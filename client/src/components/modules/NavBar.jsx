import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { UserContext } from "../App";
import "./NavBar.css";

const NavBar = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);

  return (
    <nav className="NavBar-container">
      <Link to="/" className="NavBar-title">
        flow state
      </Link>
      <div className="NavBar-right">
        <Link to="/" className="nav-tab">
          Home
        </Link>

        {/* UPDATED: Discovery Dropdown */}
        <div className="NavBar-dropdown">
          <Link to="/discovery" className="nav-tab NavBar-dropdown-title">
            Discovery ▾
          </Link>
          <div className="NavBar-dropdown-content">
            <Link to="/discovery" className="NavBar-dropdown-item">
              Feed
            </Link>
            <Link to="/discovery?view=map" className="NavBar-dropdown-item">
              Map
            </Link>
          </div>
        </div>

        <Link to="/profile" className="nav-tab">
          Profile
        </Link>
        <Link to="/studycorner" className="nav-tab">
          Study Corner
        </Link>
        <Link to="/profile" className="nav-tab">
          Profile
        </Link>

        <div className="NavBar-auth-button">
          {userId ? (
            <button
              className="logout-button"
              onClick={() => {
                googleLogout();
                handleLogout();
              }}
            >
              Logout
            </button>
          ) : (
            <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} shape="pill" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
