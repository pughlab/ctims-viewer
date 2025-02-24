package ctimsviewer;

public class TrialGroup {
    private String TRIALCREATED;
    private Long uniqueCount;

    public TrialGroup(String TRIALCREATED, Long uniqueCount) {
        this.TRIALCREATED = TRIALCREATED;
        this.uniqueCount = uniqueCount;
    }

    public String getTrialCreated() {
        return TRIALCREATED;
    }

    public void setTrialCreated(String trialCreated) {
        this.TRIALCREATED = TRIALCREATED;
    }

    public Long getUniqueCount() {
        return uniqueCount;
    }

    public void setUniqueCount(Long uniqueCount) {
        this.uniqueCount = uniqueCount;
    }
}
