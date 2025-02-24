import React, {useContext, useEffect, useState} from 'react'
import useAxios from "../service/useAxios";
import {ProgressSpinner} from "primereact/progressspinner";
import SharedDataContext from "../service/SharedDataContext";
import {RadioButton} from "primereact/radiobutton";


const ValidateComponent = () => {

    const { response, loading, error, operation } = useAxios();
    const { response: folderResponse, loading: folderLoading, error: folderError, operation: folderOperation } = useAxios();
    // const { response: responseReport, loading: loadingReport, error: errorReport, operation: operationReport } = useAxios();

    // validation message
    const [validateMessage, setValidateMessage] = useState('');
    // list of studies uploaded
    const [folderList, setFolderList] = useState<any>([]);
    // current study selected
    const [selectedFolder, setSelectedFolder] = useState(null);

    useEffect(() => {
        getFolders();
    }, []);

    useEffect(() => {
        if (folderResponse !== null) {
            setFolderList(folderResponse);
        }
    }, [folderResponse]);

    useEffect(() => {
        if (response !== null) {
            setValidateMessage("Validation finished");
            // retreieveReportAsBlob();
        }
    }, [response]);

    // useEffect(() => {
    //     if (responseReport !== null) {
    //         const file = new Blob([responseReport], {type: 'text/html'});
    //         const blobURL = URL.createObjectURL(file);
            // setValidationResult(blobURL);
    //     }
    // }, [responseReport]);

    // check if there's any error
    useEffect(() => {
        if (error !== null) {
            setValidateMessage(error)
        }
    }, [error]);

    const handleValidate = () => {
        operation({
            method: 'GET',
            url: 'validate/' + selectedFolder,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
    }

    const getFolders = () => {
        folderOperation({
            method: 'GET',
            url: 'folders',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        })
    };

    // const retreieveReportAsBlob = () => {
    //     operationReport({
    //         method: 'GET',
    //         url: 'validation-report-blob',
    //         headers: {
    //             'Content-type': 'application/json; charset=UTF-8',
    //         },
    //     })
    // }

    return (
      <>
          <p>Validate your study with the dataset validator </p>
          {folderList.map((folder: string) => {
              return (
                  <div key={folder} className="flex align-items-center">
                      <RadioButton inputId={folder} name="Study" value={folder} onChange={(e) => setSelectedFolder(e.value)} checked={selectedFolder === folder} />
                      <label htmlFor={folder} className="ml-2">{folder}</label>
                  </div>
              );
          })}
          <br/>
          <button onClick={handleValidate} disabled={!selectedFolder}>validate</button>
          {(loading || folderLoading) && <div className="card flex justify-content-center">
              <ProgressSpinner />
          </div>}
          <br/>
          <br/>
          {validateMessage && <p>{validateMessage}</p>}
      </>
    );
}

export default ValidateComponent
