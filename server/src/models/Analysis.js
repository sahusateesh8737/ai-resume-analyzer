import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  jobDescription: { type: String, required: true },
  atsScore: { type: Number },
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  feedback: { type: String },
  coverLetter: { type: String },
  interviewQuestions: [{
    question: { type: String },
    context: { type: String },
    suggestedAnswer: { type: String }
  }],
  grammarFeedback: { type: String },
  analyzedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Analysis', AnalysisSchema);
