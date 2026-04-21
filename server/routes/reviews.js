const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', auth, reviewController.addReview);
router.get('/book/:bookId', reviewController.getBookReviews);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
