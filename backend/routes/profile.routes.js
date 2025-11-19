const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadPhoto } = require('../middleware/upload.middleware');

router.get('/me', authenticate, profileController.getMyProfile);
router.get('/:userId', authenticate, profileController.getProfile);
router.put('/update', authenticate, profileController.updateProfile);
router.post('/upload-photo', authenticate, uploadPhoto.single('photo'), profileController.uploadPhoto);
router.post('/upload-photos', authenticate, uploadPhoto.array('photos', 5), profileController.uploadPhotos);
router.delete('/delete-photo', authenticate, profileController.deletePhoto);
router.patch('/privacy', authenticate, profileController.updatePrivacy);
router.post('/upload-document', authenticate, uploadPhoto.single('document'), profileController.uploadDocument);

module.exports = router;