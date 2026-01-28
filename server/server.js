require("dotenv").config();
const http = require("http");
const express = require("express");
const session = require("express-session");

let MongoStore = require("connect-mongo");
if (MongoStore.default) {
  MongoStore = MongoStore.default;
}

// connecting to mongo
const mongoose = require("mongoose");
const cors = require("cors");
const validator = require("./validator");
const api = require("./api");
const auth = require("./auth");
const socketManager = require("./server-socket");
const path = require("path");

validator.checkSetup();
const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(
  cors({
    origin: ["http://localhost:5173", "https://megna10-rojinaadhikarii-4.onrender.com"],
    credentials: true,
  })
);
app.use(validator.checkRoutes);

mongoose
  .connect(process.env.MONGO_SRV, { dbName: "flowstate-weblab" })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_SRV,
      dbName: "flowstate-weblab",
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, 
      secure: false,               
      sameSite: "lax",            
    },
  })
);

app.use(auth.populateCurrentUser);
app.use("/api", api);

const buildPath = path.join(__dirname, "..", "client", "dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

mongoose.set("strictQuery", false);

const port = 3000;
const server = http.createServer(app);
socketManager.init(server);
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});