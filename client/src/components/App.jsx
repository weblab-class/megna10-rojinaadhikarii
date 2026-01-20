import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";
import "../utilities.css";
import { get, post } from "../utilities";
import NavBar from "./modules/NavBar";

export const UserContext = createContext(null);

const App = () => {
  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) setUserId(user._id);
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
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