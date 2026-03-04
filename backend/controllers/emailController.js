const Email = require('../models/Email');
const User = require('../models/User');
const Reply = require('../models/Reply');
const pollingService = require('../services/pollingService');
const { sendReply } = require('../services/gmailService');

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

/**
 * POST /api/emails/refresh
 * Trigger a Gmail poll for the current user and return updated emails
 */
const refreshEmails = async (req, res) => {
    try {
        // Trigger a fresh poll from Gmail
        await pollingService.pollUserEmails(req.userId);

        // Return updated email list
        const [emails, total] = await Promise.all([
            Email.find({ userId: req.userId })
                .sort({ receivedAt: -1 })
                .limit(20),
            Email.countDocuments({ userId: req.userId }),
        ]);

        const unreadCount = await Email.countDocuments({
            userId: req.userId,
            isRead: false,
        });

        res.json({
            emails,
            pagination: {
                page: 1,
                limit: 20,
                total,
                pages: Math.ceil(total / 20),
            },
            unreadCount,
        });
    } catch (error) {
        console.error('Refresh emails error:', error.message);
        res.status(500).json({ message: 'Failed to refresh emails' });
    }
};

/**
 * POST /api/emails/:id/reply
 * Reply to an email
 */
const replyToEmail = async (req, res) => {
    try {
        const { body: replyBody } = req.body;

        if (!replyBody || !replyBody.trim()) {
            return res.status(400).json({ message: 'Reply body is required' });
        }

        // Find the original email
        const email = await Email.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Get user with tokens
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the reply via Gmail
        await sendReply(user, email, replyBody.trim());

        // Save the sent reply to the database
        const toAddress = email.fromName
            ? `${email.fromName} <${email.from}>`
            : email.from;
        const subject = email.subject.startsWith('Re:')
            ? email.subject
            : `Re: ${email.subject}`;

        const reply = await Reply.create({
            userId: req.userId,
            emailId: email._id,
            to: toAddress,
            subject,
            body: replyBody.trim(),
        });

        res.json({ message: 'Reply sent successfully', reply });
    } catch (error) {
        console.error('Reply error:', error.message);
        if (error.response?.data) {
            console.error('Reply error details:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.message === 'AUTH_ERROR') {
            return res.status(401).json({ message: 'Gmail authorization expired. Please log out and log back in.' });
        }
        // Detect insufficient permissions (missing gmail.send scope)
        if (error.message?.includes('Insufficient Permission') || error.response?.status === 403) {
            return res.status(403).json({ message: 'Insufficient Gmail permissions. Please log out and log back in to grant send access.' });
        }
        res.status(500).json({ message: 'Failed to send reply. Check server logs for details.' });
    }
};

/**
 * GET /api/emails/replies
 * Get all sent replies for the current user
 */
const getReplies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [replies, total] = await Promise.all([
            Reply.find({ userId: req.userId })
                .sort({ sentAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('emailId', 'subject from fromName'), // Get context of what was replied to
            Reply.countDocuments({ userId: req.userId }),
        ]);

        res.json({
            replies,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Fetch replies error:', error.message);
        res.status(500).json({ message: 'Failed to fetch replies' });
    }
};

module.exports = { getEmails, getEmail, toggleRead, markAllRead, refreshEmails, replyToEmail, getReplies };
