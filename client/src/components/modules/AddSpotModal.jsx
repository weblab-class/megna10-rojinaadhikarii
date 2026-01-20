import React, { useState } from "react";
import "./AddSpotModal.css";

const AddSpotModal = ({ isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  // Form states
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  
  // Tag state to track selection
  const [selectedTags, setSelectedTags] = useState([]);

  const availableTags = [
    "WiFi", "Group Study", "Food Nearby", "Outlets", 
    "Quiet", "24/7", "Study Rooms", "Moderate Noise"
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !location || !description) {
      alert("Please fill out all required fields.");
      return;
    }
    
    onAdd({ 
      name, 
      location, 
      description, 
      tags: selectedTags 
    });
    
    // Reset and close
    setName("");
    setLocation("");
    setDescription("");
    setSelectedTags([]);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Add Study Spot</h2>
        <hr className="modal-divider" />
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Study Spot Name *</label>
            <input 
              type="text" 
              placeholder="eg. Student Center" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input 
              type="text" 
              placeholder="eg." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              placeholder="Describe the study space, atmosphere, amenities, and what makes it special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="tag-selection">
            <label>Tags & Amenities *</label>
            <p className="tag-subtext">Select all that apply.</p>
            <div className="modal-tags">
              {availableTags.map(tag => (
                <button 
                  key={tag} 
                  type="button"
                  className={`modal-tag-btn ${selectedTags.includes(tag) ? "active" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="submit-btn">Add Study Spot</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpotModal;