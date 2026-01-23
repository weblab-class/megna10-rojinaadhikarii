require("dotenv").config();
const http = require("http");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const validator = require("./validator");
const api = require("./api");
const auth = require("./auth");
const socketManager = require("./server-socket");

validator.checkSetup();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(validator.checkRoutes);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "session-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(auth.populateCurrentUser);
app.use("/api", api);


mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_SRV, { dbName: "flowstate-weblab" })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const port = 3000;
const server = http.createServer(app);
socketManager.init(server);
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
