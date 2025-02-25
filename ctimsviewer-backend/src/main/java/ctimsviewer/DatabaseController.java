package ctimsviewer;


import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import ctimsviewer.ChartsTable;
import ctimsviewer.ChartsTableRepository;
import ctimsviewer.ClinicalData;
import ctimsviewer.TrialDataDTO;
import ctimsviewer.TrialGroup;
import ctimsviewer.service.DatabaseService;

import javax.servlet.http.HttpSession;

import java.util.List;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.nio.charset.StandardCharsets;



@RestController
@CrossOrigin
@RequestMapping("/db")
public class DatabaseController {

    @Autowired
    DatabaseService dataService;

    @Autowired
    ChartsTableRepository chartsTableRepository;


/*
    @GetMapping("/fetch")
    public ResponseEntity<String> fetchData(HttpSession session) {
        //String userId = getUserIdFromSession(session);
        return ResponseEntity.status(HttpStatus.OK).body("Uploaded the file successfully: ");
    }
*/
    @GetMapping("/fetch")
    public ResponseEntity<String> fetchData(HttpSession session, @RequestParam String tableName) {
        String userId = getUserIdFromSession(session);
        byte[] data = dataService.getData(tableName, userId);

        if (data == null || data.length == 0) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No data found");
        }

        return ResponseEntity.status(HttpStatus.OK).body(new String(data));
    }


    @GetMapping("/fetchrepo")
    public ResponseEntity<String> fetchDataRepo(HttpSession session, @RequestParam String tableName) {
        String userId = getUserIdFromSession(session);
        byte[] data = dataService.getDataUsingRepo(tableName, userId);
        if (data == null || data.length == 0) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No data found");
        }

        return ResponseEntity.status(HttpStatus.OK).body(new String(data));
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file, HttpSession session) {
        String userId = getUserIdFromSession(session);
        LocalDateTime time = LocalDateTime.now();
        //String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy, h:mm a"));

        String Time = time.toString();
        dataService.save(file, Time, userId);
        dataService.saveClinicalData(file, Time, userId);
        return ResponseEntity.status(HttpStatus.OK).body("Can access the Endpoint " );
    }

    @GetMapping("/createChart/{chartType}/{ArmTypes}")
    public ResponseEntity<String> getCreateChart(@PathVariable String chartType, @PathVariable String[] ArmTypes, HttpSession session) {
        String userId = getUserIdFromSession(session);
        System.out.printf("Entered FileController123 %s",chartType);
        String bytes = dataService.getCreateChart(userId, chartType, ArmTypes);
        if (bytes != null) {
            //String result = new String(bytes, StandardCharsets.UTF_8);
                    //return ResponseEntity.status(HttpStatus.OK).body("Uploaded the file successfully: " + file.getOriginalFilename());
            System.out.printf("Success %s",bytes.toString() );
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/createChartFilter/{chartType}/{ArmTypes}/{TrialCreationDates}/{StudyIds}")
    public ResponseEntity<String> getFilterChart(@PathVariable String chartType, @PathVariable String[] ArmTypes, @PathVariable String TrialCreationDates, @PathVariable String StudyIds, HttpSession session) {
        String userId = getUserIdFromSession(session);
        System.out.printf("Entered FileController123 %s",chartType);
        String bytes = dataService.getFilterChart(userId, chartType, ArmTypes, TrialCreationDates, StudyIds);
        if (bytes != null) {
            //String result = new String(bytes, StandardCharsets.UTF_8);
                    //return ResponseEntity.status(HttpStatus.OK).body("Uploaded the file successfully: " + file.getOriginalFilename());
            System.out.printf("Success %s",bytes.toString() );
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/fetchTrialIDs")
    public ResponseEntity<String> getTrialIDs(HttpSession session){
        String userId = getUserIdFromSession(session);
        String bytes = dataService.getTrialIDs(userId);
        System.out.printf("bytes  trial ids %s", bytes.toString());
         if (bytes != null) {
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping("/fetchTrialArmIDs")
    public ResponseEntity<String> getTrialArmIDs(HttpSession session){
        String userId = getUserIdFromSession(session);
        String bytes = dataService.getTrialArmIDs(userId);
         if (bytes != null) {
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping("/FilteredTrialArmIDs/{TrialCreationDates}")
    public ResponseEntity<String> getFilteredTrialArmIDs(HttpSession session, @PathVariable String TrialCreationDates){
        String userId = getUserIdFromSession(session);
        System.out.printf("TrialCreationDates, %s", TrialCreationDates);
        String bytes = dataService.getFilteredTrialArmIDs(userId, TrialCreationDates);
         if (bytes != null) {
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping("/fetchStudyIDs")
    public ResponseEntity<String> getStudyIDs(HttpSession session){
        String userId = getUserIdFromSession(session);
        String bytes = dataService.getStudyIDs(userId);
         if (bytes != null) {
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping("/FilteredStudyIDs/{TrialCreationDates}")
    public ResponseEntity<String> getFilteredStudyIDs(HttpSession session, @PathVariable String TrialCreationDates){
        String userId = getUserIdFromSession(session);
        String bytes = dataService.getFilteredStudyIDs(userId, TrialCreationDates);
         if (bytes != null) {
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    //getFilteredTrialArmIDs


    @GetMapping("/groupTrials")
    public ResponseEntity<List<ChartsTable>> getGroupTrials(HttpSession session){
        System.out.printf("Check1");
        String userId = getUserIdFromSession(session);
        List<ChartsTable> bytes = dataService.getGroupTrials(userId);
        System.out.printf("Check1 bytes123 %s", bytes);
        if (bytes != null) {
            return new ResponseEntity<>(bytes,HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }




    @GetMapping("/patientmatch")
    public ResponseEntity<List<ChartsTable>> getPatientMatch(@RequestParam String patientid, HttpSession session){
        String userId = getUserIdFromSession(session);
        List<ChartsTable> bytes = dataService.getPatientMatch(patientid, userId);
         if (bytes != null) {
            return new ResponseEntity<>(bytes,HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }



    @GetMapping("/viewTrialData")
    public ResponseEntity<List<ClinicalData>> viewTrialData(
            @RequestParam(value = "trialcreated", required = false) String trialCreated,
            @RequestParam(value = "trialid", required = false) String trialId,
            @RequestParam(value = "trialname", required = false) String trialName,
            @RequestParam(value = "studyid", required = false) String StudyID,
            @RequestParam(value = "patient_id", required = false) String patientId,
            @RequestParam(value = "sampleid", required = false) String sampleID,
            @RequestParam(value = "hugosymbol", required = false) String hugoSymbol,
            @RequestParam(value = "gene", required = false) String gene,
            HttpSession session) {
        
        String userId = getUserIdFromSession(session);
        
        List<ClinicalData> bytes = dataService.viewTrialData(
                userId, 
                trialCreated, 
                trialId,
                trialName,
                StudyID, 
                patientId, 
                sampleID,
                hugoSymbol, 
                gene
        );
        
        if (bytes != null) {
            return new ResponseEntity<>(bytes, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/reactPlotlyData")
    public ResponseEntity<List<Map<String, String>>> reactPlotlyData(
            @RequestParam(value = "trialcreated", required = false) String trialCreated,
            @RequestParam(value = "trialid", required = false) String trialId,
            @RequestParam(value = "trialname", required = false) String trialName,
            @RequestParam(value = "studyid", required = false) String StudyID,
            @RequestParam(value = "patient_id", required = false) String patientId,
            @RequestParam(value = "sampleid", required = false) String sampleID,
            @RequestParam(value = "hugosymbol", required = false) String hugoSymbol,
            @RequestParam(value = "gene", required = false) String gene,
            HttpSession session) {
        
        String userId = getUserIdFromSession(session);
        System.out.printf("Check1");
        List<Map<String, String>> bytes = dataService.reactPlotlyData(
                userId, 
                trialCreated, 
                trialId,
                trialName,
                StudyID, 
                patientId, 
                sampleID,
                hugoSymbol, 
                gene
        );
        System.out.printf("Check4 ");
        if (bytes != null) {
            return new ResponseEntity<>(bytes, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/reactPlotlyFilter/{ArmTypes}/{TrialCreationDates}/{StudyIds}")
    public ResponseEntity<List<Map<String, String>>> reactPlotlyFilter(@PathVariable String[] ArmTypes, @PathVariable String TrialCreationDates, @PathVariable String StudyIds, HttpSession session) {
        String userId = getUserIdFromSession(session);
        System.out.printf("Check12");
        List<Map<String, String>> bytes = dataService.reactPlotlyFilter(userId, ArmTypes, TrialCreationDates, StudyIds);
        if (bytes != null) {
            return new ResponseEntity<>(bytes ,HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/FectchTrialIdsFromMatachminer")
    public ResponseEntity<String> getTrialFromMatachminer(HttpSession session){
        String userId = getUserIdFromSession(session);
        String bytes = dataService.getTrialFromMatachminer(userId);
         if (bytes != null) {
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/FectchTrialDataFromMatachminer/{trialInternalId}/{trialId}/{dataUpdated}")
    public ResponseEntity<String> getTrialDataFromMatachminer(HttpSession session, @PathVariable String trialInternalId, @PathVariable String trialId, @PathVariable String dataUpdated){
        System.out.printf("trialInternalId %s", trialInternalId);
        String userId = getUserIdFromSession(session);
        String bytes = dataService.getTrialDataFromMatachminer(userId, trialInternalId, trialId, dataUpdated);
         if (bytes != null) {
            return new ResponseEntity<>(bytes.toString(),HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    private String getUserIdFromSession(HttpSession session) {
        return "user-local";
    }


    @GetMapping("/username")
    public ResponseEntity<String> getUsername() {
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

        return ResponseEntity.status(HttpStatus.OK).body(username);
    }

    @DeleteMapping("/delete/{trialDate}")
    public ResponseEntity<String> deleteTrial(@PathVariable String trialDate, HttpSession session) {
    String userId = getUserIdFromSession(session);
    dataService.deleteTrial(userId, trialDate);
    String message = String.format("Deleted Trial %s", trialDate);
    return ResponseEntity.status(HttpStatus.OK).body(message);
    }

}