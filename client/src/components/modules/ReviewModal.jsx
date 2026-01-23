import React, { useState } from "react";
import "./ReviewModal.css";
import { post } from "../../utilities";

const ReviewModal = ({ isOpen, onClose, spotId, spotName }) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) return alert("Please select a star rating.");
    if (!reviewText.trim()) return alert("Please enter a review.");

    const body = {
      spotId: spotId,
      content: reviewText,
      rating: rating,
    };

    try {
      await post("/api/review", body);
      setReviewText("");
      setRating(0);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Could not save review. Check your terminal!");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Restored Original Header */}
        <h2 className="modal-title">Review {spotName}</h2>
        <hr className="modal-divider" />

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Restored Star Rating Group */}
          <div className="form-group">
            <label>Your Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={num <= (hover || rating) ? "on" : "off"}
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHover(num)}
                  onMouseLeave={() => setHover(rating)}
                >
                  <span className="star">&#9733;</span>
                </button>
              ))}
            </div>
          </div>

          {/* Restored  Group */}
          <div className="form-group">
            <label>Your Review</label>
            <textarea
              placeholder="What did you think? Would you recommend?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
            />
          </div>

          {/* Restored Original Action Buttons */}
          <div className="modal-actions">
            <button type="submit" className="submit-btn">
              Submit Review
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
