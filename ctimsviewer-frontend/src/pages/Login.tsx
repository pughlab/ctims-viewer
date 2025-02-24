import {useState} from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import "./pages.css";
import { toBeRequired } from "@testing-library/jest-dom/matchers";
import Keycloak from 'keycloak-js';




const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [invalid, setInvalid] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleLogin = (e: { preventDefault: () => void; }) => {
        // need prevent default, otherwise the page will be reloaded
        e.preventDefault();
            const keycloak = new Keycloak({
                url: 'http://localhost:8080/auth/',
                realm: 'Ctimsorg',
                clientId: 'ctims'
            });

            
          keycloak.init({onLoad: 'login-required', redirectUri: 'http://localhost:3000/main' })
          .then(authenticated => {
            console.log("authenticated", authenticated);
            if (authenticated) {
              console.log("User is authenticated");
              //window.location.replace("/main");
              //history.push("/main"); // Redirect to homepage after successful login
              navigate('/main'); 
            } else {
              console.log("User is not authenticated");
            }
          })
          .catch(error => {
            console.error("Keycloak initialization error", error);
          });

    }

    return (
        <>
            <div className="LoginHeader">
                <form onSubmit={handleLogin} className="login-page">
                        <div>
                            {invalid ? <span className="LoginInvalid">Invalid details Please try again</span> : <span className="LoginInitialMsg">Signin with your Tid</span>}
                        </div>
                        <div className="flex flex-column gap-2">
                            <br></br>
                            <h1 style={{ height: "6rem", margin: "10px auto", display: "block", textAlign: "center", fontSize: "4rem", color: "whitesmoke"}}>
                              Please Login 
                            </h1>
                        </div>
                        <br />
                        <div>
                            <Button label="Login" />
                        </div>
                </form>
            </div>
        </>
    );
}

export default Login;
