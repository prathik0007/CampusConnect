const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadEventBanner } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const handleSingleUpload = (req, res, next) => {
  const uploadMiddleware = upload.single('image');

  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || 'File upload error.',
        status: 'ERROR'
      });
    }
    next();
  });
};

router.post('/event-banner', protect, authorize('ORGANIZER'), handleSingleUpload, uploadEventBanner);

module.exports = router;
