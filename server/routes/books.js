const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/covers';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `cover-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', bookController.getAllBooks);
router.get('/featured', bookController.getFeaturedBooks);
router.get('/popular', bookController.getPopularBooks);
router.get('/categories', bookController.getCategories);
router.get('/:id', bookController.getBookById);
router.post('/', auth, adminAuth, upload.single('coverImage'), bookController.createBook);
router.put('/:id', auth, adminAuth, upload.single('coverImage'), bookController.updateBook);
router.delete('/:id', auth, adminAuth, bookController.deleteBook);

module.exports = router;
