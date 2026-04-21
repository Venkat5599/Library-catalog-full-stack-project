const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/admin', auth, adminAuth, dashboardController.getAdminStats);
router.get('/user', auth, dashboardController.getUserStats);

module.exports = router;
