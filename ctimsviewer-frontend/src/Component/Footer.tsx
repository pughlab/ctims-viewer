import "./Footer.css"
const Footer = ()=>{
const Version= process.env.REACT_APP_VERSION;
return (<>
    <div className="TextAlign">
        <p>Version {Version}</p>
    </div>
    </>);
}
export default Footer;