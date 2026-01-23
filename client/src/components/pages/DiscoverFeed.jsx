import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import "../../utilities.css";
import "./DiscoverFeed.css";
import AddSpotModal from "../modules/AddSpotModal";
import ReviewModal from "../modules/ReviewModal";
import SeeAllReviewsModal from "../modules/SeeAllReviewsModal";
import MapDropdown from "../modules/MapDropdown"; 
import { get, post, del } from "../../utilities";
import { UserContext } from "../App";

const DiscoverFeed = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  
  // LOGIC FOR MANDATORY MAP CLICKS
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [tempCoords, setTempCoords] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const viewMode = searchParams.get("view") === "map" ? "map" : "list";

  const { userId, setUserId } = useContext(UserContext);
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    get("/api/studyspot").then((dbSpots) => {
      if (Array.isArray(dbSpots)) {
        const userBookmarks = (userId?.bookmarked_spots || []).map((id) => String(id));
        const formattedDb = dbSpots.map((s) => ({
          ...s,
          isLiked: userBookmarks.includes(String(s._id)),
        }));
        setSpots(formattedDb); 
      }
    });
  }, [userId]);

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round(sum / reviews.length);
  };

  const handleToggleHeart = (spotId) => {
    if (!userId) return alert("Please log in to bookmark!");
    setSpots((prev) => prev.map(spot => 
      spot._id === spotId ? { ...spot, isLiked: !spot.isLiked } : spot
    ));
    post("/api/bookmark", { spotId: spotId }).then(setUserId).catch(console.error);
  };

  const handleDelete = (spotId) => {
    if (window.confirm("Are you sure? This will permanently delete it.")) {
      del(`/api/studyspot?spotId=${spotId}`)
        .then(() => setSpots((prev) => prev.filter((s) => s._id !== spotId)))
        .catch(() => alert("Could not delete spot."));
    }
  };

  const handleAddSpot = (newSpotData) => {
    const tempId = Date.now().toString();
    
    // tempCoords is guaranteed because picking is now mandatory
    const finalSpotData = {
      ...newSpotData,
      lat: tempCoords.lat,
      lng: tempCoords.lng,
    };

    const temporarySpot = { _id: tempId, ...finalSpotData, reviews: [], isLiked: false };
    setSpots([temporarySpot, ...spots]);
    setIsAddModalOpen(false);

    post("/api/studyspot", finalSpotData)
      .then((saved) => {
        setSpots((prev) => prev.map((s) => (s._id === tempId ? { ...saved, isLiked: false } : s)));
        setTempCoords(null); 
      })
      .catch(() => alert("Could not save spot."));
  };

  const filteredSpots = (spots || []).filter((spot) => {
    return (
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTags.length === 0 || activeTags.every((t) => spot.tags?.includes(t)))
    );
  });

  if (userId === undefined) {
    return (
      <div className="discover-container" style={{ justifyContent: "center", paddingTop: "20vh" }}>
        Loading...
      </div>
    );
  }

  if (userId === null) {
    return (
      <div className="discover-container" style={{ alignItems: "center", paddingTop: "15vh", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Abril Fatface", fontSize: "2rem", margin: 0 }}>Enter the flow</h2>
        <p style={{ fontFamily: "Josefin Sans", fontSize: "1.2rem", marginTop: "15px", color: "#555" }}>
          Please log in to browse, review, and bookmark study spots.
        </p>
      </div>
    );
  }

  return (
    <div className="discover-container">
      <div className="discover-content-wrapper">
        <div className="discover-header">
          <h1>Discover Study Spaces</h1>
          <button 
            className="add-spot-btn" 
            onClick={() => {
              // FORCE MAP VIEW FOR PIN DROPPING
              if (viewMode !== "map") {
                navigate("/discovery?view=map");
              }
              setIsPickingMode(true);
            }}
          >
            + Add Study Spot
          </button>
        </div>

        {/* SEARCH & FILTER */}
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
            {["All", "Near Me", "Quiet", "24/7", "Group Study", "WiFi", "Outlets"].map((tag) => (
              <button
                key={tag}
                className={`filter-btn ${activeTags.includes(tag) || (tag === "All" && activeTags.length === 0) ? "active" : ""}`}
                onClick={() => {
                  if (tag === "All") setActiveTags([]);
                  else activeTags.includes(tag) ? setActiveTags(activeTags.filter(t => t !== tag)) : setActiveTags([...activeTags, tag]);
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "map" ? (
          <div style={{ position: "relative" }}>
            {/* MANDATORY INSTRUCTION OVERLAY */}
            {isPickingMode && (
                <div style={{ 
                    position: "absolute", top: "15px", left: "50%", transform: "translateX(-50%)", 
                    zIndex: 1000, background: "#ff4d4d", color: "white", padding: "10px 20px", 
                    borderRadius: "30px", fontWeight: "bold", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" 
                }}>
                   📍 Click on the map to set the location!
                </div>
            )}
            <MapDropdown 
                spots={filteredSpots} 
                isOpen={true} 
                isPicking={isPickingMode} 
                onLocationSelect={(lat, lng) => {
                    setTempCoords({ lat, lng });
                    setIsPickingMode(false); // End picking mode
                    setIsAddModalOpen(true); // Now show the popup form
                }}
            />
          </div>
        ) : (
          <div className="spots-list">
            {filteredSpots.map((spot) => {
              const avgRating = calculateRating(spot.reviews);
              const canDelete = spot.name !== "Stratton Student Center" && spot.name !== "Hayden Library" && spot.creator_id === userId._id;
              return (
                <div key={spot._id} className="spot-card">
                  <div className="spot-image"><img src={spot.image || "/stud.jpg"} alt={spot.name} /></div>
                  <div className="spot-details" style={{ position: "relative" }}>
                    <button onClick={() => handleToggleHeart(spot._id)} style={{ position: "absolute", top: "0px", right: "0px", background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: spot.isLiked ? "red" : "transparent", WebkitTextStroke: "1px red", zIndex: 101 }}>{spot.isLiked ? "❤️" : "♡"}</button>
                    {canDelete && (
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(spot._id); }} style={{ position: "absolute", bottom: "5px", right: "5px", background: "rgba(255, 255, 255, 0.8)", borderRadius: "50%", border: "1px solid #ccc", width: "30px", height: "30px", cursor: "pointer", zIndex: 100 }}>🗑️</button>
                    )}
                    <h3>{spot.name}</h3>
                    <div className="stars">{"★".repeat(avgRating)}{"☆".repeat(5 - avgRating)} <span style={{fontSize:"0.8rem", color:"#888"}}>({spot.reviews?.length || 0})</span></div>
                    <div className="spot-tags">{spot.tags && spot.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>
                    <div className="spot-actions" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                      <button className="review-btn" onClick={() => { setActiveSpot(spot); setIsReviewModalOpen(true); }}>🗨️ Write Review</button>
                      <button className="review-btn" onClick={() => { setActiveSpot(spot); setIsSeeAllOpen(true); }}>See All</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddSpotModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setTempCoords(null); }} onAdd={handleAddSpot} />
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} spotName={activeSpot?.name} spotId={activeSpot?._id} />
      <SeeAllReviewsModal isOpen={isSeeAllOpen} onClose={() => setIsSeeAllOpen(false)} spot={activeSpot} />
    </div>
  );
};

export default DiscoverFeed;