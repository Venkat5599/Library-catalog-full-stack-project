const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography',
           'Self-Help', 'Business', 'Arts', 'Philosophy', 'Religion', 'Travel',
           'Children', 'Comics', 'Education', 'Law', 'Medical', 'Other']
  },
  tags: [{ type: String, trim: true }],
  description: { type: String, default: '' },
  publishedYear: { type: Number },
  publisher: { type: String, default: '' },
  language: { type: String, default: 'English' },
  pages: { type: Number },
  coverImage: { type: String, default: '' },
  totalCopies: { type: Number, required: true, default: 1, min: 1 },
  availableCopies: { type: Number, required: true, default: 1, min: 0 },
  totalBorrows: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

bookSchema.index({ title: 'text', author: 'text', tags: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ availableCopies: 1 });

bookSchema.virtual('isAvailable').get(function () {
  return this.availableCopies > 0;
});

module.exports = mongoose.model('Book', bookSchema);
