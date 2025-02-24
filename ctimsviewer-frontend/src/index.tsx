import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Main from "./pages/Main";
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route} from "react-router-dom";
import Header from "./Component/Header";
import HeaderEmpty from "./Component/HeaderEmpty";
import Navi from "./Component/Navi";
import Home from "./Component/Home";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import {ReactKeycloakProvider, useKeycloak} from '@react-keycloak/web';
import Keycloak from 'keycloak-js'
import {login} from "./service/AuthService"

const apiUrl = process.env.REACT_APP_API_URL;
const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_INTEGRATION;

//console.log("Value in KEYCLOAK_INTEGRATION", keycloakIntegration);

//console.log("Check1 Value", process.env.REACT_APP_KEYCLOAK_INTEGRATION);
const initOptions ={ onLoad: 'login-required', redirectUri: '', checkLoginIframe: false};
console.log("Check2 Value", process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET);
const keycloak = new Keycloak({
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM || '',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT || "",
  clientSecret: process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET || "" // Add client secret
} as Keycloak.KeycloakConfig);
 // Type assertion to inform TypeScript about the new property
console.log('Keycloak object:', keycloak);

//login("dgavini", "Dheeraj@23");

//          <App  accessToken={check}/>
const AppWithKeycloak: React.FC = () => {
    const { initialized, keycloak } = useKeycloak();
    const userName = keycloak?.idTokenParsed?.name;
    var check = keycloak.token;
    const resourceAccess = keycloak.tokenParsed?.resource_access;
    const ctimsRoles = resourceAccess?.ctims?.roles || [];
    console.log("Content in keycloak", ctimsRoles);
    useEffect(() => {
      if (initialized && keycloak.authenticated) {
       const token = keycloak.token;
        console.log("Access Token", token);
        console.log("User Name", userName);
        // Now you can use the token or perform any other actions with the authenticated user
      }
    }, [initialized, keycloak]);
  console.log("Check value", check);
    return (
          <BrowserRouter>
                <div>
                  <Header userName={userName} />
                  <Navi roles={ctimsRoles} />
                  <Home />
                  <App accessToken={check} roles={ctimsRoles}  />
                </div>
          </BrowserRouter>
    );
  };

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));

if(keycloakIntegration== "enable")
{
  root.render(
    <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions}>
    <AppWithKeycloak />
  </ReactKeycloakProvider>
);
}
else{
  {console.log("Entered Else statement")}
root.render(
  <BrowserRouter>
  <div>
    <HeaderEmpty/>
    <Navi />
    <Home />
     <App accessToken="" />
  </div>
</BrowserRouter>

);
}


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
