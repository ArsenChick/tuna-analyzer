import { useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';
import "./scss/app.scss";

//Изображения
import logo_icon from "./img/tuna_neon_logo.svg";

import * as Icon from "react-feather";

function App() {
  let [user, setUser] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'username']);
  const navigate = useNavigate();
  if(cookies.username && user == null){
	  setUser(cookies.username);
    setCookie("username", cookies.username);
  }
  
  return (
    <div className="App">
      <div id="top-bar">
        <div id="big-top-bar">
          <header>
            <Link to="/" className="page-link">
              <img src={logo_icon} width="70px" alt="" />
              <h1 id="logo-title">Tuna</h1>
            </Link>
          </header>
          <nav className="sections">
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
                    to="/history"
                  >
                    <span>My History</span>
                    <Icon.List size={20} />
                  </NavLink>{" "}
                </li>
              }
              <li>
                {user
                  ? <button
                      className="navButton"
                      id="logoutButton"
                      onClick={() => {
                        removeCookie('access_token');
                        removeCookie('username');
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
      <Outlet context={[user, setUser]} />
    </div>
  );
}

export default App;
