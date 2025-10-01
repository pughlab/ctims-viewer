import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import useAxiosDb from "../service/useAxiosDb";
import "./PatientView.css";

interface ChartData {
    uniquearms: number;
    uniquepatients: number;
    trialcreated: string;
    username: string;
    trialid: string;
    trialmatchdate: string;
    uniquestudyid: number;
    trialname: string;
}

const PatientView = (props: any) => {
    const { response: fetchPatientsDataResponse, operation: fetchPatientsDataOperation } = useAxiosDb();
    const [patientsData, setPatientsData] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    const bearerToken = props.accessToken;
    const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_REALM;
    const selectedPatientIds = [props.patient_ids];
    const selectedStudyIds=[props.study_id]

    useEffect(() => {
        handleFetchPatientsData();
    }, []);

    useEffect(() => {
        if (fetchPatientsDataResponse && Array.isArray(fetchPatientsDataResponse)) {
            setPatientsData(fetchPatientsDataResponse);
            console.log("Fetched Patients Data:", fetchPatientsDataResponse);
        }
    }, [fetchPatientsDataResponse]);

    const handleFetchPatientsData = () => {
        const headers: Record<string, string> = {
            "Content-type": "application/json; charset=UTF-8",
        };
        if (keycloakIntegration !== "disable" && bearerToken) {
            headers["Authorization"] = `Bearer ${bearerToken}`;
        }
        fetchPatientsDataOperation({
            method: "POST",
            url: `fetchIndividualPatientsData`,
            headers: headers,
            data: { selectedPatientIds },
        });
    };

    const renderMatchValues = (rowData: any) => {
        let parsedMatch = {};
        try {
            parsedMatch = JSON.parse((rowData.c || "{}").replace(/'/g, '"'));
        } catch (err) {
            parsedMatch = { error: "Invalid match data" };
        }

        return (
            <ul className="match-values">
                {Object.entries(parsedMatch).map(([key, value]) => (
                    <li key={key}>
                        <strong>{formatKey(key)}:</strong> {String(value)}
                    </li>
                ))}
            </ul>
        );
    };

    const formatKey = (key: string) => {
        return key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const footer = `Total ${patientsData ? patientsData.length : 0} rows.`;


    return (
        <div className="charts-tab-content">
            <div className="patient-info-bar">
                <div>
                    <span className="label">Patient ID:</span> {props.patient_ids}
                </div>
                <div>
                    <span className="label">Study ID:</span> {props.study_id}
                </div>
                <div>
                    {props.patient_ids && props.study_id && <button
                        className="cbiportal-button"
                        onClick={() => {
                            const cbiPortalUrl = process.env.REACT_APP_CBIOPORTAL_URL;
                            const link = `${cbiPortalUrl}/patient?studyId=${props.study_id}&caseId=${props.patient_ids}`;
                            window.open(link, "_blank");
                        }}
                    >
                        View in cBioPortal
                    </button>}
                </div>
            </div>
            <div className="table-container">
                <div className="table-toolbar">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={globalFilterValue}
                            onChange={(e) => setGlobalFilterValue(e.target.value)}
                            placeholder="Search patients..."
                            className="search-input"
                        />
                    </span>
                </div>
                <DataTable
                    value={patientsData}
                    paginator
                    rows={5} 
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    responsiveLayout="scroll"
                    globalFilterFields={['ti', 'tn', 'ta', 'matchValuesStr']} 
                    selectionMode="single"
                    selection={selectedPatient}
                    onSelectionChange={(e) => setSelectedPatient(e.value)}
                    globalFilter={globalFilterValue}
                    footer={footer}
                    emptyMessage="No patients found"
                    className="p-datatable-gridlines">
                    <Column field="ti" header="Trial ID" sortable />
                    <Column field="tn" header="Trial Name" sortable />
                    <Column field="ta" header="Trial Arm" sortable />
                    <Column field="c" header="Patient Match Values" body={renderMatchValues} sortable />
                </DataTable>
            </div>
        </div>
    );
};

export default PatientView;
