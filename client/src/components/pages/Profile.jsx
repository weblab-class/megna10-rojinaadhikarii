import React, { useState, useContext, useEffect } from "react";
import "./Profile.css";
import { get, post } from "../../utilities";
import { UserContext } from "../App";
import SettingsModal from "../modules/SettingsModal";
import ReviewModal from "../modules/ReviewModal";
import SeeAllReviewsModal from "../modules/SeeAllReviewsModal";
import { useParams } from "react-router-dom";

const Profile = () => {
  // states
  const [activeTab, setActiveTab] = useState("bookmarks");
  const [favoriteSpots, setFavoriteSpots] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);

  // new states for card functionality
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(null);

  // global user data
  const { userId: loggedInUser, setUserId } = useContext(UserContext);
  const { userId: urlUserId } = useParams();

  useEffect(() => {
    if (loggedInUser === undefined) return;
    setProfileUser(null);

    if (!urlUserId) {
      if (loggedInUser) {
        setProfileUser(loggedInUser);
      } else {
        setProfileUser(null);
      }
      return;
    }

    get("/api/user", { userid: urlUserId })
      .then((user) => {
        setProfileUser(user);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, [urlUserId, loggedInUser]);

  useEffect(() => {
    if (profileUser) {
      get("/api/studyspot").then((allSpots) => {
        // bookmarks
        const userBookmarks = (profileUser.bookmarked_spots || []).map(String);
        const userFavs = allSpots.filter((spot) => userBookmarks.includes(String(spot._id)));
        setFavoriteSpots(userFavs);

        // my reviews
        let gatheredReviews = [];
        allSpots.forEach((spot) => {
          if (spot.reviews) {
            spot.reviews.forEach((review) => {
              if (review.creator_id === profileUser._id) {
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
  }, [profileUser]);

  // helper: calculate stars
  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round(sum / reviews.length);
  };

  // helper: toggle heart (unbookmarking)
  const handleToggleHeart = (spotId) => {
    if (!loggedInUser) return;
    post("/api/bookmark", { spotId: spotId }).then((updatedUser) => {
      setUserId(updatedUser);
      // if we are viewing our own profile, remove the card immediately from the list
      if (!urlUserId || urlUserId === loggedInUser._id) {
        setFavoriteSpots((prev) => prev.filter((s) => s._id !== spotId));
      }
    }).catch(console.error);
  };

  const handleReviewSuccess = (updatedSpot, updatedUser) => {
    // update the spot in our local list so the review count updates instantly
    setFavoriteSpots(prev => prev.map(s => s._id === updatedSpot._id ? updatedSpot : s));
    setUserId(updatedUser);
    setIsReviewModalOpen(false);
  };

  const handleDeleteReview = (spotId, reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setMyReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
      post("/api/review/delete", { spotId, reviewId }).catch((err) => {
        console.log("Failed to delete review", err);
        alert("Error deleting review");
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSettingsSave = (updatedData) => {
    const newUser = { ...profileUser, ...updatedData };
    setProfileUser(newUser); 
    setUserId(newUser);      
    post("/api/user", updatedData).catch((err) => {
      console.log("save error:", err);
      alert("failed to save. the image might still be too large for the database.");
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too big! Please select an image under 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        handleSettingsSave({ picture: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loggedInUser === undefined) {
     return <div className="profile-container" style={{justifyContent: "center", paddingTop: "20vh", color: "#888"}}>Loading session...</div>;
  }

  if (loggedInUser === null && !urlUserId)
    return <div className="profile-container">please log in to view your profile.</div>;
  
  if (!profileUser) return <div className="profile-container">loading your profile...</div>;

  const isOwnProfile = !urlUserId || urlUserId === loggedInUser?._id;

  return (
    <div className="profile-container">
      <div className="profile-content-wrapper">
        <div className="user-info-card">
          <div className="user-main-info">
            
            {/* avatar section */}
            <div className="profile-avatar-wrapper">
              {isOwnProfile ? (
                <label className="avatar-upload-label">
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  <div className="profile-avatar-container">
                    {profileUser.picture ? (
                      <img src={profileUser.picture} alt="Profile" className="profile-avatar-img" />
                    ) : (
                      <div className="profile-avatar-svg">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="#888">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="profile-edit-badge" title="Change Profile Picture">✎</div>
                </label>
              ) : (
                <div className="profile-avatar-container">
                  {profileUser.picture ? (
                    <img src={profileUser.picture} alt="Profile" className="profile-avatar-img" />
                  ) : (
                    <div className="profile-avatar-svg">
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="#888">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="user-text-details">
              <h2>{profileUser.name}</h2>
              {profileUser.showEmail !== false && (
                <p className="user-email">{profileUser.email || "No Email Provided"}</p>
              )}
              {profileUser.bio && (
                <p className="user-bio" style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  {profileUser.bio}
                </p>
              )}
              <div className="user-stats">
                <span><strong>{favoriteSpots.length}</strong> bookmarks</span>
                <span><strong>{myReviews.length}</strong> reviews</span>
              </div>
            </div>
          </div>

          <div className="user-actions">
            <button className="profile-action-btn" onClick={handleShare}>
              {copied ? "copied!" : "share profile"}
            </button>
            {isOwnProfile && (
              <button className="profile-action-btn" onClick={() => setIsSettingsOpen(true)}>
                edit profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === "bookmarks" ? "active" : ""}`} onClick={() => setActiveTab("bookmarks")}>
            bookmarked spots
          </button>
          <div className="tab-divider"></div>
          <button className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>
            reviews
          </button>
        </div>

        <div className="profile-spots-list">
          {activeTab === "bookmarks" ? (
            <>
              {favoriteSpots.length > 0 ? (
                // updated: detailed card structure
                favoriteSpots.map((spot) => {
                  const avgRating = calculateRating(spot.reviews);
                  // we show a filled heart because this is the bookmarks tab
                  return (
                    <div key={spot._id} className="spot-card">
                      <div className="spot-image">
                         {spot.image ? <img src={spot.image} alt={spot.name} loading="lazy" /> : <div className="no-image-placeholder"></div>}
                      </div>
                      <div className="spot-details" style={{ position: "relative" }}>
                          
                          {/* heart button */}
                          <button 
                            className="heart-btn" 
                            onClick={() => handleToggleHeart(spot._id)} 
                            style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "red", zIndex: 101 }}
                            title="Remove bookmark"
                          >
                            ❤️
                          </button>

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
                <p className="no-spots-msg">No favorites yet! Go to the Discovery feed to heart some spots.</p>
              )}
            </>
          ) : (
            <>
              {myReviews.length > 0 ? (
                myReviews.map((review, i) => (
                  <div key={i} className="review-card">
                    <div className="review-header">
                      <h3>{review.spotName}</h3>
                      <div className="review-header-right">
                        <div className="review-stars">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                        {isOwnProfile && (
                          <button className="review-delete-btn" onClick={() => handleDeleteReview(review.spotId, review.reviewId)} title="Delete Review">🗑️</button>
                        )}
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

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={profileUser} onSave={handleSettingsSave} />
      
      {/* added modals at the bottom */}
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} spotName={activeSpot?.name} spotId={activeSpot?._id} onReviewSuccess={handleReviewSuccess} />
      <SeeAllReviewsModal isOpen={isSeeAllOpen} onClose={() => setIsSeeAllOpen(false)} spot={activeSpot} />
    </div>
  );
};

export default Profile;