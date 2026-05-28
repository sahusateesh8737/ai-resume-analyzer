import mongoose from 'mongoose';

const JobApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected'], 
    default: 'Wishlist' 
  },
  dateApplied: { type: Date },
  notes: { type: String },
  salary: { type: String },
  location: { type: String }
}, { timestamps: true });

export default mongoose.model('JobApplication', JobApplicationSchema);
