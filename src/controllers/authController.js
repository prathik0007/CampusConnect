const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password.',
        status: 'ERROR'
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
        status: 'ERROR'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.',
        status: 'ERROR'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email address already exists.',
        status: 'ERROR'
      });
    }

    const parsedRole = (role && role.toUpperCase() === 'ORGANIZER') ? 'ORGANIZER' : 'STUDENT';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: parsedRole
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      message: 'Server error during registration.',
      status: 'ERROR'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide both email and password.',
        status: 'ERROR'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
        status: 'ERROR'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
        status: 'ERROR'
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      message: 'Server error during login.',
      status: 'ERROR'
    });
  }
};

const getMe = async (req, res) => {
  try {
    const userObj = {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    };

    return res.status(200).json({
      user: userObj,
      data: userObj,
      ...userObj
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      message: 'Server error retrieving user details.',
      status: 'ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
