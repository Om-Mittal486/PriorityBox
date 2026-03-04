const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { encrypt } = require('../utils/encryption');
const {
    createOAuth2Client,
    getAuthUrl,
    getTokensFromCode,
    getUserProfile,
} = require('../services/gmailService');

/**
 * GET /api/auth/google
 * Redirect to Google OAuth consent screen
 */
const googleLogin = (req, res) => {
    const url = getAuthUrl();
    res.json({ url });
};

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/login?error=no_code`
            );
        }

        // Exchange code for tokens
        const tokens = await getTokensFromCode(code);

        // Get user profile
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials(tokens);
        const profile = await getUserProfile(oauth2Client);

        // Create or update user
        const userData = {
            googleId: profile.id,
            email: profile.email,
            name: profile.name,
            avatar: profile.picture || '',
            accessToken: encrypt(tokens.access_token),
            refreshToken: encrypt(tokens.refresh_token),
            tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        };

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            // Update existing user
            Object.assign(user, userData);
            await user.save();
        } else {
            // Create new user
            user = await User.create(userData);
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`);
    } catch (error) {
        console.error('Google callback error:', error.message);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select(
            '-accessToken -refreshToken -tokenExpiry'
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

module.exports = { googleLogin, googleCallback, getMe, logout };
