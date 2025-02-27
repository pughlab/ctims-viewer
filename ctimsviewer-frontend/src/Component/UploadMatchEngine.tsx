import React, { useEffect, useState } from "react";
import useAxiosDb from "../service/useAxiosDb";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner"; // Import ProgressSpinner
import "./styles.css";

const UploadMatchEngine = (props: any) => {
    type TrialData = {
        count: number;
        trial_id: string;
        trial_internal_id: string;
        _updated: string;
        nickname: string;
    };

    const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_REALM;
    const bearerToken = props.accessToken;
    const {
        response: fetchTrialsResponse,
        loading: fetchTrialsLoading,
        error: fetchTrialsError,
        operation: fetchTrialsOperation,
    } = useAxiosDb();

    const {
        response: fetchTrialDataResponse,
        loading: fetchTrialDataLoading,
        error: fetchTrialDataError,
        operation: fetchTrialDataOperation,
    } = useAxiosDb();

    const [tableData, setTableData] = useState<any[]>([]);
    const [loadingState, setLoadingState] = useState<{ [key: string]: boolean }>({}); // Track loading state for each row
    const [pageLoading, setPageLoading] = useState<boolean>(false); // Track page loading state

    useEffect(() => {
        handleValidate();
    }, []);

    useEffect(() => {
    }, [fetchTrialDataResponse]);

    useEffect(() => {
        if (fetchTrialsResponse && Array.isArray(fetchTrialsResponse)) {
            const formattedData = (fetchTrialsResponse as TrialData[]).map((item, index) => {
                const updatedFormatted = item._updated
                    ? new Date(item._updated).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                      })
                    : null;

                return {
                    key: index.toString(),
                    data: {
                        count: item.count,
                        trial_id: item.trial_id,
                        trial_internal_id: item.trial_internal_id,
                        updated: updatedFormatted,
                        nickname: item.nickname,
                    },
                };
            });
            setTableData(formattedData);
        } else if (!Array.isArray(fetchTrialsResponse)) {
            console.error("fetchTrialsResponse is not an array:", fetchTrialsResponse);
            setTableData([]);
        }
    }, [fetchTrialsResponse]);

    const handleValidate = () => {
        const headers: Record<string, string> = {
            "Content-type": "application/json; charset=UTF-8",
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers["Authorization"] = `Bearer ${bearerToken}`;
        }

        fetchTrialsOperation({
            method: "GET",
            url: "/FetchTrialIdsFromMatchEngine",
            headers: headers,
        });
    };

    const handleFetchTrialData = (trialInternalId: string, trialId: string, updated: string) => {
        const headers: Record<string, string> = {
            "Content-type": "application/json; charset=UTF-8",
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers["Authorization"] = `Bearer ${bearerToken}`;
        }

        // Set loading state for the specific trial
        setLoadingState((prevState) => ({
            ...prevState,
            [`${trialInternalId}-${trialId}`]: true,
        }));

        // Set the page loading state to true
        setPageLoading(true);

        fetchTrialDataOperation({
            method: "GET",
            url: `/FetchTrialDataFromMatchEngine/${trialInternalId}/${trialId}/${updated}`,
            headers: headers,
        })
        .finally(() => {
            setLoadingState((prevState) => ({
                ...prevState,
                [`${trialInternalId}-${trialId}`]: false,
            }));

            setPageLoading(false);
        });
    };

    const actionBodyTemplate = (node: any) => {
        const isLoading = loadingState[`${node.data.trial_internal_id}-${node.data.trial_id}`]; // Check loading state
        return (
            <button
                onClick={() => handleFetchTrialData(node.data.trial_internal_id, node.data.trial_id, node.data.updated)}
                className="fetch-button"
                disabled={isLoading} // Disable button while loading
            >
                {isLoading ? (
                    <ProgressSpinner style={{ width: '20px', height: '20px' }} />
                ) : (
                    'Fetch Data'
                )}
            </button>
        );
    };

    return (
        <div>
            {pageLoading && (
                <div className="page-overlay">
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                </div>
            )}

            <h3>This page is used to fetch the matched trials from MatchEngine to CTIMS Viewer(The below data is fetched from MatchEngine).</h3>
            <br />
            <br />
            {fetchTrialsLoading && <p>Loading...</p>}
            {fetchTrialsError && <p>Error fetching data: {fetchTrialsError}</p>}

            {!fetchTrialsLoading && !fetchTrialsError && tableData.length > 0 && (
                <TreeTable value={tableData}>
                    <Column field="trial_id" header="Trial ID"></Column>
                    <Column field="nickname" header="Nickname"></Column>
                    <Column field="count" header="Trial Match Count" expander></Column>
                    <Column field="updated" header="Last Matched in MatchEngine"></Column>
                    <Column
                        body={actionBodyTemplate}
                        header="Actions"
                        style={{ textAlign: "center", width: "150px" }}
                    ></Column>
                </TreeTable>
            )}

            {!fetchTrialsLoading && !fetchTrialsError && tableData.length === 0 && (
                <p>No data available.</p>
            )}
        </div>
    );
};

export default UploadMatchEngine;
