const express = require('express');
const router = express.Router();
const devController = require('../controllers/devController');
const { protect } = require('../middleware/auth');

// Create admin account (POST) — first-time setup
router.post('/create-admin', devController.createAdmin);

// Dev-only seed endpoint (POST) — create sample users/profiles/chats
router.post('/seed', devController.seed);

// Public profiles for demo (GET) — no auth required
router.get('/profiles', devController.getPublicProfiles);

module.exports = router;
