const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const searchRoutes = require('./routes/search');
const matchRoutes = require('./routes/match');
const interactionRoutes = require('./routes/interaction');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const devRoutes = require('./routes/dev');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

// Socket.IO CORS configuration
const socketOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

const io = socketio(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow Vercel deployment URLs
      if (!origin || (origin && origin.includes('.vercel.app'))) {
        return callback(null, true);
      }
      if (socketOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:", "http://localhost:3000"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Vercel deployment URLs
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serve uploaded files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  // Allow cross-origin resource loading for images served from /uploads
  // Some browsers block images if Cross-Origin-Resource-Policy is set to same-origin.
  // Ensure the header allows cross-origin so frontend at localhost:3000 can load images.
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Rate limiting
app.use('/api/', rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/interaction', interactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dev', devRoutes); // Keep dev routes for admin creation

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('send-message', (data) => {
    io.to(data.recipientId).emit('receive-message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.recipientId).emit('user-typing', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Database connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// For Vercel serverless
if (process.env.VERCEL) {
  module.exports = app;
  module.exports.connectDB = connectDB;
} else {
  // For local development
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
  
  module.exports = { app, io };
}
