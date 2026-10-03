const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a JWT token with user ID and role
 * @param {Object} user - User document or object with id and role
 * @returns {string} - Signed JWT token
 */
const generateToken = (user) => {
  const secret = config.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  const payload = {
    id: user.id || user._id.toString(),
    role: user.role,
  };

  return jwt.sign(payload, secret, {
    expiresIn: config.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {Object} - Decoded payload ({ id, role, iat, exp })
 */
const verifyToken = (token) => {
  const secret = config.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
