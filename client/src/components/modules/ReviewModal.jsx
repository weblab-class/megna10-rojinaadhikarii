import React, { useState } from "react";
import "./ReviewModal.css";

const ReviewModal = ({ isOpen, onClose, onSubmit, spotName }) => {
  if (!isOpen) return null;

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating!");
    onSubmit({ rating, reviewText });
    setRating(0);
    setReviewText("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="review-modal-container">
        <div className="review-modal-header">
          <div>
            <h2 className="modal-title">Write a Review</h2>
            <p className="modal-subtitle">{spotName}</p>
          </div>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        
        <hr className="modal-divider" />

        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <label>Your Rating *</label>
            <div className="star-rating">
              {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                  <button
                    type="button"
                    key={index}
                    className={ratingValue <= (hover || rating) ? "star on" : "star off"}
                    onClick={() => setRating(ratingValue)}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <span>★</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Your Review *</label>
            <textarea
              placeholder="Share your experience at this study spot. What did you like? What could be improved?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="submit-btn">Submit Review</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;