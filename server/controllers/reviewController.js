const Review = require('../models/Review');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');

exports.addReview = async (req, res, next) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user._id;

    const hasBorrowed = await Borrow.findOne({ user: userId, book: bookId, status: { $in: ['returned', 'borrowed'] } });
    if (!hasBorrowed) return res.status(403).json({ message: 'You must borrow this book before reviewing' });

    const existing = await Review.findOne({ user: userId, book: bookId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this book' });

    const review = await Review.create({ user: userId, book: bookId, rating, comment, isVerified: true });
    await review.populate('user', 'name avatar');

    // Update book rating
    const reviews = await Review.find({ book: bookId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Book.findByIdAndUpdate(bookId, { averageRating: Math.round(avg * 10) / 10, reviewCount: reviews.length });

    res.status(201).json({ message: 'Review added', review });
  } catch (err) { next(err); }
};

exports.getBookReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { next(err); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await review.deleteOne();

    const reviews = await Review.find({ book: review.book });
    const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Book.findByIdAndUpdate(review.book, { averageRating: Math.round(avg * 10) / 10, reviewCount: reviews.length });

    res.json({ message: 'Review deleted' });
  } catch (err) { next(err); }
};
