const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        emailId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Email',
            required: true,
        },
        to: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        sentAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// For efficient querying by user
replySchema.index({ userId: 1, sentAt: -1 });

module.exports = mongoose.model('Reply', replySchema);
