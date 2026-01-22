import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./DiscoverFeed.css";
import AddSpotModal from "../modules/AddSpotModal";
import ReviewModal from "../modules/ReviewModal"; 
import SeeAllReviewsModal from "../modules/SeeAllReviewsModal"; 
import { get, post } from "../../utilities";

const DiscoverFeed = (props) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [activeTags, setActiveTags] = useState([]); 

  // Initial default spots with empty reviews
const defaultSpots = [
  { 
    _id: "default1", 
    name: "Stratton Student Center", 
    image: "/stud.jpg",
    // description: "Casual atmosphere perfect for group work and collaboration", 
    tags: ["WiFi", "Group Study", "Food Nearby", "Outlets"], 
    reviews: [], 
    isLiked: false 
  },
  { 
    _id: "default2", 
    name: "Hayden Library", 
    image: "/hayden.jpg", 
    // description: "Spacious study area with individual desks and great natural lighting", 
    tags: ["WiFi", "Quiet", "Study Rooms", "Outlets", "Food Nearby"], 
    reviews: [], 
    isLiked: false 
  }
];

  const [spots, setSpots] = useState(defaultSpots);

  useEffect(() => {
    get("/api/studyspots").then((dbSpots) => {
      if (Array.isArray(dbSpots)) {
        const filteredDb = dbSpots.filter(s => s.name !== "Stratton Student Center" && s.name !== "Hayden Library");
        const formattedDb = filteredDb.map(s => ({ ...s, isLiked: false }));
        setSpots([...defaultSpots, ...formattedDb]);
      }
    });
  }, []);

  // Helper function calculates average rating from reviews
  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round(sum / reviews.length);
  };

  const handleToggleHeart = (spotId) => {
    setSpots(spots.map(spot => spot._id === spotId ? { ...spot, isLiked: !spot.isLiked } : spot));
  };

  const handleDelete = (spotId) => {
    if (spotId.startsWith("default")) return alert("Cannot delete default spots!");
    if (window.confirm("Are you sure? This will permanently delete it from the database.")) {
      fetch(`http://localhost:3000/api/studyspot?spotId=${spotId}`, { method: "DELETE" })
        .then((res) => {
          if (res.ok) setSpots(spots.filter((s) => s._id !== spotId));
        });
    }
  };

  const handleAddSpot = (newSpotData) => {
    const tempId = Date.now().toString();
    const temporarySpot = { _id: tempId, ...newSpotData, image: "/stud.jpg", reviews: [], isLiked: false };
    setSpots([temporarySpot, ...spots]);
    setIsAddModalOpen(false);
    post("/api/studyspot", newSpotData).then((saved) => {
      setSpots((prev) => prev.map((s) => (s._id === tempId ? { ...saved, isLiked: false } : s)));
    });
  };

  const filteredSpots = (spots || []).filter((spot) => {
    return spot.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
           (activeTags.length === 0 || activeTags.every(t => spot.tags?.includes(t)));
  });

  return (
    <div className="discover-container">
      <div className="discover-content-wrapper">
        <div className="discover-header">
          <h1>Discover Study Spaces</h1>
          <button className="add-spot-btn" onClick={() => setIsAddModalOpen(true)}>+ Add Study Spot</button>
        </div>

        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search" className="search-bar" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-tags">
            {["All", "Near Me", "Quiet", "24/7", "Group Study", "WiFi", "Outlets"].map(tag => (
              <button key={tag} className={`filter-btn ${activeTags.includes(tag) || (tag === "All" && activeTags.length === 0) ? "active" : ""}`} onClick={() => setActiveTags(tag === "All" ? [] : [tag])}>{tag}</button>
            ))}
          </div>
        </div>

        <div className="spots-list">
          {filteredSpots.map((spot) => {
            const avgRating = calculateRating(spot.reviews);
            return (
              <div key={spot._id} className="spot-card">
                <div className="spot-image"><img src={spot.image || "/stud.jpg"} alt={spot.name} /></div>
                
                <div className="spot-details" style={{ position: "relative" }}>
                  <button 
                    onClick={() => handleToggleHeart(spot._id)}
                    style={{ position: "absolute", top: "0px", right: "0px", background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: spot.isLiked ? "red" : "transparent", WebkitTextStroke: "1px red" }}
                  >
                    {spot.isLiked ? "❤️" : "♡"}
                  </button>

                  {!spot._id.startsWith("default") && (
                    <button 
                      onClick={() => handleDelete(spot._id)} 
                      style={{ position: "absolute", bottom: "0px", right: "0px", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", opacity: 0.5 }}
                    >🗑️</button>
                  )}

                  <h3>{spot.name}</h3>
                  {/* <p className="spot-desc">{spot.description}</p> */}
                  
                  {/* Dynamic Stars based on average rating */}
                  <div className="stars">
                    {"★".repeat(avgRating)}
                    {"☆".repeat(5 - avgRating)}
                    <span style={{ fontSize: "0.8rem", color: "#888", marginLeft: "5px" }}>
                      ({spot.reviews?.length || 0})
                    </span>
                  </div>

                  {/* Tags below Stars as requested */}
                  <div className="spot-tags" style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
                    {spot.tags && spot.tags.map((t, i) => (<span key={i} className="tag">{t}</span>))}
                  </div>

                  <div className="spot-actions" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button className="review-btn" onClick={() => { setActiveSpot(spot); setIsReviewModalOpen(true); }}>
                      🗨️ {spot.reviews?.length || 0} Write Review
                    </button>
                    <button className="review-btn" onClick={() => { setActiveSpot(spot); setIsSeeAllOpen(true); }}>
                      See All
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddSpotModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddSpot} />
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} spotName={activeSpot?.name} spotId={activeSpot?._id} />
      <SeeAllReviewsModal isOpen={isSeeAllOpen} onClose={() => setIsSeeAllOpen(false)} spot={activeSpot} />
    </div>
  );
};

export default DiscoverFeed;