const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getSenders,
    addSender,
    updateSender,
    deleteSender,
} = require('../controllers/senderController');

router.use(auth);

router.get('/', getSenders);
router.post('/', addSender);
router.put('/:id', updateSender);
router.delete('/:id', deleteSender);

module.exports = router;
