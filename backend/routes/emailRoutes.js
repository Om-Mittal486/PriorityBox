const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getEmails,
    getEmail,
    toggleRead,
    markAllRead,
} = require('../controllers/emailController');

router.use(auth);

router.get('/', getEmails);
router.patch('/mark-all-read', markAllRead);
router.get('/:id', getEmail);
router.patch('/:id/read', toggleRead);

module.exports = router;
