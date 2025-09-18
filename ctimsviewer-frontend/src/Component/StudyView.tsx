import React, { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import useAxiosDb from "../service/useAxiosDb";
import "./StudyView.css";

interface ChartData {
    uniquearms: number;
    uniquepatients: number;
    trialcreated: string;
    username: string;
    trialid: String;
    trialmatchdate: String;
    uniquestudyid: number;
    trialname: String;
}

const StudyView = (props: any) => {


    const { response: fetchIdResponse, loading: fetchIdLoading, error: fetchIdError, operation: fetchIdOperation } = useAxiosDb();
    const { response: fetchTrialIdResponse, loading: fetchTrialIdLoading, error: fetchTrialIdError, operation: fetchTrialIdOperation } = useAxiosDb();
    const { response: fetchStudyIdResponse, loading: fetchStudyIdLoading, error: fetchStudyIdError, operation: fetchStudyIdOperation } = useAxiosDb();
    const { response: groupTrialsResponse, loading: groupTrialsLoading, error: groupTrialsError, operation: groupTrialsOperation } = useAxiosDb();
    const { response: fetchPatientsDataResponse, loading: fetchPatientsDataLoading, error: fetchPatientsDataError, operation: fetchPatientsDataOperation } = useAxiosDb();

    const [selectedTrialsLabel, setSelectedTrialsLabel] = useState<ChartData[]>([]);
    const [selectedTrials, setSelectedTrials] = useState<ChartData[]>([]);
    const [newCheckedItems, setNewCheckedItems] = useState<string[]>([]);
    const [selectedStudy, setSelectedStudy] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [charts, setCharts] = useState<ChartData[]>([]);
    const [trialArmData, setTrialArmData] = useState<any[]>([]);
    const [studyData, setStudyData] = useState<any[]>([]);
    const [checkedItems, setCheckedItems] = useState<string[]>([]);
    const [patientsData, setPatientsData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState('');
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);





    var bearerToken = props.accessToken;
    const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_REALM;



    useEffect(() => {
        getTrialArmIDs();
        getTrialIDs();
        getStudyArmIDs();
        handleTrialIds();
    }, [])

    useEffect(() => {
        getTrialArmIDs();
        getStudyArmIDs();
    }, [selectedTrials]);

    useEffect(() => {
        if (groupTrialsResponse) {
            setCharts(groupTrialsResponse as ChartData[]);
        }
    }, [groupTrialsResponse]);

    useEffect(() => {
        if (fetchTrialIdResponse && (fetchTrialIdResponse as string).length > 0) {
            if ((fetchTrialIdResponse as string).includes(',')) {
                const parsedData = (fetchTrialIdResponse as string).replace(/[\[\]]/g, '').split(', ').map(item => item.trim());
                setTrialArmData(parsedData);
            }
            else {
                const parsedData = [(fetchTrialIdResponse as string).replace(/[\[\]]/g, '').trim()];
                setTrialArmData(parsedData);
            }
        }

    }, [fetchTrialIdResponse])

    useEffect(() => {
        if (fetchStudyIdResponse && (fetchStudyIdResponse as string).length > 0) {
            if ((fetchStudyIdResponse as string).includes(',')) {
                const parsedData = (fetchStudyIdResponse as string).replace(/[\[\]]/g, '').split(', ').map(item => item.trim());
                setStudyData(parsedData);
            }
            else {
                const parsedData = [(fetchStudyIdResponse as string).replace(/[\[\]]/g, '').trim()];
                setStudyData(parsedData);
            }
        }

    }, [fetchStudyIdResponse])

    useEffect(() => {
        if (fetchPatientsDataResponse && Array.isArray(fetchPatientsDataResponse)) {
            setPatientsData(fetchPatientsDataResponse);
        }
    }, [fetchPatientsDataResponse]);


    const handleChange = (selectedList: any) => {
        setSelectedOptions(selectedList);
    };

    const handleStudyChange = (selectedList: any) => {
        setSelectedStudy(selectedList);
    };

    const transformedTrialOptions = charts.map((trial: any) => ({
        label: `${trial.trialid}`,
        value: trial.trialid,
    }));

    const handleTrialsChange = (selectedList: any) => {
        setSelectedTrialsLabel(selectedList);

        const matchedCreatedDates = selectedList.map((trialId: any) => {
            const match = charts.find(chart => chart.trialid === trialId);
            return match?.trialcreated ?? null;
        }).filter(Boolean); 

        setSelectedTrials(matchedCreatedDates as ChartData[]);

        setNewCheckedItems(prev => [...prev, ...matchedCreatedDates]);
    };



    const handleTrialIds = () => {
        const headers: Record<string, string> = {
            'Content-type': 'application/json; charset=UTF-8',
        };
        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }

        groupTrialsOperation({
            method: 'GET',
            url: `groupTrials`,
            headers: headers,
        });
    };


    const getTrialIDs = () => {
        if (bearerToken || keycloakIntegration == "disable") {
            const headers: Record<string, string> = {
                'Content-type': 'application/json; charset=UTF-8',
            };

            if (keycloakIntegration !== "disable" && bearerToken) {
                headers['Authorization'] = `Bearer ${bearerToken}`;
            }

            fetchIdOperation({
                method: 'GET',
                url: 'fetchTrialIDs',
                headers: headers
            });
        }

    };

    const getTrialArmIDs = () => {
        if (bearerToken || keycloakIntegration == "disable") {
            const headers: Record<string, string> = {
                'Content-type': 'application/json; charset=UTF-8',
            };
            if (keycloakIntegration !== "disable" && bearerToken) {
                headers['Authorization'] = `Bearer ${bearerToken}`;
            }

            if (selectedTrials.length > 0) {
                fetchTrialIdOperation({
                    method: 'GET',
                    url: `FilteredTrialArmIDsWithTrialId/${selectedTrials}/${selectedTrialsLabel}`,
                    headers: headers
                });
            }
            else {
                fetchTrialIdOperation({
                    method: 'GET',
                    url: 'fetchTrialArmIDs',
                    headers: headers
                });

            }
        }
    };


    const getStudyArmIDs = () => {
        if (bearerToken || keycloakIntegration == "disable") {
            const headers: Record<string, string> = {
                'Content-type': 'application/json; charset=UTF-8',
            };

            if (keycloakIntegration !== "disable" && bearerToken) {
                headers['Authorization'] = `Bearer ${bearerToken}`;
            }

            if (selectedTrials.length > 0) {
                fetchStudyIdOperation({
                    method: 'GET',
                    url: `FilteredStudyIDs/${selectedTrials}/${selectedTrialsLabel}`,
                    headers: headers
                });
            }
            else {
                fetchStudyIdOperation({
                    method: 'GET',
                    url: 'fetchStudyIDs',
                    headers: headers
                });

            }
        }
    };

    const handleFetchPatientsData = () => {
        const headers: Record<string, string> = {
            'Content-type': 'application/json; charset=UTF-8',
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }

        const timestamp = Date.now();

        console.log("selectedOptions", selectedOptions);
        console.log("selectedTrials", selectedTrials);
        console.log("selectedStudy", selectedStudy);
        if (selectedTrials.length > 0) {
            fetchPatientsDataOperation({
                method: 'POST',
                url: `fetchPatientsData`,
                headers: headers,
                data: {
                    selectedOptions,
                    selectedStudy,
                },
            });
        }
    };



    const filteredPatients = patientsData.filter((patient) =>
        patient.p.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredPatients.slice(indexOfFirstRow, indexOfLastRow);

    const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };


    interface PatientModalProps {
        patient: any;
        onClose: () => void;
    }

    const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose }) => {
        let parsedMatch = {};
        try {
            parsedMatch = JSON.parse((patient.c || '{}').replace(/'/g, '"'));
        } catch (err) {
            parsedMatch = { error: "Invalid match data" };
        }

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <button className="close-button" onClick={onClose}>X</button>
                    <h2>Patient Details</h2>
                    <p><strong>Patient ID:</strong> {patient.p}</p>
                    <p><strong>Study ID:</strong> {patient.s}</p>
                    <p><strong>Trial ID:</strong> {patient.ti}</p>
                    <p><strong>Trial Name:</strong> {patient.tn}</p>
                    <p><strong>Trial Arm:</strong> {patient.ta}</p>
                    <h3>Patient Match Values:</h3>
                    <ul>
                        {Object.entries(parsedMatch).map(([key, value]) => (
                        <li key={key}><strong>{formatKey(key)}:</strong> {String(value)}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const formatKey = (key: string) => {
        return key
            .split('_')
            .map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join(' ');
    };

    return (
        <>
            {(
                <div className="charts-tab-content">
                    <div className="left">
                        <div className="mainButtonsContainer">
                            <div className="dropdown-container">
                                <div className="indi-dropdown-container">
                                    {charts && (
                                        <>
                                            <label htmlFor="trialIdsMultiSelect" className="dropdown-label">Trial Id's</label>
                                            <MultiSelect
                                                id="trialIdsMultiSelect"
                                                className="fixed-width-select w-full md:w-20rem"
                                                //options={trialArmOptions.map((arm) => ({ label: arm, value: arm }))}
                                                options={transformedTrialOptions}
                                                value={selectedTrialsLabel}
                                                placeholder="Trial Id's"
                                                filter
                                                onChange={(e) => handleTrialsChange(e.value)}
                                            />
                                        </>
                                    )}
                                </div>
                                <br />
                                <div className="indi-dropdown-container">
                                    {trialArmData && (
                                        <>
                                            <label htmlFor="trialArmIdsMultiSelect" className="dropdown-label">Trial Arm Id's</label>
                                            <MultiSelect
                                                id="trialArmIdsMultiSelect"
                                                className="fixed-width-select w-full md:w-20rem"
                                                options={trialArmData}
                                                value={selectedOptions}
                                                placeholder="Trial Arm Id's"
                                                filter
                                                disabled={selectedTrials.length === 0}
                                                onChange={(e) => handleChange(e.value)}
                                            />
                                        </>
                                    )}
                                </div>
                                <br />
                                <div className="indi-dropdown-container">
                                    {studyData && (
                                        <>
                                            <label htmlFor="studyIdsMultiSelect" className="dropdown-label">Study Id's</label>
                                            <MultiSelect
                                                id="studyIdsMultiSelect"
                                                className="fixed-width-select w-full md:w-20rem"
                                                options={studyData}
                                                value={selectedStudy}
                                                placeholder="Study Id's"
                                                filter
                                                disabled={selectedTrials.length === 0}
                                                onChange={(e) => handleStudyChange(e.value)}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="ButtonContainer">
                                <button className="createCtmlButton" onClick={handleFetchPatientsData} style={{ height: "2.5rem", alignItems: "center" }} >
                                    Fetch Patients Data
                                </button>
                            </div>
                        </div>
                        {patientsData.length > 0 && (
                            <div className="table-container mt-4">
                                <input
                                    type="text"
                                    placeholder="Search Patient ID"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{
                                        marginBottom: "1rem",
                                        padding: "0.5rem",
                                        borderRadius: "5px",
                                        border: "1px solid #ccc",
                                        width: "250px"
                                    }}
                                />
                                <div className="patient-cards-container">
                                    {currentRows.map((patient, index) => (
                                        <div
                                            key={index}
                                            className="patient-card"
                                            onClick={() => setSelectedPatient(patient)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="patient-info">
                                                <p><strong>Patient ID:</strong> {patient.p}</p>
                                                <p><strong>Study ID:</strong> {patient.s}</p>
                                                <p><strong>Trial ID:</strong> {patient.ti}</p>
                                                <p><strong>Trial Name:</strong> {patient.tn}</p>
                                                <p><strong>Trial Arm:</strong> {patient.ta}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {selectedPatient && (
                                    <PatientModal
                                        patient={selectedPatient}
                                        onClose={() => setSelectedPatient(null)}
                                    />
                                )}
                                {/* Pagination Controls */}
                                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="createCtmlButton"
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="createCtmlButton"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default StudyView;