const multer = require('multer');

// Store temporarily in memory buffer to stream directly to Cloudinary without permanent disk persistence
const storage = multer.memoryStorage();

// Allowed image MIME types: JPEG, JPG, PNG, WEBP
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP image formats are supported.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// 5 MB maximum file size limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

module.exports = upload;
