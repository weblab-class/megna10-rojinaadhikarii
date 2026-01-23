import React, { useState, useContext, useEffect } from "react";
import "./Profile.css";
import { get, post } from "../../utilities";
import { UserContext } from "../App";
import SettingsModal from "../modules/SettingsModal";

const Profile = () => {
  // ===========================states=====================================
  const [activeTab, setActiveTab] = useState("bookmarks"); //books vs reviews visible
  const [favoriteSpots, setFavoriteSpots] = useState([]); //spots user hearted
  const [myReviews, setMyReviews] = useState([]); // list of reviews written by  user
  const [copied, setCopied] = useState(false); // state of share profile button
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  //GLOBAL USER DATE IMPORTANTTTTT
  const { userId, setUserId } = useContext(UserContext);

  useEffect(() => {
    if (userId) {
      get("/api/studyspot").then((allSpots) => {
        //  bookmarks
        const userBookmarks = (userId.bookmarked_spots || []).map(String);
        const userFavs = allSpots.filter((spot) => userBookmarks.includes(String(spot._id)));
        setFavoriteSpots(userFavs);

        // My Reviews
        // iterate through every spot and check if any review inside that spot belongs to the current user
        let gatheredReviews = [];
        allSpots.forEach((spot) => {
          if (spot.reviews) {
            spot.reviews.forEach((review) => {
              if (review.creator_id === userId._id) {
                gatheredReviews.push({
                  ...review,
                  spotName: spot.name,
                  spotImage: spot.image,
                  spotId: spot._id,
                  reviewId: review._id,
                });
              }
            });
          }
        });
        setMyReviews(gatheredReviews);
      });
    }
  }, [userId]);

  //removes review from UI and makes sure backend also deletes it
  const handleDeleteReview = (spotId, reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setMyReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));

      post("/api/review/delete", { spotId, reviewId }).catch((err) => {
        console.log("Failed to delete review", err);
        alert("Error deleting review");
      });
    }
  };

  // copies the current profile to users clipboard
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  //updates user info in context and database
  const handleSettingsSave = (updatedData) => {
    const newUser = { ...userId, ...updatedData };
    setUserId(newUser);
    post("/api/user", updatedData).catch((err) => console.log(err));
  };

  //handles logout state
  if (userId === null)
    return <div className="profile-container">Please log in to view your profile.</div>;
  //handles loading state
  if (!userId) return <div className="profile-container">Loading your profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-content-wrapper">
        <div className="user-info-card">
          {/* USER IDENTITY CARD */}
          <div className="user-main-info">
            <div className="profile-avatar">
              {/* TODO: ADD PROFILE PIC FOR USER , ABILITY TO UPLOAD? */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#888">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="user-text-details">
              <h2>{userId.name}</h2>

              {/* based on user's privacy settings */}
              {userId.showEmail !== false && (
                <p className="user-email">{userId.email || "No Email Provided"}</p>
              )}
              {userId.bio && (
                <p
                  className="user-bio"
                  style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}
                >
                  {userId.bio}
                </p>
              )}

              {/* social stats of user */}
              <div className="user-stats">
                <span>
                  <strong>{myReviews.length}</strong> Reviews
                </span>
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
            <button className="profile-action-btn" onClick={() => setIsSettingsOpen(true)}>
              Settings
            </button>
          </div>
        </div>

        {/* tab nav */}
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

        {/* book spots or reviews list on profile */}
        <div className="profile-spots-list">
          {activeTab === "bookmarks" ? (
            <>
              {favoriteSpots.length > 0 ? (
                favoriteSpots.map((spot) => (
                  <div key={spot._id} className="spot-card">
                    <div className="spot-image">
                      <img src={spot.image || "/stud.jpg"} alt={spot.name} />
                    </div>
                    <div className="spot-details">
                      <h3>{spot.name}</h3>
                      <p className="spot-desc">{spot.description || "A great place to study."}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-spots-msg">
                  No favorites yet! Go to the Discovery feed to heart some spots.
                </p>
              )}
            </>
          ) : (
            // REVIEWS TAB
            <>
              {myReviews.length > 0 ? (
                myReviews.map((review, i) => (
                  <div key={i} className="review-card">
                    <div className="review-header">
                      <h3>{review.spotName}</h3>
                      <div className="review-header-right">
                        <div className="review-stars">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </div>

                        <button
                          className="review-delete-btn"
                          onClick={() => handleDeleteReview(review.spotId, review.reviewId)}
                          title="Delete Review"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="review-content">"{review.content}"</p>
                  </div>
                ))
              ) : (
                <p className="no-spots-msg">You haven't written any reviews yet.</p>
              )}
            </>
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={userId}
        onSave={handleSettingsSave}
      />
    </div>
  );
};

export default Profile;
