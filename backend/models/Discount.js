import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    note: {
      type: String,
      default: '',
      maxlength: 200,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Discount', discountSchema);
