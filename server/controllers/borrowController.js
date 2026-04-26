const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');
const Review = require('../models/Review');

exports.borrowBook = async (req, res, next) => {
  try {
    const { bookId, borrowingDays = 14 } = req.body;
    const userId = req.user._id;

    // Validate borrowing days (7-30 days)
    if (borrowingDays < 7 || borrowingDays > 30) {
      return res.status(400).json({ message: 'Borrowing duration must be between 7 and 30 days' });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'No copies available' });

    const existing = await Borrow.findOne({ user: userId, book: bookId, status: 'borrowed' });
    if (existing) return res.status(400).json({ message: 'You already have this book borrowed' });

    const user = await User.findById(userId);
    if (user.currentBorrows >= 5) return res.status(400).json({ message: 'Borrow limit reached (max 5 books)' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowingDays);

    const borrow = await Borrow.create({ user: userId, book: bookId, dueDate, borrowingDays });

    book.availableCopies -= 1;
    book.totalBorrows += 1;
    await book.save();

    user.currentBorrows += 1;
    user.totalBorrows += 1;
    await user.save();

    const populated = await borrow.populate('book', 'title author coverImage');
    res.status(201).json({ message: 'Book borrowed successfully', borrow: populated });
  } catch (err) { next(err); }
};

exports.returnBook = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const borrow = await Borrow.findById(req.params.borrowId).populate('book');
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
    if (borrow.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (borrow.status === 'returned') return res.status(400).json({ message: 'Already returned' });

    borrow.returnDate = new Date();
    borrow.status = 'returned';
    borrow.fine = borrow.calculateFine();
    await borrow.save();

    const book = await Book.findById(borrow.book._id || borrow.book);
    book.availableCopies += 1;
    await book.save();

    const user = await User.findById(borrow.user);
    user.currentBorrows = Math.max(0, user.currentBorrows - 1);
    if (borrow.fine > 0) user.finesDue += borrow.fine;
    await user.save();

    let reviewAdded = false;
    if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
      const existingReview = await Review.findOne({ user: req.user._id, book: book._id });
      if (!existingReview) {
        await Review.create({ user: req.user._id, book: book._id, rating: Number(rating), comment: (comment || '').trim(), isVerified: true });
        const reviews = await Review.find({ book: book._id });
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Book.findByIdAndUpdate(book._id, { averageRating: Math.round(avg * 10) / 10, reviewCount: reviews.length });
        reviewAdded = true;
      }
    }

    res.json({ message: 'Book returned successfully', borrow, fine: borrow.fine, reviewAdded });
  } catch (err) { next(err); }
};

exports.renewBook = async (req, res, next) => {
  try {
    const { renewalDays = 14 } = req.body;
    const borrow = await Borrow.findById(req.params.borrowId);
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
    if (borrow.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    if (borrow.status !== 'borrowed') return res.status(400).json({ message: 'Cannot renew this borrow' });
    if (borrow.renewCount >= 2) return res.status(400).json({ message: 'Maximum renewals reached' });

    // Validate renewal days (7-30 days)
    if (renewalDays < 7 || renewalDays > 30) {
      return res.status(400).json({ message: 'Renewal duration must be between 7 and 30 days' });
    }

    borrow.dueDate = new Date(borrow.dueDate.getTime() + renewalDays * 24 * 60 * 60 * 1000);
    borrow.renewalDays = renewalDays;
    borrow.renewCount += 1;
    await borrow.save();

    res.json({ message: 'Book renewed successfully', borrow });
  } catch (err) { next(err); }
};

exports.getMyBorrows = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const borrows = await Borrow.find(query)
      .populate('book', 'title author coverImage isbn category publisher totalCopies availableCopies')
      .sort({ borrowDate: -1 });

    // Update overdue status
    const now = new Date();
    for (const b of borrows) {
      if (b.status === 'borrowed' && b.dueDate < now) {
        b.status = 'overdue';
        b.fine = b.calculateFine();
        await b.save();
      }
    }

    res.json(borrows);
  } catch (err) { next(err); }
};

exports.getAllBorrows = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Borrow.countDocuments(query);
    const borrows = await Borrow.find(query)
      .populate('user', 'name email membershipId')
      .populate('book', 'title author isbn coverImage')
      .sort({ borrowDate: -1 })
      .skip(skip).limit(parseInt(limit));

    res.json({ borrows, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

exports.payFine = async (req, res, next) => {
  try {
    const borrow = await Borrow.findById(req.params.borrowId);
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });

    borrow.finePaid = true;
    await borrow.save();

    const user = await User.findById(borrow.user);
    user.finesDue = Math.max(0, user.finesDue - borrow.fine);
    await user.save();

    res.json({ message: 'Fine paid successfully' });
  } catch (err) { next(err); }
};
