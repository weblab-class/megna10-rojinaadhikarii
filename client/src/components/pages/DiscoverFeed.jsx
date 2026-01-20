import React, { useState } from "react";
import "../../utilities.css";
import "./DiscoverFeed.css";
import AddSpotModal from "../modules/AddSpotModal";
import ReviewModal from "../modules/ReviewModal"; 

const DiscoverFeed = () => {
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);
  
  const [spots, setSpots] = useState([
    {
      id: "1",
      name: "Stratton Student Center",
      description: "Casual atmosphere perfect for group work and collaboration",
      tags: ["WiFi", "Group Study", "Food Nearby", "Outlets"],
      rating: 4,
      image: "/stud.jpg" 
    },
    {
      id: "2",
      name: "Hayden Library",
      description: "Spacious study area with individual desks and great natural lighting",
      tags: ["WiFi", "Quiet", "Study Rooms", "Outlets", "Food Nearby"],
      rating: 4,
      image: "/hayden.jpg"
    }
  ]);


  const handleAddSpot = (newSpotData) => {
    const newEntry = {
      id: Date.now().toString(),
      name: newSpotData.name,
      description: newSpotData.description,
      tags: newSpotData.tags.length > 0 ? newSpotData.tags : ["WiFi"],
      rating: 0,
      image: "/stud.jpg" 
    };
    setSpots([newEntry, ...spots]);
  };

  const handleOpenReview = (spot) => {
    setActiveSpot(spot);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = (reviewData) => {
    console.log(`Review for ${activeSpot.name}:`, reviewData);
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
            <input type="text" placeholder="Search" className="search-bar" />
          </div>
          <div className="filter-tags">
            {["All", "Near Me", "Quiet", "24/7", "Group Study", "WiFi", "Outlets"].map(tag => (
              <button key={tag} className="filter-btn">{tag}</button>
            ))}
          </div>
        </div>

        <div className="spots-list">
          {spots.map(spot => (
            <div key={spot.id} className="spot-card">
              <div className="spot-image">
                <img src={spot.image} alt={spot.name} />
              </div>
              
              <div className="spot-details">
                <div className="spot-header-row">
                  <h3>{spot.name}</h3>
                  <span className="heart-icon">♡</span> 
                </div>

                <p className="spot-desc">{spot.description}</p>
                
                <div className="stars">
                  {"★".repeat(spot.rating || 0)}{"☆".repeat(5 - (spot.rating || 0))}
                </div>

                <div className="spot-tags">
                  {spot.tags.map(tag => (
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

      <AddSpotModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddSpot}
      />

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        spotName={activeSpot?.name}
      />
    </div>
  );
};

export default DiscoverFeed;