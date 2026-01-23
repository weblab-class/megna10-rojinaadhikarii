const express = require("express");
const router = express.Router();
const StudySpot = require("./models/studyspot");
const auth = require("./auth");
const User = require("./models/user");

//  GET ALL SPOTS
router.get("/studyspot", (req, res) => {
  StudySpot.find({}).then((spots) => res.send(spots));
});

// POST NEW SPOT
router.post("/studyspot", (req, res) => {
  if (!req.user) return res.status(401).send({ error: "Not logged in" });

  const newSpot = new StudySpot({
    creator_id: req.user._id, 
    
    name: req.body.name,
    location: req.body.location,
    description: req.body.description,
    tags: req.body.tags || [],
    image: req.body.image || "/stud.jpg", 
    reviews: [],
  });
  newSpot.save().then((spot) => res.send(spot));
});

// POST REVIEW
router.post("/review", (req, res) => {
  const { spotId, content, rating } = req.body;

  if (!spotId || spotId.length !== 24) {
    return res.status(400).send({ error: "Invalid ID format." });
  }

  StudySpot.findById(spotId)
    .then((spot) => {
      if (!spot) return res.status(404).send({ error: "Spot not found" });


      const newReview = {
        creator_id: req.user._id, 
        creator_name: req.user.name,
        content: content,
        rating: rating,
      };

      spot.reviews.push(newReview);
      spot.save().then((updatedSpot) => res.send(updatedSpot));
    })
    .catch((err) => {
      res.status(500).send({ error: "Database error" });
    });
});

// DELETE SPOT
router.delete("/studyspot", (req, res) => {
  const spotId = req.query.spotId;
  StudySpot.findByIdAndDelete(spotId)
    .then((deleted) => {
      if (!deleted) return res.status(404).send({ error: "Spot not found" });
      res.send({ msg: "Deleted successfully" });
    })
    .catch((err) => {
      console.log("Delete error:", err);
      res.status(500).send({ error: "Delete failed" });
    });
});


router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.get("/whoami", (req, res) => {
  if (!req.user) {
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
      res.status(500).send("User Not Found");
    });
});

router.post("/bookmark", (req, res) => {
  if (!req.user) return res.status(401).send({ error: "Not logged in" });

  User.findById(req.user._id).then((user) => {
    if (!user) return res.status(404).send({ error: "User not found" });

    const spotId = req.body.spotId;

    // check if the string ID is already in the list
    if (user.bookmarked_spots.includes(spotId)) {
      // remove: filter it out
      user.bookmarked_spots = user.bookmarked_spots.filter((id) => id !== spotId);
    } else {
      // add: push it to the list
      user.bookmarked_spots.push(spotId);
    }

    user.save().then((updatedUser) => res.send(updatedUser));
  });
});

// DELETE REVIEW ROUTE
router.post("/review/delete", (req, res) => {
  if (!req.user) return res.status(401).send({ error: "Not logged in" });

  const { spotId, reviewId } = req.body;

  StudySpot.findById(spotId).then((spot) => {
    if (!spot) return res.status(404).send({ error: "Spot not found" });

    // find the specific review
    const review = spot.reviews.id(reviewId);
    if (!review) return res.status(404).send({ error: "Review not found" });

    // ensure the logged-in user is the one who wrote it
    if (review.creator_id !== req.user._id.toString()) {
      return res.status(403).send({ error: "You can only delete your own reviews" });
    }

    // remove the review using Mongoose's .remove() or .pull()
    spot.reviews.pull(reviewId);

    // save the spot
    spot.save().then((updatedSpot) => res.send(updatedSpot));
  });
});

const seedDefaults = async () => {
  const stratton = await StudySpot.findOne({ name: "Stratton Student Center" });
  if (!stratton) {
    const newStratton = new StudySpot({
      name: "Stratton Student Center",
      location: "84 Massachusetts Ave",
      lat: 42.3591, 
      lng: -71.0947, 
      // description: "The central hub for student life.",
      image: "/stud.jpg", 
      tags: ["WiFi", "Group Study", "Food Nearby", "Outlets"],
      reviews: []
    });
    await newStratton.save();
    console.log("Created Stratton Student Center in Database!");
  }

  const hayden = await StudySpot.findOne({ name: "Hayden Library" });
  if (!hayden) {
    const newHayden = new StudySpot({
      name: "Hayden Library",
      location: "160 Memorial Dr",
      lat: 42.3591,
      lng: -71.0947, 
      // description: "Newly renovated library with great views.",
      image: "/hayden.jpg",
      tags: ["WiFi", "Quiet", "Study Rooms", "Outlets", "Food Nearby"],
      reviews: []
    });
    await newHayden.save();
    console.log("Created Hayden Library in Database!");
  }
};

seedDefaults();


module.exports = router;
