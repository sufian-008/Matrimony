const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { protect } = require('../middleware/auth');

router.post('/interest/:profileId', protect, interactionController.sendInterest);
router.put('/interest/:interactionId', protect, interactionController.respondToInterest);
router.post('/shortlist/:profileId', protect, interactionController.addToShortlist);
router.delete('/shortlist/:profileId', protect, interactionController.removeFromShortlist);
router.get('/shortlists', protect, interactionController.getMyShortlists);
router.post('/favorite/:profileId', protect, interactionController.addToFavorites);
router.delete('/favorite/:profileId', protect, interactionController.removeFromFavorites);
router.get('/favorites', protect, interactionController.getMyFavorites);
router.get('/interests/sent', protect, interactionController.getSentInterests);
router.get('/interests/received', protect, interactionController.getReceivedInterests);
router.post('/block/:profileId', protect, interactionController.blockUser);

module.exports = router;
