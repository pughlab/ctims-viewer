import React from "react";
import header from "../header.png";
import { useKeycloak } from '@react-keycloak/web';
import "./styles.css";
import viewer from "../images/viewer.png";
import fetcher from "../images/assembler.png";
function Sample() {

    return( 
    <>
        <section id="Sample">
            <div>
            <h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}></h1>
            <h3 style={{ padding: "2rem" }}>CTIMS is an open source software platform, used for matching patients to clinical trials. CTIMS platform consists of Assembler, Editor, Matcher and Viewer.</h3>
            </div>
            <br></br>
            <br></br>
            <br></br>
            <div className="home-images">
                <div className="images-div">
                    <img src={viewer} className="individual-images"/>
                    <h3>The CTIMS Viewer application is designed to generate visualizations such as bar charts and heatmaps from matched clinical trial data using the CTIMS editor. It allows users to create dynamic plots based on the number of patients matched to each trial, providing a visual representation of patient distribution and helping to analyze trial matching efficiency.</h3>
                </div>
                <div className="images-div">
                    <img src={fetcher}  className="individual-images"/>
                    <h3>The CTIMS fetcher retrieves clinical research studies from clinicaltrials.gov and transforms the data into a format that is compatible with the CTIMS Editor. This tool not only enables users to visualize both the original and converted data but also facilitates downloading the transformed data. By streamlining data conversion and visualization, fetcher aids in making clinical trial information more accessible and usable for further analysis and decision-making.</h3>
                </div>
            </div>
        </section>
    </>
    ); 

}

export default Sample;
//style={{ backgroundColor: 'lightblue', minHeight: '100vh' }}