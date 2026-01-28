import React, { useState, useEffect } from "react";
import { get } from "../../utilities";
import { Link } from "react-router-dom";
import "./Leaderboard.css"; 

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get("/api/studyspot")
      .then((allSpots) => {
        const counts = {}; 

        allSpots.forEach((spot) => {
          if (spot.reviews) {
            spot.reviews.forEach((review) => {
              const id = review.creator_id;
              if (!counts[id]) {
                counts[id] = {
                  userId: id,
                  name: review.creator_name || "Anonymous User", 
                  count: 0
                };
              }
              counts[id].count += 1;
            });
          }
        });

        const sortedLeaderboard = Object.values(counts).sort((a, b) => b.count - a.count);
        setLeaderboard(sortedLeaderboard);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch spots for leaderboard", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="leaderboard-container" style={{ paddingTop: "160px", textAlign: "center" }}>Loading leaderboard...</div>;

  return (
    <div className="leaderboard-container" style={{ paddingTop: "160px" }}>
      <h1 className="leaderboard-header" style={{ marginBottom: "60px" }}>🏆 top reviewers</h1>
      
      <div className="leaderboard-list">
        {leaderboard.length > 0 ? (
          leaderboard.map((user, index) => (
            <div 
              key={user.userId} 
              className="leaderboard-card" 
              style={{ 
                borderLeft: 
                  index === 0 ? "8px solid #EDB51C" : 
                  index === 1 ? "8px solid #C0C0C0" : 
                  index === 2 ? "8px solid #CD7F32" : 
                  "8px solid #A1B3A8"                
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                 <div className="leaderboard-rank" style={{ color: "black" }}>
                   #{index + 1}
                 </div>
                 
                 <div className="leaderboard-user-info">
                   <Link to={`/profile/${user.userId}`} className="leaderboard-name">
                       {user.name}
                   </Link>
                 </div>
              </div>

              <div className="leaderboard-count">
                {user.count} reviews
              </div>
            </div>
          ))
        ) : (
          <p style={{textAlign: "center", color: "#666"}}>no reviews found in the system yet.</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;