const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password using bcrypt
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plaintext password against a stored bcrypt hash
 * @param {string} enteredPassword
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (enteredPassword, storedHash) => {
  if (!enteredPassword || !storedHash) {
    return false;
  }
  return bcrypt.compare(enteredPassword, storedHash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
