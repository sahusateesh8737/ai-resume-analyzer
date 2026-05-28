import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 5 }, // For usage limits
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
