import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import useAxiosDb from "../service/useAxiosDb";
import './Assembler.css';
import { TreeTable } from "primereact/treetable";
import {DataTable} from "primereact/datatable";
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
            fetchLogs();
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
        const footer = `Total ${tableData ? tableData.length : 0} rows.`;
        return (
            <div className="mb-6">
            <DataTable value={tableData} tableStyle={{ minWidth: "50rem" }} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} footer={footer}>
              <Column field="data.study_id" header="Study ID" />
              {false && <Column field="data.total_count" header="Total Count" />}
              <Column field="data.patient_count" header="Patient Count" />
              <Column field="data.sample_count" header="Sample Count" />
            </DataTable>
          </div>
        );
      };
    const footer_logs = `Total ${assemblerLogs ? assemblerLogs.length : 0} rows.`;
    return (
        <div>
            <form onSubmit={handleSubmit} className="assembler-form">
                <h3 className='h3_center' >cBioPortal study Id to assemble into Matcher database</h3>
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
            <h3>Studies in Matcher database</h3>
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
                        className="toggle-logs-btn text-white px-4 py-2 rounded-lg"
                        style={{ backgroundColor: "rgba(59,145,216)" }}
                    >
                        {showLogs ? "Hide Logs" : "Show Logs"}
                    </button>
                </div>
                {showLogs && (
                <>
                        <DataTable value={assemblerLogs} className="assembler-logs-table" tableStyle={{ minWidth: "70rem" }} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} footer={footer_logs}>
                        <Column field="usertriggered" header="User" />
                        <Column field="studyid" header="Study ID" />
                        <Column
                          field="jobtriggeredtime"
                          header="Job Triggered"
                          body={(rowData) => new Date(rowData.jobtriggeredtime).toLocaleString()}
                        />
                        <Column
                          field="jobcompletedtime"
                          header="Job Completed"
                          body={(rowData) => new Date(rowData.jobcompletedtime).toLocaleString()}
                        />
                        <Column
                          field="jobstatus"
                          header="Status"
                          body={(rowData) => (
                            <span className={`status-badge ${getStatusClass(rowData.jobstatus)}`}>
                              {rowData.jobstatus}
                            </span>
                          )}
                        />
                        <Column
                          field="jobresult"
                          header="Result"
                          body={(rowData) => (
                            <span className={`result-badge ${getResultClass(rowData.jobresult)}`}>
                              {rowData.jobresult}
                            </span>
                          )}
                        />
                      </DataTable>
                </>)}    
            </div>

        </div>
    );
};

export default Assembler;
