const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');

exports.getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [totalBooks, totalUsers, totalBorrows, activeBorrows, overdueBorrows, totalCopies] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'member' }),
      Borrow.countDocuments(),
      Borrow.countDocuments({ status: 'borrowed' }),
      Borrow.countDocuments({ status: 'overdue' }),
      Book.aggregate([{ $group: { _id: null, total: { $sum: '$totalCopies' }, available: { $sum: '$availableCopies' } } }])
    ]);

    // Monthly borrow trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await Borrow.aggregate([
      { $match: { borrowDate: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$borrowDate' }, month: { $month: '$borrowDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Category distribution
    const categoryStats = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, borrows: { $sum: '$totalBorrows' } } },
      { $sort: { count: -1 } }
    ]);

    // Top borrowed books
    const topBooks = await Book.find().sort({ totalBorrows: -1 }).limit(5).select('title author totalBorrows coverImage');

    // Recent activity
    const recentBorrows = await Borrow.find()
      .populate('user', 'name email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 })
      .limit(10);

    // Overdue updates
    await Borrow.updateMany(
      { status: 'borrowed', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    res.json({
      stats: {
        totalBooks,
        totalUsers,
        totalBorrows,
        activeBorrows,
        overdueBorrows,
        totalCopies: totalCopies[0]?.total || 0,
        availableCopies: totalCopies[0]?.available || 0
      },
      monthlyTrend,
      categoryStats,
      topBooks,
      recentBorrows
    });
  } catch (err) { next(err); }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [activeBorrows, totalBorrows, overdueBorrows] = await Promise.all([
      Borrow.find({ user: userId, status: 'borrowed' }).populate('book', 'title author coverImage dueDate'),
      Borrow.countDocuments({ user: userId }),
      Borrow.find({ user: userId, status: 'overdue' }).populate('book', 'title author coverImage')
    ]);

    const user = await require('../models/User').findById(userId);

    res.json({
      activeBorrows,
      overdueBorrows,
      totalBorrows,
      finesDue: user.finesDue,
      memberSince: user.createdAt
    });
  } catch (err) { next(err); }
};
