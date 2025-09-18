import Assembler from "../Component/Assembler";
const CtimsAssembler=(props: any)=>{

    const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_INTEGRATION;
    if(keycloakIntegration=="enable")
    {
        return (
            <div className="card" >
                <Assembler accessToken={props.accessToken}/>
            </div>
        );
    }
    else
    {
        return (
            <div className="card">
                <Assembler accessToken=""/>
            </div>
        );
    }
}

export default CtimsAssembler;