import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  requestPasswordReset,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name: name || '',
      watchlist: [],
      customLists: [],
      recommendations: []
    });
    
    await newUser.save();

    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      watchlist: newUser.watchlist,
      customLists: newUser.customLists,
      recommendations: newUser.recommendations
    };

    res.status(201).json({ user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login endpoint - optimized without timeouts
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user in the database
    const user = await User.findOne({ email }).lean();
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatches = await bcrypt.compare(password, user.password);
    
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, sessionStart: Date.now() }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30m' }
    );

    // Return user data without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      watchlist: user.watchlist || [],
      customLists: user.customLists || [],
      recommendations: user.recommendations || []
    };

    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Add logout endpoint
router.post('/logout', (req, res) => {
  // JWT is stateless, so we don't need to do anything server-side
  // This endpoint is just for completeness
  res.status(200).json({ message: 'Logged out successfully' });
});

// Add these routes to handle password reset
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
