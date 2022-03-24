import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';

function App() {
  let [user, setUser] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="App">
      <header>
        <Link to="/"><h1>Tuna</h1></Link>
      </header>
      <nav>
        <NavLink
          // TODO добавить стили и изменить style на className
          style={({ isActive }) => {
            return {color: isActive ? "red" : ""}
          }}
          to="/history"
        >
          My History
        </NavLink> {" - "}
        { user ?
          <button onClick={() => {
            setUser(null);
            navigate("/");
          }}
          >
            {user}: Log out
          </button> :
          <NavLink
            // TODO добавить стили и изменить style на className
            style={({ isActive }) => {
              return { color: isActive ? "red" : "" };
            }}
            to="/login"
          >
            Login
          </NavLink>
        }
      </nav>
      <Outlet context={[user, setUser]} />
    </div>
  );
}

export default App;
