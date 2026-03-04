const User = require('../models/User');
const Sender = require('../models/Sender');
const Email = require('../models/Email');
const { fetchEmailsFromSenders } = require('./gmailService');

let io = null;
let pollingInterval = null;

/**
 * Initialize the polling service with Socket.io instance
 */
const init = (socketIo) => {
    io = socketIo;
};

/**
 * Start the email polling loop
 */
const startPolling = () => {
    const interval = parseInt(process.env.POLLING_INTERVAL) || 30000;

    console.log(`📧 Email polling started (every ${interval / 1000}s)`);

    // Run immediately on start
    pollAllUsers();

    // Then poll on interval
    pollingInterval = setInterval(pollAllUsers, interval);
};

/**
 * Stop the polling loop
 */
const stopPolling = () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('📧 Email polling stopped');
    }
};

/**
 * Poll emails for all users that have saved senders
 */
const pollAllUsers = async () => {
    try {
        // Find all users who have at least one sender
        const senders = await Sender.find().distinct('userId');

        if (senders.length === 0) return;

        for (const userId of senders) {
            try {
                await pollUserEmails(userId);
            } catch (err) {
                if (err.message === 'AUTH_ERROR') {
                    console.warn(`⚠️ Auth error for user ${userId}, skipping...`);
                } else {
                    console.error(`Error polling for user ${userId}:`, err.message);
                }
            }
        }
    } catch (error) {
        console.error('Polling error:', error.message);
    }
};

/**
 * Poll emails for a single user
 */
const pollUserEmails = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;

    const senders = await Sender.find({ userId });
    if (senders.length === 0) return;

    const senderEmails = senders.map((s) => s.email);

    // Fetch emails from Gmail
    const gmailEmails = await fetchEmailsFromSenders(user, senderEmails, 20);

    let newEmailCount = 0;

    for (const emailData of gmailEmails) {
        try {
            // Check if we already have this email
            const exists = await Email.findOne({
                userId,
                gmailId: emailData.gmailId,
            });

            if (!exists) {
                // Save new email
                const newEmail = await Email.create({
                    userId,
                    ...emailData,
                });

                newEmailCount++;

                // Emit real-time event via Socket.io
                if (io) {
                    io.to(userId.toString()).emit('new-email', {
                        email: newEmail,
                    });
                }
            }
        } catch (err) {
            // Skip duplicate key errors (race condition protection)
            if (err.code !== 11000) {
                console.error('Error saving email:', err.message);
            }
        }
    }

    if (newEmailCount > 0) {
        console.log(`📬 ${newEmailCount} new email(s) for ${user.email}`);
    }
};

module.exports = {
    init,
    startPolling,
    stopPolling,
    pollAllUsers,
    pollUserEmails,
};
