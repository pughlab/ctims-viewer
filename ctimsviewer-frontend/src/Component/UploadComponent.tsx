import React, {useEffect, useState} from "react";
import useAxios from "../service/useAxios";
import useAxiosDb from "../service/useAxiosDb";
import axios, { AxiosInstance } from "axios"; 
import { ProgressSpinner } from 'primereact/progressspinner';
import {TreeTable} from "primereact/treetable";
import {Column} from "primereact/column";
import { v4 as uuidv4 } from 'uuid';
import {RadioButton} from "primereact/radiobutton";
import "./styles.css";
import { MdDelete } from "react-icons/md";


const UploadComponent = (props: any) => {

    const { response:csvResponse, loading: csvLoading, error: csvError, operation: csvOperation } = useAxios();
    const { response:deleteResponse, loading: deleteLoading, error: deleteError, operation: deleteOperation } = useAxios();
    const { response:downloadResponse, loading: downloadLoading, error: downloadError, operation: downloadOperation } = useAxios();
    const { response, loading, error, operation } = useAxios();
    const { response: folderResponse, loading: folderLoading, error: folderError, operation: folderOperation } = useAxios();
    const { response: filesResponse, loading: filesLoading, error: filesError, operation: filesOperation } = useAxios();


    const [selectedFolder, setSelectedFolder] = useState(null);

    const [createStatus, setCreateStatus] = useState(null);

    // status of tar.gz upload
    const [uploadMessage, setUploadMessage] = useState('');
    // list of studies uploaded
    const [folderList, setFolderList] = useState<any>([]);
    // list of files for a given study
    // const [filesList, setFilesList] = useState<any>([]);
    // current node selected
    const [selectedNode, setSelectedNode] = useState<any>(null);

    const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_REALM;



    console.log("Props Value In side Uplaod", props)
    var bearerToken = props.accessToken;






    useEffect(() => {
        if (csvResponse != null) {
            console.log("Success to run the script", JSON.stringify(csvResponse));
            setCreateStatus(csvResponse);
            
        }
        else{
            console.log("Failure in running python script", csvError,csvResponse );
            setCreateStatus(csvError);
        }

    }, [csvResponse]);


    useEffect(() => {
        if (downloadResponse != null) {
            const blob = new Blob([downloadResponse], { type: 'text/csv' });
    
            // Create a temporary URL for the Blob object
            const url = window.URL.createObjectURL(blob);
    
            // Create a link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('clinical.csv', "Clinical"); 
    
            // Trigger a click event on the link to initiate the download
            document.body.appendChild(link);
            link.click();
    
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        }
        else{
            console.error('Download response is null');
        }

    }, [downloadResponse]);




    useEffect(() => {
        if (response !== null) {
            setUploadMessage("File uploaded successfully");
        }
        getFolders();
    }, [response]);

    useEffect(() => {
        if (error !== null) {
            setUploadMessage("Failed to upload study file");
        }
    }, [error]);

    useEffect(() => {
        if (error !== null) {
            setUploadMessage("Failed to upload study file");
        }
    }, [error]);

    useEffect(() => {
        if (folderResponse !== null) {
            // @ts-ignore
            const folders = folderResponse.map((folder: any) =>
            {
                return {
                    key: uuidv4(),
                    data: {
                        name: folder
                    },
                    children: [{
                        key: uuidv4(),
                        data: {
                            name: 'placeHolder'
                        }
                    }]
                }
            });
            console.log("folders",folders);
            setFolderList(folders);
        }
    }, [folderResponse]);

    useEffect(() => {
        if (filesResponse !== null) {
            // @ts-ignore
            const folderChildren = filesResponse.map((file: any) => {
                return {
                    key: uuidv4(),
                    data: {
                        name: file
                    }
                }
            });

            selectedNode.children = folderChildren;

            // find the index of the selected node, update the tree
            let _nodes = folderList.map((node: any) => {
                if (node.key === selectedNode.key) {
                    node = selectedNode;
                }
                return node;
            });
            setFolderList([..._nodes]);
            console.log("Folders List", folderList);
        }
    }, [filesResponse]);

    useEffect(() => {
        if (folderError !== null) {
            console.log('folderError: ', folderError);
        }
        if (filesError !== null) {
            console.log('filesError: ', filesError);
        }
    }, [folderError, filesError]);

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const headers: Record<string, string> = {
            'Content-type': 'multipart/form-data',
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        operation({
            method: 'POST',
            url: 'upload',
            headers: headers,
            data: formData
        })
    };

    const getFolders = () => {
        if (bearerToken || keycloakIntegration== "disable" ) { // Check if bearerToken is available
            console.log("Bearer Token:", bearerToken); 
            const headers: Record<string, string> = {
                'Content-type': 'application/json; charset=UTF-8',
            };
    
            if (keycloakIntegration !== "disable" && bearerToken) {
                headers['Authorization'] = `Bearer ${bearerToken}`;
            }
            folderOperation({
                method: 'GET',
                url: 'gzfolders',
                headers: headers
            });
        } else {
            console.log("Bearer token not available yet. Waiting...");
        }
    };
    useEffect(() => {
        getFolders(); // Call getFolders whenever bearerToken changes
    }, [bearerToken]);

    const getFilesFromFolder = (name: string) => {

        const headers: Record<string, string> = {
            'Content-type': 'application/json; charset=UTF-8',
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        filesOperation({
            method: 'GET',
            url: 'files/' + name,
            headers: headers
        })
    };

    const onFolderExpand = (event: any) => {
        const folderNode = event.node;
        const folderName = folderNode.data.name;
        setSelectedNode(folderNode);
        getFilesFromFolder(folderName);
    };

    const handleValidate = () => {

        const headers: Record<string, string> = {
            'Content-type': 'application/json; charset=UTF-8',
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        csvOperation({
            method: 'GET',
            url: 'create/' +  selectedFolder ,
            headers: headers,
        })
    }

    const handleDelete = (selFolderName: string) => {
        console.log("Folder Name",selFolderName );
        const headers: Record<string, string> = {
            'Content-type': 'application/json; charset=UTF-8',
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        deleteOperation({
            method: 'DELETE',
            url: 'delete/' + selFolderName ,
            headers:headers,
        }).then(() => {
            // After successful deletion, reload the folder list
            getFolders();
        }).catch(error => {
            console.error('Error deleting folder:', error);
        });
    }

    /*
    const handleDownload = (selFolderName: string) => {
        downloadOperation({
            method: 'GET',
            url: 'download/'+selFolderName ,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
    }
    */
    const handleDownload = (selFolderName: string) => {
        // Trigger the downloadOperation to fetch the byte data from the backend
        //var pathVar  = selectedFolder+"/"+selFolderName;
        const headers: Record<string, string> = {
            
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        downloadOperation({
          method: 'GET',
          url: 'download/' + selectedFolder,
          responseType: 'arraybuffer', // Set the responseType to 'arraybuffer' to handle byte data,
          headers: headers,
        })
        /*
        .then(() => {
          if (downloadResponse !== null) {
            // Create a Blob object from the fetched byte data
            const blob = new Blob([downloadResponse], { type: 'text/csv' });
    
            // Create a temporary URL for the Blob object
            const url = window.URL.createObjectURL(blob);
    
            // Create a link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('clinical.csv', selFolderName); 
    
            // Trigger a click event on the link to initiate the download
            document.body.appendChild(link);
            link.click();
    
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          } else {
            console.error('Download response is null');
          }
        }).catch((error) => {
          console.error('Error downloading CSV:', error);
          // Handle error
        });
        */
      };
    



    return (
        <>
            <p className="textHeading">Upload a cBioPortal study tar.gz file</p>
            <div style={{ flex: "column"}}>
            <input type="file" onChange={handleFileUpload} />
            {csvResponse && <button className="createCtmlButton_new" onClick={() => handleDownload("clinical.csv")}>Download</button> }
            </div>
            {(loading || folderLoading || filesLoading) && <div className="flex justify-content-center">
                <ProgressSpinner className="custom-spinner" />
            </div>}
            <br/>
            <br/>
                <h3>This is folder list</h3>
                        {folderList && folderList.map((folder: any) => {
                            return (
                                <div key={folder.key} className="flex align-items-center justify-content-between" style={{ marginBottom: '10px' }}>
                                <div className="flex align-items-center">
                                    <RadioButton
                                    inputId={folder.data.name}
                                    name="Study"
                                    value={folder.data.name}
                                    onChange={(e) => setSelectedFolder(e.value)}
                                    checked={selectedFolder === folder.data.name}
                                    />
                                    <label htmlFor={folder.data.name} className="ml-2">{folder.data.name}</label>
                                </div>
                                <button className="deleteButton" value={folder.data.name} onClick={() => handleDelete(folder.data.name)}><MdDelete /></button>
                                </div>
                                
                             );
                        })} 
                <br/>   
                {csvLoading && <div className="flex justify-content-center">
                <ProgressSpinner  className="custom-spinner"/>
                </div>}
                <br/>
                <br/>
                <br/>
                <div className="flex justify-content-center">                
                    <button className="createCtmlButton_new" onClick={handleValidate} disabled={!selectedFolder}>Submit</button>
                </div>  
                       

            
        </>
    )
}

export default UploadComponent
