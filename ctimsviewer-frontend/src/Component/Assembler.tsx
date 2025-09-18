import React, { useState, useEffect } from 'react';
import useAxiosDb from "../service/useAxiosDb";
import './Assembler.css';
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";

interface AssemblerLog {
    jobtriggeredtime: string;
    usertriggered: string;
    studyid: string;
    jobcompletedtime: string;
    jobstatus: string;
    jobresult: string;
}

type StudyData = {
    _id: string;
    total_count: number;
    patient_count: number;
    sample_count: number;
  };
  
  type ApiResponse = {
    clinical: StudyData[];
    genomic: StudyData[];
    prior_treatment: StudyData[];
  };


const Assembler = (props: { accessToken?: string; keycloakIntegration?: string }) => {
    const [studyId, setStudyId] = useState('');
    const [jobMessage, setJobMessage] = useState('');
    const [assemblerLogs, setAssemblerLogs] = useState<AssemblerLog[]>([]);
    const [studyData, setStudyData] = useState<ApiResponse | null>(null);
    const [showLogs, setShowLogs] = useState(false);

    const { operation: fetchAssemblerOperation, loading, error } = useAxiosDb();
    const {
        response: fetchStudyDataResponse,
        loading: fetchStudyDataLoading,
        error: fetchStudyDataError,
        operation: fetchStudyDataOperation,
    } = useAxiosDb();

    const {
        operation: fetchAssemblerLogsOperation,
        loading: fetchLogsLoading,
        error: fetchLogsError,
        response: fetchAssemblerLogsResponse
    } = useAxiosDb();

    const bearerToken = props.accessToken || "";
    const keycloakIntegration = props.keycloakIntegration || "enable";

    const headers: Record<string, string> = {
        'Content-type': 'application/json; charset=UTF-8',
    };
    if (keycloakIntegration !== "disable" && bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    // Fetch logs using the hook
    const fetchLogs = () => {
        fetchAssemblerLogsOperation({
            method: 'GET',
            url: `/fetchAssemblerLogs`,
            headers: headers
        });
    };

    useEffect(() => {
        if (fetchAssemblerLogsResponse) {
            const logs: AssemblerLog[] = fetchAssemblerLogsResponse ?? fetchAssemblerLogsResponse ?? [];
            setAssemblerLogs(logs);
        }
    }, [fetchAssemblerLogsResponse]);

    useEffect(() => {
        if (fetchStudyDataResponse) {
          setStudyData(fetchStudyDataResponse);
        }
      }, [fetchStudyDataResponse]);

      const fetchStudyData = () => {
        const headers: Record<string, string> = {
            "Content-type": "application/json; charset=UTF-8",
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers["Authorization"] = `Bearer ${bearerToken}`;
        }

        fetchStudyDataOperation({
            method: "GET",
            url: "/FetchStudyDataFromMatchEngine",
            headers: headers,
        });
    };

    useEffect(() => {
        fetchLogs();
        fetchStudyData();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (studyId.trim().length === 0) {
            console.warn("Please enter a valid Study ID");
            return;
        }

        setJobMessage('Starting job...');

        fetchAssemblerOperation({
            method: 'GET',
            url: `fetchAssemblerData/${studyId}`,
            headers: headers
        }).then((res: any) => {
            setJobMessage(res || 'Job request sent.');
            fetchLogs(); // Refresh logs after job submission
        }).catch(() => {
            setJobMessage('Failed to start job.');
        });
    };

    const getStatusClass = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
                return 'completed';
            case 'RUNNING':
                return 'running';
            case 'FAILED':
                return 'failed';
            default:
                return '';
        }
    };

    const getResultClass = (result: string) => {
        const r = result.toUpperCase().replace(/\s/g, '_');
        switch (r) {
            case 'SUCCESS':
                return 'success';
            case 'IN_PROGRESS':
                return 'in_progress';
            default:
                return 'failure';
        }
    };

    const renderTable = (title: string, rows: StudyData[]) => {
        const tableData = rows.map((row, idx) => ({
          key: idx.toString(),
          data: {
            study_id: row._id,
            total_count: row.total_count,
            patient_count: row.patient_count,
            sample_count: row.sample_count,
          },
        }));
    
        return (
          <div className="mb-6">
            {false && <h2 className="text-lg font-bold mb-2">{title}</h2>}
            <TreeTable value={tableData} tableStyle={{ minWidth: "50rem" }}>
              <Column field="study_id" header="Study ID" />
              {false && <Column field="total_count" header="Total Count" />}
              <Column field="patient_count" header="Patient Count" />
              <Column field="sample_count" header="Sample Count" />
            </TreeTable>
          </div>
        );
      };

    return (
        <div>
            <h1 className="assembler-title">Assembler</h1>

            <form onSubmit={handleSubmit} className="assembler-form">
                <h3>Enter StudyId to pull from CbioPortal</h3>
                <input
                    type="text"
                    value={studyId}
                    onChange={(e) => setStudyId(e.target.value)}
                    placeholder="Enter Study ID..."
                    className="assembler-input"
                />
                <button type="submit" className="assembler-button" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
            <h3>The below table shows the count of Patients that are available to match within the MatchEngine.</h3>
            {fetchStudyDataLoading && <p>Fetching Data...</p>}
            {fetchStudyDataResponse && renderTable("Clinical", studyData?.clinical || [])}
            {jobMessage && <p className="job-message">{jobMessage}</p>}
            {error && <p className="error-text">Error: {error || "Something went wrong"}</p>}

            {fetchLogsLoading && <p>Loading logs...</p>}
            {fetchLogsError && <p className="error-text">Error loading logs: {fetchLogsError}</p>}

            <div className="logs-table-wrapper">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="logs-title">Assembler Logs</h2>
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="toggle-logs-btn bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                        {showLogs ? "Hide Logs" : "Show Logs"}
                    </button>
                </div>
                {showLogs && (
                <>
                    {assemblerLogs.length > 0 ? (
                        <table className="assembler-logs-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Study ID</th>
                                    <th>Job Triggered</th>
                                    <th>Job Completed</th>
                                    <th>Status</th>
                                    <th>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assemblerLogs.map((log, index) => (
                                    <tr key={index}>
                                        <td>{log.usertriggered}</td>
                                        <td>{log.studyid}</td>
                                        <td>{new Date(log.jobtriggeredtime).toLocaleString()}</td>
                                        <td>{new Date(log.jobcompletedtime).toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(log.jobstatus)}`}>
                                                {log.jobstatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`result-badge ${getResultClass(log.jobresult)}`}>
                                                {log.jobresult}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No logs available.</p>
                    )}
                </>)}    
            </div>

        </div>
    );
};

export default Assembler;
