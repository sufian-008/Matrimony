const app = require('../server');
const { connectDB } = require('../server');

module.exports = async (req, res) => {
  // Connect to database if not already connected
  if (connectDB) {
    await connectDB();
  }
  
  // Handle the request
  return app(req, res);
};
