const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        gmailId: {
            type: String,
            required: true,
        },
        from: {
            type: String,
            required: true,
        },
        fromName: {
            type: String,
            default: '',
        },
        subject: {
            type: String,
            default: '(No Subject)',
        },
        snippet: {
            type: String,
            default: '',
        },
        body: {
            type: String,
            default: '',
        },
        receivedAt: {
            type: Date,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Prevent duplicate emails per user
emailSchema.index({ userId: 1, gmailId: 1 }, { unique: true });

// For efficient querying
emailSchema.index({ userId: 1, receivedAt: -1 });

module.exports = mongoose.model('Email', emailSchema);
