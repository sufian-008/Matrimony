const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Multer error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      error: err.toString()
    });
  }
  next();
};

router.post('/create', protect, profileController.createProfile);
router.get('/stats', protect, profileController.getDashboardStats);
router.get('/me', protect, profileController.getMyProfile); // Alias for my-profile
router.get('/my-profile', protect, profileController.getMyProfile);
router.put('/update', protect, profileController.updateProfile);
router.get('/:profileId', protect, profileController.getProfileById);
router.post('/upload-photo', protect, upload.single('photo'), handleMulterError, profileController.uploadPhoto);
router.delete('/photo/:photoId', protect, profileController.deletePhoto);
router.post('/upload-document', protect, upload.single('document'), handleMulterError, profileController.uploadDocument);
router.put('/privacy', protect, profileController.updatePrivacy);
router.get('/view/:profileId', protect, profileController.viewProfile);

module.exports = router;
