import React from "react";
import { useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useCookies, CookiesProvider } from "react-cookie";
import { isMobile } from "./scripts/mobileDetect";

//import "./scripts/hintInteraction";
import "./scss/top_bar/burger_menu.scss";

import "./scss/app.scss";
import logo_icon from "./img/tuna_neon_logo.svg";
import * as Icon from "react-feather";


function App() {
  let [user, setUser] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies([
    "access_token",
    "username"
  ]);
  const navigate = useNavigate();
  const [menuActive, setMenuActive] = useState(false);

  if (cookies.username && user == null) {
    setUser(cookies.username);
    setCookie("username", cookies.username);
  }

  const handleToggle = () => {
   setMenuActive(!menuActive);
   //console.log("changed");
  };

  const closeMenu = () => {
    if (menuActive) {
      setMenuActive(false);
    }
  };


  return (
    <div className="App">
      <div id="top-bar">
        <div id="big-top-bar">
          <header>
            <Link to="/" className="page-link">
              <img src={logo_icon} className="logo-icon" width="50px" alt="" />
              <h1 id="logo-title">Tuna</h1>
            </Link>
          </header>
          <div
            className = {`top-bar-icon ${ menuActive ? '_active' : '' }`}
            onClick={ handleToggle }
          >
            <span>
            </span>
          </div>
          <h2 className = {`menu-title ${ menuActive ? '_active' : '' }`}> Menu </h2>
          <nav className = {`sections ${ menuActive ? '_active' : '' }`
          }>
            <ul>
              {user &&
                <li>
                  <NavLink
                    // TODO добавить стили и изменить style на className
                    className="navButton"
                    id="historyButton"
                    style={({ isActive }) => {
                      return { color: isActive ? "#f48a9a" : "" };
                    }}
                    onClick={ closeMenu }
                    to="/history"
                  >
                    <span>My History</span>
                    <Icon.BookOpen size={20} />
                  </NavLink>{" "}
                </li>}
              <li>
                {user
                  ? <button
                      className="navButton"
                      id="logoutButton"
                      onClick={(closeMenu) => {
                        removeCookie("access_token");
                        removeCookie("username");
                        setUser(null);
                        navigate("/");
                      }}
                    >
                      <span id="userLogin">
                        {user}
                      </span>
                      <Icon.LogOut size={20} />
                    </button>
                  : <NavLink
                      // TODO добавить стили и изменить style на className
                      className="navButton"
                      id="loginButton"
                      style={({ isActive }) => {
                        return { color: isActive ? "#f48a9a" : "" };
                      }}
                      onClick = { closeMenu }
                      to="/login"
                    >
                      <span>Log in</span>
                      <Icon.LogIn size={20} />
                    </NavLink>}
              </li>
            </ul>
          </nav>
        </div>
        <div id="small-top-bar" />
      </div>
      <CookiesProvider>
        <Outlet context={[user, setUser]} />
      </CookiesProvider>
    </div>
  );
}

export default App;
