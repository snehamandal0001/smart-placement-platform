import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    // Reference to the Job applied for
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must be associated with a job']
    },
    // Reference to the Student who applied
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to an applicant']
    },
    // Application Lifecycle Stages
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
        message: 'Invalid application status'
      },
      default: 'Applied'
    },
    // Snapshot of resume at the time of application
    resumeUrl: {
      type: String,
      default: ''
    },
    // Optional recruiter feedback or notes
    feedback: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Prevent a student from applying to the SAME job more than once
// Compound Unique Index: { job + applicant } must be unique together
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;