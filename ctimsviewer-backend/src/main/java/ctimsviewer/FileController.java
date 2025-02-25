package ctimsviewer;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import ctimsviewer.service.FilesStorageService;

import javax.servlet.http.HttpSession;
import java.io.FileNotFoundException;
import java.util.List;
import java.nio.charset.StandardCharsets;
import java.lang.String;


import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Arrays;




@RestController
@CrossOrigin
@RequestMapping("/file")
public class FileController {

    @Autowired
    FilesStorageService storageService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file, HttpSession session) {
        String userId = getUserIdFromSession(session);

        storageService.save(file, userId);
        return ResponseEntity.status(HttpStatus.OK).body("Uploaded the file successfully: " + file.getOriginalFilename());
    }

    @GetMapping("/")
    public ResponseEntity<List<String>> getFiles(HttpSession session) {
        String userId = getUserIdFromSession(session);

        List<String> fileList = storageService.getFiles(userId);
        return new ResponseEntity<>(fileList, HttpStatus.OK);
    }


    @GetMapping("/Check2")
    public ResponseEntity<String> getCheck2( HttpSession session) {
        //String userId = getUserIdFromSession(session);

        return new ResponseEntity<>("Hitting the endpoint check2", HttpStatus.OK);

    }

    @GetMapping("/folders")
    public ResponseEntity<List<String>> getFolders(HttpSession session) {
        String userId = getUserIdFromSession(session);

        List<String> folderList = storageService.getFolders(userId);
        if (folderList == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(folderList, HttpStatus.OK);
    }


    @GetMapping("/gzfolders")
    public ResponseEntity<List<String>> getGzFolders(HttpSession session) {
        String userId = getUserIdFromSession(session);

        List<String> folderList = storageService.getGzFolders(userId);
        if (folderList == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(folderList, HttpStatus.OK);
    }

    @GetMapping("/plot")
    public ResponseEntity<List<byte[]>> getPlots(HttpSession session) {
        String userId = getUserIdFromSession(session);
        List<byte[]> imageBytesList = storageService.getPlots(userId);
        if (imageBytesList == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
/*
        System.out.printf("Image imageBytes in plot  " );
        for (byte[] imageBytes : imageBytesList) {
           System.out.println(Arrays.toString(imageBytes));
        }
*/    
        return new ResponseEntity<>(imageBytesList, HttpStatus.OK);
    }

    @GetMapping("/files/{folderName}")
    public ResponseEntity<List<String>> getFilesInFolder(@PathVariable String folderName, HttpSession session) {
        String userId = getUserIdFromSession(session);

        List<String> fileList = storageService.getFilesInFolder(userId, folderName);
        return new ResponseEntity<>(fileList, HttpStatus.OK);
    }


    /*
     * Execute the python validation script and return the report template html
     */

    @GetMapping("/validate/{folderName}")
    public ResponseEntity<HttpStatus> getValidationResult(@PathVariable String folderName, HttpSession session) {
        String userId = getUserIdFromSession(session);

        byte[] bytes = storageService.getValidationResult(userId, folderName);
        if (bytes != null) {
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/create/{folderName}")
    public ResponseEntity<String> getCreateCsv(@PathVariable String folderName, HttpSession session) {
        String userId = getUserIdFromSession(session);

        String bytes = storageService.getCreateCsv(userId, folderName);
        if (bytes != null) {
            //String result = new String(bytes, StandardCharsets.UTF_8);
                    //return ResponseEntity.status(HttpStatus.OK).body("Uploaded the file successfully: " + file.getOriginalFilename());
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/createChart/{chartType}/{selectedFile}")
    public ResponseEntity<String> getCreateChart(@PathVariable String chartType, @PathVariable String selectedFile, HttpSession session) {
        String userId = getUserIdFromSession(session);
        System.out.printf("Entered FileController %s",chartType);
        String bytes = storageService.getCreateChart(userId, chartType, selectedFile);
        if (bytes != null) {
            //String result = new String(bytes, StandardCharsets.UTF_8);
                    //return ResponseEntity.status(HttpStatus.OK).body("Uploaded the file successfully: " + file.getOriginalFilename());
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/ctimsImports/{nctId}")
    public ResponseEntity<String> getCtimsImports(@PathVariable String nctId, HttpSession session) {
        String userId = getUserIdFromSession(session);
        System.out.printf("Entered FileController %s",nctId);
        String bytes = storageService.getCtimsImports(userId, nctId);
        if (bytes != null) {
            //String result = new String(bytes, StandardCharsets.UTF_8);
                    //return ResponseEntity.status(HttpStatus.OK).body("Uploaded the file successfully: " + file.getOriginalFilename());
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete/{folderName}")
        public ResponseEntity<String> deleteZipFile(@PathVariable String folderName, HttpSession session) {
        String userId = getUserIdFromSession(session);
        System.out.printf("Entered delete function in FileController"+ userId );
        storageService.deleteFiles(userId+"/"+folderName);
        storageService.deleteFiles(userId+"/"+folderName+".tar.gz");
        return ResponseEntity.status(HttpStatus.OK).body("Deleted all files");
    }


    @GetMapping("/download/{folderName}")
    public ResponseEntity<byte[]> downloadCsv(@PathVariable String folderName, HttpSession session) {
        String userId = getUserIdFromSession(session);
        System.out.println("Reached the downloadCsv function"+ folderName);
        byte[] bytes = storageService.downloadCsv(userId, folderName);
        String content = new String(bytes);
        System.out.println("Bytes Stream"+ content);
        if (bytes != null) {
            return ResponseEntity.ok().body(bytes);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/downloadPlot/")
        public ResponseEntity<byte[]> downloadPlot( HttpSession session) {
        String userId = getUserIdFromSession(session);
        System.out.println("Reached the downloadCsv function");
        byte[] bytes = storageService.downloadPlot(userId);
        String content = new String(bytes);
        System.out.println("Bytes Stream"+ content);
        if (bytes != null) {
            return ResponseEntity.ok().body(bytes);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

        @GetMapping("/downloadCtimsImports/{nctId}")
        public ResponseEntity<byte[]> downloadCtimsImports(@PathVariable String nctId, HttpSession session) {
        String userId = getUserIdFromSession(session);
        System.out.println("Reached the downloadCtimsImports function");
        byte[] bytes = storageService.downloadCtimsImports(nctId, userId);
        String content = new String(bytes);
        System.out.println("Bytes Stream"+ content);
        if (bytes != null) {
            return ResponseEntity.ok().body(bytes);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/validation-report-blob/{folderName}")
    public ResponseEntity<byte[]> getReportAsBlob(@PathVariable String folderName, HttpSession session) {
        String userId = getUserIdFromSession(session);
        byte[] bytes = null;
        try {
            bytes = storageService.getReport(userId, folderName);
        } catch (FileNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (bytes != null) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_HTML);
            headers.setContentDispositionFormData("inline", "validated_study.html");
            headers.setContentLength(bytes.length);
            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/validation-report-html/{folderName}")
    public ResponseEntity<String> getReportAsHtml(@PathVariable String folderName, HttpSession session) {
        String userId = getUserIdFromSession(session);

        String htmlContent = storageService.getReportAsString(userId, folderName);
        if (htmlContent == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            return new ResponseEntity<>(htmlContent, HttpStatus.OK);
        }
    }

    @DeleteMapping("/files")
    public ResponseEntity<String> deleteFiles(HttpSession session) {
        String userId = getUserIdFromSession(session);

        storageService.deleteFiles(userId);
        return ResponseEntity.status(HttpStatus.OK).body("Deleted all files");
    }

    private String getUserIdFromSession(HttpSession session) {
//        String userId = (String) session.getAttribute("userId");
//        if (userId == null) {
//            throw HttpClientErrorException.Unauthorized.create(HttpStatus.UNAUTHORIZED, "Unauthorized", HttpHeaders.EMPTY, null, null);
//        }
//        return userId;
        return "user-local";
    }
}
