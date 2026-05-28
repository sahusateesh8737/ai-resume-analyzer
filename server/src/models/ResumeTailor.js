import mongoose from 'mongoose';

const DiffSchema = new mongoose.Schema({
  path: { type: String, required: true }, // e.g., "work[0].highlights[1]"
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String } // AI's reasoning for this change
});

const ResumeTailorSchema = new mongoose.Schema({
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobDescription: { type: String, required: true },
  diffs: [DiffSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ResumeTailor', ResumeTailorSchema);
