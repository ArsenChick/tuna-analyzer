import { useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import './scss/app.scss';

//Изображения
//import logo from './img/tuna_logo.svg';
import log_in_icon from './img/log_in_icon.svg';
import log_out_icon from './img/log_out_icon.svg';


function App() {
  let [user, setUser] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="App" id="page-content">
      <div id="top-bar">
        <div id="big-top-bar">
          <header>
            <Link to="/">
              <h1 id="logo-tittle">Tuna</h1>
            </Link>
          </header>
          <nav className="sections">
            <ul>
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
                  My History
                </NavLink>{" "}
              </li>
              <li>
                {user
                  ? <button
                      className="navButton"
                      id="logoutButton"
                      onClick={() => {
                        setUser(null);
                        navigate("/");
                      }}
                    >
                      <span id="userLogin">{user}</span>
                      <img src={log_out_icon} width="20px" alt="Log out"/>
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
                      <img src={log_in_icon} width="20px" alt=""/>
                    </NavLink>}
              </li>
            </ul>
          </nav>
        </div>
        <div id="small-top-bar">
        </div>
      </div>
      <Outlet context={[user, setUser]} />
    </div>
  );
}

export default App;
