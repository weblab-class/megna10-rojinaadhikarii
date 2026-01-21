import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../utilities.css";
import "./HomePage.css";

const HomePage = () => {
  const featuresRef = useRef(null);
  const navigate = useNavigate();

  const handleEnterFlow = () => {
    navigate("/discovery");
  };

  return (
    <div className="home-page">
      {/* Slogan section */}
      <section className="slogan">
        <h1>
          Less searching, <br />
          <span className="highlight">more studying</span>
        </h1>
        <p>Discover the perfect study spot for your focus and flow</p>
        <button className="cta-button" onClick={handleEnterFlow}>
          Enter the flow
        </button>
      </section>

      {/* Banner Image section */}
      <div className="hero-image-container">
      <img 
        src="hero-banner.jpg" 
        alt="Study desk with supplies" 
        className="hero-banner" 
      />
      </div>

      {/* Features section */}
      <section className="features" ref={featuresRef}>
        <h2 className="features-title">Features</h2>
        <div className="feature-cards">
          
          {/* Card 1: Discovery Feed */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="86" height="81" viewBox="0 0 86 81" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_1136197_155)">
                  <rect x="4" width="78" height="73" rx="36.5" fill="#A1B3A8"/>
                  <path d="M43 66.9167C60.9493 66.9167 75.5 53.2987 75.5 36.5C75.5 19.7014 60.9493 6.08337 43 6.08337C25.0507 6.08337 10.5 19.7014 10.5 36.5C10.5 53.2987 25.0507 66.9167 43 66.9167Z" stroke="#1E1E1E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M56.78 23.6034L49.89 42.9484L29.22 49.3967L36.11 30.0517L56.78 23.6034Z" stroke="#1E1E1E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <defs>
                  <filter id="filter0_d_1136197_155" x="0" y="0" width="86" height="81" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1136197_155"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1136197_155" result="shape"/>
                  </filter>
                </defs>
              </svg>
            </div>
            <h3>Discovery Feed</h3>
            <p>Browse curated study spaces tailored to your preferences and location</p>
          </div>

          {/* Card 2: Review & Rank */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="86" height="81" viewBox="0 0 86 81" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_1136197_171)">
                  <rect x="4" width="78" height="73" rx="36.5" fill="#A1B3A8"/>
                  <path d="M43 6.08337L53.0425 25.1242L75.5 28.1963L59.25 43.0092L63.085 63.9359L43 54.0505L22.915 63.9359L26.75 43.0092L10.5 28.1963L32.9575 25.1242L43 6.08337Z" stroke="#1E1E1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <defs>
                  <filter id="filter0_d_1136197_171" x="0" y="0" width="86" height="81" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1136197_171"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1136197_171" result="shape"/>
                  </filter>
                </defs>
              </svg>
            </div>
            <h3>Review & Rank</h3>
            <p>Read reviews and ratings from fellow students about each study spot</p>
          </div>

          {/* Card 3: Bookmark Spots */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="86" height="78" viewBox="0 0 86 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_1136197_187)">
                  <rect x="4" width="78" height="70" rx="35" fill="#A1B3A8"/>
                  <path d="M65.75 61.25L43 46.6667L20.25 61.25V14.5833C20.25 13.0362 20.9348 11.5525 22.1538 10.4585C23.3728 9.36458 25.0261 8.75 26.75 8.75H59.25C60.9739 8.75 62.6272 9.36458 63.8462 10.4585C65.0652 11.5525 65.75 13.0362 65.75 14.5833V61.25Z" stroke="#1E1E1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <defs>
                  <filter id="filter0_d_1136197_187" x="0" y="0" width="86" height="78" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1136197_187"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1136197_187" result="shape"/>
                  </filter>
                </defs>
              </svg>
            </div>
            <h3>Bookmark Spots</h3>
            <p>Save your favorite locations for quick access when you need them</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;