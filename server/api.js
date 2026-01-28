const express = require("express");
const router = express.Router();
const StudySpot = require("./models/studyspot");
const auth = require("./auth");
const User = require("./models/user");

// study spots routes

router.get("/studyspot", (req, res) => {
  StudySpot.find({}).then((spots) => res.send(spots));
});

router.post("/studyspot", (req, res) => {
  if (!req.user) return res.status(401).send({ error: "Not logged in" });

  const newSpot = new StudySpot({
    creator_id: req.user._id,
    name: req.body.name,
    location: req.body.location,
    lat: req.body.lat,
    lng: req.body.lng,
    tags: req.body.tags || [],
    image: req.body.image || "",
    reviews: [],
  });
  newSpot.save().then((spot) => res.send(spot));
});

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

// review routes

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
      return spot.save();
    })
    .then((updatedSpot) => {
      return User.findByIdAndUpdate(
        req.user._id, 
        { $inc: { reviewCount: 1 } }, 
        { new: true }
      ).then((updatedUser) => {
        req.session.user = updatedUser;
        res.send({ spot: updatedSpot, user: updatedUser });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ error: "Database error" });
    });
});

router.post("/review/delete", (req, res) => {
  if (!req.user) return res.status(401).send({ error: "Not logged in" });

  const { spotId, reviewId } = req.body;

  StudySpot.findById(spotId).then((spot) => {
    if (!spot) return res.status(404).send({ error: "Spot not found" });

    const review = spot.reviews.id(reviewId);
    if (!review) return res.status(404).send({ error: "Review not found" });

    if (review.creator_id !== req.user._id.toString()) {
      return res.status(403).send({ error: "You can only delete your own reviews" });
    }

    spot.reviews.pull(reviewId);
    spot.save().then((updatedSpot) => res.send(updatedSpot));
  });
});

// auth routes

router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.get("/whoami", (req, res) => {
  if (!req.user) {
    return res.send({});
  }
  res.send(req.user);
});

// user routes

router.get("/user", (req, res) => {
  if (req.query.userid) {
    User.findById(req.query.userid)
      .then((user) => {
        if (!user) return res.status(404).send({ error: "User not found" });
        res.send(user);
      })
      .catch((err) => {
        console.log(`💥 Database Error: ${err.message}`);
        res.status(500).send({ error: "Failed to fetch user" });
      });
  } else if (req.user) {
    res.send(req.user);
  } else {
    res.status(401).send({ error: "Not logged in and no user specified" });
  }
});

router.post("/user", (req, res) => {
  if (!req.user) return res.status(401).send({ error: "Not logged in" });

  User.findById(req.user._id).then((user) => {
    if (req.body.name) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.showEmail !== undefined) user.showEmail = req.body.showEmail;
    if (req.body.picture !== undefined) user.picture = req.body.picture;

    user.save().then((updatedUser) => {
      req.session.user = updatedUser;
      res.send(updatedUser);
    });
  });
});

// bookmark route

router.post("/bookmark", (req, res) => {
  if (!req.user) return res.status(401).send({ error: "Not logged in" });

  User.findById(req.user._id).then((user) => {
    if (!user) return res.status(404).send({ error: "User not found" });

    const spotId = req.body.spotId;

    if (user.bookmarked_spots.includes(spotId)) {
      user.bookmarked_spots = user.bookmarked_spots.filter((id) => id !== spotId);
    } else {
      user.bookmarked_spots.push(spotId);
    }

    user.save().then((updatedUser) => res.send(updatedUser));
  });
});

// defaults seeding

const seedDefaults = async () => {
  const stratton = await StudySpot.findOne({ name: "Stratton Student Center" });
  if (!stratton) {
    const newStratton = new StudySpot({
      name: "Stratton Student Center",
      location: "84 Massachusetts Ave",
      lat: 42.3591,
      lng: -71.0947,
      image: "/stud.jpg",
      tags: ["WiFi", "Group Study", "Food Nearby", "Outlets"],
      reviews: [],
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
      image: "/hayden.jpg",
      tags: ["WiFi", "Quiet", "Study Rooms", "Outlets", "Food Nearby"],
      reviews: [],
    });
    await newHayden.save();
    console.log("Created Hayden Library in Database!");
  }
};

seedDefaults();

module.exports = router;