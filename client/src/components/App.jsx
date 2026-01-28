import React, { useState, useEffect, createContext } from "react";
import { Routes, Route } from "react-router-dom"; 
import "../utilities.css";
import { get, post } from "../utilities";
import NavBar from "./modules/NavBar";

import HomePage from "./pages/HomePage";
import DiscoverFeed from "./pages/DiscoverFeed";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Leaderboard from "./pages/Leaderboard";

import StudyCorner from "./modules/StudyCorner"; 

export const UserContext = createContext(undefined);

const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [spots, setSpots] = useState(null); 

  useEffect(() => {
    get("/api/whoami")
      .then((user) => {
        if (user._id) {
          setUserId(user);
        } else {
          setUserId(null); 
        }
      })
      .catch((err) => {
        console.error("Session check failed", err);
        setUserId(null);
      });

    get("/api/studyspot")
      .then((data) => {
        if (Array.isArray(data)) setSpots(data);
        else setSpots([]);
      })
      .catch((err) => {
        console.error("Failed to fetch spots", err);
        setSpots([]);
      });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user);
    });
  };

  const handleLogout = () => {
    setUserId(null);
    post("/api/logout");
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, handleLogin, handleLogout, spots, setSpots }}>
      <NavBar />
      <div className="App-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discovery" element={<DiscoverFeed />} />
          <Route path="/studycorner" element={<StudyCorner />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/:userId?" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </UserContext.Provider>
  );
};

export default App;