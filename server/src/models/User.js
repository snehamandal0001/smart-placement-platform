import mongoose from 'mongoose';

// Define the blueprint for User documents
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true, // Prevents duplicate accounts with the same email
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'recruiter'],
        message: 'Role must be either student or recruiter'
      },
      default: 'student'
    },
    // Student-specific fields
    skills: {
      type: [String], // Array of strings e.g. ["React", "Node.js"]
      default: []
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
      default: null
    },
    resumeUrl: {
      type: String,
      default: ''
    },
    // Recruiter-specific fields
    companyName: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    // Automatically creates `createdAt` and `updatedAt` date fields
    timestamps: true
  }
);

// Create the Mongoose model from the schema
const User = mongoose.model('User', userSchema);

export default User;