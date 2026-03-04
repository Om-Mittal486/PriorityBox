const { google } = require('googleapis');
const { decrypt, encrypt } = require('../utils/encryption');
const User = require('../models/User');

/**
 * Create an OAuth2 client
 */
const createOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

/**
 * Get an authenticated OAuth2 client for a user
 * Handles token refresh automatically
 */
const getAuthenticatedClient = async (user) => {
    const oauth2Client = createOAuth2Client();

    const accessToken = decrypt(user.accessToken);
    const refreshToken = decrypt(user.refreshToken);

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: user.tokenExpiry ? new Date(user.tokenExpiry).getTime() : null,
    });

    // Listen for token refresh events
    oauth2Client.on('tokens', async (tokens) => {
        try {
            const updateData = {};
            if (tokens.access_token) {
                updateData.accessToken = encrypt(tokens.access_token);
            }
            if (tokens.refresh_token) {
                updateData.refreshToken = encrypt(tokens.refresh_token);
            }
            if (tokens.expiry_date) {
                updateData.tokenExpiry = new Date(tokens.expiry_date);
            }
            await User.findByIdAndUpdate(user._id, updateData);
        } catch (err) {
            console.error('Error updating refreshed tokens:', err.message);
        }
    });

    return oauth2Client;
};

/**
 * Get the Google OAuth consent URL
 */
const getAuthUrl = () => {
    const oauth2Client = createOAuth2Client();
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/gmail.readonly',
        ],
    });
};

/**
 * Exchange authorization code for tokens
 */
const getTokensFromCode = async (code) => {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

/**
 * Get user profile info from Google
 */
const getUserProfile = async (oauth2Client) => {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data;
};

/**
 * Fetch recent emails from Gmail for specific senders
 */
const fetchEmailsFromSenders = async (user, senderEmails, maxResults = 10) => {
    try {
        const oauth2Client = await getAuthenticatedClient(user);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        if (!senderEmails || senderEmails.length === 0) {
            return [];
        }

        // Build query: from:(sender1@email.com OR sender2@email.com)
        const fromQuery = senderEmails.map((e) => `from:${e}`).join(' OR ');
        const query = `(${fromQuery}) newer_than:1d`;

        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults,
        });

        if (!response.data.messages || response.data.messages.length === 0) {
            return [];
        }

        // Fetch full details for each message
        const emails = await Promise.all(
            response.data.messages.map(async (msg) => {
                try {
                    const detail = await gmail.users.messages.get({
                        userId: 'me',
                        id: msg.id,
                        format: 'full',
                    });
                    return parseGmailMessage(detail.data);
                } catch (err) {
                    console.error(`Error fetching message ${msg.id}:`, err.message);
                    return null;
                }
            })
        );

        return emails.filter(Boolean);
    } catch (error) {
        console.error(`Error fetching emails for user ${user.email}:`, error.message);
        if (error.code === 401 || error.code === 403) {
            throw new Error('AUTH_ERROR');
        }
        throw error;
    }
};

/**
 * Parse a Gmail API message into a clean object
 */
const parseGmailMessage = (message) => {
    const headers = message.payload?.headers || [];

    const getHeader = (name) => {
        const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
    };

    const from = getHeader('From');
    const subject = getHeader('Subject') || '(No Subject)';
    const date = getHeader('Date');

    // Extract email address from "Name <email>" format
    const emailMatch = from.match(/<(.+?)>/);
    const fromEmail = emailMatch ? emailMatch[1].toLowerCase() : from.toLowerCase();
    const fromName = emailMatch ? from.replace(/<.+?>/, '').trim() : '';

    // Get email body
    let body = '';
    if (message.payload) {
        body = extractBody(message.payload);
    }

    return {
        gmailId: message.id,
        from: fromEmail,
        fromName: fromName.replace(/"/g, ''),
        subject,
        snippet: message.snippet || '',
        body,
        receivedAt: date ? new Date(date) : new Date(),
    };
};

/**
 * Recursively extract the email body from Gmail payload
 */
const extractBody = (payload) => {
    // If the payload has a body with data, decode it
    if (payload.body && payload.body.data) {
        return Buffer.from(payload.body.data, 'base64url').toString('utf-8');
    }

    // If the payload has parts, search through them
    if (payload.parts) {
        // Prefer HTML part
        const htmlPart = payload.parts.find(
            (p) => p.mimeType === 'text/html'
        );
        if (htmlPart && htmlPart.body && htmlPart.body.data) {
            return Buffer.from(htmlPart.body.data, 'base64url').toString('utf-8');
        }

        // Fall back to plain text
        const textPart = payload.parts.find(
            (p) => p.mimeType === 'text/plain'
        );
        if (textPart && textPart.body && textPart.body.data) {
            return Buffer.from(textPart.body.data, 'base64url').toString('utf-8');
        }

        // Recursively check nested parts
        for (const part of payload.parts) {
            const body = extractBody(part);
            if (body) return body;
        }
    }

    return '';
};

module.exports = {
    createOAuth2Client,
    getAuthenticatedClient,
    getAuthUrl,
    getTokensFromCode,
    getUserProfile,
    fetchEmailsFromSenders,
    parseGmailMessage,
};
