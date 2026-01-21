import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./DiscoverFeed.css";
import AddSpotModal from "../modules/AddSpotModal";
import ReviewModal from "../modules/ReviewModal"; 
import { get, post } from "../../utilities";

const DiscoverFeed = (props) => { // Added props to access user
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [activeTags, setActiveTags] = useState([]); 

  const defaultSpots = [
    {
      _id: "default1",
      name: "Stratton Student Center",
      description: "Casual atmosphere perfect for group work and collaboration",
      tags: ["WiFi", "Group Study", "Food Nearby", "Outlets"],
      rating: 4,
      image: "/stud.jpg",
    },
    {
      _id: "default2",
      name: "Hayden Library",
      description: "Spacious study area with individual desks and great natural lighting",
      tags: ["WiFi", "Quiet", "Study Rooms", "Outlets", "Food Nearby"],
      rating: 4,
      image: "/hayden.jpg",
    }
  ];

  const [spots, setSpots] = useState(defaultSpots);


useEffect(() => {
  get("http://localhost:3000/api/studyspots").then((spotsFromServer) => {
    if (Array.isArray(spotsFromServer)) {
      const dbSpots = spotsFromServer.filter(
        (s) => s.name !== "Stratton Student Center" && s.name !== "Hayden Library"
      );
      setSpots([...defaultSpots, ...dbSpots]);
    } 
  });
}, []);

  const filteredSpots = (spots || []).filter((spot) => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = activeTags.length === 0 || 
      activeTags.every(tag => spot.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag) => {
    if (tag === "All") return setActiveTags([]);
    setActiveTags((prev) => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Logic to check if a specific spot is in the user's personal favorites
  const isHearted = (spotId) => {
    return props.user && props.user.favorited_spots?.includes(spotId);
  };

const handleToggleHeart = (spotId) => {
    if (!props.userId) return alert("Please log in to favorite spots!");
    
    post("http://localhost:3000/api/studyspot/toggle-heart", { id: spotId }).then(() => { 
      // This triggers a refresh so the hearts stay permanent on the screen
      window.location.reload(); 
    });
  };

const handleAddSpot = (newSpotData) => {
    const tempId = Date.now().toString();
    const temporarySpot = {
      _id: tempId,
      name: newSpotData.name || "New Spot",
      description: newSpotData.description || "",
      tags: newSpotData.tags || ["WiFi"],
      image: "/stud.jpg",
      rating: 4
    };

    setSpots([temporarySpot, ...spots]);
    setIsAddModalOpen(false);

    post("http://localhost:3000/api/studyspot", newSpotData).then((savedSpot) => {
      console.log("Spot saved successfully!");
      setSpots((prev) => prev.map((s) => (s._id === tempId ? savedSpot : s)));
    });
  };

  const handleOpenReview = (spot) => {
    setActiveSpot(spot);
    setIsReviewModalOpen(true);
  };

  return (
    <div className="discover-container">
      <div className="discover-content-wrapper">
        <div className="discover-header">
          <h1>Discover Study Spaces</h1>
          <button className="add-spot-btn" onClick={() => setIsAddModalOpen(true)}>
            + Add Study Spot
          </button>
        </div>

        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search" 
              className="search-bar" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <div className="filter-tags">
            <button 
              className={`filter-btn ${activeTags.length === 0 ? "active" : ""}`}
              onClick={() => toggleTag("All")}
            >
              All
            </button>
            {["Near Me", "Quiet", "24/7", "Group Study", "WiFi", "Outlets"].map(tag => (
              <button 
                key={tag} 
                className={`filter-btn ${activeTags.includes(tag) ? "active" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="spots-list">
          {filteredSpots.map((spot) => (
            <div key={spot._id} className="spot-card">
              <div className="spot-image">
                <img src={spot.image || "/stud.jpg"} alt={spot.name} />
              </div>
              <div className="spot-details">
                <div className="spot-header-row">
                  <h3>{spot.name}</h3>
                  <span 
                    className={`heart-icon ${isHearted(spot._id) ? "active" : ""}`} 
                    onClick={() => handleToggleHeart(spot._id)}
                  >
                    {isHearted(spot._id) ? "❤️" : "♡"}
                  </span> 
                </div>
                <p className="spot-desc">{spot.description}</p>
                <div className="stars">{"★".repeat(4)}☆</div>
                <div className="spot-tags">
                  {spot.tags && spot.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <button className="review-btn" onClick={() => handleOpenReview(spot)}>
                  <span className="msg-icon">🗨️</span> Write a review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddSpotModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddSpot} />
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} spotName={activeSpot?.name} />
    </div>
  );
};

export default DiscoverFeed;