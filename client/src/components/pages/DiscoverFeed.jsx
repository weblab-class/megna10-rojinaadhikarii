import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../utilities.css";
import "./DiscoverFeed.css";
import AddSpotModal from "../modules/AddSpotModal";
import ReviewModal from "../modules/ReviewModal";
import SeeAllReviewsModal from "../modules/SeeAllReviewsModal";
// import MapDropdown from "../modules/MapDropdown";
import { get, post, del } from "../../utilities";
import { UserContext } from "../App";

const DiscoverFeed = () => {
  // ===========================states=====================================
  // ui state
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);

  // filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);

  // LOGIC FOR MANDATORY MAP CLICKS
  // const [isPickingMode, setIsPickingMode] = useState(false);
  // const [tempCoords, setTempCoords] = useState(null);

  // const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  // const viewMode = searchParams.get("view") === "map" ? "map" : "list";

  //GLOBAL USER STATE REALLY IMPORTANTTTT
  const { userId, setUserId } = useContext(UserContext);
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    get("/api/studyspot").then((dbSpots) => {
      if (Array.isArray(dbSpots)) {
        // get local isliked state with users saved bookmarks from databade
        const userBookmarks = (userId?.bookmarked_spots || []).map((id) => String(id));
        const formattedDb = dbSpots.map((s) => ({
          ...s,
          isLiked: userBookmarks.includes(String(s._id)),
        }));
        setSpots(formattedDb);
      }
    });
  }, [userId]);

  //average star rating logic
  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round(sum / reviews.length);
  };

  // bookmarking and unbookmarking states
  const handleToggleHeart = (spotId) => {
    if (!userId) return alert("Please log in to bookmark!");

    setSpots((prev) =>
      prev.map((spot) => (spot._id === spotId ? { ...spot, isLiked: !spot.isLiked } : spot))
    );

    //sends toggle change to database
    post("/api/bookmark", { spotId: spotId })
      .then((updatedUser) => {
        setUserId(updatedUser);
      })
      .catch((err) => {
        console.error("Bookmark failed", err);
      });
  };

  // deletes a spot only if user is the creator
  const handleDelete = (spotId) => {
    if (window.confirm("Are you sure? This will permanently delete it.")) {
      del(`/api/studyspot?spotId=${spotId}`)
        .then(() => setSpots((prev) => prev.filter((s) => s._id !== spotId)))
        .catch(() => alert("Could not delete spot."));
    }
  };

  // add a new spot
  const handleAddSpot = (newSpotData) => {
    const tempId = Date.now().toString();
    const temporarySpot = { _id: tempId, ...newSpotData, reviews: [], isLiked: false };
    // // tempCoords is guaranteed because picking is now mandatory
    // const finalSpotData = {
    //   ...newSpotData,
    //   lat: tempCoords.lat,
    //   lng: tempCoords.lng,
    // };

    setSpots([temporarySpot, ...spots]);
    setIsAddModalOpen(false);

    post("/api/studyspot", newSpotData)
      .then((saved) => {
        setSpots((prev) => prev.map((s) => (s._id === tempId ? { ...saved, isLiked: false } : s)));
      })
      .catch(() => {
        alert("The spot was added to the screen, but could not be saved to the database.");
      });
    // post("/api/studyspot", finalSpotData)
    //   .then((saved) => {
    //     setSpots((prev) => prev.map((s) => (s._id === tempId ? { ...saved, isLiked: false } : s)));
    //     setTempCoords(null);
    //   })
    //   .catch(() => alert("Could not save spot."));
  };

  // filters spots based on tags
  const filteredSpots = (spots || []).filter((spot) => {
    return (
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTags.length === 0 || activeTags.every((t) => spot.tags?.includes(t)))
    );
  });

  // 1. Loading State
  if (userId === undefined) {
    return (
      <div className="discover-container" style={{ justifyContent: "center", paddingTop: "20vh" }}>
        Loading...
      </div>
    );
  }

  // 2. Logged Out State
  if (userId === null) {
    return (
      <div className="discover-container">
        <div className="logged-out-text-content">
          <h2 style={{ fontFamily: "Abril Fatface", fontSize: "2.5rem", margin: 0 }}>
            Enter the flow
          </h2>
          <p
            style={{
              fontFamily: "Josefin Sans",
              fontSize: "1.2rem",
              marginTop: "15px",
              color: "#555",
            }}
          >
            Please log in to browse, review, and bookmark study spots.
          </p>
        </div>
      </div>
    );
  }

  // 3. Main Discover Feed View
  return (
    <div className="discover-container">
      <div className="discover-content-wrapper">
        {/* HEADER */}
        <div className="discover-header">
          <h1>Discover Study Spaces</h1>
          <button className="add-spot-btn" onClick={() => setIsAddModalOpen(true)}>
            {/* <button
            className="add-spot-btn"
            onClick={() => {
              // Switch to map view to drop a pin
              if (viewMode !== "map") {
                navigate("/discovery?view=map");
              }
              setIsPickingMode(true);
            }}
          > */}
            + Add Study Spot
          </button>
        </div>

        {/* SEARCH & FILTER SECTION */}
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
            {[
              "WiFi",
              "Group Study",
              "Food Nearby",
              "Outlets",
              "Quiet",
              "24/7",
              "Study Rooms",
              "Moderate Noise",
            ].map((tag) => (
              <button
                key={tag}
                className={`filter-btn ${activeTags.includes(tag) ? "active" : ""}`}
                onClick={() => {
                  if (activeTags.includes(tag)) {
                    setActiveTags(activeTags.filter((t) => t !== tag));
                  } else {
                    setActiveTags([...activeTags, tag]);
                  }
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* MAP VIEW vs LIST VIEW
        {viewMode === "map" ? (
          <div style={{ position: "relative" }}>
            {isPickingMode && (
              <div
                style={{
                  position: "absolute",
                  top: "15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                  background: "#ff4d4d",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "30px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
              >
                📍 Click on the map to set the location!
              </div>
            )}
            <MapDropdown
              spots={filteredSpots}
              isOpen={true}
              isPicking={isPickingMode}
              onLocationSelect={(lat, lng) => {
                setTempCoords({ lat, lng });
                setIsPickingMode(false);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        ) : ( */}
        {/* GRID OF SPOTS (LIST VIEW) */}
        <div className="spots-list">
          {filteredSpots.map((spot) => {
            const avgRating = calculateRating(spot.reviews);
            const canDelete =
              spot.name !== "Stratton Student Center" &&
              spot.name !== "Hayden Library" &&
              spot.creator_id === userId._id;

            return (
              <div key={spot._id} className="spot-card">
                <div className="spot-image">
                  <img src={spot.image || "/stud.jpg"} alt={spot.name} />
                </div>
                <div className="spot-details" style={{ position: "relative" }}>
                  {/* Heart Button */}
                  <button
                    className="heart-btn"
                    onClick={() => handleToggleHeart(spot._id)}
                    style={{
                      position: "absolute",
                      top: "0px",
                      right: "0px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.5rem",
                      color: spot.isLiked ? "red" : "transparent",
                      WebkitTextStroke: "1px red",
                    }}
                  >
                    {spot.isLiked ? "❤️" : "♡"}
                  </button>

                  {/* Delete Button */}
                  {canDelete && (
                    <button
                      className="delete-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(spot._id);
                      }}
                      style={{
                        position: "absolute",
                        bottom: "5px",
                        right: "5px",
                        background: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "50%",
                        border: "1px rgba(255, 255, 255, 0.8)",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                      }}
                    >
                      🗑️
                    </button>
                  )}

                  <h3>{spot.name}</h3>
                  <div className="stars">
                    {"★".repeat(avgRating)}
                    {"☆".repeat(5 - avgRating)}
                    <span style={{ fontSize: "0.8rem", color: "#888", marginLeft: "5px" }}>
                      ({spot.reviews?.length || 0})
                    </span>
                  </div>

                  <div className="spot-tags">
                    {spot.tags?.map((t, i) => (
                      <span key={i} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div
                    className="spot-actions"
                    style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                  >
                    <button
                      className="review-btn"
                      onClick={() => {
                        setActiveSpot(spot);
                        setIsReviewModalOpen(true);
                      }}
                    >
                      🗨️ {spot.reviews?.length || 0} Write Review
                    </button>
                    <button
                      className="review-btn"
                      onClick={() => {
                        setActiveSpot(spot);
                        setIsSeeAllOpen(true);
                      }}
                    >
                      See All
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALS */}
      <AddSpotModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setTempCoords(null);
        }}
        onAdd={handleAddSpot}
      />
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        spotName={activeSpot?.name}
        spotId={activeSpot?._id}
      />
      <SeeAllReviewsModal
        isOpen={isSeeAllOpen}
        onClose={() => setIsSeeAllOpen(false)}
        spot={activeSpot}
      />
    </div>
  );
};

export default DiscoverFeed;
