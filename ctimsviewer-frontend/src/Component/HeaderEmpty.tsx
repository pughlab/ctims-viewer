import React from "react";
import header from "../header.png";
import { useKeycloak } from '@react-keycloak/web';
import "./styles.css";

function Header() {

    return( 
    <>
    <div className="headerStyles">
        <h1 style={{ height: "6rem", margin: "10px auto", display: "block", textAlign: "center", fontSize: "4rem", color: "whitesmoke" }}>ctimsviewer</h1>
    </div>
    </>
    ); 

}

export default Header;
