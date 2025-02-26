import React, {useState} from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import UploadMatchEngine from '../Component/UploadMatchEngine';
import ValidateComponent from "../Component/ValidateComponent";
import ResultComponent from "../Component/ResultComponent";
import SharedDataContext from "../service/SharedDataContext";
import "./pages.css";
import Navi from "../Component/Navi";

const MatchEngine = (props: any) => {
    const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_INTEGRATION;
    if(keycloakIntegration=="enable")
    {
        return (
            <div className="card" >
                <UploadMatchEngine accessToken={props.accessToken}/>
            </div>
        );
    }
    else
    {
        return (
            <div className="card">
                <UploadMatchEngine accessToken=""/>
            </div>
        );
    }
}

export default MatchEngine;