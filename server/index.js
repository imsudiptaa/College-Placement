require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();

// === MIDDLEWARE ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ Serve static folder for avatar access
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === MONGODB CONNECTION ===
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// === ROUTES ===
app.use("/", require("./routes/authRoutes")); // Consider using "/auth" prefix
app.use("/student", require("./routes/studentRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/faculty", require("./routes/facultyRoutes")); // ✅ Ensures /faculty/:id will work

// === HEALTH CHECK ===
app.get("/", (req, res) => {
  res.send("✅ Server is up and running");
});

// === START SERVER ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
