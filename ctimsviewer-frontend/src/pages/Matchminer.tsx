import React, {useState} from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import UploadMatchminer from '../Component/UploadMatchminer';
import ValidateComponent from "../Component/ValidateComponent";
import ResultComponent from "../Component/ResultComponent";
import SharedDataContext from "../service/SharedDataContext";
import "./pages.css";
import Navi from "../Component/Navi";

const Matchminer = (props: any) => {
    const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_INTEGRATION;

    // const [result, setResult] = useState('');
    //console.log("Props Value In side main", props)

    if(keycloakIntegration=="enable")
    {
        return (
            <div className="card" >
                {/*<SharedDataContext.Provider value={{ validationResult: result, setValidationResult: setResult }}>*/}
                        <UploadMatchminer accessToken={props.accessToken}/>
                {/*</SharedDataContext.Provider>*/}
            </div>
        );

    }
    else
    {
        return (
            <div className="card">
                {/*<SharedDataContext.Provider value={{ validationResult: result, setValidationResult: setResult }}>*/}
                        <UploadMatchminer accessToken=""/>
                {/*</SharedDataContext.Provider>*/}
            </div>
        );
    }

}

export default Matchminer;