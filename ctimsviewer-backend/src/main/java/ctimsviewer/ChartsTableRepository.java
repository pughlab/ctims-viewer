package ctimsviewer;

//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;


import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

import ctimsviewer.ChartsTable;
import ctimsviewer.ClinicalData;
import ctimsviewer.TrialDataDTO;
import ctimsviewer.TrialGroup;

/*
public interface ChartsTableRepository extends JpaRepository<ChartsTable, Long> {



    @Query("SELECT c FROM ChartsTable c WHERE c.tableName = :tableName")
    List<ChartsTable> findAllByTableName(@Param("tableName") String tableName);
  
}
*/

//TrialMatchdata
//TrialMatchImport

@Repository
public interface ChartsTableRepository extends CrudRepository<ChartsTable, Long> {
    
    @Query("SELECT * FROM ClinicalData")
    List<ChartsTable> findAllByTableName(@Param("tableName") String tableName);


    @Query("SELECT * FROM ClinicalData WHERE TRIALCREATED IN (:arguments)  AND STUDYID IN (:studylist)")
    List<ClinicalData> findDataByCreationDate(@Param("arguments") List<String> arguments, @Param("studylist") List<String>  studylist);

    @Query("SELECT * FROM ClinicalData WHERE TRIALARMID IN (:armlist) AND TRIALCREATED IN (:arguments)  AND STUDYID IN (:studylist)")
    List<ClinicalData> findPlotlyDataByCreationDate(@Param("armlist") List<String> armlist, @Param("arguments") List<String> arguments, @Param("studylist") List<String>  studylist);


    @Query("SELECT * FROM ClinicalData WHERE " +
        "(TRIALCREATED = :TRIALCREATED OR :TRIALCREATED IS NULL) AND " +
        "(TrialId = :trialId OR :trialId IS NULL) AND " +
        "(TrialName = :trialName OR :trialName IS NULL) AND " +
        "(StudyID = :StudyID OR :StudyID IS NULL) AND " +
        "(patient_id = :patient_id OR :patient_id IS NULL) AND " +
        "(SampleID = :SampleID OR :SampleID IS NULL) AND " +
        "(HugoSymbol = :HugoSymbol OR :HugoSymbol IS NULL) AND " +
        "(:gene IS NULL OR HugoSymbol = :gene OR LeftPartnerGene = :gene OR RightPartnerGene = :gene)")
    List<ClinicalData> findDataByCustomFilter(
        @Param("TRIALCREATED") String TRIALCREATED,
        @Param("trialId") String trialId,
        @Param("trialName") String trialName,
        @Param("StudyID") String StudyID,
        @Param("patient_id") String patient_id,
        @Param("SampleID") String SampleID,
        @Param("HugoSymbol") String HugoSymbol,
        @Param("gene") String gene
    );

    @Query("SELECT TrialArmId, patient_id, combineddata, StudyID FROM ClinicalData WHERE " +
        "(TRIALCREATED = :TRIALCREATED OR :TRIALCREATED IS NULL) AND " +
        "(TrialId = :trialId OR :trialId IS NULL) AND " +
        "(TrialName = :trialName OR :trialName IS NULL) AND " +
        "(StudyID = :StudyID OR :StudyID IS NULL) AND " +
        "(patient_id = :patient_id OR :patient_id IS NULL) AND " +
        "(SampleID = :SampleID OR :SampleID IS NULL) AND " +
        "(HugoSymbol = :HugoSymbol OR :HugoSymbol IS NULL) AND " +
        "(:gene IS NULL OR HugoSymbol = :gene OR LeftPartnerGene = :gene OR RightPartnerGene = :gene)")
    List<ClinicalData> reactPlotlyDataFilter(
        @Param("TRIALCREATED") String TRIALCREATED,
        @Param("trialId") String trialId,
        @Param("trialName") String trialName,
        @Param("StudyID") String StudyID,
        @Param("patient_id") String patient_id,
        @Param("SampleID") String SampleID,
        @Param("HugoSymbol") String HugoSymbol,
        @Param("gene") String gene
    );

    @Query("SELECT DISTINCT c.trialarmid FROM ClinicalData c")
    List<String> findAllUniqueTrialarmid();

    @Query("SELECT c.trialid, c.trialcreated FROM CTIMSCHARTS c")
    List<ChartsTable> findAllUniqueTrialid();


    @Query("SELECT DISTINCT c.trialarmid FROM ClinicalData c WHERE TRIALCREATED IN (:arguments)")
    List<String> findFilteredUniqueTrialarmid(@Param("arguments") List<String>  arguments);

    @Query("SELECT DISTINCT c.studyid FROM ClinicalData c")
    List<String> findAllUniqueStudyid();

    @Query("SELECT DISTINCT c.studyid FROM ClinicalData c WHERE TRIALCREATED IN (:arguments)")
    List<String> findFilteredUniqueStudyid(@Param("arguments") List<String>  arguments);

    @Transactional
    @Modifying
    @Query("INSERT INTO CTIMSCHARTS (TRIALCREATED, USERNAME, UNIQUEARMS, UNIQUEPATIENTS, TRIALID, TRIALMATCHDATE, UNIQUESTUDYID, TRIALNAME) VALUES (:trialcreated, :username, :uniquearms, :uniquepatients, :trialid, :trialmatchdate, :uniquestudyid, :trialname)")
    void insertTrialInformation(@Param("trialcreated") String trialcreated, @Param("username") String username, @Param("uniquearms") int uniquearms, @Param("uniquepatients") int uniquepatients, @Param("trialid") String trialid, @Param("trialmatchdate") String trialmatchdate, @Param("uniquestudyid") int uniquestudyid, @Param("trialname") String trialname);



    @Query("SELECT * FROM CTIMSCHARTS")
    List<ChartsTable> groupTrials();

    @Query("SELECT TRIALCREATED FROM CTIMSCHARTS where TRIALID = :trialid AND TRIALMATCHDATE= :trialcreated")
    List<ChartsTable> getTrialCreatedDate(@Param("trialcreated") String trialcreated, @Param("trialid") String trialid);


    @Query("SELECT * FROM CTIMSCHARTS WHERE PATIENTID = :argument")
    List<ChartsTable> getPatientsData(@Param("argument") String argument);


    @Transactional
    @Modifying
    @Query("DELETE FROM CTIMSCHARTS WHERE TRIALCREATED = :argument")
    void deleteTrialFromCTIMSCHARTS(@Param("argument") String argument);

    @Transactional
    @Modifying
    @Query("DELETE FROM ClinicalData WHERE TRIALCREATED = :argument")
    void deleteTrialFromClinicalData(@Param("argument") String argument);


    @Transactional
    @Modifying
    @Query("INSERT INTO ClinicalData (TrialId, TrialName, TrialMatchDate, TrialArmId, ArmCode, StudyID, patient_id, SampleID, VitalStatus, Gender, Age, Diagnosis, HER2Status, ERStatus, PRStatus, GenomicAlteration, HugoSymbol, MutationEffect, TrueVariantClassification, VariantCategory, LeftPartnerGene, RightPartnerGene, CNVCall, MSStatus, TRIALCREATED, COMBINEDDATA, ONCOTREEPRIMARYDIAGNOSISMATCHONLY) " +
           "VALUES (:trialId, :trialName, :trialMatchDate, :trialArmId, :armCode, :studyID, :patientId, :sampleID, :vitalStatus, :gender, :age, :diagnosis, :her2Status, :erStatus, :prStatus, :genomicAlteration, :hugoSymbol, :mutationEffect, :trueVariantClassification, :variantCategory, :leftPartnerGene, :rightPartnerGene, :cnvCall, :msStatus, :trialcreated, :combinedData, :oncotreePrimaryDiagnosisMatchOnly)")
    void insertClinicalData(@Param("trialId") String trialId,
                            @Param("trialName") String trialName,
                            @Param("trialMatchDate") String trialMatchDate,
                            @Param("trialArmId") String trialArmId,
                            @Param("armCode") String armCode,
                            @Param("studyID") String studyID,
                            @Param("patientId") String patientId,
                            @Param("sampleID") String sampleID,
                            @Param("vitalStatus") String vitalStatus,
                            @Param("gender") String gender,
                            @Param("age") String age,
                            @Param("diagnosis") String diagnosis,
                            @Param("her2Status") String her2Status,
                            @Param("erStatus") String erStatus,
                            @Param("prStatus") String prStatus,
                            @Param("genomicAlteration") String genomicAlteration,
                            @Param("hugoSymbol") String hugoSymbol,
                            @Param("mutationEffect") String mutationEffect,
                            @Param("trueVariantClassification") String trueVariantClassification,
                            @Param("variantCategory") String variantCategory,
                            @Param("leftPartnerGene") String leftPartnerGene,
                            @Param("rightPartnerGene") String rightPartnerGene,
                            @Param("cnvCall") String cnvCall,
                            @Param("msStatus") String msStatus,
                            @Param("trialcreated") String trialcreated,
                            @Param("combinedData") String combinedData,
                            @Param("oncotreePrimaryDiagnosisMatchOnly") String oncotreePrimaryDiagnosisMatchOnly);

}