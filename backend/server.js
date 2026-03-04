require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const pollingService = require('./services/pollingService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const senderRoutes = require('./routes/senderRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
);
app.use(express.json());

// Rate limiting — general API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: { message: 'Too many requests, please try again later' },
});

// Rate limiting — auth routes (more generous to prevent login failures)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: { message: 'Too many login attempts, please try again later' },
});

app.use('/api/auth', authLimiter);
app.use('/api/', limiter);

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/senders', senderRoutes);
app.use('/api/emails', emailRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// ─── Socket.io Authentication ────────────────────────────────
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 User connected: ${userId}`);

    // Join user-specific room
    socket.join(userId);

    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${userId}`);
    });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Initialize polling service with Socket.io
        pollingService.init(io);
        pollingService.startPolling();

        server.listen(PORT, () => {
            console.log(`\n🚀 MailWatch server running on port ${PORT}`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   Frontend URL: ${process.env.FRONTEND_URL}\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();
