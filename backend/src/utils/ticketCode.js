const crypto = require('crypto');

/**
 * Generate a clean, unique, human-readable ticket code
 * Format: CC-XXXX-XXXX
 * Uses unambiguous alphanumeric characters (excluding 0, O, 1, I)
 */
const generateTicketCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = crypto.randomBytes(8);
  let part1 = '';
  let part2 = '';

  for (let i = 0; i < 4; i++) {
    part1 += chars[bytes[i] % chars.length];
  }
  for (let i = 4; i < 8; i++) {
    part2 += chars[bytes[i] % chars.length];
  }

  return `CC-${part1}-${part2}`;
};

module.exports = {
  generateTicketCode,
};
