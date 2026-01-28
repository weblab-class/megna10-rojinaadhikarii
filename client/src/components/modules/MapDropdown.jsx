import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapDropdown.css";

const LocationPicker = ({ onLocationSelect, isPicking }) => {
  useMapEvents({
    click(e) {
      if (isPicking) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapDropdown = ({ spots, isOpen, isPicking, onLocationSelect }) => {
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultLandmarks = [
    { _id: "default-hayden", name: "Hayden Library", lat: 42.3592, lng: -71.0884 },
    { _id: "default-stratton", name: "Stratton Student Center", lat: 42.3591, lng: -71.0948 },
  ];

  return (
    <>
      {/* 1. Instructions Info Box */}
      <div className={`instruction-box ${isPicking ? "picking" : "browsing"}`}>
        <div className="instruction-icon">📍</div>
        <div className="instruction1-text">
          {isPicking ? (
            <p>click anywhere on the map to set the exact location for your new study spot</p>
          ) : (
            <p>click on the pins to see spot names</p>
          )}
        </div>
      </div>

      {/* 2. Map Container */}
      <div
        style={{
          height: "500px",
          width: "100%",
          marginTop: "20px",
          border: "2px solid #333",
          borderRadius: "12px",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <MapContainer
          center={[42.3595, -71.092]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationPicker isPicking={isPicking} onLocationSelect={onLocationSelect} />

          {defaultLandmarks.map((mark) => (
            <Marker key={mark._id} position={[mark.lat, mark.lng]}>
              <Popup>
                <strong>{mark.name}</strong>
              </Popup>
            </Marker>
          ))}

          {spots.map((spot) => {
            if (spot.name === "Hayden Library" || spot.name === "Stratton Student Center")
              return null;
            return (
              <Marker key={spot._id} position={[spot.lat || 42.3595, spot.lng || -71.092]}>
                <Popup>
                  <strong>{spot.name}</strong>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </>
  );
};

export default MapDropdown;
