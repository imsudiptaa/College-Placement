// services/mailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify email configuration
console.log('Email configuration:', {
  service: 'Gmail',
  user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '...' : 'Not set',
  pass: process.env.EMAIL_PASSWORD ? 'Set (hidden)' : 'Not set'
});

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP transporter failed:', err);
  } else {
    console.log('SMTP transporter is ready');
  }
});

const sendPasswordResetEmail = async (email, resetToken, userType) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&type=${userType.toLowerCase()}`;

  const mailOptions = {
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset for your ${userType} account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp) => {
  console.log(`Preparing to send OTP email to ${email} with OTP: ${otp}`);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - NSEC Placement Portal',
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <h1 style="color: #4a90e2; font-size: 32px; text-align: center;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send OTP email to ${email}:`, error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendOTPEmail,
};
