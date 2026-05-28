import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: { type: String },
  fileUrl: { type: String }, // If storing in AWS S3 or Cloudinary
  extractedText: { type: String, required: true }, // The raw text from the PDF
  structuredData: { type: mongoose.Schema.Types.Mixed }, // Parsed JSON Resume Standard data
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Resume', ResumeSchema);
