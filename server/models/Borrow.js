const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed' },
  fine: { type: Number, default: 0 },
  finePaid: { type: Boolean, default: false },
  renewCount: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

borrowSchema.methods.calculateFine = function () {
  if (this.status === 'returned' && this.returnDate) {
    const overdueDays = Math.max(0, Math.floor((this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24)));
    return overdueDays * 5; // ₹5 per day
  }
  if (this.status === 'borrowed' || this.status === 'overdue') {
    const now = new Date();
    const overdueDays = Math.max(0, Math.floor((now - this.dueDate) / (1000 * 60 * 60 * 24)));
    return overdueDays * 5;
  }
  return 0;
};

module.exports = mongoose.model('Borrow', borrowSchema);
