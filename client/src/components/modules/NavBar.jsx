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
    <nav className="NavBar-container">
      <div className="NavBar-title u-inlineBlock">flow state</div>
      <div className="NavBar-linkContainer u-inlineBlock">
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
        <Link to="/" className="NavBar-link">
          Home
        </Link>
        <Link to="/homepage/" className="NavBar-link">
          HomePage
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
