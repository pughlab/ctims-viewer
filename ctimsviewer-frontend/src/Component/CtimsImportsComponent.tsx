import React, { useEffect, useState } from "react";
import useAxios from "../service/useAxios";
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';

const CtimsImportsComponent = (props: any) => {
    const { accessToken: bearerToken } = props;

    const { response: csvResponse, loading: csvLoading, error: csvError, operation: csvOperation } = useAxios();
    const { response: downloadResponse, loading: downloadLoading, error: downloadError, operation: downloadOperation } = useAxios();

    const [nctId, setNctId] = useState<string>("");
    const [blobUrl, setBlobUrl] = useState<string>("");
    const [newBlobUrl, setNewBlobUrl] = useState<string>("");

    interface ClinicalTrialData {
        NCTId?: string;
        Condition?: string[];
        BriefTitle?: string;
    }
/*
    useEffect(() => {
        // Create a Blob URL for the JSON data
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(jsonBlob);
        setBlobUrl(url);

        // Cleanup the Blob URL when the component unmounts
        return () => {
            URL.revokeObjectURL(url);
        };
    }, []);

    useEffect(() => {
        // Create a Blob URL for the JSON data
        const jsonBlob = new Blob([JSON.stringify(newData)], { type: 'application/json' });
        const url = URL.createObjectURL(jsonBlob);
        setNewBlobUrl(url);

        // Cleanup the Blob URL when the component unmounts
        return () => {
            URL.revokeObjectURL(url);
        };
    }, []);
*/
    useEffect(() => {
        // Create a Blob URL for the JSON data
         console.log("csvResponse", csvResponse);
        //console.log("JSON.stringify(csvResponse)", JSON.stringify(csvResponse));
        if(csvResponse)
        {
            const jsonBlob = new Blob([JSON.stringify(csvResponse)], { type: 'application/json' });
            const url = URL.createObjectURL(jsonBlob);
            console.log("url", url)
            setNewBlobUrl(url);


        }
    }, [csvResponse]);

    useEffect(() => {
        if (downloadResponse != null) {
            const blob = new Blob([downloadResponse], { type: 'json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nctId + ".json");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } else {
            console.error('Download response is null');
        }
    }, [downloadResponse]);

    const fetchClinicalTrialData = async (nctId: string, fields?: string[]): Promise<ClinicalTrialData> => {
        const baseUrl = "https://clinicaltrials.gov/api/v2";
        let endpoint = `/studies/${nctId}`;
        if (fields) {
            endpoint += `?fields=${fields.join(',')}`;
        }
        const url = `${baseUrl}${endpoint}`;

        try {
            const response = await axios.get<ClinicalTrialData>(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching clinical trial data:", error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        console.log("Form elements", nctId);
        

        try {
            const clinicalTrialData = await fetchClinicalTrialData(nctId);
            console.log("Clinical trial data fetched:", clinicalTrialData);
            const jsonBlob = new Blob([JSON.stringify(clinicalTrialData)], { type: 'application/json' });
                    const url = URL.createObjectURL(jsonBlob);
                    setBlobUrl(url);

        } catch (error) {
            console.error("Error fetching clinical trial data during submit:", error);
            return;
        }

        const headers: Record<string, string> = {
            'Content-type': 'application/json; charset=UTF-8',
        };
        if (bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }

        csvOperation({
            method: 'GET',
            url: `ctimsImports/${nctId}`,
            headers: headers,
        });
    };

    const handleDownload = () => {
        const headers: Record<string, string> = {};

        if (bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        downloadOperation({
            method: 'GET',
            url: `downloadCtimsImports/${nctId}`,
            responseType: 'arraybuffer',
            headers: headers,
        });
    };

    return (
        <>
            <div>
                <h3 style={{ padding: "2rem" }}>CTIMS Assembler is integrated with the clinicaltrials.gov API using Fetcher component. It requires an API token which can be obtained from clinicaltrials.gov by registering. The user can enter the NCT ID and get the output of the API, which is converted into CTML format by Assembler-Fetcher.</h3>
            </div>
            <br />
            <br />
            <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", marginBottom: "10px", justifyContent: "space-between" }} >
                        <h3 style={{ margin: "0 10px 0 0", flex: "0 0 auto" }}>NCT Id:</h3>
                        <input type="text" id="nctValue" style={{ flex: "1 1 auto", padding: "8px", fontSize: "16px" }} onChange={(e) => setNctId(e.target.value)} />
                        <button style={{ padding: "10px 20px", margin: "2rem", fontSize: "16px", alignSelf: "center", backgroundColor: "#2E72D2", color: "white", borderRadius: "4px" }} onClick={handleSubmit}>Submit</button>
                        {csvResponse && <button style={{ padding: "10px 20px", margin: "2rem", fontSize: "16px", alignSelf: "center", backgroundColor: "#2E72D2", color: "white", borderRadius: "4px" }} onClick={handleDownload}>Download</button>}
                    </div>
                    <br />
                </div>
            </div>
            {(csvLoading) && <div className="flex justify-content-center">
                <ProgressSpinner className="custom-spinner" />
            </div>}
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                {blobUrl && newBlobUrl && <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h4>Data from clinicaltrials.gov</h4>
                    <iframe id="jsonFrame" src={blobUrl} width="400" height="300"></iframe>
                </div>}
                { newBlobUrl && <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h4>CTML data file</h4>
                    <iframe id="jsonFrame" src={newBlobUrl} width="400" height="300"></iframe>
                </div>}
            </div>
        </>
    );
};

export default CtimsImportsComponent;
