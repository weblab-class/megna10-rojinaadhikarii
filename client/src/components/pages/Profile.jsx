import React, { useState, useContext, useEffect } from "react";
import "./Profile.css";
import { get } from "../../utilities";
import { UserContext } from "../App";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("bookmarks");
  const [favoriteSpots, setFavoriteSpots] = useState([]);
  const [copied, setCopied] = useState(false);

  // 1. Get the user object from context
  // (Note: In your App.js, you named the state 'userId', so we grab 'userId' here)
  const { userId } = useContext(UserContext);

  useEffect(() => {
    // 2. ONLY fetch spots if we actually have a logged-in user
    if (userId && userId.favorited_spots) {
      get("/api/studyspots").then((allSpots) => {
        const userFavs = allSpots.filter((spot) => userId.favorited_spots.includes(spot._id));
        setFavoriteSpots(userFavs);
      });
    }
  }, [userId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 3. THE FIX: If 'userId' is undefined (still loading), STOP here.
  // This prevents the blank screen crash.
  if (userId === null) {
    return <div>Please log in to view your profile.</div>;
  }
  if (!userId) {
    return <div className="profile-container">Loading your profile...</div>;
  }

  // 4. Render the page (Now safe because userId is guaranteed to exist)
  return (
    <div className="profile-container">
      <div className="profile-content-wrapper">
        <div className="user-info-card">
          <div className="user-main-info">
            <div className="profile-avatar">
              {/* Basic Avatar SVG */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#888">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="user-text-details">
              <h2>{userId.name}</h2>
              <p className="user-email">{userId.email || "No Email Provided"}</p>

              <div className="user-stats">
                <span>
                  <strong>{userId.reviews || 0}</strong> Reviews
                </span>
                {/* Check if arrays exist before checking length */}
                <span>
                  <strong>{userId.followers ? userId.followers.length : 0}</strong> Followers
                </span>
                <span>
                  <strong>{userId.following ? userId.following.length : 0}</strong> Following
                </span>
              </div>
            </div>
          </div>

          <div className="user-actions">
            <button className="profile-action-btn" onClick={handleShare}>
              {copied ? "Copied!" : "Share Profile"}
            </button>
            <button className="profile-action-btn">Edit Profile</button>
            <button className="profile-action-btn">Settings</button>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "bookmarks" ? "active" : ""}`}
            onClick={() => setActiveTab("bookmarks")}
          >
            Bookmarked Spots
          </button>
          <div className="tab-divider"></div>
          <button
            className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            My Favorites
          </button>
        </div>

        {/* Content Section */}
        <div className="profile-spots-list">
          {activeTab === "bookmarks" ? (
            // Placeholder for bookmarks
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No bookmarks yet
            </div>
          ) : (
            <>
              {favoriteSpots.length > 0 ? (
                favoriteSpots.map((spot) => (
                  <div key={spot._id} className="spot-card">
                    <div className="spot-image">
                      <img src={spot.image || "/stud.jpg"} alt={spot.name} />
                    </div>
                    <div className="spot-details">
                      <h3>{spot.name}</h3>
                      <p className="spot-desc">{spot.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-spots-msg">
                  No favorites yet! Go to the Discovery feed to heart some spots.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
