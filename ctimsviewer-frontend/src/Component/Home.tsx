import React from "react";
import header from "../header.png";
import { useKeycloak } from '@react-keycloak/web';
import "./styles.css";

function Sample() {

    return( 
    <>
        <section id="Sample">
            <div>
            <h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}></h1>
            </div>
        </section>
    </>
    ); 

}
//CTIMS is an open source software platform, used for matching patients to clinical trials. CTIMS platform consists of Assembler, Editor, Matcher and Viewer. 
export default Sample;
//style={{ backgroundColor: 'lightblue', minHeight: '100vh' }}