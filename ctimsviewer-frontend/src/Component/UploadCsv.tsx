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
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from 'primereact/checkbox';
import {Dialog} from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import RightComponent from "./RightComponent";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import SingleSelectComponent from "./SingleSelectComponet";
import BarChart from "./ReactPlotly/BarChart";
import HeatmapChart from "./ReactPlotly/HeatPlot";
import ReverseBarChart from "./ReactPlotly/ReverseBarChart";
import TopBarChart from "./ReactPlotly/TopBarChart";
import 'react-tabs/style/react-tabs.css';
import StudyView from "./StudyView";
import PatientView from "./PatientView";
import { Link, Outlet, useLocation } from "react-router-dom";
//import { FloatLabel } from 'primereact/floatlabel';

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

  interface DataItem {
    trialarmid: string;
    patient_id: number;
  }

  const chartComponents: Record<string, React.FC<{ data: any[], study_id: string, onBarClick: (patient: string, study:string) => void }>> = {
    BarChart: BarChart,
    HeatMap: HeatmapChart,
    ReverseBarChart: ReverseBarChart,
    TopBarChart: TopBarChart,
  };

const UploadCsv = (props: any) => {

    const { response:csvResponse, loading: csvLoading, error: csvError, operation: csvOperation } = useAxios();
    const { response:deleteResponse, loading: deleteLoading, error: deleteError, operation: deleteOperation } = useAxios();
    const { response:downloadResponse, loading: downloadLoading, error: downloadError, operation: downloadOperation } = useAxios();
    const { response, loading, error, operation } = useAxios();
    const { response: folderResponse, loading: folderLoading, error: folderError, operation: folderOperation } = useAxios();
    const { response: filesResponse, loading: filesLoading, error: filesError, operation: filesOperation } = useAxios();

    const { response: plotResponse, loading: plotLoading, error: plotError, operation: plotOperation } = useAxios();

    const { response: sendResponse, loading: sendLoading, error: sendError, operation: sendOperation } = useAxiosDb();
    const { response:csvChartResponse, loading: csvChartLoading, error: csvChartError, operation: csvChartOperation } = useAxiosDb();
    const { response:fetchTrialIdResponse, loading: fetchTrialIdLoading, error: fetchTrialIdError, operation: fetchTrialIdOperation } = useAxiosDb();
    const { response:fetchStudyIdResponse, loading: fetchStudyIdLoading, error: fetchStudyIdError, operation: fetchStudyIdOperation } = useAxiosDb();
    const { response:fetchIdResponse, loading: fetchIdLoading, error: fetchIdError, operation: fetchIdOperation } = useAxiosDb();
    const { response: groupTrialsResponse, loading: groupTrialsLoading, error: groupTrialsError, operation: groupTrialsOperation } = useAxiosDb();

    const { response:reactPlotlyChartResponse, loading: reactPlotlyChartLoading, error: reactPlotlyChartError, operation: reactPlotlyChartOperation } = useAxiosDb();

    const [selectedOptions, setSelectedOptions] = useState([]);

    const [selectedTrials, setSelectedTrials] = useState<ChartData[]>([]);

    const [selectedTrialsLabel, setSelectedTrialsLabel] = useState<ChartData[]>([]);

    const [selectedStudy, setSelectedStudy] = useState([]);

    const [selectedFolder, setSelectedFolder] = useState(null);

    const [createStatus, setCreateStatus] = useState(null);

    const [runPlot, setRunPlot] = useState(false);

    // status of tar.gz upload
    const [uploadMessage, setUploadMessage] = useState('');
    // list of studies uploaded
    const [folderList, setFolderList] = useState<any>([]);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_REALM;

    const [selectedItem, setSelectedItem] = useState<String>("");

    const [imageSrc, setImageSrc] = useState('');

    const [trialArmData, setTrialArmData] = useState<any[]>([]);

    const [trialData, setTrialData] = useState<any[]>([]);

    const [studyData, setStudyData] = useState<any[]>([]);

    const [isOpen, setIsOpen] = useState(false);

    const [checkedItems, setCheckedItems] = useState<string[]>([]);

    const [newCheckedItems, setNewCheckedItems] = useState<string[]>([]);

    const [charts, setCharts] = useState<ChartData[]>([]);

    const [reactPlotlyData, setReactPlotlyData] = useState<DataItem[]>([]);

    const [showPopup, setShowPopup] = useState(false);

    const [selectedTab, setSelectedTab] = useState('table');

    const [selectedPatient, setSelectedPatient] = useState('');
    
    const [selectedPatientStudy, setSelectedPatientStudy] = useState('');

    const roles = props.roles || [];;
    const hasUploadCsvRole = roles.includes('role_csvupload');
    const hasPythonChartsRole = roles.includes('role_pythoncharts');

    const location = useLocation();


    const items =[
        "HeatMap",
        "TopBarChart",
        "ReverseBarChart",
        "BarChart"
    ]
    console.log("Props Value In side Uplaod", props)
    var bearerToken = props.accessToken;



    useEffect(()=>{
        getTrialArmIDs();
        getTrialIDs();
        getStudyArmIDs();
        handleTrialIds();
    },[])

    useEffect(()=>{
        handleTrialIds();
        getTrialArmIDs();
        getStudyArmIDs();
    },[ selectedTab])

    useEffect(()=>{
        getTrialArmIDs();
        getTrialIDs();
        getStudyArmIDs();
    },[groupTrialsResponse])



    useEffect(()=>{
        if(fetchTrialIdResponse && (fetchTrialIdResponse as string).length>0)
        {
            if ((fetchTrialIdResponse as string).includes(',')) {
            const parsedData = (fetchTrialIdResponse as string).replace(/[\[\]]/g, '').split(', ').map(item => item.trim());
            setTrialArmData(parsedData);
            }
            else{
                const parsedData = [(fetchTrialIdResponse as string).replace(/[\[\]]/g, '').trim()];
                setTrialArmData(parsedData);
            }
        }
        
    },[fetchTrialIdResponse])

    useEffect(()=>{
        if(fetchIdResponse  && (fetchIdResponse as string).length>0)
        {
            console.log("Fetched Data", fetchIdResponse);
            if ((fetchIdResponse as string).includes(',')) {
            const parsedData = (fetchIdResponse as string).replace(/[\[\]]/g, '').split(', ').map(item => item.trim());
            setTrialData(parsedData);
            }
            else{
                const parsedData = [(fetchIdResponse as string).replace(/[\[\]]/g, '').trim()];
                setTrialData(parsedData);
            }
        }
        
    },[fetchIdResponse])


    useEffect(() => {
        if (groupTrialsResponse) {
          setCharts(groupTrialsResponse as ChartData[]);
          console.log("groupTrialsResponse", groupTrialsResponse);
        }
      }, [groupTrialsResponse,selectedTab]);
    

    const transformedTrialOptions = charts.map((trial: any) => ({
        label: `${trial.trialid}`, 
        value: trial.trialid, 
      }));
      
    console.log("transformedTrialOptions", transformedTrialOptions)


    useEffect(()=>{
        if(fetchStudyIdResponse &&  (fetchStudyIdResponse as string).length>0 )
        {
            console.log("fetchStudyIdResponse", fetchStudyIdResponse)
            if ((fetchStudyIdResponse as string).includes(',')) {
            const parsedData = (fetchStudyIdResponse as string).replace(/[\[\]]/g, '').split(', ').map(item => item.trim());
            setStudyData(parsedData);
            }
            else{
                const parsedData = [(fetchStudyIdResponse as string).replace(/[\[\]]/g, '').trim()];
                setStudyData(parsedData);
            }
        }
        
    },[fetchStudyIdResponse])


    useEffect(() => {
        if (csvResponse != null) {
            console.log("Success to run the script", JSON.stringify(csvResponse));
            setCreateStatus(csvResponse);
            getPlot();
            setRunPlot(false);
        }
        else{
            console.log("Failure in running python script", csvError,csvResponse );
            setCreateStatus(csvError);
        }

    }, [csvResponse]);

    useEffect(() => {
        if (csvChartResponse != null) {
            console.log("Success to run the script", JSON.stringify(csvChartResponse));
            setCreateStatus(csvChartResponse);
            getPlot();
            setRunPlot(false);
        }
        else{
            console.log("Failure in running python script", csvChartError,csvChartResponse );
            setCreateStatus(csvError);
        }

    }, [csvChartResponse]);


    useEffect(() => {
        if (reactPlotlyChartResponse != null) {
            setReactPlotlyData(reactPlotlyChartResponse);
            console.log("React Plotly data", reactPlotlyData);
            handleViewPlot();
        }
    }, [reactPlotlyChartResponse]);


    useEffect(() => {
        if (downloadResponse != null) {
            const blob = new Blob([downloadResponse], { type: 'image/png' });
    
            // Create a temporary URL for the Blob object
            const url = window.URL.createObjectURL(blob);
    
            // Create a link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', "heatmap.png"); 
    
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
        console.log("Got Response", response)
        if (response !== null) {
            setUploadMessage("File uploaded successfully");
        }
        getFolders();

       // getFilesFromFolder("");
        //console.log("filesResponse", filesResponse);
    }, [response]);

    useEffect(() => {
        console.log("Got Response", sendResponse)
        if (sendResponse !== null) {
            setUploadMessage("File uploaded successfully");
        }
        getFolders();

       // getFilesFromFolder("");
        //console.log("filesResponse", filesResponse);
    }, [sendResponse]);

    //csvChartResponse
    useEffect(() => {
        // Handle the response to set the image source
        if (plotResponse) {
            // Assuming plotResponse contains the image data
            console.log("Entered log Response", plotResponse[0]);

            const imageUrl = `data:image/png;base64,${plotResponse[0]}`;
            setImageSrc(imageUrl);
        }
    }, [plotResponse]);


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
            console.log(folders);
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

    const handleFileUpload = () => {
        // Mimic the behavior of selecting a file when the button is clicked
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv'; // Set the accepted file type if needed
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append("file", file);

            const headers: Record<string, string> = {
                'Content-type': 'multipart/form-data',
            };

            if (props.accessToken) {
                headers['Authorization'] = `Bearer ${props.accessToken}`;
            }

            // Call the operation with the file data
            sendOperation({
                method: 'POST',
                url: 'upload',
                headers: headers,
                data: formData
            });
        };
        input.click();
    };

    const handleChange = (selectedList: any) => {
        setSelectedOptions(selectedList);
    };

    const handleTrialsChange = (selectedList: any) => {
        setSelectedTrialsLabel(selectedList);
        const matchedCreatedDates = selectedList.map((trialId: any) => {
          const match = charts.find(chart => chart.trialid === trialId);
          return match?.trialcreated ?? null;
        }).filter(Boolean);
        setSelectedTrials(matchedCreatedDates as ChartData[]);
        setNewCheckedItems(prev => [...prev, ...matchedCreatedDates]);
      };
      

    const handleStudyChange = (selectedList: any) => {
        setSelectedStudy(selectedList);
        console.log("Selected Study", selectedStudy)
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
                url: 'folders',
                headers: headers
            });
        } else {
            console.log("Bearer token not available yet. Waiting...");
        }
    };
    
    const getTrialArmIDs = () => {
        if (bearerToken || keycloakIntegration== "disable" ) { // Check if bearerToken is available
            console.log("Bearer Token:", bearerToken); 
            const headers: Record<string, string> = {
                'Content-type': 'application/json; charset=UTF-8',
            };
    
            if (keycloakIntegration !== "disable" && bearerToken) {
                headers['Authorization'] = `Bearer ${bearerToken}`;
            }

            if(selectedTrials.length>0)
            {
                console.log("checkedItems.length", checkedItems)
                console.log("selectedTrials.length", selectedTrials)
                console.log("newCheckedItems.length", newCheckedItems)
                console.log("newcharts.length", charts)
                //charts
                //newCheckedItems
                fetchTrialIdOperation({
                    method: 'GET',
                    url: `FilteredTrialArmIDsWithTrialId/${selectedTrials}/${selectedTrialsLabel}`,
                    headers: headers
                });
            }
            else{
                fetchTrialIdOperation({
                    method: 'GET',
                    url: 'fetchTrialArmIDs',
                    headers: headers
                });

            }
            
        } else {
            console.log("Bearer token not available yet. Waiting...");
        }
    };

    const getTrialIDs = () => {
        if (bearerToken || keycloakIntegration== "disable" ) { // Check if bearerToken is available
            console.log("Bearer Token:", bearerToken); 
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


            
        } else {
            console.log("Bearer token not available yet. Waiting...");
        }

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


    const getStudyArmIDs = () => {
        if (bearerToken || keycloakIntegration== "disable" ) { // Check if bearerToken is available
            console.log("Bearer Token:", bearerToken); 
            const headers: Record<string, string> = {
                'Content-type': 'application/json; charset=UTF-8',
            };
    
            if (keycloakIntegration !== "disable" && bearerToken) {
                headers['Authorization'] = `Bearer ${bearerToken}`;
            }

            if(selectedTrials.length>0)
            {
                console.log("checkedItems.length", checkedItems)
                fetchStudyIdOperation({
                    method: 'GET',
                    url: `FilteredStudyIDs/${selectedTrials}/${selectedTrialsLabel}`,
                    headers: headers
                });
            }
            else{
                fetchStudyIdOperation({
                    method: 'GET',
                    url: 'fetchStudyIDs',
                    headers: headers
                });

            }
            
        } else {
            console.log("Bearer token not available yet. Waiting...");
        }
    };

    //FilteredTrialArmIDs

    const getPlot = () => {
        if (bearerToken || keycloakIntegration== "disable" ) { // Check if bearerToken is available
            console.log("Bearer Token:", bearerToken); 
            const headers: Record<string, string> = {
                'Content-type': 'application/json; charset=UTF-8',
            };
            console.log("Entered getPlot messagwe");
            if (keycloakIntegration !== "disable" && bearerToken) {
                headers['Authorization'] = `Bearer ${bearerToken}`;
            }
            plotOperation({
                method: 'GET',
                url: 'plot',
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
        setRunPlot(true);
        console.log("selectedFolder",selectedFolder);
        const timestamp = Date.now(); 
        csvOperation({
            method: 'GET',
            url: `createChart/${selectedItem}/${selectedFolder}?timestamp=${timestamp}` ,
            headers: headers,
        })
    }



    const handleChartValidate = () => {

        const headers: Record<string, string> = {
            'Content-type': 'application/json; charset=UTF-8',
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        setRunPlot(true);
        console.log("selectedFolder",selectedFolder);
        const timestamp = Date.now(); 
        if(selectedTrials.length>0)
        {
            csvChartOperation({
                method: 'POST',
                url: `createChartFilter/${selectedItem}/${selectedOptions}/${selectedTrials}/${selectedStudy}` ,
                headers: headers,
            })
        }
        else
        {
            csvChartOperation({
                method: 'POST',
                url: `createChart/${selectedItem}/${selectedOptions}` ,
                headers: headers,
            })
        }

    }

    const handleReactPlotlyChart = () => {
        setShowPopup(false);
        const headers: Record<string, string> = {
            'Content-type': 'application/json; charset=UTF-8',
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        setRunPlot(true);
        //setReactPlotlyData([]);
        console.log("selectedFolder",selectedFolder);
        const timestamp = Date.now(); 
        if(selectedTrials.length>0)
        {
            reactPlotlyChartOperation({
                method: 'POST',
                url: `reactPlotlyFilter` ,
                headers: headers,
                data: {
                    selectedOptions,
                    selectedStudy,
                },
            })
        }
        else
        {
            reactPlotlyChartOperation({
                method: 'POST',
                url: `reactPlotlyData` ,
                headers: headers,
            })
        }

    }

    const handleDelete = (selectedTrial: string) => {
        console.log("selectedTrial",selectedTrial );
        const headers: Record<string, string> = {
            'Content-type': 'application/json; charset=UTF-8',
        };
        

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        deleteOperation({
            method: 'DELETE',
            url: 'delete/' + selectedTrial ,
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
    const handleDownload = () => {
        // Trigger the downloadOperation to fetch the byte data from the backend
        //var pathVar  = selectedFolder+"/"+selFolderName;
        const headers: Record<string, string> = {
            
        };

        if (keycloakIntegration !== "disable" && bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }
        downloadOperation({
          method: 'GET',
          url: 'downloadPlot/',
          responseType: 'arraybuffer', // Set the responseType to 'arraybuffer' to handle byte data,
          headers: headers,
        })
      };


      const handleSendData = () =>{



        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv'; // Set the accepted file type if needed
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append("file", file);

            const headers: Record<string, string> = {
                'Content-type': 'multipart/form-data',
            };

            if (props.accessToken) {
                headers['Authorization'] = `Bearer ${props.accessToken}`;
            }

            // Call the operation with the file data
            sendOperation({
                method: 'POST',
                url: 'upload',
                headers: headers,
                data: formData
            });
        };
        input.click();
        


      }
    
    const handleCheckboxChange = (index: string) => {
        setCheckedItems((prev) => {
          const newCheckedItems = [...prev];
          if (newCheckedItems.includes(index)) {
            return newCheckedItems.filter((item) => item !== index);
          } else {
            newCheckedItems.push(index);
            return newCheckedItems;
          }
        });
      };

    const handleViewPlot = () => setShowPopup(true);

      useEffect(() => {
        console.log("Checked items:", checkedItems);
        getTrialArmIDs();
        getStudyArmIDs();
      }, [selectedTrials]);

      const customOptionTemplate = (option: any) => {
        console.log("options", option)
        return (
            <div className="custom-dropdown-item">
                <input
                    type="radio"
                    checked={selectedItem === option}
                    onChange={() => setSelectedItem(option)}
                    className="custom-radio"
                    id={`radio-${option}`}
                />
                <label htmlFor={`radio-${option}`}>{option}</label>
            </div>
        );
    };

    const customPanelHeader = (
        <div style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
          Trial Id's
        </div>
      );


    return (
        <>
            {reactPlotlyChartLoading && (
                <div className="page-overlay">
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                </div>
            )}
            <div className="tab-buttons">
                <button 
                    onClick={() => setSelectedTab('table')} 
                    className={selectedTab === 'table' ? 'active' : ''}
                >
                    Trial Matches
                </button>
                <button 
                    onClick={() => setSelectedTab('charts')} 
                    className={selectedTab === 'charts' ? 'active' : ''}
                >
                    Charts
                </button>
                {false && <button 
                    onClick={() => setSelectedTab('study')} 
                    className={selectedTab === 'study' ? 'active' : ''}
                >
                    Study View
                </button>}
                <button 
                    onClick={() => setSelectedTab('patient')} 
                    className={selectedTab === 'patient' ? 'active' : ''}
                >
                    Patient View
                </button>
            </div>
            <div className="tab-content">
                {selectedTab === 'table' && hasUploadCsvRole && (
                    <div className="table-tab-content">
                        <div className="ImportButtonContainer">
                            <button onClick={handleFileUpload} className="importButton">Upload CSV</button>
                        </div>
                    </div>
                )}
                {selectedTab === 'charts' && (
                    <div className="charts-tab-content">
                        <div>
                            <h3>Select Chart type, Trials, Arms and Studies for Analysis and Visualization . Heatmap,Top Bar Chart, Side Bar chart and Vertical Bar Charts help in analysis of results.</h3>
                        </div>
                        <br/>
                        <br/>
                        <div className="left">
                            <div className="mainButtonsContainer">
                                <div className="dropdown-container">
                                    <div className="indi-dropdown-container">
                                        <label htmlFor="plotTypeDropdown" className="dropdown-label">Plot Type</label>
                                        <Dropdown 
                                            id="plotTypeDropdown"
                                            value={selectedItem} 
                                            onChange={(e) => setSelectedItem(e.value)} 
                                            options={items} 
                                            //itemTemplate={customOptionTemplate}
                                            placeholder="Plot Type" 
                                            className="fixed-width-select" 
                                        />
                                    </div>
                                    <br />
                                    <div className="indi-dropdown-container">
                                        {charts && (
                                            <>
                                                <label htmlFor="trialIdsMultiSelect" className="dropdown-label">Trial Id's</label>
                                                <MultiSelect
                                                    id="trialIdsMultiSelect"
                                                    className="fixed-width-select w-full md:w-20rem"
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
                                    <button className="createCtmlButton" onClick={handleReactPlotlyChart} disabled={!(selectedItem)} style={{ height: "2.5rem", alignItems: "center" }} >
                                        Create Chart
                                    </button>
                                    {/*!reactPlotlyChartLoading && reactPlotlyChartResponse && 
                                        <button className="createCtmlButton" onClick={() => handleViewPlot()}>
                                            View Plot
                                        </button>
                                        */}
                                    {hasPythonChartsRole && <div>
                                        {<button className="createCtmlButton" onClick={handleChartValidate} disabled={!(selectedItem)} style={{ height: "2.5rem", alignItems: "center" }} >Create Python Charts</button>}
                                        {imageSrc && createStatus && (((createStatus as string).startsWith("Success"))) && !(csvChartLoading) &&   <Popup trigger={<button className="createCtmlButton" > View Plot </button>} modal nested position="left center">
                                            <img src={imageSrc} alt="Plot" style={{ width: '100%', height:'auto', maxWidth: '1000px', display: 'block', margin: '0 auto' }} />
                                            </Popup>}
                                        {createStatus && (!((createStatus as string).startsWith("Success")) ? <p></p> :  <button className="createCtmlButton" onClick={() => handleDownload()}>Download
                                        </button>)}  
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {
                    false && selectedTab== 'study' && <StudyView accessToken={props.accessToken}></StudyView>
                }
                {
                    selectedTab== 'patient' && <PatientView accessToken={props.accessToken} patient_ids={selectedPatient} study_id={selectedPatientStudy}></PatientView>
                }
            </div>
            { selectedTab === 'charts' && showPopup && <div className="plot-container">
                {reactPlotlyData && !reactPlotlyChartLoading && React.createElement(chartComponents[selectedItem.toString()], {
                data: reactPlotlyData,
                study_id: "someStudyId",
                onBarClick: (patient: string, study:string) => {
                if(study!="N/A"){                
                setSelectedTab('patient');
                setSelectedPatient(patient);
                setSelectedPatientStudy(study);}
                }})}
            </div>}
            <br />
            {uploadMessage && <p>{uploadMessage}</p> && selectedTab === 'table'}
            <br />
            {(loading || folderLoading || filesLoading || csvLoading || sendLoading || csvChartLoading) && 
                <div className="page-overlay">
                    <ProgressSpinner className="custom-spinner" />
                </div>
            }
            <br />
            { selectedTab === 'table' && <div className="container" >
                {!sendLoading && <div  className="right">
                    {!sendLoading && <RightComponent accessToken={props.accessToken} onCheckboxChange={handleCheckboxChange} />}
                </div>}
            </div>}
            {createStatus && (!((createStatus as String).startsWith("Success")) ? 
                <iframe srcDoc={`<h3>${createStatus}</h3>`} width="400" height="300"></iframe> : 
                <p></p>)}
            <br />
        </>
    );
    
    
}

export default UploadCsv
