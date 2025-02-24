package ctimsviewer.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.util.List;

public interface FilesStorageService {

    void init();

    void save(MultipartFile file, String userId);

    void deleteFiles(String userId);

    List<String> getFiles(String userId);

    List<String> getFolders(String userId);

    List<String> getGzFolders(String userId);

    List<String> getFilesInFolder(String userId, String folderName);

    byte[] getValidationResult(String userId, String folderName);
    
    String getCreateCsv(String userId, String folderName);

    String getCreateChart(String userId, String chartType, String selectedFile);

    String getCtimsImports(String userId, String nctId);

    List<byte[]> getPlots(String userId);

    byte[] getReport(String userId, String folderName) throws FileNotFoundException;

    String getReportAsString(String userId, String folderName);

    byte[] downloadCsv(String userId, String fileName);

    byte[] downloadPlot(String userId);

    byte[] downloadCtimsImports(String nctId, String userId);

}
