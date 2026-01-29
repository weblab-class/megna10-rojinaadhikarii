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
  if (!req.user) return res.status(401).send({ error: "not logged in" });

  if (!req.body.image || req.body.image.trim() === "") {
    return res.status(400).send({ error: "an image is required to create a study spot." });
  }

  const newSpot = new StudySpot({
    creator_id: req.user._id,
    creator_name: req.user.name, // saves the name for new spots
    name: req.body.name,
    location: req.body.location,
    lat: req.body.lat,
    lng: req.body.lng,
    tags: req.body.tags || [],
    image: req.body.image,
    reviews: [],
  });
  newSpot.save().then((spot) => res.send(spot));
});

router.delete("/studyspot", (req, res) => {
  const admins = ["YOUR_ID", "ROJINA_ID"];
  const spotId = req.query.spotId;
  StudySpot.findByIdAndDelete(spotId)
    .then((deleted) => {
      if (!deleted) {
        return res.status(404).send({ error: "spot not found" });
      }

      // 3. Check permissions
      const isCreator = String(spot.creator_id) === String(req.user._id);
      const isAdmin = admins.includes(String(req.user._id));

      if (isCreator || isAdmin) {
        // 4. Authorized! Now perform the deletion
        return StudySpot.findByIdAndDelete(spotId);
      } else {
        // 5. Not authorized
        throw new Error("UNAUTHORIZED");
      }
    })

    .then((deleted) => {
      // If we reach here, it was deleted (unless the error was thrown above)
      if (deleted) res.send({ msg: "deleted successfully" });
    })
    .catch((err) => {
      if (err.message === "UNAUTHORIZED") {
        res.status(403).send({ error: "You do not have permission to delete this spot." });
      } else {
        console.log("delete error:", err);
        res.status(500).send({ error: "delete failed" });
      }
    });
});

// review routes

router.post("/review", (req, res) => {
  const { spotId, content, rating } = req.body;

  if (!spotId || spotId.length !== 24) {
    return res.status(400).send({ error: "invalid id format." });
  }

  StudySpot.findById(spotId)
    .then((spot) => {
      if (!spot) return res.status(404).send({ error: "spot not found" });

      const newReview = {
        creator_id: req.user._id,
        creator_name: req.user.name,
        creator_picture: req.user.picture,
        content: content,
        rating: rating,
        timestamp: new Date(),
      };

      spot.reviews.push(newReview);
      return spot.save();
    })
    .then((updatedSpot) => {
      return User.findByIdAndUpdate(req.user._id, { $inc: { reviewCount: 1 } }, { new: true }).then(
        (updatedUser) => {
          req.session.user = updatedUser;
          res.send({ spot: updatedSpot, user: updatedUser });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ error: "database error" });
    });
});

router.post("/review/delete", (req, res) => {
  if (!req.user) return res.status(401).send({ error: "not logged in" });

  const { spotId, reviewId } = req.body;

  StudySpot.findById(spotId).then((spot) => {
    if (!spot) return res.status(404).send({ error: "spot not found" });

    const review = spot.reviews.id(reviewId);
    if (!review) return res.status(404).send({ error: "review not found" });

    if (review.creator_id !== req.user._id.toString()) {
      return res.status(403).send({ error: "you can only delete your own reviews" });
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

router.get("/users/all", (req, res) => {
  User.find({}).then((users) => {
    res.send(users);
  });
});

router.get("/user", (req, res) => {
  if (req.query.userid) {
    User.findById(req.query.userid)
      .then((user) => {
        if (!user) return res.status(404).send({ error: "user not found" });
        res.send(user);
      })
      .catch((err) => {
        console.log(`💥 database error: ${err.message}`);
        res.status(500).send({ error: "failed to fetch user" });
      });
  } else if (req.user) {
    res.send(req.user);
  } else {
    res.status(401).send({ error: "not logged in and no user specified" });
  }
});

router.post("/user", (req, res) => {
  if (!req.user) return res.status(401).send({ error: "not logged in" });

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
  if (!req.user) return res.status(401).send({ error: "not logged in" });

  User.findById(req.user._id).then((user) => {
    if (!user) return res.status(404).send({ error: "user not found" });

    const spotId = req.body.spotId;

    if (user.bookmarked_spots.includes(spotId)) {
      user.bookmarked_spots = user.bookmarked_spots.filter((id) => id !== spotId);
    } else {
      user.bookmarked_spots.push(spotId);
    }

    user.save().then((updatedUser) => res.send(updatedUser));
  });
});

// defaults seeding & database fixes

const fixMissingCreatorNames = async () => {
  const spots = await StudySpot.find({ creator_name: { $exists: false } });
  if (spots.length > 0) {
    console.log(`found ${spots.length} spots without names. fixing...`);
    for (const spot of spots) {
      const user = await User.findById(spot.creator_id);
      if (user) {
        spot.creator_name = user.name;
        await spot.save();
      }
    }
    console.log("database names updated!");
  }
};

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
    console.log("created stratton student center in database!");
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
    console.log("created hayden library in database!");
  }
};

// run fix then seed
fixMissingCreatorNames().then(seedDefaults);

module.exports = router;