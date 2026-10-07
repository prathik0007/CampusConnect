const { uploadBufferToCloudinary } = require('../config/cloudinary');

const uploadEventBanner = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: 'Please select an image file to upload.',
        status: 'ERROR'
      });
    }

    const result = await uploadBufferToCloudinary(file.buffer);

    if (!result || !result.secure_url) {
      return res.status(500).json({
        message: 'Failed to retrieve Cloudinary image URL.',
        status: 'ERROR'
      });
    }

    const imageUrl = result.secure_url;

    return res.status(200).json({
      imageUrl,
      bannerUrl: imageUrl,
      url: imageUrl,
      image: imageUrl,
      publicId: result.public_id,
      message: 'Image uploaded successfully to Cloudinary'
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return res.status(500).json({
      message: error.message || 'Error uploading image to Cloudinary.',
      status: 'ERROR'
    });
  }
};

module.exports = {
  uploadEventBanner
};
