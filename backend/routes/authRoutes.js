const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    googleLogin,
    googleCallback,
    getMe,
    logout,
} = require('../controllers/authController');

// Public routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// Protected routes
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

module.exports = router;
