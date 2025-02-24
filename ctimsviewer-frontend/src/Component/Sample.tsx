import React from "react";
import header from "../header.png";
import { useKeycloak } from '@react-keycloak/web';
import "./styles.css";
import CtimsImportsComponent  from "./CtimsImportsComponent";

function Sample(props: any) {

    return( 
    <>
        <section id="Sample">
            <div>
            <br/>
            <br/>
            <CtimsImportsComponent accessToken={props.accessToken}/>
            </div>
        </section>
    </>
    ); 

}

export default Sample;
//style={{ backgroundColor: 'lightblue', minHeight: '100vh' }}