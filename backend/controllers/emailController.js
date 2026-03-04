const Email = require('../models/Email');

/**
 * GET /api/emails
 * Get all emails for the logged-in user (paginated)
 */
const getEmails = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [emails, total] = await Promise.all([
            Email.find({ userId: req.userId })
                .sort({ receivedAt: -1 })
                .skip(skip)
                .limit(limit),
            Email.countDocuments({ userId: req.userId }),
        ]);

        const unreadCount = await Email.countDocuments({
            userId: req.userId,
            isRead: false,
        });

        res.json({
            emails,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            unreadCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch emails' });
    }
};

/**
 * GET /api/emails/:id
 * Get a single email with full body
 */
const getEmail = async (req, res) => {
    try {
        const email = await Email.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        res.json({ email });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch email' });
    }
};

/**
 * PATCH /api/emails/:id/read
 * Toggle read/unread status
 */
const toggleRead = async (req, res) => {
    try {
        const email = await Email.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        email.isRead = !email.isRead;
        await email.save();

        const unreadCount = await Email.countDocuments({
            userId: req.userId,
            isRead: false,
        });

        res.json({ email, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update email' });
    }
};

/**
 * PATCH /api/emails/mark-all-read
 * Mark all emails as read
 */
const markAllRead = async (req, res) => {
    try {
        await Email.updateMany(
            { userId: req.userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: 'All emails marked as read', unreadCount: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark emails as read' });
    }
};

module.exports = { getEmails, getEmail, toggleRead, markAllRead };
