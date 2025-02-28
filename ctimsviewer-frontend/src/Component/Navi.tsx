import React, { useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import "./styles.css";

function Navi(props: any) {
    const location = useLocation();

    const roles = props.roles || [];;
    const hasChartsRole = roles.includes('role_charts');
    const hasMatchEnginelRole = roles.includes('role_matchengine');
    const hasFetcherRole = roles.includes('role_fetcher');
    const hasLoaderRole = roles.includes('role_loader');

    return (
        <div>
            <div className="navHeader">
                <h3 className={location.pathname === "/" ? "selected" : ""}>
                    <Link to="/" >Home Page</Link>
                </h3>
                {hasChartsRole && (<h3 className={location.pathname === "/charts" ? "selected" : ""}>
                    <Link to="/charts" >CTIMS Viewer Charts</Link>
                </h3>)}
                {hasMatchEnginelRole && (<h3 className={location.pathname === "/matchengine" ? "selected" : ""}>
                    <Link to="/matchengine" >CTIMS Match Engine</Link>
                </h3>)}
                {hasLoaderRole && (<h3 className={location.pathname === "/loader" ? "selected" : ""}>
                    <Link to="/loader" >CTIMS Loader</Link>
                </h3>)}
                {hasFetcherRole && (<h3 className={location.pathname === "/fetcher" ? "selected" : ""}>
                    <Link to="/fetcher">CTIMS Assembler Fetcher</Link>
                </h3>)}
            </div>
        </div>
    );
}

export default Navi;
