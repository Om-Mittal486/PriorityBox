const Sender = require('../models/Sender');
const Email = require('../models/Email');

/**
 * GET /api/senders
 * Get all senders for the logged-in user
 */
const getSenders = async (req, res) => {
    try {
        const senders = await Sender.find({ userId: req.userId }).sort({
            createdAt: -1,
        });
        res.json({ senders });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch senders' });
    }
};

/**
 * POST /api/senders
 * Add a new sender
 */
const addSender = async (req, res) => {
    try {
        const { email, label } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email address is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const sender = await Sender.create({
            userId: req.userId,
            email: email.toLowerCase().trim(),
            label: label || '',
        });

        res.status(201).json({ sender });
    } catch (error) {
        if (error.code === 11000) {
            return res
                .status(400)
                .json({ message: 'This sender email is already added' });
        }
        res.status(500).json({ message: 'Failed to add sender' });
    }
};

/**
 * PUT /api/senders/:id
 * Update a sender
 */
const updateSender = async (req, res) => {
    try {
        const { email, label } = req.body;

        const sender = await Sender.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            sender.email = email.toLowerCase().trim();
        }

        if (label !== undefined) {
            sender.label = label;
        }

        await sender.save();
        res.json({ sender });
    } catch (error) {
        if (error.code === 11000) {
            return res
                .status(400)
                .json({ message: 'This sender email is already added' });
        }
        res.status(500).json({ message: 'Failed to update sender' });
    }
};

/**
 * DELETE /api/senders/:id
 * Delete a sender and all associated emails
 */
const deleteSender = async (req, res) => {
    try {
        const sender = await Sender.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        // Cascade-delete all emails from this sender
        const deleteResult = await Email.deleteMany({
            userId: req.userId,
            from: sender.email,
        });

        res.json({
            message: 'Sender deleted successfully',
            emailsDeleted: deleteResult.deletedCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete sender' });
    }
};

module.exports = { getSenders, addSender, updateSender, deleteSender };
