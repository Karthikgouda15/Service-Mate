const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Attach io to app for use in controllers
app.set('io', io);

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
// app.use(mongoSanitize()); // Disabled due to Node v23 Getter-only error on IncomingMessage
// app.use(xss()); // Disabled due to Node v23 Getter-only error on IncomingMessage

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'ServiceMate API is running...' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.io initialization
require('./sockets/socketHandlers')(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
