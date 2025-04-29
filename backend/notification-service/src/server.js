const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

// Routes
const notificationRoutes = require("./Routes/notification");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:8081",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Routes
app.use("/notification", notificationRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));

module.exports = app;

