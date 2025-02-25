import React, { useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import "./styles.css";

function Navi(props: any) {
    const location = useLocation();

    const roles = props.roles || [];;
    const hasChartsRole = roles.includes('role_charts');
    const hasFetcherRole = roles.includes('role_fetcher');
    const hasClinicalRole = roles.includes('role_clinical');

    return (
        <div>
            <div className="navHeader">
                <h3 className={location.pathname === "/" ? "selected" : ""}>
                    <Link to="/" >Home Page</Link>
                </h3>
                {hasChartsRole && (<h3 className={location.pathname === "/charts" ? "selected" : ""}>
                    <Link to="/charts" >CTIMS Viewer Charts</Link>
                </h3>)}
                {hasChartsRole && (<h3 className={location.pathname === "/matchminer" ? "selected" : ""}>
                    <Link to="/matchminer" >CTIMS Matchminer</Link>
                </h3>)}
                {hasClinicalRole && (<h3 className={location.pathname === "/clinical" ? "selected" : ""}>
                    <Link to="/clinical" >CTIMS Clinical</Link>
                </h3>)}
                {hasFetcherRole && (<h3 className={location.pathname === "/sample" ? "selected" : ""}>
                    <Link to="/sample">CTIMS Assembler Fetcher</Link>
                </h3>)}
            </div>
        </div>
    );
}

export default Navi;
