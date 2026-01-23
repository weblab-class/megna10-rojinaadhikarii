import React, { useState, useEffect, useContext } from "react";
import "../../utilities.css";
import "./DiscoverFeed.css";
import AddSpotModal from "../modules/AddSpotModal";
import ReviewModal from "../modules/ReviewModal";
import SeeAllReviewsModal from "../modules/SeeAllReviewsModal";
import { get, post, del } from "../../utilities";
import { UserContext } from "../App";

const DiscoverFeed = () => {
  // ===========================states=====================================
  // ui state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);

  // filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);

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
    if (window.confirm("Are you sure? This will permanently delete it from the database.")) {
      del(`/api/studyspot?spotId=${spotId}`)
        .then(() => setSpots((prev) => prev.filter((s) => s._id !== spotId)))
        .catch((err) => {
          alert("Could not delete spot. You might not be the owner.");
        });
    }
  };

  // add a new spot
  const handleAddSpot = (newSpotData) => {
    const tempId = Date.now().toString();
    const temporarySpot = { _id: tempId, ...newSpotData, reviews: [], isLiked: false };
    setSpots([temporarySpot, ...spots]);
    setIsAddModalOpen(false);

    post("/api/studyspot", newSpotData)
      .then((saved) => {
        setSpots((prev) => prev.map((s) => (s._id === tempId ? { ...saved, isLiked: false } : s)));
      })
      .catch(() => {
        alert("The spot was added to the screen, but could not be saved to the database.");
      });
  };

  // filters spots based on tags
  const filteredSpots = (spots || []).filter((spot) => {
    return (
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTags.length === 0 || activeTags.every((t) => spot.tags?.includes(t)))
    );
  });

  //loading state
  if (userId === undefined) {
    return (
      <div className="discover-container" style={{ justifyContent: "center", paddingTop: "20vh" }}>
        Loading...
      </div>
    );
  }

  //logged out state
  if (userId === null) {
    return (
      <div className="discover-container">
        {/* GIF Container shifted to the top-left via CSS
        <div className="logged-out-gif-wrapper">
          <img src="/ai-baby.gif" alt="Loading animation" />
        </div> */}

        {/* Main Text Content */}
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

  return (
    <div className="discover-container">
      <div className="discover-content-wrapper">
        {/* header */}
        <div className="discover-header">
          <h1>Discover Study Spaces</h1>
          <button className="add-spot-btn" onClick={() => setIsAddModalOpen(true)}>
            + Add Study Spot
          </button>
        </div>

        {/* search and tag filtering conditions */}
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
                className={`filter-btn ${
                  activeTags.includes(tag) || (tag === "All" && activeTags.length === 0)
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  if (tag === "All") {
                    setActiveTags([]);
                  } else {
                    if (activeTags.includes(tag)) {
                      setActiveTags(activeTags.filter((t) => t !== tag));
                    } else {
                      setActiveTags([...activeTags, tag]);
                    }
                  }
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* grid of spots */}
        <div className="spots-list">
          {filteredSpots.map((spot) => {
            const avgRating = calculateRating(spot.reviews);

            //  cannot delete spots you didtns create
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
                  {/* heart button */}
                  <button
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
                      transition: "transform 0.1s",
                      zIndex: 101,
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.8)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {spot.isLiked ? "❤️" : "♡"}
                  </button>

                  {/* delete button */}
                  {canDelete && (
                    <button
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
                        border: "1px solid #ccc",
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
                  {/* visual star rating */}
                  <div className="stars">
                    {"★".repeat(avgRating)}
                    {"☆".repeat(5 - avgRating)}
                    <span style={{ fontSize: "0.8rem", color: "#888", marginLeft: "5px" }}>
                      ({spot.reviews?.length || 0})
                    </span>
                  </div>

                  {/* spot tags */}
                  <div className="spot-tags">
                    {spot.tags &&
                      spot.tags.map((t, i) => (
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

      <AddSpotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
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
