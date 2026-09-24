import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
      unique: true, 
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
    skills: {
      type: [String], 
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
    companyName: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving
userSchema.pre('save', async function () { 
  if (!this.isModified('password')) {
    return; 
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;