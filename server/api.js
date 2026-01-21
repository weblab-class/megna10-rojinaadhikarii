const express = require("express");
const router = express.Router();
const StudySpot = require("./models/studyspot");

// 1. GET all study spots from Hard Disk
router.get("/studyspots", (req, res) => {
  StudySpot.find({}).then((spots) => res.send(spots));
});

// 2. POST a new study spot
router.post("/studyspot", (req, res) => {
  const newSpot = new StudySpot({
    name: req.body.name,
    location: req.body.location, 
    description: req.body.description,
    tags: req.body.tags || [],
    image: "/stud.jpg",
    reviews: [],
  });

  newSpot.save().then((spot) => res.send(spot));
});

// 3. POST a new review (Fixes 500 error)
router.post("/review", (req, res) => {
  const { spotId, content, rating } = req.body;

  // Catch non-MongoDB IDs before they crash the DBMS
  if (!spotId || spotId.length !== 24) {
    return res.status(400).send({ error: "Invalid ID format. Please review a spot saved in the database." });
  }

  StudySpot.findById(spotId).then((spot) => {
    if (!spot) return res.status(404).send({ error: "Spot not found in database" });

    const newReview = {
      creator_name: req.user ? req.user.name : "Anonymous",
      content: content,
      rating: rating,
    };

    spot.reviews.push(newReview);
    
    // Save to MongoDB Atlas
    spot.save().then((updatedSpot) => res.send(updatedSpot));
  }).catch((err) => {
    res.status(500).send({ error: "Database error occurred" });
  });
});

module.exports = router;