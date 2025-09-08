package ctimsviewer;
public class FetchDataFromRequest {
    private String[] selectedOptions;
    private String[] selectedTrials;
    private String[] selectedStudy;
    private String[] selectedPatientIds;
    private long timestamp;

    public String[] getSelectedOptions() {
        return selectedOptions;
    }

    public void setSelectedOptions(String[] selectedOptions) {
        this.selectedOptions = selectedOptions;
    }

    public String[] getSelectedTrials() {
        return selectedTrials;
    }

    public void setSelectedTrials(String[] selectedTrials) {
        this.selectedTrials = selectedTrials;
    }

    public String[] getSelectedStudy() {
        return selectedStudy;
    }

    public void setSelectedStudy(String[] selectedStudy) {
        this.selectedStudy = selectedStudy;
    }

    public String[] getSelectedPatientIds() {
        return selectedPatientIds;
    }

    public void setSelectedPatientIds(String[] selectedPatientIds) {
        this.selectedPatientIds = selectedPatientIds;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
