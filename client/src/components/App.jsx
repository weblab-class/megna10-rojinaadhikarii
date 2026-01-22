import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";
import "../utilities.css";
import { get, post } from "../utilities";
import NavBar from "./modules/NavBar";
import StudyCorner from "./modules/StudyCorner.jsx";

export const UserContext = React.createContext();

const App = () => {
  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) setUserId(user);
      else {
        // ❌ Failure: User is NOT logged in
        // We must set this to null so the app stops loading!
        setUserId(null);
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user);
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };

  return (
    <UserContext.Provider value={{ userId, handleLogin, handleLogout }}>
      <NavBar />
      <div className="App-container">
        <Outlet />
      </div>
    </UserContext.Provider>
  );
};

export default App;
