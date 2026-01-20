import { Link } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import "./NavBar.css";
import React, { useContext } from "react";
import { UserContext } from "../App";

/**
 * The navigation bar at the top of all pages. Takes no props.
 */
const NavBar = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  return (
    // Left
    <nav className="NavBar-container">
      <div className="NavBar-title">flow state</div>

      {/*   Right   */}
      <div className="NavBar-right">
        <button className="nav-tab">Discovery</button>
        <button className="nav-tab">Bookmarks</button>

        {/* Auth button (top right) */}
        <div className="NavBar-auth-button">
          {userId ? (
            <button
              onClick={() => {
                googleLogout();
                handleLogout();
              }}
            >
              Logout
            </button>
          ) : (
            <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
