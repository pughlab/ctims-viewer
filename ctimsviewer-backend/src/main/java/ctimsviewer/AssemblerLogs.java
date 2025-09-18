package ctimsviewer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Data
@Table(name = "AssemblerLogs", schema = "ctimsviewer")
public class AssemblerLogs {

    @Id
    @Column(name = "JobTriggeredTime")
    @JsonProperty("jobtriggeredtime")
    private String jobtriggeredtime;

    @Column(name = "UserTriggered")
    @JsonProperty("usertriggered")
    private String usertriggered;

    @Column(name = "StudyId")
    @JsonProperty("studyid")
    private String studyid;

    @Column(name = "JobCompletedTime")
    @JsonProperty("jobcompletedtime")
    private String jobcompletedtime;

    @Column(name = "JobStatus")
    @JsonProperty("jobstatus")
    private String jobstatus;

    @Column(name = "JobResult")
    @JsonProperty("jobresult")
    private String jobresult;


}
