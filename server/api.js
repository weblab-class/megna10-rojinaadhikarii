const express = require("express");
const router = express.Router();
const StudySpot = require("./models/studyspot");
const auth = require("./auth");
const User = require("./models/user");

// 1. GET ALL SPOTS
router.get("/studyspots", (req, res) => {
  StudySpot.find({}).then((spots) => res.send(spots));
});

// 2. POST NEW SPOT
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

// 3. POST REVIEW
router.post("/review", (req, res) => {
  const { spotId, content, rating } = req.body;

  // Catch non-MongoDB IDs before they crash the DBMS
  if (!spotId || spotId.length !== 24) {
    return res
      .status(400)
      .send({ error: "Invalid ID format. Please review a spot saved in the database." });
  }

  StudySpot.findById(spotId)
    .then((spot) => {
      if (!spot) return res.status(404).send({ error: "Spot not found in database" });

      const newReview = {
        creator_name: req.user ? req.user.name : "Anonymous",
        content: content,
        rating: rating,
      };

      spot.reviews.push(newReview);

      // Save to MongoDB Atlas
      spot.save().then((updatedSpot) => res.send(updatedSpot));
    })
    .catch((err) => {
      res.status(500).send({ error: "Database error occurred" });
    });
});

router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.get("/user", (req, res) => {
  User.findById(req.query.userid)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(500).send("User Not");
    });
});

router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.get("/user", (req, res) => {
  User.findById(req.query.userid)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(500).send("User Not");
    });
});

router.post("/bookmark", auth.ensureLoggedIn, (req, res) => {
  User.findById(req.user._id).then((user) => {
    if (req.body.isLiked) {
      // If true, we want to ADD it (ensure no duplicates)
      if (!user.bookmarked_spots.includes(req.body.spotId)) {
        user.bookmarked_spots.push(req.body.spotId);
      }
    } else {
      // If false, we want to REMOVE it
      user.bookmarked_spots = user.bookmarked_spots.filter((id) => id !== req.body.spotId);
    }

    user.save().then((updatedUser) => {
      res.send(updatedUser); // Send back the full updated user object
    });
  });
});

module.exports = router;
