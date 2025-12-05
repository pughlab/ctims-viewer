CREATE TABLE IF NOT EXISTS ctimsviewer.`AssemblerLogs` (
  `UserTriggered` varchar(255) DEFAULT NULL,
  `StudyId` varchar(255) DEFAULT NULL,
  `JobTriggeredTime` varchar(255) DEFAULT NULL,
  `JobCompletedTime` varchar(255) DEFAULT NULL,
  `JobStatus` varchar(100) DEFAULT NULL,
  `JobResult` varchar(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS ctimsviewer.`CTIMSCHARTS` (
  `TRIALCREATED` varchar(255) NOT NULL,
  `USERNAME` varchar(255) DEFAULT NULL,
  `UNIQUEARMS` int DEFAULT NULL,
  `UNIQUEPATIENTS` int DEFAULT NULL,
  `TRIALID` varchar(255) DEFAULT NULL,
  `TRIALMATCHDATE` varchar(255) DEFAULT NULL,
  `UNIQUESTUDYID` int DEFAULT NULL,
  `TRIALNAME` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`TRIALCREATED`)
);

CREATE TABLE IF NOT EXISTS ctimsviewer.`CbioPortalMatchedData` (
  `StudyId` varchar(255) DEFAULT NULL,
  `PatientId` varchar(255) DEFAULT NULL,
  `SampleId` varchar(255) DEFAULT NULL,
  `FileName` varchar(255) DEFAULT NULL,
  `timeInserted` varchar(255) DEFAULT NULL,
  `TrialName` varchar(255) DEFAULT NULL,
  `TrialArmId` varchar(255) DEFAULT NULL,
  `TrialCreatedDate` varchar(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS ctimsviewer.`ClinicalData` (
  `TrialId` varchar(255) DEFAULT NULL,
  `TrialName` varchar(255) DEFAULT NULL,
  `TrialMatchDate` varchar(255) DEFAULT NULL,
  `TrialArmId` varchar(255) DEFAULT NULL,
  `ArmCode` varchar(255) DEFAULT NULL,
  `StudyID` varchar(255) DEFAULT NULL,
  `patient_id` varchar(255) DEFAULT NULL,
  `SampleID` varchar(255) DEFAULT NULL,
  `VitalStatus` varchar(255) DEFAULT NULL,
  `Gender` varchar(255) DEFAULT NULL,
  `Age` varchar(255) DEFAULT NULL,
  `Diagnosis` varchar(255) DEFAULT NULL,
  `HER2Status` varchar(255) DEFAULT NULL,
  `ERStatus` varchar(255) DEFAULT NULL,
  `PRStatus` varchar(255) DEFAULT NULL,
  `GenomicAlteration` varchar(255) DEFAULT NULL,
  `HugoSymbol` varchar(255) DEFAULT NULL,
  `MutationEffect` varchar(255) DEFAULT NULL,
  `TrueVariantClassification` varchar(255) DEFAULT NULL,
  `VariantCategory` varchar(255) DEFAULT NULL,
  `LeftPartnerGene` varchar(255) DEFAULT NULL,
  `RightPartnerGene` varchar(255) DEFAULT NULL,
  `CNVCall` varchar(255) DEFAULT NULL,
  `MSStatus` varchar(255) DEFAULT NULL,
  `TRIALCREATED` varchar(255) DEFAULT NULL,
  `CombinedData` varchar(2048) DEFAULT NULL,
  `OncotreePrimaryDiagnosisMatchOnly` varchar(255) DEFAULT NULL,
  KEY `FK_TRIALCREATED` (`TRIALCREATED`),
  CONSTRAINT `FK_TRIALCREATED` FOREIGN KEY (`TRIALCREATED`) REFERENCES `CTIMSCHARTS` (`TRIALCREATED`)
);