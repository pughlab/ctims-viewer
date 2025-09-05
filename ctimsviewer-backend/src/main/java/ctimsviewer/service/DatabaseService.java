package ctimsviewer.service;
import ctimsviewer.ChartsTable;
import ctimsviewer.ClinicalData;
import ctimsviewer.AssemblerLogs;
import ctimsviewer.TrialDataDTO;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;



public interface DatabaseService{

    void init();

    void save(MultipartFile file, String time, String userId);

    void saveClinicalData(MultipartFile file, String time, String userId);

    byte[] getData(String tableName,  String userId);

    byte[] getDataUsingRepo(String tableName , String userId);

    byte[] getDataUsingFilter(String TrialCreationDates, String StudyIds,String userId);

    String getCreateChart(String userId, String chartType, String[] ArmTypes);

    String getFilterChart(String userId, String chartType, String[] ArmTypes, String TrialCreationDates, String StudyIds);

    String getTrialArmIDs(String userId);

    String getTrialIDs(String userId);

    public String getFilteredTrialArmIDs(String userId, String TrialCreationDates);

    public String getFilteredTrialArmIDsWithTrialId(String userId, String TrialCreationDates, String TrialId);

    String getStudyIDs(String userId);

    public String getFilteredStudyIDs(String userId, String TrialCreationDates, String TrialIds);

    public List<ClinicalData> viewTrialData(String userId, String trialCreated, String trialId, String trialName, String StudyID, String patientId, String SampleID, String hugoSymbol, String gene);

    public List<Map<String, String>> reactPlotlyData(String userId, String trialCreated, String trialId, String trialName, String StudyID, String patientId, String SampleID, String hugoSymbol, String gene);

    public void fetchAssemblerData(String userId, String StudyIds, String email);

    public List<Map<String, String>> reactPlotlyFilter(String userId, String[] ArmTypes, String TrialCreationDates, String StudyIds);

    List<ChartsTable> getGroupTrials(String userId);

    List<AssemblerLogs> getAssemblerLogsData(String userId);

    List<ChartsTable> getPatientMatch(String patientid, String userId);

    public void deleteTrial(String userId, String trialDate, String trialId);

    public String getTrialFromMatchEngine(String userId);

    public String getStudyDataFromMatchEngine(String userId);

    void saveTrialInformation(List<Map<String, Object>> records, String time);

    public String formatDate(String dateString);

    void saveResultsJsonData(List<Map<String, Object>> records, String time);

    public String getTrialDataFromMatchEngine(String userId, String trialInternalId, String trialId, String dataUpdated);
    
    String getUserName();


}