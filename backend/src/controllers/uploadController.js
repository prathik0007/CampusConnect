const { getCloudinary } = require('../config/cloudinary');

/**
 * Handle event banner upload to Cloudinary
 * POST /api/uploads/event-banner
 * Protection: authenticate, requireRole('organizer', 'admin')
 */
const uploadEventBanner = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please attach an image under the "image" field.',
      });
    }

    const cloudinary = getCloudinary();

    // Upload memory buffer directly to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusconnect/events',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }, // Automatically optimize size & delivery format
        ],
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]', error.message);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image to Cloudinary service.',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Event banner uploaded successfully',
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          },
        });
      }
    );

    // End stream with the file buffer
    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadEventBanner,
};
