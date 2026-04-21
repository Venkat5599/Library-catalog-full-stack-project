const Book = require('../models/Book');
const Borrow = require('../models/Borrow');

exports.getAllBooks = async (req, res, next) => {
  try {
    const { search, category, availability, sort = 'newest', page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (availability === 'available') query.availableCopies = { $gt: 0 };

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { totalBorrows: -1 },
      rating: { averageRating: -1 },
      title: { title: 1 }
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query).sort(sortOption).skip(skip).limit(parseInt(limit));

    res.json({
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) { next(err); }
};

exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) { next(err); }
};

exports.createBook = async (req, res, next) => {
  try {
    const existing = await Book.findOne({ isbn: req.body.isbn });
    if (existing) return res.status(400).json({ message: 'ISBN already exists' });

    const bookData = { ...req.body, addedBy: req.user._id };
    if (req.file) bookData.coverImage = `/uploads/${req.file.filename}`;

    const book = await Book.create(bookData);
    res.status(201).json({ message: 'Book added successfully', book });
  } catch (err) { next(err); }
};

exports.updateBook = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.coverImage = `/uploads/${req.file.filename}`;

    const book = await Book.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book updated', book });
  } catch (err) { next(err); }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const activeBorrow = await Borrow.findOne({ book: req.params.id, status: 'borrowed' });
    if (activeBorrow) return res.status(400).json({ message: 'Cannot delete: book is currently borrowed' });

    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) { next(err); }
};

exports.getFeaturedBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ isFeatured: true }).limit(6);
    res.json(books);
  } catch (err) { next(err); }
};

exports.getPopularBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ totalBorrows: -1 }).limit(8);
    res.json(books);
  } catch (err) { next(err); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Book.distinct('category');
    res.json(categories);
  } catch (err) { next(err); }
};
