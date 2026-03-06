import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;
