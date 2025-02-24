import React, {useContext, useEffect, useRef, useState} from "react";
import SharedDataContext from "../service/SharedDataContext";
import useAxios from "../service/useAxios";
import {RadioButton} from "primereact/radiobutton";
import {ProgressSpinner} from "primereact/progressspinner";
import {Toast} from "primereact/toast";

const ResultComponent = () => {
    // const { validationResult, setValidationResult } = useContext(SharedDataContext);
    // get the list of studies
    const { response: folderResponse, loading: folderLoading, error: folderError, operation: folderOperation } = useAxios();
    // get the validation result html
    const { response: responseReport, loading: loadingReport, error: errorReport, operation: operationReport } = useAxios();

    // list of studies uploaded
    const [folderList, setFolderList] = useState<any>([]);
    // current study selected
    const [selectedFolder, setSelectedFolder] = useState(null);
    // validation result
    const [validationResult, setValidationResult] = useState<string | undefined>(undefined);

    const toast = useRef(null);

    useEffect(() => {
        getFolders();
    }, []);

    const getFolders = () => {
        folderOperation({
            method: 'GET',
            url: 'folders',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        })
    };

    useEffect(() => {
        if (folderResponse !== null) {
            setFolderList(folderResponse);
        }
    }, [folderResponse]);

     useEffect(() => {
        if (responseReport !== null) {
            const file = new Blob([responseReport], {type: 'text/html'});
            const blobURL = URL.createObjectURL(file);
            setValidationResult(blobURL);
        }
    }, [responseReport]);

     useEffect(() => {
         if (errorReport !== null) {
             // @ts-ignore
             toast.current.show({severity:'error', summary: 'Error', detail:errorReport, life: 3000});
         }
     }, [errorReport]);

    const handleShowResult = () => {
            operationReport({
                method: 'GET',
                url: 'validation-report-blob/' + selectedFolder,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
        }

    return (
        <>
            <Toast ref={toast} />
            {folderList.map((folder: string) => {
                return (
                    <div key={folder} className="flex align-items-center">
                        <RadioButton inputId={folder} name="Study" value={folder} onChange={(e) => setSelectedFolder(e.value)} checked={selectedFolder === folder} />
                        <label htmlFor={folder} className="ml-2">{folder}</label>
                    </div>
                );
            })}
            <br/>
            <button onClick={handleShowResult} disabled={!selectedFolder}>Show validation result</button>
            {(folderLoading || loadingReport) && <div className="card flex justify-content-center">
                <ProgressSpinner />
            </div>}
            {validationResult && (
                <iframe src={validationResult} title="HTML Content" width="100%"
                        height="580px" />
            )}
        </>
    );
}

export default ResultComponent;

