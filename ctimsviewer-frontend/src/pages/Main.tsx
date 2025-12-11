import React, {useState} from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import UploadCsv from "../Component/UploadCsv";
import UploadComponent from "../Component/UploadComponent";
import ValidateComponent from "../Component/ValidateComponent";
import ResultComponent from "../Component/ResultComponent";
import SharedDataContext from "../service/SharedDataContext";
import "./pages.css";
import Navi from "../Component/Navi";

const Main = (props: any) => {
    const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_INTEGRATION;

    // const [result, setResult] = useState('');
    //console.log("Props Value In side main", props)

    if(keycloakIntegration=="enable")
    {
        return (
            <div className="card" >
                {/*<SharedDataContext.Provider value={{ validationResult: result, setValidationResult: setResult }}>*/}
                        <UploadCsv accessToken={props.accessToken} roles={props.roles}/>
                {/*</SharedDataContext.Provider>*/}
            </div>
        );

    }
    else
    {
        return (
            <div className="card">
                {/*<SharedDataContext.Provider value={{ validationResult: result, setValidationResult: setResult }}>*/}
                        <UploadCsv accessToken="" roles=""/>
                {/*</SharedDataContext.Provider>*/}
            </div>
        );
    }

}

export default Main;
