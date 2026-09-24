import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must be associated with a job']
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to an applicant']
    },
    status: {
    type: String,
    enum: ['Applied', 'OA', 'Interview', 'Offered', 'Rejected'],
    default: 'Applied'
  },
    resumeUrl: {
      type: String,
      required: true,
      default: ''
    },
    resumeText: { type: String, default: '' }, //Stores the parsed PDF text
    feedback: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;