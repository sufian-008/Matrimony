const express = require('express');
const router = express.Router();
const { protect, checkVerified } = require('../middleware/auth');
const { uploadProfile, uploadDocument } = require('../utils/fileUpload');
const {
  createProfile,
  getMyProfile,
  getProfile,
  updateProfile,
  uploadPhotos,
  deletePhoto,
  uploadDocuments,
  deleteDocument,
  updatePrivacy,
  deleteProfile
} = require('../controllers/profile.controller');

// All routes require authentication and verified email
router.use(protect, checkVerified);

// Profile CRUD
router.post('/', uploadProfile.single('profilePhoto'), createProfile);
router.get('/me', getMyProfile);
router.get('/:id', getProfile);
router.put('/', uploadProfile.single('profilePhoto'), updateProfile);
router.delete('/', deleteProfile);

// Photos
router.post('/photos', uploadProfile.array('photos', 5), uploadPhotos);
router.delete('/photos/:photoId', deletePhoto);

// Documents
router.post('/documents', uploadDocument.array('documents', 5), uploadDocuments);
router.delete('/documents/:docId', deleteDocument);

// Privacy
router.put('/privacy', updatePrivacy);

module.exports = router;