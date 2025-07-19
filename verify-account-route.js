// Add this route to your server.js or routes file

/**
 * @route POST /verify-account
 * @desc Verify a user account manually
 * @access Public
 */
router.post('/verify-account', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Try to find the user in different collections (student, faculty, admin)
    let user = await Student.findOne({ email });
    let userType = 'student';
    
    if (!user) {
      user = await Faculty.findOne({ email });
      userType = 'faculty';
    }
    
    if (!user) {
      user = await Admin.findOne({ email });
      userType = 'admin';
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update verification status
    user.isVerified = true;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: `${userType} account verified successfully`,
    });
  } catch (error) {
    console.error('Verify account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during verification',
    });
  }
});