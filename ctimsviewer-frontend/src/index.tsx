import React, { useEffect , useState} from 'react';
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

const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_INTEGRATION;


const initOptions ={ onLoad: 'login-required', redirectUri: '', checkLoginIframe: false};

const keycloak = new Keycloak({
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM || '',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT || "",
  clientSecret: process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET || "" // Add client secret
} as Keycloak.KeycloakConfig);
 // Type assertion to inform TypeScript about the new property


//          <App  accessToken={check}/>
const AppWithKeycloak: React.FC = () => {
    const client: any= process.env.REACT_APP_KEYCLOAK_CLIENT;
    const { initialized, keycloak } = useKeycloak();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [ctimsRoles, setCtimsRoles] = useState<string[]>([]);
  const userName = keycloak?.idTokenParsed?.name;

  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;
    let autoLogoutTimeout: NodeJS.Timeout;
    const scheduleTokenRefresh = () => {
      const exp = keycloak.tokenParsed?.exp;
      const iat = keycloak.tokenParsed?.iat;
      if (exp && iat) {
        const tokenLifespan = exp - iat;
        const refreshTimeInSeconds = tokenLifespan - 60;
        const refreshTimeInMs = refreshTimeInSeconds * 1000;
  
        refreshTimeout = setTimeout(() => {
          keycloak.updateToken(60).then((refreshed) => {
            if (refreshed) {
              setAccessToken(keycloak.token);
  
              const resourceAccess = keycloak.tokenParsed?.resource_access;
              const roles = resourceAccess?.[client]?.roles || [];
              setCtimsRoles(roles);
              scheduleTokenRefresh();
              scheduleAutoLogout();
            } else {
              scheduleTokenRefresh();
            }
          }).catch((err) => {
            keycloak.logout();
          });
  
        }, refreshTimeInMs);
  
      }
    };
    const scheduleAutoLogout = () => {
      const exp = keycloak.tokenParsed?.exp;
      if (!exp) return;

      const now = Date.now();
      const expMs = exp * 1000;
      const timeUntilLogout = expMs - now;

      if (timeUntilLogout > 0) {
        autoLogoutTimeout = setTimeout(() => {
          keycloak.logout();
        }, timeUntilLogout);
      }
    };
    if (initialized && keycloak.authenticated) {
      setAccessToken(keycloak.token);
  
      const resourceAccess = keycloak.tokenParsed?.resource_access;
      const roles = resourceAccess?.[client]?.roles || [];
      setCtimsRoles(roles);
      scheduleTokenRefresh();
      scheduleAutoLogout();
    }
  
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      if (autoLogoutTimeout) clearTimeout(autoLogoutTimeout);
    };
  }, [initialized, keycloak, client]);
    return (
          <BrowserRouter>
                <div>
                  <Header userName={userName} />
                  <Navi roles={ctimsRoles} />
                  <Home />
                  <App accessToken={accessToken || ''} roles={ctimsRoles} />
                </div>
          </BrowserRouter>
    );
  };

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));

if(keycloakIntegration == "enable")
{
  root.render(
    <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions}>
    <AppWithKeycloak />
  </ReactKeycloakProvider>
);
}
else{
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
