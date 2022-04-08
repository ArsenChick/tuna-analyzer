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
    <div className="App">
      <div id="top-bar">
        <div id="big-top-bar">
          <header>
            <Link to="/" className="page-link">
              <h1 id="logo-title">Tuna</h1>
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
                      <img src={log_out_icon} width="20px" alt=""/>
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
      <div className="hint-area">
        <div className="hint-modal-body">
          <ul>
            <span>Characteristics description:</span>
            <li>
                <b>BPM</b> (Beats Per Minute) a musical term
                that means measuring the tempo of the
                music.
            </li>
            <li>
               <b>Key</b> is the group of pitches, or scale, that
               forms the basis of a music composition
               in classical.
            </li>
            <li>
               Elements that give the composition more&nbsp;
               <b>energy</b>: higher tones, fast and irregular
               rhythms, dissonant harmony.
            </li>
            <li>
                <b>Happiness</b> of the music is usually expressed
                 in a fast tempo and in a major key
            </li>
            <li>
                <b>Danceability</b> is measured using a mixture
                of song features such as beat strength,
                tempo stability, and overall tempo.
            </li>
          </ul>
        </div>
        <button className="hint-button">?</button>
      </div>
    </div>
  );
}

export default App;
