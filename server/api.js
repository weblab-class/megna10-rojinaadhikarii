const express = require("express");
const router = express.Router();

const StudySpot = require("./models/studyspot"); // Import the schema [cite: 590]
const User = require("./models/user");
const auth = require("./auth");

router.get("/studyspots", (req, res) => {
  StudySpot.find({}).then((spots) => {
    res.send(spots || []);
  });
});

router.post("/studyspot", (req, res) => {
  const newSpot = new StudySpot({
    name: req.body.name,
    description: req.body.description || req.body.content,
    tags: req.body.tags || [],
    image: "/stud.jpg",
  });

  newSpot.save().then((spot) => {
    console.log("Successfully saved to DB:", spot); // Add this to your terminal log
    res.send(spot);
  });
});

router.post("/studyspot/toggle-heart", auth.ensureLoggedIn, (req, res) => {
  User.findById(req.user._id).then((user) => {
    const spotId = req.body.id;
    const index = user.favorited_spots.indexOf(spotId);
    if (index > -1) {
      user.favorited_spots.splice(index, 1);
    } else {
      user.favorited_spots.push(spotId);
    }
    user.save().then((updatedUser) => res.send(updatedUser));
  });
});

router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.get("/whoami", (req, res) => {
  if (!req.user) return res.send({});
  res.send(req.user);
});

router.use((req, res, next) => {
  console.log(`API request: ${req.method} ${req.url}`);
  next();
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|
router.get("/user", (req, res) => {
  User.findById(req.query.userid)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(500).send("User Not");
    });
});
// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
