import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
      type: String,
      required: [true, 'Please provide the company name'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Please provide a location (e.g. Remote, Bangalore)'],
      trim: true
    },
    salary: {
      type: String,
      required: [true, 'Please provide salary details or LPA range'],
      default: 'Not Disclosed'
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Please provide at least one required skill'],
      default: []
    },
    jobType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Internship', 'Contract'],
      default: 'Full-Time'
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open'
    },
    // Relational field: Links this job directly to the User (Recruiter) who posted it
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the 'User' model
      required: false // We will set this to true when auth is implemented in Day 9
    }
  },
  {
    timestamps: true
  }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;