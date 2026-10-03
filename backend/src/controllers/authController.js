const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

// Email regex pattern for validation
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

/**
 * Register a new user (Student or Organizer)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    let { name, email, password, role, department, rollNumber, phone } = req.body;

    // Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
    }

    // Validate and normalize email
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format',
      });
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Security: Validate role (Public registration ONLY allows 'student' or 'organizer')
    const userRole = role ? role.toLowerCase().trim() : 'student';
    if (userRole === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Registration as admin is not permitted through public registration',
      });
    }

    if (!['student', 'organizer'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Role must be either student or organizer',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Hash password securely with bcrypt
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: userRole,
      department: department ? department.trim() : '',
      rollNumber: rollNumber ? rollNumber.trim().toUpperCase() : '',
      phone: phone ? phone.trim() : '',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=2563EB&color=fff`,
    });

    // Generate JWT token
    const token = generateToken(newUser);

    // Return safe user object (toJSON automatically removes passwordHash and __v, transforms _id -> id)
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by normalized email and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    // Generic error message to prevent account enumeration
    const INVALID_CREDENTIALS_MSG = 'Invalid email or password';

    if (!user) {
      return res.status(401).json({
        success: false,
        message: INVALID_CREDENTIALS_MSG,
      });
    }

    // Verify password with bcrypt
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: INVALID_CREDENTIALS_MSG,
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  // req.user was attached by authMiddleware.authenticate
  return res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: {
      user: req.user.toJSON(),
    },
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
