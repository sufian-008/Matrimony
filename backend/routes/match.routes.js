const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/send-interest', authenticate, matchController.sendInterest);
router.get('/interests/received', authenticate, matchController.getReceivedInterests);
router.get('/interests/sent', authenticate, matchController.getSentInterests);
router.patch('/interests/:matchId/respond', authenticate, matchController.respondToInterest);
router.get('/matches', authenticate, matchController.getMatches);
router.post('/shortlist', authenticate, matchController.addToShortlist);
router.get('/shortlist', authenticate, matchController.getShortlist);
router.delete('/shortlist/:shortlistId', authenticate, matchController.removeFromShortlist);

module.exports = router;
