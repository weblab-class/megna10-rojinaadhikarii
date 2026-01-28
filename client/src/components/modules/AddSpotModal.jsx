import React, { useState } from "react";
import "./AddSpotModal.css";

const AddSpotModal = ({ isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [image, setImage] = useState(null); 

  const availableTags = [
    "WiFi", "Group Study", "Food Nearby", "Outlets", 
    "Quiet", "24/7", "Study Rooms", "Moderate Noise"
  ];

  // resize huge images
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL("image/jpeg", 0.7)); 
        };
      };
    });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await resizeImage(file);
        setImage(compressedBase64); // stores the smaller image data
      } catch (err) {
        console.error("Image resize failed", err);
      }
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
    
    // pass the image along with the other data
    onAdd({ 
      name, 
      location, 
      description, 
      tags: selectedTags,
      image: image // send the uploaded (and resized) photo
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
                <p style={{ fontSize: "0.7rem", color: "green" }}>✓ Photo selected (Compressed)</p>
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