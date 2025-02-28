import React, {useState} from 'react'
import Keycloak from 'keycloak-js'
import * as ReactDOM from "react-dom";
import axios from "axios";
import {isAuthenticated, logout} from "./service/AuthService";
import {Route, Routes, Navigate} from "react-router-dom";
import Main from "./pages/Main";
import Loader from "./pages/Clinical";
import Login from "./pages/Login";
import Fetcher from "./Component/Sample";
import Home from "./Component/HomeMain";
import MatchEngine from './pages/MatchEngine';




function App(props) {



    const roles = props.roles || [];;
    const hasChartsRole = roles.includes('role_charts');
    const hasMatchEnginelRole = roles.includes('role_matchengine');
    const hasFetcherRole = roles.includes('role_fetcher');
    const hasLoaderRole = roles.includes('role_loader');

    return (
        <React.Suspense >
            <Routes>
                <Route  path="/" name="Home Page" element={<Home />}/>
                {hasChartsRole && (<Route  path="/charts" name="Main Page" element={<Main accessToken={props.accessToken} />} />)}
                {hasMatchEnginelRole && (<Route  path="/matchengine" name="Match Engine" element={<MatchEngine accessToken={props.accessToken} />} />)}
                {hasLoaderRole && (<Route  path="/loader" name="CTIMS Loader" element={<Loader accessToken={props.accessToken} />} />)}
                {hasFetcherRole && (<Route path="/fetcher" name="CTIMS Assembler Fetcher"  element={<Fetcher accessToken={props.accessToken}/>} />)}
            </Routes>
        </React.Suspense>
    );
}

export default App
