import React, {useState} from 'react'
import Keycloak from 'keycloak-js'
import * as ReactDOM from "react-dom";
import axios from "axios";
import {isAuthenticated, logout} from "./service/AuthService";
import {Route, Routes, Navigate} from "react-router-dom";
import Main from "./pages/Main";
import Clinical from "./pages/Clinical";
import Login from "./pages/Login";
import Sample from "./Component/Sample";
import Home from "./Component/HomeMain";
import Matchminer from './pages/Matchminer';




function App(props) {



    const roles = props.roles || [];;
    const hasChartsRole = roles.includes('role_charts');
    const hasFetcherRole = roles.includes('role_fetcher');
    const hasClinicalRole = roles.includes('role_clinical');

    return (
        <React.Suspense >
            <Routes>
                <Route  path="/" name="Home Page" element={<Home />}/>
                {hasChartsRole && (<Route  path="/charts" name="Main Page" element={<Main accessToken={props.accessToken} />} />)}
                {hasChartsRole && (<Route  path="/matchminer" name="Matchminer" element={<Matchminer accessToken={props.accessToken} />} />)}
                {hasClinicalRole && (<Route  path="/clinical" name="Main Page" element={<Clinical accessToken={props.accessToken} />} />)}
                {hasFetcherRole && (<Route path="/sample" name="SamplePage"  element={<Sample accessToken={props.accessToken}/>} />)}
            </Routes>
        </React.Suspense>
    );
}

export default App
