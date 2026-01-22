import React from "react";
import "./SeeAllReviewsModal.css";

const SeeAllReviewsModal = ({ isOpen, onClose, spot }) => {
  if (!isOpen || !spot) return null;

  // Helper to calculate average rating
  const calculateAverage = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1); 
  };

  // Helper to format date strings like Jan 21, 2026
  const formatDate = (dateString) => {
    if (!dateString) return "Jan 21, 2026"; // Fallback for dummy data
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const avgRating = calculateAverage(spot.reviews);
  const starCount = Math.round(Number(avgRating));

  return (
    <div className="modal-overlay">
      <div className="reviews-modal-content">
        <div className="modal-header">
          <div>
            <h2>Reviews</h2>
            <p className="sub-location">{spot.name}</p>
          </div>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>

        <div className="rating-summary">
          <span className="stars-row">
            {"★".repeat(starCount)}
            {"☆".repeat(5 - starCount)}
          </span>
          <span className="rating-number">{avgRating}</span>
          <span className="review-count">{spot.reviews?.length || 0} reviews</span>
        </div>

        <div className="reviews-scroll-area">
          {spot.reviews?.length > 0 ? (
            spot.reviews.map((review, index) => (
              <div key={index} className="review-item-card">
                <div className="review-user-row">
                  <div className="user-avatar">{review.creator_name?.charAt(0) || "U"}</div>
                  <div className="user-info">
                    <strong>{review.creator_name || "Anonymous"}</strong>
                    {/* Dynamic Date based on timestamp */}
                    <span className="review-date">{formatDate(review.timestamp)}</span>
                  </div>
                  <div className="user-stars">
                    {"★".repeat(review.rating || 0)}
                    {"☆".repeat(5 - (review.rating || 0))}
                  </div>
                </div>
                <p className="review-text">{review.content}</p>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>No reviews yet.</p>
          )}
        </div>

        <button className="modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SeeAllReviewsModal;