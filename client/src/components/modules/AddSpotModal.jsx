import React, { useState } from "react";
import "./AddSpotModal.css";

const AddSpotModal = ({ isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [image, setImage] = useState(null); // New state for the photo

  const availableTags = [
    "WiFi", "Group Study", "Food Nearby", "Outlets", 
    "Quiet", "24/7", "Study Rooms", "Moderate Noise"
  ];

  // Logic to turn the file into a string for the database
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result); // This stores the image data
      };
      reader.readAsDataURL(file);
    }
  };

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
    
    // Pass the image along with the other data
    onAdd({ 
      name, 
      location, 
      description, 
      tags: selectedTags,
      image: image // Sends the uploaded photo
    });
    
    setName("");
    setLocation("");
    setDescription("");
    setSelectedTags([]);
    setImage(null);
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
              placeholder="eg. 3rd Floor" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              placeholder="Describe the study space..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="tag-selection">
            <label>Tags & Amenities *</label>
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

          <div className="form-group" style={{ marginTop: "15px" }}>
            <label>Upload Picture</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              style={{ fontSize: "0.8rem" }}
            />
            {image && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ fontSize: "0.7rem", color: "green" }}>✓ Photo selected</p>
              </div>
            )}
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