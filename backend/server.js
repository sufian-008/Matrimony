require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeSocketIO } = require('./src/utils/socketService');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocketIO(server);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});