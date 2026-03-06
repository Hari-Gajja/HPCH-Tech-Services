import mongoose from 'mongoose';

const studentRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    collegeName: { type: String, required: true },
    studentIdUrl: { type: String, default: '' },
    studentIdPublicId: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

export default mongoose.model('StudentRequest', studentRequestSchema);
