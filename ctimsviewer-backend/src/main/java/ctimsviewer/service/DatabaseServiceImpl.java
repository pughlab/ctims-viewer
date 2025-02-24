package ctimsviewer.service;

import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.*;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


import ctimsviewer.ChartsTableRepository;
import ctimsviewer.ChartsTable;
import ctimsviewer.ClinicalData;
import ctimsviewer.TrialDataDTO;
import ctimsviewer.TrialGroup;


import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;


import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.util.stream.Stream;
import java.io.InputStream;
import java.nio.file.*;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;


import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpMethod;



import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.jayway.jsonpath.JsonPath;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class DatabaseServiceImpl implements DatabaseService{

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ChartsTableRepository chartsTableRepository;

    private final Path root = Paths.get("ctimsFiles");

    @Value("${MM_API_URL}")
    private String MM_API_URL;

    @Value("${MM_API_TOKEN}")
    private String MM_API_TOKEN;


    @Override
    public void init() {

    }

    private Path getUserPath(String userId) {
        return root.resolve(userId);
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

    @Override
    public byte[] getData(String tableName, String userId) {
        String sql = "SELECT * FROM " + tableName;
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
        //System.out.printf("%s", results);
        StringBuilder resultString = new StringBuilder();
        for (Map<String, Object> row : results) {
            resultString.append(row.toString()).append("\n");
        }

        return resultString.toString().getBytes();
    }


    @Override
    public byte[] getDataUsingRepo(String tableName, String userId) {
        List<ChartsTable> chartsTables = chartsTableRepository.findAllByTableName(tableName);
        //System.out.printf("%s", chartsTables);
        StringBuilder resultString = new StringBuilder();
        for (ChartsTable chart : chartsTables) {
            resultString.append(chart.toString()).append("");
        }

        return resultString.toString().getBytes();
    }

    @Override
    public byte[] getDataUsingFilter(String TrialCreationDates, String StudyIds, String userId) {

        List<String> dateList = Arrays.asList(TrialCreationDates.split(","));
        System.out.printf("Date List %s", dateList);

        List<String> studyList = Arrays.asList(StudyIds.split(","));
        System.out.printf("Date List %s", studyList);
        List<ClinicalData> chartsTables = chartsTableRepository.findDataByCreationDate(dateList, studyList);
       // System.out.printf("Table %s", chartsTables);
        StringBuilder resultString = new StringBuilder();
        
        for (ClinicalData chart : chartsTables) {
            resultString.append(chart.toDetailedString2()).append("");
        }

        return resultString.toString().getBytes();
    }

    @Override
    public String getTrialArmIDs(String userId){

        List<String> results = chartsTableRepository.findAllUniqueTrialarmid();
        return results.toString();
    }

    @Override
    public String getTrialIDs(String userId){

        List<ChartsTable> results = chartsTableRepository.findAllUniqueTrialid();
        System.out.println("Results before converting to string: " + results);
        return results.toString();
    }

    @Override
    public String getFilteredTrialArmIDs(String userId, String TrialCreationDates){


        System.out.printf("TrialCreationDates1 %s", TrialCreationDates);
        //System.out.printf("TrialCreationDates %s", TrialCreationDates);

        List<String> dateList = Arrays.asList(TrialCreationDates.split(","));
        //System.out.printf("dateList %s", dateList);
        List<String> results = chartsTableRepository.findFilteredUniqueTrialarmid(dateList);
        System.out.printf("results.toString() %s", results.toString());
        return results.toString();
    }

    @Override
    public String getStudyIDs(String userId){

        List<String> results = chartsTableRepository.findAllUniqueStudyid();
        return results.toString();
    }

    @Override
    public String getFilteredStudyIDs(String userId, String TrialCreationDates){


        System.out.printf("TrialCreationDates1 %s", TrialCreationDates);
        //System.out.printf("TrialCreationDates %s", TrialCreationDates);

        List<String> dateList = Arrays.asList(TrialCreationDates.split(","));
        //System.out.printf("dateList %s", dateList);
        List<String> results = chartsTableRepository.findFilteredUniqueStudyid(dateList);
        System.out.printf("results.toString() %s", results.toString());
        return results.toString();
    }

    @Override
    public List<ClinicalData> viewTrialData(String userId, String trialCreated, String trialId, String trialName, String StudyID, String patientId, String SampleID, String hugoSymbol, String gene){


        //List<String> dateList = Arrays.asList(TrialCreationDate.split(","));
        //List<ClinicalData> results = chartsTableRepository.findDataByCreationDate(dateList);


        System.out.printf("TrialCreationDates %s %s", trialCreated, patientId);
        List<ClinicalData> results = chartsTableRepository.findDataByCustomFilter(trialCreated, trialId, trialName, StudyID, patientId, SampleID, hugoSymbol, gene);

        
        //findDataByCustomFilter
        StringBuilder resultString = new StringBuilder();
        for (ClinicalData chart : results) {
            resultString.append(chart).append("");
        }
        
        return results;
    }

    @Override
    public List<Map<String, String>> reactPlotlyData(String userId, String trialCreated, String trialId, String trialName, String StudyID, String patientId, String SampleID, String hugoSymbol, String gene){

        System.out.printf("Check2");
        List<ClinicalData> results = chartsTableRepository.reactPlotlyDataFilter(trialCreated, trialId, trialName, StudyID, patientId, SampleID, hugoSymbol, gene);
        //System.out.println("Results before converting to string: " + results);
        List<Map<String, String>> convertedResults = new ArrayList<>();
        for (ClinicalData chart : results) {
            String data = chart.toDetailedString2().replace("\n", ""); // Remove \n
            String[] parts = data.split(",", 2); // Split into two parts
            Map<String, String> map = new HashMap<>();
            map.put("trialarmid", parts[0]);
            map.put("patient_id", parts[1]);
            convertedResults.add(map);
        }

        return convertedResults;
    }

    @Override
    public List<Map<String, String>> reactPlotlyFilter(String userId, String[] ArmTypes, String TrialCreationDates, String StudyIds) {
        List<String> dateList = Arrays.asList(TrialCreationDates.split(","));
        System.out.printf("Date List %s", TrialCreationDates);

        List<String> studyList = Arrays.asList(StudyIds.split(","));
        System.out.printf("Date List %s", StudyIds);

        List<String> armList = Arrays.asList(ArmTypes);
        System.out.printf("Date List %s",armList );
        List<ClinicalData> results = chartsTableRepository.findPlotlyDataByCreationDate(armList, dateList, studyList);
        System.out.printf("results %s", results.toString());
        List<Map<String, String>> convertedResults = new ArrayList<>();
        for (ClinicalData chart : results) {
            String data = chart.toDetailedString2().replace("\n", ""); // Remove \n
            String[] parts = data.split(",", 2); // Split into two parts
            Map<String, String> map = new HashMap<>();
            map.put("trialarmid", parts[0]);
            map.put("patient_id", parts[1]);
            convertedResults.add(map);
        }
        System.out.printf("Date%s", convertedResults.toString());
        return convertedResults;


    }


    @Override
    public void save(MultipartFile file, String time, String userId) {
        try (
            BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
           

             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

               Set<String> uniquePatientIds = new HashSet<>();
               Set<String> uniqueTrialArmIds = new HashSet<>();
               Set<String> uniqueStudyIds = new HashSet<>();
               String trialId ="";
               String trialMatchDate="";
               String trialName="";
               for (CSVRecord csvRecord : csvParser) {

                    trialId = csvRecord.toMap().entrySet().stream()
                    .filter(entry -> entry.getKey().contains("Trial Id"))
                    .map(entry -> entry.getValue().replace("\"", "").trim())
                    .findFirst()
                    .orElse(null);
                    trialMatchDate = csvRecord.get("Trial Match Date");
                    trialName = csvRecord.get("Nickname");
                    String patientId = csvRecord.get("Patient ID");
                    String trialArmId = trialId + "_"+(trialName != null && !trialName.isEmpty() ? trialName : " ")+"_Arm"+Integer.toString((Integer.parseInt(csvRecord.get("Arm Number")))+1);
                    String studyId = csvRecord.get("Study ID");
                    uniquePatientIds.add(patientId);
                    uniqueTrialArmIds.add(trialArmId);
                    uniqueStudyIds.add(studyId);
                    System.out.printf("trialArmId %s",trialArmId );
               }
               //CAPTUR_Arm1
//String trialArmId = csvRecord.get("Trial Id")+"CAPTUR_Arm"+csvRecord.get("Arm Number");

                System.out.printf("Trial id and Trial match Date %s %s",trialId,trialMatchDate );
                int uniquePatientCount = uniquePatientIds.size();
                int uniqueTrialArmCount = uniqueTrialArmIds.size();
                int uniqueStudyCount = uniqueStudyIds.size();

                String trialcreated = time;
                String username = getUserName();
                int uniquearms = uniqueTrialArmCount;
                int uniquepatients = uniquePatientCount;
                int uniquestudies = uniqueStudyCount;
                String trialid = trialId;
                String trialmatchdate = trialMatchDate;
                String trialname = trialName;


                chartsTableRepository.insertChart(trialcreated, username, uniquearms, uniquepatients, trialid, trialmatchdate, uniqueStudyCount, trialname);


        } catch (IOException e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }


    }

    @Override
    public void saveClinicalData(MultipartFile file, String time, String userId) {

    try (
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

        for (CSVRecord csvRecord : csvParser) {
            String trialId = csvRecord.toMap().entrySet().stream()
            .filter(entry -> entry.getKey().contains("Trial Id"))
            .map(entry -> entry.getValue().replace("\"", "").trim())
            .findFirst()
            .orElse(null);
            String trialName = csvRecord.get("Nickname");
            String trialMatchDate = csvRecord.get("Trial Match Date");
            String trialArmId = trialId + "_"+(trialName != null && !trialName.isEmpty() ? trialName : " ")+"_Arm"+Integer.toString((Integer.parseInt(csvRecord.get("Arm Number")))+1);
            String armCode = csvRecord.get("Arm Code");
            String studyID = csvRecord.get("Study ID");
            String patientId = csvRecord.get("Patient ID");
            String sampleID = csvRecord.get("Sample ID");
            String vitalStatus = csvRecord.get("Vital Status");
            String gender = csvRecord.get("Gender");
            String age = csvRecord.get("Age");
            String diagnosis = csvRecord.get("Diagnosis");
            String HER2Status = csvRecord.get("HER2 Status");
            String ERStatus = csvRecord.get("ER Status");
            String PRStatus = csvRecord.get("PR Status");
            String genomicAlteration = csvRecord.get("Genomic Alteration");
            String hugoSymbol = csvRecord.get("Hugo Symbol");
            String mutationEffect = csvRecord.get("Mutation Effect");
            String trueVariantClassification = csvRecord.get("True Variant Classification");
            String variantCategory = csvRecord.get("Variant Category");
            String leftPartnerGene = csvRecord.get("Left Partner Gene");
            String rightPartnerGene = csvRecord.get("Right Partner Gene");
            String CNVCall = csvRecord.get("CNV Call");
            String MSStatus = csvRecord.get("MS Status");
            String trialcreated = time;
            String combinedData = csvRecord.get("Patient Match Values");
            String oncotreePrimaryDiagnosisMatchOnly = csvRecord.get("Oncotree Primary Diagnosis Match Value");
            System.out.printf("oncotreePrimaryDiagnosisMatchOnly %s",oncotreePrimaryDiagnosisMatchOnly);

            chartsTableRepository.insertClinicalData(
                trialId, trialName, trialMatchDate, trialArmId, armCode, studyID, 
                patientId, sampleID, vitalStatus, gender, age, diagnosis, HER2Status, 
                ERStatus, PRStatus, genomicAlteration, hugoSymbol, mutationEffect, 
                trueVariantClassification, variantCategory, leftPartnerGene, 
                rightPartnerGene, CNVCall, MSStatus, trialcreated, combinedData, oncotreePrimaryDiagnosisMatchOnly);
                }

            } catch (IOException e) {
                throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
            }
        }





    @Override
    public String getCreateChart(String userId, String chartType, String[] ArmTypes) {
        System.out.printf("Entered getCreateChart2 %s",chartType);

        String result = String.join(",", ArmTypes);
        System.out.printf("result %s", result);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        String retRes ="";



    try {

        byte[] dbDataBytes2 = getDataUsingRepo("ClinicalData", userId);
        //byte[] dbDataBytes = getData("CTIMSCHARTS", userId);
        String dbData2 = new String(dbDataBytes2, "UTF-8");
        System.out.printf("Data from db2 %s", dbData2);

        String pythonCommand = "python3";
       // Path userDir = getUserPath(userId);
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

        Path prepareClinicalDataFile = importerDir.resolve(chartType+".py");
        //System.out.println("Contents of prepare_clinical_data.py:");
        // Check if the Python script exists in the temporary directory
        if (!Files.exists(scriptFile)) {
            System.out.println("Python script not found in temporary directory.");
            return "Error: Python script not found.";
        }

            // Create the results folder if it doesn't exist
        File resultsFolder = new File("ctimsFiles/user-local/results");
        if (!resultsFolder.exists()) {
            if (!resultsFolder.mkdirs()) {
                return "Error: Failed to create results folder.";
            }
        }

       
        byte[] dbDataBytes = getDataUsingRepo("ClinicalData", userId);
        //byte[] dbDataBytes = getData("CTIMSCHARTS", userId);
        String dbData = new String(dbDataBytes, "UTF-8");
        System.out.printf("Data from db %s", dbData);
        String headers = "trialArmId,patient_id";
        FileOutputStream fos = new FileOutputStream("ctimsFiles/user-local/inputcsvfile.csv");
        fos.write(headers.getBytes(StandardCharsets.UTF_8)); 
        fos.write(dbData.getBytes(StandardCharsets.UTF_8));




        // Command and arguments to execute the Python script
        String[] command = {
            pythonCommand,
            scriptFile.toString(),
            "ctimsFiles/user-local/inputcsvfile.csv",
            "ctimsFiles/user-local/results/heatmap.png",
            result
        };
        System.out.printf("command1234 %s", command[4]);
        ProcessBuilder pb = new ProcessBuilder(command);
        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
        // System.out.println(line); // Optional: Process output here if needed
            outputStream.write(line.getBytes());
        }

        int exitCode = process.waitFor();

        LocalDateTime now = LocalDateTime.now();

        if (exitCode == 0) {
            System.out.printf("Python script executed successfully.");
            retRes = "Success"+chartType+now;
        } else {
            //System.out.println("Error, exit code is not zero");
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            StringBuilder errorMessage = new StringBuilder();
            while ((line = errorReader.readLine()) != null) {
                errorMessage.append(line).append("\n");
            }
            retRes = "Error: Failed to execute Python script. Error details: " + errorMessage.toString();
            System.out.printf("%s",retRes);
            System.out.printf("%d",exitCode);
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
    public String getFilterChart(String userId, String chartType, String[] ArmTypes, String TrialCreationDates, String StudyIds) {
        System.out.printf("Entered getCreateChart3 %s",chartType);

        String result = String.join(",", ArmTypes);
        System.out.printf("result %s", result);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        String retRes ="";

    try {
/*
        byte[] dbDataBytes2 = getDataUsingFilter(TrialCreationDates, userId);
        //byte[] dbDataBytes = getData("CTIMSCHARTS", userId);
        String dbData2 = new String(dbDataBytes2, "UTF-8");
        System.out.printf("Data from db2 %s", dbData2);
*/
        String pythonCommand = "python3";
       // Path userDir = getUserPath(userId);
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

        Path prepareClinicalDataFile = importerDir.resolve(chartType+".py");
        //System.out.println("Contents of prepare_clinical_data.py:");
        // Check if the Python script exists in the temporary directory
        if (!Files.exists(scriptFile)) {
            System.out.println("Python script not found in temporary directory.");
            return "Error: Python script not found.";
        }

            // Create the results folder if it doesn't exist
        File resultsFolder = new File("ctimsFiles/user-local/results");
        if (!resultsFolder.exists()) {
            if (!resultsFolder.mkdirs()) {
                return "Error: Failed to create results folder.";
            }
        }

       
        byte[] dbDataBytes = getDataUsingFilter(TrialCreationDates, StudyIds, userId);
        //byte[] dbDataBytes = getData("CTIMSCHARTS", userId);
        String dbData = new String(dbDataBytes, "UTF-8");
        System.out.printf("Data from db %s", dbData);
        String headers = "TrialArmId,patient_id";
        FileOutputStream fos = new FileOutputStream("ctimsFiles/user-local/inputcsvfile.csv");
        fos.write(headers.getBytes(StandardCharsets.UTF_8)); 
        fos.write(dbData.getBytes(StandardCharsets.UTF_8));




        // Command and arguments to execute the Python script
        String[] command = {
            pythonCommand,
            scriptFile.toString(),
            "ctimsFiles/user-local/inputcsvfile.csv",
            "ctimsFiles/user-local/results/heatmap.png",
            result
        };
        System.out.printf("command1234 %s", command[4]);
        ProcessBuilder pb = new ProcessBuilder(command);
        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
        // System.out.println(line); // Optional: Process output here if needed
            outputStream.write(line.getBytes());
        }

        int exitCode = process.waitFor();

        LocalDateTime now = LocalDateTime.now();

        if (exitCode == 0) {
            System.out.printf("Python script executed successfully.");
            retRes = "Success"+chartType+now;
        } else {
            //System.out.println("Error, exit code is not zero");
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            StringBuilder errorMessage = new StringBuilder();
            while ((line = errorReader.readLine()) != null) {
                errorMessage.append(line).append("\n");
            }
            retRes = "Error: Failed to execute Python script. Error details: " + errorMessage.toString();
            System.out.printf("%s",retRes);
            System.out.printf("%d",exitCode);
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
    public List<ChartsTable> getGroupTrials(String userId){


       List<ChartsTable> results = chartsTableRepository.groupTrials();

        System.out.printf("Check_@@@@&&&& %s", chartsTableRepository.groupTrials().toString());
        StringBuilder detailedResults = new StringBuilder();
        for (ChartsTable result : results) {
            detailedResults.append(result.toDetailedString());
        }
        System.out.printf("detailed output  %s", results);
        return results;

    }
    

    @Override
    public List<ChartsTable> getPatientMatch(String patientid, String userId){


       List<ChartsTable> results = chartsTableRepository.getPatientsData(patientid);
        StringBuilder detailedResults = new StringBuilder();
        for (ChartsTable result : results) {
            detailedResults.append(result.toDetailedString());
        }
        
        return results;

    }

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public String getTrialFromMatchminer(String userId){
        String url = MM_API_URL+"/ctims_trial_summary_with_nctid";
        Map<String, Object> requestBody = Map.of("key", "value");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer "+ MM_API_TOKEN);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
        System.out.printf("Data %s",ResponseEntity.ok(response.getBody()).toString());
        try {
        // Extract 'values' field from the response JSON
        List<Object> values = JsonPath.read(response.getBody(), "$.values");
        return values.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error extracting values.";
        }
    }

    @Override
    public String getTrialDataFromMatchminer(String userId, String trialInternalId){
        System.out.printf("trialInternalId2 %s", trialInternalId);
        String url = UriComponentsBuilder.fromHttpUrl(MM_API_URL + "/ctims_trial_match")
                                    //.queryParam("where", "{\"trial_internal_id\":\"" + trialInternalId + "\", \"is_disabled\": false}")
                                    .toUriString();

        System.out.printf("URL: %s\n", url);
        Map<String, Object> requestBody = Map.of("key", "value");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer "+ MM_API_TOKEN);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
        System.out.printf("Data %s",ResponseEntity.ok(response.getBody()).toString());
        try {
        // Extract 'values' field from the response JSON
        List<Object> values = JsonPath.read(response.getBody(), "$.values");
        return values.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error extracting values.";
        }
    }



    @Override
    public String getUserName(){

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = null;

        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                
                username = ((UserDetails) principal).getUsername();
            } else {
                username = principal.toString();
            }
        }

        return username;
    }


    @Override
    public void deleteTrial(String userId, String trialDate) {
        System.out.printf("Entered  dataserviveImpl %s", trialDate);
        chartsTableRepository.deleteTrialFromClinicalData(trialDate);
        chartsTableRepository.deleteTrialFromCTIMSCHARTS(trialDate);
    }

}
