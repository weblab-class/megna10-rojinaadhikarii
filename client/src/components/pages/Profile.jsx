import React, { useState, useContext, useEffect } from "react";
import "./Profile.css";
import { get } from "../../utilities";
import { UserContext } from "../App";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("bookmarks");
  const [myReviews, setMyReviews] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [copied, setCopied] = useState(false);

  // 1. Get the user object from context
  // (Note: In your App.js, you named the state 'userId', so we grab 'userId' here)
  const { userId } = useContext(UserContext);

  useEffect(() => {
    // 2. ONLY fetch spots if we actually have a logged-in user
    if (userId && userId.bookmarked_spots) {
      get("/api/studyspots").then((allSpots) => {
        const userFavs = allSpots.filter((spot) => userId.bookmarked_spots.includes(spot._id));
        setBookmarks(userFavs); // Save to the 'bookmarks' bucket
      });
    }

    // 2. FETCH REVIEWS
    // Assuming you have an endpoint or way to get reviews by user
    if (userId) {
      get(`/api/reviews?creator_id=${userId._id}`).then((reviews) => {
        setMyReviews(reviews); // Save to the 'reviews' bucket
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
            className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            My Reviews
          </button>
        </div>

        {/* Content Section */}
        <div className="content">
          {activeTab === "bookmarks" ? (
            // RENDER BOOKMARKS
            bookmarks.length > 0 ? (
              bookmarks.map((spot) => <div key={spot._id}>{spot.name}</div>)
            ) : (
              <p>No bookmarks yet!</p>
            )
          ) : // RENDER REVIEWS
          myReviews.length > 0 ? (
            myReviews.map((review) => <div key={review._id}>{review.content}</div>)
          ) : (
            <p>No reviews yet!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;