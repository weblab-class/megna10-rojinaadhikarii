import React, { useState, useEffect, useContext, useMemo } from "react";
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const viewMode = searchParams.get("view") === "map" ? "map" : "list";

  const { userId, setUserId, spots, setSpots } = useContext(UserContext);

  const [tempCoords, setTempCoords] = useState(null);

  // typing effect states
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedSub, setDisplayedSub] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const fullTitle = "enter the flow...";
  const fullSub = "please log in to browse study spots";

  useEffect(() => {
    if (userId === null) {
      setTitleIndex(0);
      setSubIndex(0);
      setDisplayedTitle("");
      setDisplayedSub("");
    }
  }, [userId]);

  const displaySpots = useMemo(() => {
    if (!spots || spots.length === 0) return [];

    const userBookmarks = (userId?.bookmarked_spots || []).map((id) => String(id));

    return spots.map((s) => {
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
  }, [spots, userId]);

  useEffect(() => {
    if (userId === null && titleIndex < fullTitle.length) {
      const timeout = setTimeout(() => {
        setDisplayedTitle((prev) => prev + fullTitle.charAt(titleIndex));
        setTitleIndex(titleIndex + 1);
      }, 70);
      return () => clearTimeout(timeout);
    }
  }, [titleIndex, userId]);

  useEffect(() => {
    if (userId === null && titleIndex === fullTitle.length && subIndex < fullSub.length) {
      const timeout = setTimeout(() => {
        setDisplayedSub((prev) => prev + fullSub.charAt(subIndex));
        setSubIndex(subIndex + 1);
      }, 40);
      return () => clearTimeout(timeout);
    }
  }, [subIndex, titleIndex, userId]);

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round(sum / reviews.length);
  };

  const handleToggleHeart = (spotId) => {
    if (!userId) return alert("please log in to bookmark!");
    post("/api/bookmark", { spotId: spotId }).then(setUserId).catch(console.error);
  };

  const handleDelete = (spotId) => {
    if (window.confirm("are you sure? this will permanently delete it.")) {
      del(`/api/studyspot?spotId=${spotId}`)
        .then(() => {
            setSpots((prev) => prev.filter((s) => s._id !== spotId));
        })
        .catch(() => alert("could not delete spot."));
    }
  };

  const handleStartPicking = () => {
    setTempCoords(null);
    navigate("/discovery?view=map");
  };

  const handleViewMap = () => {
    setTempCoords({ browseOnly: true }); 
    navigate("/discovery?view=map");
  };

  const handleMapClick = (lat, lng) => {
    setTempCoords({ lat, lng });
    setIsAddModalOpen(true);
  };

  const handleAddSpot = (newSpotData) => {
    if (!tempCoords) return alert("error: no location selected.");
    const tempId = Date.now().toString();
    const finalSpotData = {
      ...newSpotData,
      lat: tempCoords.lat,
      lng: tempCoords.lng,
      image: newSpotData.image || "",
    };

    const temporarySpot = { _id: tempId, ...finalSpotData, reviews: [], isLiked: false };
    setSpots([temporarySpot, ...spots]);
    setIsAddModalOpen(false);

    post("/api/studyspot", finalSpotData)
      .then((saved) => {
        setSpots((prev) => prev.map((s) => (s._id === tempId ? { ...saved, isLiked: false } : s)));
        setTempCoords(null);
        navigate("/discovery?view=list");
      }).catch(() => alert("could not save spot."));
  };

  const handleReviewSuccess = (updatedSpot, updatedUser) => {
    setSpots((prev) => prev.map((s) => (s._id === updatedSpot._id ? updatedSpot : s)));
    setUserId(updatedUser);
    setIsReviewModalOpen(false);
  };

  const filteredSpots = (displaySpots || []).filter((spot) => {
    return (
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTags.length === 0 || activeTags.every((t) => spot.tags?.includes(t)))
    );
  });

  if (userId === undefined)
    return (
      <div className="discover-container" style={{ justifyContent: "center", paddingTop: "20vh" }}>
        Loading...
      </div>
    );

  // 👇 FIXED: Removed the duplicated logic and syntax errors here
  if (userId === null) {
    return (
      <div className="discover-container soft-bg discover-login-layout" style={{ alignItems: "center", paddingTop: "22vh", textAlign: "center", position: "relative" }}>
        
        <div className="discover-mascot-container" style={{ marginBottom: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "35px", position: "relative", zIndex: 2 }}>
          <div className="discover-speech-bubble" style={{ background: "white", border: "4px solid #F0EAE3", borderRadius: "30px 30px 30px 10px", padding: "15px 35px", position: "relative", boxShadow: "0 15px 35px rgba(0,0,0,0.03)" }}>
            <h2 style={{ fontFamily: "Abril Fatface", fontSize: "2.8rem", margin: 0, minHeight: "1.2em", color: "#7C6A58", letterSpacing: "-0.5px" }}>
              {displayedTitle}
            </h2>
          </div>
          <div className="discover-mascot-sprite bear-kawaii" style={{ fontSize: "95px", marginTop: "10px" }}>🧸</div>
        </div>

        <p
          style={{
            fontFamily: "Josefin Sans",
            fontSize: "1.2rem",
            marginTop: "10px",
            color: "#888",
            minHeight: "1.5em",
            position: "relative", 
            zIndex: 2 
          }}
        >
          {displayedSub}<span className="cursor">|</span>
        </p>
      </div>
    );
  }

  return (
    <div className="discover-container">
      <div className="discover-content-wrapper">
        <div className="discover-header">
          <h1>discover study spaces</h1>
          <div className="header-buttons">
            {viewMode !== "map" && (
              <>
                <button className="view-map-btn" onClick={handleViewMap}>
                  📍 view map
                </button>
                <button className="add-spot-btn" onClick={handleStartPicking}>
                  + add study spot
                </button>
              </>
            )}
          </div>
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
            {["All", "Food Nearby", "Quiet", "24/7", "Group Study", "WiFi", "Outlets", "Moderate Noise"].map((tag) => (
              <button
                key={tag}
                className={`filter-btn ${activeTags.includes(tag) || (tag === "All" && activeTags.length === 0) ? "active" : ""}`}
                onClick={() => {
                  if (tag === "All") setActiveTags([]);
                  else activeTags.includes(tag) ? setActiveTags(activeTags.filter(t => t !== tag)) : setActiveTags([...activeTags, tag]);
                }}>{tag}</button>
            ))}
          </div>
        </div>

        {viewMode === "map" ? (
          <MapDropdown
            spots={filteredSpots}
            isOpen={viewMode === "map"}
            isPicking={viewMode === "map" && tempCoords === null}
            onLocationSelect={handleMapClick}
          />
        ) : (
          <div className="spots-list">
            {spots === null ? (
                // Skeleton Loading
                [...Array(5)].map((_, i) => (
                  <div key={i} className="spot-card skeleton-card" style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
                    <div className="spot-image skeleton" style={{ width: "300px", height: "180px", flexShrink: 0, borderRadius: "8px" }}></div>
                    <div className="spot-details" style={{ flex: 1, padding: "10px 0" }}>
                      <div className="skeleton" style={{ height: "28px", width: "60%", marginBottom: "15px" }}></div>
                      <div className="skeleton" style={{ height: "16px", width: "40%", marginBottom: "20px" }}></div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "15px" }}></div>
                        <div className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "15px" }}></div>
                        <div className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "15px" }}></div>
                      </div>
                    </div>
                  </div>
                ))
            ) : filteredSpots.length > 0 ? (
                filteredSpots.map((spot) => {
                const avgRating = calculateRating(spot.reviews);
                const canDelete = spot.creator_id === userId._id;
                return (
                    <div key={spot._id} className="spot-card">
                    <div className="spot-image">
                        {spot.image ? <img src={spot.image} alt={spot.name} loading="lazy" /> : <div className="no-image-placeholder"></div>}
                    </div>
                    <div className="spot-details" style={{ position: "relative" }}>
                        <button className="heart-btn" onClick={() => handleToggleHeart(spot._id)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: spot.isLiked ? "red" : "transparent", WebkitTextStroke: "1px red", zIndex: 101 }}>
                        {spot.isLiked ? "❤️" : "♡"}
                        </button>
                        {canDelete && (
                        <button className="delete-spot-btn-discovery" onClick={(e) => { e.stopPropagation(); handleDelete(spot._id); }} style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(255, 255, 255, 0.8)", borderRadius: "50%", border: "1px solid #000", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>🗑️</button>
                        )}
                        <h3>{spot.name}</h3>

                        <div className="stars" style={{ color: "#ffb800" }}>
                          {"★".repeat(avgRating)}{"☆".repeat(5 - avgRating)}
                          <span className="review-count" style={{ color: "#888", fontSize: "0.85rem" }}> ({spot.reviews?.length || 0})</span>
                        </div>

                        {spot.location && (
                          <div style={{ fontSize: "14px", color: "#666", margin: "4px 0", fontStyle: "italic", fontFamily: '"Josefin Sans", sans-serif' }}>
                            📍 {spot.location}
                          </div>
                        )}

                        <div className="spot-tags">{spot.tags?.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>
                        <div className="spot-actions" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                        <button className="review-btn" onClick={() => { setActiveSpot(spot); setIsReviewModalOpen(true); }}>🗨️ Review</button>
                        <button className="review-btn" onClick={() => { setActiveSpot(spot); setIsSeeAllOpen(true); }}>See All ({spot.reviews?.length || 0})</button>
                        </div>
                    </div>
                    </div>
                );
                })
            ) : (
                <p style={{textAlign:"center", color:"#888", marginTop: "50px"}}>No spots found.</p>
            )}
          </div>
        )}
      </div>

      <AddSpotModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddSpot} />
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} spotName={activeSpot?.name} spotId={activeSpot?._id} onReviewSuccess={handleReviewSuccess} />
      <SeeAllReviewsModal isOpen={isSeeAllOpen} onClose={() => setIsSeeAllOpen(false)} spot={activeSpot} />
    </div>
  );
};

export default DiscoverFeed;