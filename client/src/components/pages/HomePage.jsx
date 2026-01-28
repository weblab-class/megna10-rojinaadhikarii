import "../../utilities.css";
import "./HomePage.css";
import { useNavigate, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

const HomePage = () => {
  const navigate = useNavigate();

  const fullTitle = "less searching, more ";
  const fullSub = "discover the perfect study spot for your focus and flow";
  const fullFeatures = "features";

  const words = ["studying", "learning", "locking in", "doing", "winning"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedWord, setDisplayedWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordCharIndex, setWordCharIndex] = useState(0);

  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedSub, setDisplayedSub] = useState("");
  const [displayedFeatures, setDisplayedFeatures] = useState("");

  const [titleIndex, setTitleIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [featuresIndex, setFeaturesIndex] = useState(0);

  const [titleComplete, setTitleComplete] = useState(false);

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

  // initial title typing (prefix only)
  useEffect(() => {
    if (titleIndex < fullTitle.length) {
      const timeout = setTimeout(() => {
        setDisplayedTitle((prev) => prev + fullTitle.charAt(titleIndex));
        setTitleIndex(titleIndex + 1);
      }, 70);
      return () => clearTimeout(timeout);
    } else if (!titleComplete) {
      setTitleComplete(true);
    }
  }, [titleIndex, titleComplete]);

  //Word rotation effect (starts after title prefix is complete)
  useEffect(() => {
    if (!titleComplete) return;

    const currentWord = words[currentWordIndex];

    if (!isDeleting && wordCharIndex < currentWord.length) {
      const timeout = setTimeout(() => {
        setDisplayedWord((prev) => prev + currentWord.charAt(wordCharIndex));
        setWordCharIndex(wordCharIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && wordCharIndex === currentWord.length) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1000); // Pause before deleting
      return () => clearTimeout(timeout);
    } else if (isDeleting && wordCharIndex > 0) {
      const timeout = setTimeout(() => {
        setDisplayedWord((prev) => prev.slice(0, -1));
        setWordCharIndex(wordCharIndex - 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else if (isDeleting && wordCharIndex === 0) {
      setIsDeleting(false);
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }
  }, [titleComplete, wordCharIndex, isDeleting, currentWordIndex]);

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
        setDisplayedFeatures(fullFeatures.slice(0, featuresIndex + 1));
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
              {/* This part rotates */}
              <span className="rotating-word">{displayedWord}</span>
              {/* Cursor logic: stays at title until done, then moves to word */}
              {!titleComplete ? (
                <span className="cursor">|</span>
              ) : (
                <span className="cursor">|</span>
              )}
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
            <p>
              browse curated study spaces tailored to your preferences and location, and read
              reviews from fellow students to see what works best
            </p>
          </Link>

          <Link to="/profile" className="feature-card">
            <h3>bookmark spots</h3>
            <p>save your favorite locations for quick access when you need a productive session</p>
          </Link>
          <Link to="/studycorner" className="feature-card">
            <h3>study corner</h3>
            <p>
              stay focused with a built-in Pomodoro timer, to-do list, ambient music, and a daily
              goal tracker
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
