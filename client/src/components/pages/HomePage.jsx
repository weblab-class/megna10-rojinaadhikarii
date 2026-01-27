import "../../utilities.css";
import "./HomePage.css";
import { useNavigate, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

const HomePage = () => {
  const navigate = useNavigate();

  const fullTitle = "less searching, more studying";
  const fullSub = "discover the perfect study spot for your focus and flow";
  const fullFeatures = "features";

  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedSub, setDisplayedSub] = useState("");
  const [displayedFeatures, setDisplayedFeatures] = useState("");

  const [titleIndex, setTitleIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [featuresIndex, setFeaturesIndex] = useState(0);

  useEffect(() => {
    const reveal = () => {
      const reveals = document.querySelectorAll(".reveal");
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 150) {
          reveals[i].classList.add("active");
        }
      }
    };
    window.addEventListener("scroll", reveal);
    reveal(); 
    return () => window.removeEventListener("scroll", reveal);
  }, []);

  useEffect(() => {
    if (titleIndex < fullTitle.length) {
      const timeout = setTimeout(() => {
        setDisplayedTitle((prev) => prev + fullTitle.charAt(titleIndex));
        setTitleIndex(titleIndex + 1);
      }, 70);
      return () => clearTimeout(timeout);
    }
  }, [titleIndex]);

  useEffect(() => {
    if (subIndex < fullSub.length) {
      const timeout = setTimeout(() => {
        setDisplayedSub((prev) => prev + fullSub.charAt(subIndex));
        setSubIndex(subIndex + 1);
      }, 40); 
      return () => clearTimeout(timeout);
    }
  }, [subIndex]);

  useEffect(() => {
    if (featuresIndex < fullFeatures.length) {
      const timeout = setTimeout(() => {
        setDisplayedFeatures((prev) => prev + fullFeatures.charAt(featuresIndex));
        setFeaturesIndex(featuresIndex + 1);
      }, 70);
      return () => clearTimeout(timeout);
    }
  }, [featuresIndex]);

  const handleEnterFlow = () => {
    navigate("/discovery");
  };

  return (
    <div className="home-page">
      <section className="slogan">
        <div className="slogan-content">
          <div className="title-container">
            <h1 style={{ minHeight: "1.2em" }}>
              {displayedTitle}
              {titleIndex < fullTitle.length && <span className="cursor">|</span>}
            </h1>
          </div>
          <p style={{ minHeight: "1.5em" }}>
            {displayedSub}
            {subIndex < fullSub.length && <span className="cursor">|</span>}
          </p>
          <button className="cta-button" onClick={handleEnterFlow}>
            enter the flow
          </button>
        </div>
      </section>

      <section className="features reveal">
        <h2 className="features-title" style={{ minHeight: "1.2em" }}>
          {displayedFeatures}
          {featuresIndex < fullFeatures.length && <span className="cursor">|</span>}
        </h2>
        <div className="feature-cards">
          <Link to="/discovery" className="feature-card">
            <h3>discovery feed</h3>
            <p>browse curated study spaces tailored to your preferences and location</p>
          </Link>
          <div className="feature-card">
            <h3>review & rank</h3>
            <p>read reviews and ratings from fellow students about each study spot</p>
          </div>
          <Link to="/profile" className="feature-card">
            <h3>bookmark spots</h3>
            <p>save your favorite locations for quick access when you need them</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;