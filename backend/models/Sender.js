const mongoose = require('mongoose');

const senderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        label: {
            type: String,
            default: '',
            trim: true,
        },
    },
    { timestamps: true }
);

// Ensure a user can't add the same sender email twice
senderSchema.index({ userId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Sender', senderSchema);
