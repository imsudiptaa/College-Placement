// This is a simple script to help verify a user account
// You can run this on your server to manually verify a user

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the Student schema (simplified version)
const studentSchema = new mongoose.Schema({
  email: String,
  isVerified: Boolean
});

const Student = mongoose.model('Student', studentSchema);

// Function to verify a student by email
async function verifyStudent(email) {
  try {
    const student = await Student.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );
    
    if (!student) {
      console.log(`Student with email ${email} not found`);
      return false;
    }
    
    console.log(`Student ${email} verified successfully`);
    return true;
  } catch (error) {
    console.error('Error verifying student:', error);
    return false;
  }
}

// Example usage:
// verifyStudent('mdrehanfarooque.aiml2022@nsec.ac.in')
//   .then(() => mongoose.disconnect());

// Export the function for use in other files
module.exports = { verifyStudent };