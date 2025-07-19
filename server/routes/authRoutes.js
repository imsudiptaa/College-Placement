const express = require("express");
const router = express.Router();
const { login, me, registerStudent, verifyOTP, resendOTP, generateOTP, verifyAccount } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { sendOTPEmail } = require("../services/mailService");
const Student = require("../models/Student");

router.post("/login", login);
router.get("/me", authenticateToken, me);
router.post("/register-student", registerStudent);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/verify-account", verifyAccount);

// Endpoint to check and fix verification status
router.get("/check-verification/:email", async (req, res) => {
  try {
    const email = req.params.email;
    console.log(`Checking verification status for: ${email}`);
    
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    console.log(`Current verification status: ${student.isVerified}`);
    
    // Force set verification to true if needed
    if (!student.isVerified) {
      student.isVerified = true;
      await student.save();
      console.log(`Fixed verification status for ${email}`);
    }
    
    res.json({ 
      email: student.email,
      isVerified: student.isVerified,
      message: "Verification status checked and fixed if needed"
    });
  } catch (error) {
    console.error("Verification check error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/send-otp", async (req, res) => {
  try {
    // This endpoint is needed for the initial OTP sending
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    if (!email.endsWith('@nsec.ac.in')) {
      return res.status(400).json({ message: 'Email must be from @nsec.ac.in domain' });
    }
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent && existingStudent.isVerified) {
      return res.status(400).json({ message: 'Email is already registered and verified. Please login.' });
    }
    
    // Generate OTP and store in memory
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store OTP in memory
    const { otpStore } = require('../controllers/authController');
    otpStore.set(email, { otp, expiry: otpExpiry });
    
    console.log(`Generated OTP for ${email}: ${otp}, expires at ${otpExpiry}`);
    console.log(`OTP Store size: ${otpStore.size}`);
    
    // Send OTP via email
    await sendOTPEmail(email, otp);
    
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

module.exports = router;
