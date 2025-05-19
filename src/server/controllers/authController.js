import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../../models/User.js';

// Register user
export const registerUser = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    console.time('registration');
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      email, 
      password: hashedPassword,
      name: name || '',
      watchlist: [], 
      customLists: [],
      recommendations: [] 
    });
    await newUser.save();

    // Create token for immediate login after registration
    const token = jwt.sign({ id: newUser._id, sessionStart: Date.now() }, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });

    console.timeEnd('registration');
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { 
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        watchlist: newUser.watchlist,
        customLists: newUser.customLists,
        recommendations: newUser.recommendations
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.time('login-process');
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user in database - optimize with lean()
    console.time('db-query');
    const user = await User.findOne({ email }).lean();
    console.timeEnd('db-query');
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Verify password
    console.time('password-compare');
    const isMatch = await bcrypt.compare(password, user.password);
    console.timeEnd('password-compare');
    
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate JWT token
    console.time('token-generation');
    const token = jwt.sign({ id: user._id, sessionStart: Date.now() }, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });
    console.timeEnd('token-generation');

    // Return user data without password
    const userData = { 
      _id: user._id,
      email: user.email,
      name: user.name || '',
      watchlist: user.watchlist || [],
      customLists: user.customLists || [],
      recommendations: user.recommendations || []
    };

    console.timeEnd('login-process');
    res.status(200).json({ 
      token, 
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    // req.user.id comes from the JWT verification middleware
    const user = await User.findById(req.user.id).lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data without password
    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      watchlist: user.watchlist,
      customLists: user.customLists,
      recommendations: user.recommendations
    };
    
    res.status(200).json({ user: userData });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating sensitive fields
    delete updates.password;
    delete updates._id;
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { $set: updates },
      { new: true }
    ).lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return updated user data without password
    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      watchlist: user.watchlist,
      customLists: user.customLists,
      recommendations: user.recommendations
    };
    
    res.status(200).json({ user: userData });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

// Logout user
export const logoutUser = (req, res) => {
  // In a stateless JWT implementation, we don't need server-side logout
  // The client is responsible for removing the token
  res.status(200).json({ message: 'Logged out successfully' });
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email }).lean();
    
    if (!user) {
      // For security reasons, always return success even if user doesn't exist
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a reset link' });
    }

    // Generate a reset token
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password_reset' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // In a production app, you would send an email with the reset link
    // For this implementation, we'll just return the token in the response
    
    res.status(200).json({ 
      message: 'If your email exists in our system, you will receive a reset link',
      // Only return this in development, remove in production
      resetToken,
      resetUrl: `/reset-password?token=${resetToken}`
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is for password reset
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    
    // Find user by id from token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Password reset error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Error resetting password' });
  }
};
