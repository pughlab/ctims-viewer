import React, { useRef, useState  }  from "react";
import { useKeycloak } from '@react-keycloak/web';
import "./styles.css";
import logo from "../images/ctims-logo.svg";
import {Menu} from "primereact/menu";

function Header(props: any) {

  const { keycloak } = useKeycloak();
  const menuRef = useRef<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);



  const handleLogout = () => {
    keycloak.logout();
  };

  const toggleMenu = (event: any) => {
    console.log("Entered")
    setMenuVisible(!menuVisible);
    if (menuRef.current) {
      menuRef.current.toggle(event);
    }
  };

  const getInitials = (name: any) => {
    if(name== undefined)
    {
      return null;
    }
    const names = name.split(' ');
    let initials = '';
    names.forEach((n: any) => {
      initials += n[0];
    });
    return initials;
  }
  
  const initials = getInitials(props.userName)
  console.log("Props", props.userName)

    return( 
    <>
    <div className="headerStyles">
        <img src={logo} alt="CTIMS Logo"/>
        <div className="userContainer">
          <div className="userImage">
            <span>{getInitials(props.userName)}</span> 
          </div>
          <div>{props.userName}</div>
          <i className="pi pi-angle-down"
            aria-controls="popup_menu"
            aria-haspopup
            onClick={toggleMenu}></i>
          <Menu model={[{label: 'Sign Out',icon: 'pi pi-sign-out', command: handleLogout}]} popup className="menu" ref={menuRef} appendTo={document.body} /> 
        </div>
    </div>
    </>
    ); 

}

export default Header;
