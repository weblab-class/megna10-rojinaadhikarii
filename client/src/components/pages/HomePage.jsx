import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";

import "../../utilities.css";
import "./HomePage.css";
import { UserContext } from "../App";

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Slogan */}
      <section className="slogan">
        <h1>
          Less searching, <br />
          <span className="highlight">more studying</span>
        </h1>
        <p>Discover the perfect study spot for your focus and flow</p>
        <button className="cta-button">Enter the flow</button>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Features</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">🧭</div>
            <h3>Discovery Feed</h3>
            <p>Browse curated study spaces tailored to your preferences and location</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Review & Rank</h3>
            <p>Read reviews and ratings from fellow students about each study spot</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔖</div>
            <h3>Bookmark Spots</h3>
            <p>Save your favorite locations for quick access when you need them</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
