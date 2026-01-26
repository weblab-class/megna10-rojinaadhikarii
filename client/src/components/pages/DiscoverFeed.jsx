import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import "../../utilities.css";
import "./DiscoverFeed.css";
import AddSpotModal from "../modules/AddSpotModal";
import ReviewModal from "../modules/ReviewModal";
import SeeAllReviewsModal from "../modules/SeeAllReviewsModal";
import MapDropdown from "../modules/MapDropdown"; 
import { get, post, del } from "../../utilities";
import { UserContext } from "../App";

const DiscoverFeed = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate
  const searchParams = new URLSearchParams(location.search);
  const viewMode = searchParams.get("view") === "map" ? "map" : "list";

  const { userId, setUserId } = useContext(UserContext);
  const [spots, setSpots] = useState([]);
  const [tempCoords, setTempCoords] = useState(null);

  useEffect(() => {
    get("/api/studyspot").then((dbSpots) => {
      if (Array.isArray(dbSpots)) {
        const userBookmarks = (userId?.bookmarked_spots || []).map((id) => String(id));
        
        const formattedDb = dbSpots.map((s) => {
          let lat = s.lat;
          let lng = s.lng;

          if (s.name === "Hayden Library") { lat = 42.3592; lng = -71.0884; }
          else if (s.name === "Stratton Student Center") { lat = 42.3591; lng = -71.0948; }
          else if (s.name === "Barker Library") { lat = 42.3595; lng = -71.0919; }

          return {
            ...s,
            lat: lat,
            lng: lng,
            isLiked: userBookmarks.includes(String(s._id)),
          };
        });
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

  // UPDATED: Automatically switches to map view and enables picking
  const handleStartPicking = () => {
    setTempCoords(null);
    // Automatically switch to map view
    navigate("/discovery?view=map");
    alert("Map mode enabled! Click exactly where you want to add your study spot.");
  };

  const handleMapClick = (lat, lng) => {
    setTempCoords({ lat, lng });
    setIsAddModalOpen(true);
  };

  const handleAddSpot = (newSpotData) => {
    if (!tempCoords) {
      return alert("Error: No location selected. Please click the map first.");
    }

    const tempId = Date.now().toString();
    const finalSpotData = {
      ...newSpotData,
      lat: tempCoords.lat,
      lng: tempCoords.lng,
      image: newSpotData.image || "" 
    };

    const temporarySpot = { _id: tempId, ...finalSpotData, reviews: [], isLiked: false };
    setSpots([temporarySpot, ...spots]);
    setIsAddModalOpen(false);

    post("/api/studyspot", finalSpotData)
      .then((saved) => {
        setSpots((prev) => prev.map((s) => (s._id === tempId ? { ...saved, isLiked: false } : s)));
        setTempCoords(null); 
        // Automatically switch back to list view to see the new card
        navigate("/discovery?view=list");
      })
      .catch(() => alert("Could not save spot."));
  };

  const handleReviewSuccess = (updatedSpot, updatedUser) => {
    setSpots(prev => prev.map(s => s._id === updatedSpot._id ? updatedSpot : s));
    setUserId(updatedUser); 
    setIsReviewModalOpen(false);
  };

  const filteredSpots = (spots || []).filter((spot) => {
    return (
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTags.length === 0 || activeTags.every((t) => spot.tags?.includes(t)))
    );
  });

  if (userId === undefined) return <div className="discover-container" style={{ justifyContent: "center", paddingTop: "20vh" }}>Loading...</div>;

  if (userId === null) {
    return (
      <div className="discover-container" style={{ alignItems: "center", paddingTop: "15vh", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Abril Fatface", fontSize: "2rem", margin: 0 }}>Enter the flow</h2>
        <p style={{ fontFamily: "Josefin Sans", fontSize: "1.2rem", marginTop: "15px", color: "#555" }}>Please log in to browse study spots.</p>
      </div>
    );
  }

  return (
    <div className="discover-container">
      <div className="discover-content-wrapper">
        <div className="discover-header">
          <h1>Discover Study Spaces</h1>
          <button className="add-spot-btn" onClick={handleStartPicking}>+ Add Study Spot</button>
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
          <MapDropdown 
            spots={filteredSpots} 
            isOpen={true} 
            isPicking={true} 
            tempCoords={tempCoords}
            onLocationSelect={handleMapClick} 
          />
        ) : (
          <div className="spots-list">
            {filteredSpots.map((spot) => {
              const avgRating = calculateRating(spot.reviews);
              const canDelete = spot.creator_id === userId._id;

              return (
                <div key={spot._id} className="spot-card">
                  <div className="spot-image">
                    {spot.image ? (
                      <img src={spot.image} alt={spot.name} />
                    ) : (
                      <div className="no-image-placeholder">
                        <span></span>
                      </div>
                    )}
                  </div>
                  
                  <div className="spot-details" style={{ position: "relative" }}>
                    <button onClick={() => handleToggleHeart(spot._id)} style={{ position: "absolute", top: "0px", right: "0px", background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: spot.isLiked ? "red" : "transparent", WebkitTextStroke: "1px red", zIndex: 101 }}>
                      {spot.isLiked ? "❤️" : "♡"}
                    </button>
                    
                    {canDelete && (
                      <button
                        className="delete-spot-btn-discovery"
                        onClick={(e) => { e.stopPropagation(); handleDelete(spot._id); }}
                        style={{
                          position: "absolute", bottom: "5px", right: "5px",
                          background: "rgba(255, 255, 255, 0.8)", borderRadius: "50%",
                          border: "1px solid #ccc", width: "30px", height: "30px",
                          cursor: "pointer", display: "flex", alignItems: "center",
                          justifyContent: "center", zIndex: 100
                        }}
                      >
                        🗑️
                      </button>
                    )}

                    <h3>{spot.name}</h3>
                    <div className="stars">{"★".repeat(avgRating)}{"☆".repeat(5 - avgRating)} <span style={{fontSize:"0.8rem", color:"#888"}}>({spot.reviews?.length || 0})</span></div>
                    <div className="spot-tags">{spot.tags?.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>
                    <div className="spot-actions" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                      <button className="review-btn" onClick={() => { setActiveSpot(spot); setIsReviewModalOpen(true); }}>🗨️ Write a Review</button>
                      <button className="review-btn" onClick={() => { setActiveSpot(spot); setIsSeeAllOpen(true); }}>See All ({spot.reviews?.length || 0})</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddSpotModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddSpot} />
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        spotName={activeSpot?.name} 
        spotId={activeSpot?._id} 
        onReviewSuccess={handleReviewSuccess} 
      />
      <SeeAllReviewsModal isOpen={isSeeAllOpen} onClose={() => setIsSeeAllOpen(false)} spot={activeSpot} />
    </div>
  );
};

export default DiscoverFeed;