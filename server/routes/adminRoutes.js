const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload_multer");
const { authenticateToken } = require("../middleware/auth");

const {
  checkAdminExists,
  createFirstAdmin,
  createAdminByAdmin,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminAvatar,
  deleteAdmin,
  createFaculty,
  getManagedFaculty,
  getAllStudents,
  getFirstAdmin,
} = require("../controllers/adminController");

// Check if any admin exists
router.get("/exists", checkAdminExists);

// Get first admin (for faculty creation)
router.get("/first", getFirstAdmin);

// Create the first admin (without authentication)
router.post("/create-first-admin", createFirstAdmin);

// Create admin by another admin
router.post("/create-admin", createAdminByAdmin);

// Get current admin profile
router.get("/profile", authenticateToken, getAdminProfile);

// Update current admin profile
router.put("/profile", authenticateToken, updateAdminProfile);

// Upload avatar
router.post(
  "/upload-avatar",
  authenticateToken,
  upload.single("avatar"),
  uploadAdminAvatar
);

// Delete admin by ID (if needed)
router.delete("/:id", authenticateToken, deleteAdmin);

// Faculty management routes
router.post("/create-faculty", authenticateToken, createFaculty);
router.get("/managed-faculty", authenticateToken, getManagedFaculty);
router.get("/students", authenticateToken, getAllStudents);

module.exports = router;
