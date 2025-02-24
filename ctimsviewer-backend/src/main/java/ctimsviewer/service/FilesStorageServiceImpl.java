package ctimsviewer.service;

import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;



import java.io.*;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.GZIPInputStream;
import java.util.Arrays;
import java.util.Map;
import java.util.Queue;
import java.util.ArrayDeque;
import java.util.Comparator;
import java.util.ArrayList;
import java.lang.String;

import java.util.stream.Stream;



@Service
public class FilesStorageServiceImpl implements FilesStorageService{

    private final Path root = Paths.get("ctimsFiles");
    private final String validationResultFileName = "validated_study.html";
    private final String csvFileName ="clinical.csv";

    @Override
    public void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    @Override
    public void save(MultipartFile file, String userId) {
        Path userDir = getUserPath(userId);
        try {
            if (!Files.exists(userDir)) {
                Files.createDirectory(userDir);
            }
            Path filePath = userDir.resolve(file.getOriginalFilename());

            Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            extractGZip(filePath.toFile(), userId);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /*
     * Resolves the path to the user's directory by the userId.
     */
    private Path getUserPath(String userId) {
        return root.resolve(userId);
    }

    private void extractGZip(File inputFile, String userId) {
        Path userDir = getUserPath(userId);
        try {
            TarArchiveInputStream tarInput = new TarArchiveInputStream(new GZIPInputStream(new FileInputStream(inputFile)));

            TarArchiveEntry entry;
            while((entry = tarInput.getNextTarEntry()) != null) {
                if (entry.isDirectory()) {
                    new File(userDir.resolve(entry.getName()).toString()).mkdirs();
                } else {
                    byte[] buffer = new byte[1024];
                    File outFile = userDir.resolve(entry.getName()).toFile();
                    outFile.getParentFile().mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(outFile)) {
                        int len;
                        while ((len = tarInput.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /*
     * Returns a list of files in the user's directory.
     */
    @Override
    public List<String> getFiles(String userId) {
        Path userDir = getUserPath(userId);
        List<String> ret = new LinkedList<>();
        try {
            ret = Files.walk(userDir)
                    .filter(Files::isRegularFile)
                    .map(file -> file.getFileName().toString())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Could not list the files!");
        } finally {
            return ret;
        }
    }

    @Override
    public List<String> getFolders(String userId) {
        Path userDir = getUserPath(userId);
        if (!Files.exists(userDir)) {
            return null;
        }
        List<String> ret = new LinkedList<>();
        try {
            ret = Files.walk(userDir, 1) //only one level for study names
                    .filter(Files::isRegularFile)
                    .map(folder -> folder.getFileName().toString())
                    .collect(Collectors.toList());
            // remove the user's directory
            //ret.remove(0);
        } catch (IOException e) {
            throw new RuntimeException("Could not list folders!");
        }
        System.out.printf("List of folders Fetched %s", ret);
        return ret;
    }


    @Override
    public List<String> getGzFolders(String userId) {
        Path userDir = getUserPath(userId);
        if (!Files.exists(userDir)) {
            return null;
        }
        List<String> ret = new LinkedList<>();
        try {
            ret = Files.walk(userDir, 1) //only one level for study names
                    .filter(path -> path.toFile().isDirectory())
                    .map(folder -> folder.getFileName().toString())
                    .collect(Collectors.toList());
            // remove the user's directory
            ret.remove(0);
        } catch (IOException e) {
            throw new RuntimeException("Could not list folders!");
        }
        return ret;
    }


    @Override
    public List<byte[]> getPlots(String userId) {
        File imageFile = new File("ctimsFiles/user-local/results/heatmap.png");
        if (!imageFile.exists() || imageFile.isDirectory()) {
            System.out.printf("Cannot read .png file");
            return null;
        }
        System.out.printf("Can read .png file");
        List<byte[]> imageBytesList = new ArrayList<>();
        try {
            byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
           // System.out.printf("Image imageBytes  %s", Arrays.toString(imageBytes) );
            imageBytesList.add(imageBytes);
        } catch (IOException e) {
            throw new RuntimeException("Could not read image file!");
        }
        //System.out.printf("Image %s",imageBytesList );
        return imageBytesList;
    }    

    @Override
    public List<String> getFilesInFolder(String userId, String folderName) {
        Path folderPath = getUserPath(userId).resolve(folderName);
        List<String> ret = new LinkedList<>();
        try {
            System.out.printf("Files path %s",folderPath );
            ret = Files.list(folderPath)
                    .filter(Files::isRegularFile)
                    .map(file -> file.getFileName().toString())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Could not list the files in the folder!");
        }
        return ret;
    }

    @Override
    public byte[] getValidationResult(String userId, String folderName) {
        Path userDir = getUserPath(userId).resolve(folderName);
        String scriptName = "validateData.py";
        byte[] ret = null;
        try {
            // Create a temporary directory to extract the script
            Path tempDir = Files.createTempDirectory("python-script");

            // Extract the script to the temporary directory
            Path importerDir = tempDir.resolve("importer");
            Path scriptFile = importerDir.resolve(scriptName);
            copyScriptsToTempDir(importerDir);

            File outFileHtml = new File(userDir.toFile(), validationResultFileName);

            ProcessBuilder processBuilder = new ProcessBuilder("python3", scriptFile.toString(),
                    "-s", userDir.toFile().getAbsolutePath(), "-n", "-html", outFileHtml.getAbsolutePath());
            processBuilder.directory(tempDir.toFile());

            processBuilder.redirectError(new File(userDir.toFile(), "errorOut.txt"));

            Process p = processBuilder.start();
            int exitCode = p.waitFor();
            if (exitCode != 0) {
                ret = Files.readAllBytes(outFileHtml.toPath());
            }
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException ex) {
            ex.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            return ret;
        }
    }


@Override
public String getCreateCsv(String userId, String folderName) {
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    String retRes ="";
    try {
        // Command to execute the Python script
        String pythonCommand = "python3";
        String pythonScriptPath = "ctimsFiles/user-local/trial-match-utils/src/tools/prepare_clinical_data.py";

       // String pythonScriptPath = "src/main/resources/sample.txt";
        ///src/main/resources/trail-match-utils/src/tools/prepare_clinical_data.py
       
         File pythonScriptFile = new File(pythonScriptPath);


        //String filePath = System.getProperty("user.dir")+ "\\src\\main\\resources\\trial-match-utils\\src\\tools\\prepare_clinical_data.py";
        
        String filePath = System.getProperty("user.dir")+ "/ctimsFiles";
        
        //
        // Create a File object
        File file = new File(filePath);
        
        String absolutePath = file.getAbsolutePath();
        //System.out.println("Absolute Path: " + absolutePath);
       //System.out.println("User Directory " + System.getProperty("user.dir") +"Done");


        //String userDir = System.getProperty("user.dir");

        // Print the user directory
        //System.out.println("User Directory: " + userDir);


//checking with validate.py
        Path userDir = getUserPath(userId).resolve(folderName);
        String scriptName = "prepare_clinical_data.py";
        Path tempDir = Files.createTempDirectory("python-script");

        // Extract the script to the temporary directory
        Path importerDir = tempDir.resolve("importer");
        Path scriptFile = importerDir.resolve(scriptName);
        copyScriptsToTempDir(importerDir);
        File outFileHtml = new File(userDir.toFile(), csvFileName);


        System.out.printf("Files in ctimsFiles/user-local/ directory: %s",folderName );
        try (Stream<Path> paths = Files.walk(Paths.get("ctimsFiles/user-local/tmb_mskcc_2018"))) {
            paths.filter(Files::isRegularFile)
                .forEach(System.out::println);
        }

        if (file.exists()) {
            System.out.println("File exists.");
            
            // Check if the file is readable
            if (file.canRead()) {
                System.out.println("File is readable.");
            } else {
                System.out.println("File is not readable.");
            }
        } else {
            System.out.println("File does not exist.");
        }
       
        

        // Arguments for the Python script
        String[] arguments = {
            "-s", "ctimsFiles/user-local/"+folderName+"/data_clinical_sample.txt",
            "-p", "ctimsFiles/user-local/"+folderName+"/data_clinical_patient.txt",
            "-st", "ctimsFiles/user-local/"+folderName+"/meta_study.txt",
            "-o", "ctimsFiles/user-local/"+folderName+"/clinical.csv"
        };

        // Command and arguments
        String[] command = new String[arguments.length + 2];
        command[0] = pythonCommand;
        //change here as well
        command[1] = scriptFile.toString();
        command[2] = arguments[0];
        command[3] = arguments[1];
        command[4] = arguments[2];
        command[5] = arguments[3];
        command[6] = arguments[4];
        command[7] = arguments[5];
        command[8] = arguments[6];
        command[9] = arguments[7];

        System.out.println(arguments[0]);


        StringBuilder stringBuilder = new StringBuilder();

        for (String str : command) {
            stringBuilder.append(str);
        }

        String result = stringBuilder.toString();
       // System.out.println(result);

    System.out.printf("Command", result);
        Map<String, String> env = System.getenv();

        // Print each environment variable
        for (Map.Entry<String, String> entry : env.entrySet()) {
            //System.out.printf(entry.getKey() + " : " + entry.getValue());
        }
        ProcessBuilder pb = new ProcessBuilder(command);



            File csvFile = new File("ctimsFiles/user-local/"+folderName+"/clinical.csv");
            long fileSize = csvFile.length(); 
            System.out.printf("Clinical.csv File size before operation"+Long.toString(fileSize));

        Process process = pb.start();

        // Capture output from Python script
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
            // Process output here if needed
            System.out.println(line);
            // Write output to the byte array stream
            outputStream.write(line.getBytes());
        }



            InputStream errorStream = process.getErrorStream();
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(errorStream));
            StringBuilder errorStringBuilder = new StringBuilder();
            System.out.println("Error:");
            while ((line = errorReader.readLine()) != null) {
                System.out.println(line);
                errorStringBuilder.append(line).append("\n");
            }

        // Wait for the process to complete
        int exitCode = process.waitFor();

        if (exitCode == 0) {
            
              File csvFile2 = new File("ctimsFiles/user-local/"+folderName+"/clinical.csv");
            fileSize = csvFile2.length(); // Size in bytes
            //System.out.printf("Python script executed successfully. Size of CSV File: %d", fileSize);
            //System.out.println(String.format("Python script executed successfully. Size of CSV File: %d", fileSize));
            //retRes="Success while executing: "+Long.toString(fileSize);
            retRes="Success";
        } else {
            System.out.println("Error, exit code is not zero");
            System.err.println("Error executing Python script. Exit code: " + exitCode);
            retRes="Error: "+ errorStringBuilder.toString();
        }
        
        // You can also handle errors by reading from process.getErrorStream()

    } catch (IOException | InterruptedException e) {
        e.printStackTrace();
    }
    finally{
        return retRes;
    }


}




@Override
public String getCreateChart(String userId, String chartType, String selectedFile) {
    System.out.printf("Entered getCreateChart %s",chartType);
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    String retRes ="";

   try {
    String pythonCommand = "python3";
    Path userDir = getUserPath(userId);
    String scriptName = chartType+".py";

    // Create a temporary directory for the script
    Path tempDir = Files.createTempDirectory("python-script");

    // Extract the script to the temporary directory
    Path importerDir = tempDir.resolve("importer");
    Path scriptFile = importerDir.resolve(scriptName);
    copyScriptsToTempDir(importerDir);
/*
  System.out.println("Files in temporary directory:");
    try (Stream<Path> paths = Files.walk(tempDir)) {
        paths.filter(Files::isRegularFile)
             .forEach(System.out::println);
    }
*/
    System.out.println("Files in ctimsFiles/user-local/ directory:");
    try (Stream<Path> paths = Files.walk(Paths.get("ctimsFiles/user-local"))) {
        paths.filter(Files::isRegularFile)
             .forEach(System.out::println);
    }
    
    Path prepareClinicalDataFile = importerDir.resolve(chartType+".py");
    //System.out.println("Contents of prepare_clinical_data.py:");
    // Check if the Python script exists in the temporary directory
    if (!Files.exists(scriptFile)) {
        System.out.println("Python script not found in temporary directory.");
        return "Error: Python script not found.";
    }

    // Path to the input CSV file
    String csvFilePath = "ctimsFiles/user-local/"+selectedFile;

    // Check if the input CSV file exists
    File csvFile = new File(csvFilePath);
    if (!csvFile.exists()) {
        System.out.println("CSV file does not exist.");
        return "Error: CSV file not found.";
    }

        // Create the results folder if it doesn't exist
    File resultsFolder = new File("ctimsFiles/user-local/results");
    if (!resultsFolder.exists()) {
        if (!resultsFolder.mkdirs()) {
            return "Error: Failed to create results folder.";
        }
    }


    // Command and arguments to execute the Python script
    String[] command = {
        pythonCommand,
        scriptFile.toString(),
        csvFilePath,
        "ctimsFiles/user-local/results/heatmap.png" 
    };
    ProcessBuilder pb = new ProcessBuilder(command);
    Process process = pb.start();
    BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
    String line;
    while ((line = reader.readLine()) != null) {
       // System.out.println(line); // Optional: Process output here if needed
        outputStream.write(line.getBytes());
    }

    int exitCode = process.waitFor();

    if (exitCode == 0) {
        System.out.println("Python script executed successfully.");
        retRes = "Success"+selectedFile+chartType;
    } else {
        //System.out.println("Error, exit code is not zero");
        BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        StringBuilder errorMessage = new StringBuilder();
        while ((line = errorReader.readLine()) != null) {
            errorMessage.append(line).append("\n");
        }
        retRes = "Error: Failed to execute Python script. Error details: " + errorMessage.toString();
    }
    
    } catch (IOException | InterruptedException e) {
        System.out.printf("Check_@@@@");
        e.printStackTrace();
        System.out.printf("Check_@@@@");
        retRes = "Error: " + e.getMessage();
    } finally {
        return retRes;
    }

}



@Override
public String getCtimsImports(String userId, String nctId) {
   System.out.printf("Entered getCreateChart %s",nctId);
   ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
   String retRes ="";

   try{
    String pythonCommand = "python3";
    Path userDir = getUserPath(userId);
    String scriptName = "CtimsImports.py";
    String configFileName = "configFile.json";
    String line;
    Path tempDir = Files.createTempDirectory("python-script");

    Path importerDir = tempDir.resolve("importer");
    Path scriptFile = importerDir.resolve(scriptName);
    Path configFile = importerDir.resolve(configFileName);
    copyScriptsToTempDir(importerDir);

    System.out.println("Files in ctimsFiles/user-local/ directory:");
    try (Stream<Path> paths = Files.walk(Paths.get("ctimsFiles/"))) {
        paths.filter(Files::isRegularFile)
             .forEach(System.out::println);
    }
    File resultsFolder = new File("ctimsFiles/user-local/results");
    if (!resultsFolder.exists()) {
        if (!resultsFolder.mkdirs()) {
            return "Error: Failed to create results folder.";
        }
    }
    //python Final.py  NCT05307705 ./config.json ./Results
    String[] command = {
        pythonCommand,
        scriptFile.toString(),
        nctId,
        configFile.toString(),
        "ctimsFiles/user-local/results/" 
    };
    ProcessBuilder pb = new ProcessBuilder(command);
    Process process = pb.start();
    BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
    int exitCode = process.waitFor();

    if (exitCode == 0) {
        System.out.println("Python script executed successfully.");
        Path yamlFilePath = Paths.get("ctimsFiles/user-local/results", nctId + ".json");
        if (Files.exists(yamlFilePath)) {
            retRes = new String(Files.readAllBytes(yamlFilePath));
        } else {
            retRes = "Success: No output file generated.";
        }
    } else {
        BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        StringBuilder errorMessage = new StringBuilder();
        while ((line = errorReader.readLine()) != null) {
            errorMessage.append(line).append("\n");
        }
        retRes = "Error: Failed to execute Python script. Error details: " + errorMessage.toString();
        System.out.printf("Error, exit code is not zero : %s", errorMessage.toString());
    }

   }
   catch (IOException | InterruptedException e) {
        System.out.printf("Check_@@@@");
        e.printStackTrace();
        System.out.printf("Check_@@@@");
        retRes = "Error: " + e.getMessage();
    } finally {
        return retRes;
    }

}



    private String[] listValidatorFileNames() {
        // todo: traverse the directory and get all the file names
        String[] fileNames = {"__init__.py",
                "HeatPlot.py",
                "ReverseBarChart.py",
                "TopBarChart.py",
                "BarChart.py",
                "configFile.json",
                "CtimsImports.py"
                };
        return fileNames;
    }

    private void copyScriptsToTempDir(Path tempDir) throws IOException {
        for (String fileName : listValidatorFileNames()) {
            copyToTempDir(tempDir, fileName);
        }
    }

    private void copyToTempDir(Path importerDir, String fileName) throws IOException {
        // Create the importer subdirectory if it doesn't exist
        Files.createDirectories(importerDir);

        Path scriptFile = importerDir.resolve(fileName);
        try (InputStream is = getClass().getResourceAsStream("/importer/" + fileName)) {
            Files.copy(is, scriptFile, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    @Override
    public byte[] getReport(String userId, String folderName) throws FileNotFoundException {
        Path userDir = getUserPath(userId).resolve(folderName);
        File outFileHtml = new File(userDir.toFile(), validationResultFileName);

        if (!outFileHtml.exists()) {
            throw new FileNotFoundException("Validation report not found! Please validate the data first.");
        }

        byte[] ret = null;
        try {
            ret = Files.readAllBytes(outFileHtml.toPath());
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            return ret;
        }
    }

    @Override
    public String getReportAsString(String userId, String folderName) {
        String ret = "";
        Path userDir = getUserPath(userId).resolve(folderName);
        File outFileHtml = new File(userDir.toFile(), validationResultFileName);

        try {
            String htmlContent = StreamUtils.copyToString(outFileHtml.toURL().openStream(), StandardCharsets.UTF_8);
            ret = htmlContent;
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            return ret;
        }
    }

    @Override
    public void deleteFiles(String userId) {
        Path userDir = getUserPath(userId);
        try {
            // Delete all files in the user's directory
            Files.walk(userDir)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
            
            // Return success response
        } catch (IOException e) {
            e.printStackTrace();
        }
    }




    @Override
    public byte[] downloadCsv(String userId, String fileName) {
/*
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"data.csv\"");
        
        // Assume csvData is a string containing your CSV data
        String csvData = "Name, Age\nJohn, 30\nDoe, 25";
        
        OutputStream outputStream = response.getOutputStream();
        outputStream.write(csvData.getBytes());
        outputStream.flush();
        outputStream.close()

*/
        
       // String filePath = determineFilePath(userId, folderName);

    try {
        File file = new File("ctimsFiles/user-local/"+fileName+"/clinical.csv");

        if (file.exists()) {
            byte[] bytes = Files.readAllBytes(file.toPath());
            return bytes;
        } else {
            System.err.println("File not found: " + fileName);
            return null;
        }
    } catch (IOException e) {
        System.err.println("Error reading file: " + e.getMessage());
        e.printStackTrace();
        return null;
    }
    }


    @Override
    public byte[] downloadPlot(String userId) {

        
       // String filePath = determineFilePath(userId, folderName);

    try {
        File file = new File("ctimsFiles/user-local/results/heatmap.png");

        if (file.exists()) {
            byte[] bytes = Files.readAllBytes(file.toPath());
            return bytes;
        } else {
            System.err.println("File not found: heatmap.png ");
            return null;
        }
    } catch (IOException e) {
        System.err.println("Error reading file: " + e.getMessage());
        e.printStackTrace();
        return null;
    }
    }


    @Override
    public byte[] downloadCtimsImports(String nctId, String userId) {
    try {
        File file = new File("ctimsFiles/user-local/results/"+nctId+".json");

        if (file.exists()) {
            byte[] bytes = Files.readAllBytes(file.toPath());
            return bytes;
        } else {
            System.err.println("File not found: yaml file ");
            return null;
        }
    } catch (IOException e) {
        System.err.println("Error reading file: " + e.getMessage());
        e.printStackTrace();
        return null;
    }
    }


    /*
        @Override
    public void deleteFiles(String userId) {
        Path userDir = getUserPath(userId);
        try {
            // Delete all files in the user's directory
            Files.walk(userDir)
                    .filter(Files::isRegularFile)
                    .map(Path::toFile)
                    .forEach(File::delete);
            // Return success response
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
     */
}
