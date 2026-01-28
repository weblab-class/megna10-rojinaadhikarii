import React, { useState, useEffect } from "react";
import "./SettingsModal.css";

const SettingsModal = ({ isOpen, onClose, user, onSave }) => {
  // local state for the form fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [showEmail, setShowEmail] = useState(true);

  // when the modal opens, pre-fill with the user's current info
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || ""); // Assuming you might add a bio later
      setShowEmail(user.showEmail !== false); // Default to true if undefined
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // pass the updated data back to Profile.jsx
    onSave({
      name,
      bio,
      showEmail,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Profile</h2>

        {/* Name Field */}
        <div className="form-group">
          <label>Display Name</label>
          <input
            type="text"
            className="settings-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />
        </div>

        {/* Bio Field */}
        <div className="form-group">
          <label>Bio / Status</label>
          <input
            type="text"
            className="settings-input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What are you studying?"
          />
        </div>

        {/* Email Privacy Toggle */}
        <div className="toggle-row">
          <span className="toggle-label">Show Email on Profile</span>
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={showEmail}
            onChange={(e) => setShowEmail(e.target.checked)}
          />
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
