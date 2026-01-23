import React, { useState, useEffect, useContext } from "react";
import "../../utilities.css";
import "./DiscoverFeed.css";
import AddSpotModal from "../modules/AddSpotModal";
import ReviewModal from "../modules/ReviewModal";
import SeeAllReviewsModal from "../modules/SeeAllReviewsModal";
import { get, post, del } from "../../utilities";
import { UserContext } from "../App";

const DiscoverFeed = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const { userId, setUserId } = useContext(UserContext);

  const defaultSpots = [
    {
      _id: "default1",
      name: "Stratton Student Center",
      image: "/stud.jpg",
      tags: ["WiFi", "Group Study", "Food Nearby", "Outlets"],
      reviews: [],
      isLiked: false,
    },
    {
      _id: "default2",
      name: "Hayden Library",
      image: "/hayden.jpg",
      tags: ["WiFi", "Quiet", "Study Rooms", "Outlets", "Food Nearby"],
      reviews: [],
      isLiked: false,
    },
  ];

  const [spots, setSpots] = useState(defaultSpots);

  useEffect(() => {
    get("/api/studyspot").then((dbSpots) => {
      if (Array.isArray(dbSpots)) {
        const filteredDb = dbSpots.filter(
          (s) => s.name !== "Stratton Student Center" && s.name !== "Hayden Library"
        );

        const userBookmarks = (userId?.bookmarked_spots || []).map((id) => String(id));

        const formattedDb = filteredDb.map((s) => ({
          ...s,
          isLiked: userBookmarks.includes(String(s._id)),
        }));

        setSpots([...defaultSpots, ...formattedDb]);
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
    if (spotId.startsWith("default")) return alert("Cannot bookmark default examples.");

    setSpots((prev) =>
      prev.map((spot) => (spot._id === spotId ? { ...spot, isLiked: !spot.isLiked } : spot))
    );

    post("/api/bookmark", { spotId: spotId })
      .then((updatedUser) => {
        setUserId(updatedUser);
      })
      .catch((err) => {
        console.error("Bookmark failed", err);
      });
  };

  const handleDelete = (spotId) => {
    if (spotId.startsWith("default")) return alert("Cannot delete default spots!");
    if (window.confirm("Are you sure? This will permanently delete it from the database.")) {
      del(`/api/studyspot?spotId=${spotId}`)
        .then(() => setSpots((prev) => prev.filter((s) => s._id !== spotId)))
        .catch(() => alert("Server error: Could not delete."));
    }
  };

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

  const filteredSpots = (spots || []).filter((spot) => {
    return (
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTags.length === 0 || activeTags.every((t) => spot.tags?.includes(t)))
    );
  });

  // Authentication

  if (userId === undefined) {
    return (
      <div className="discover-container" style={{ justifyContent: "center", paddingTop: "20vh" }}>
        Loading...
      </div>
    );
  }

  if (userId === null) {
    return (
      <div
        className="discover-container"
        style={{ alignItems: "center", paddingTop: "15vh", textAlign: "center" }}
      >
        <h2 style={{ fontFamily: "Abril Fatface", fontSize: "2rem", margin: 0 }}>Enter the flow</h2>
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
    );
  }

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
            {["All", "Near Me", "Quiet", "24/7", "Group Study", "WiFi", "Outlets"].map((tag) => (
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

        <div className="spots-list">
          {filteredSpots.map((spot) => {
            const avgRating = calculateRating(spot.reviews);
            return (
              <div key={spot._id} className="spot-card">
                <div className="spot-image">
                  <img src={spot.image || "/stud.jpg"} alt={spot.name} />
                </div>
                <div className="spot-details" style={{ position: "relative" }}>
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

                  {!spot._id.startsWith("default") && (
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
                  <div className="stars">
                    {"★".repeat(avgRating)}
                    {"☆".repeat(5 - avgRating)}
                    <span style={{ fontSize: "0.8rem", color: "#888", marginLeft: "5px" }}>
                      ({spot.reviews?.length || 0})
                    </span>
                  </div>
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
