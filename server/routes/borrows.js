const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', auth, borrowController.borrowBook);
router.put('/return/:borrowId', auth, borrowController.returnBook);
router.put('/renew/:borrowId', auth, borrowController.renewBook);
router.put('/fine/:borrowId/pay', auth, adminAuth, borrowController.payFine);
router.get('/my-borrows', auth, borrowController.getMyBorrows);
router.get('/', auth, adminAuth, borrowController.getAllBorrows);

module.exports = router;
