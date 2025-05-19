import { User } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * User Registration API Handler
 * 
 * This API endpoint handles new user registration:
 * 1. Validates that the request is a POST method
 * 2. Checks if a user with the provided email already exists
 * 3. Securely hashes the password using bcrypt
 * 4. Creates a new user in the database
 * 5. Returns the user data (excluding password) upon successful registration
 * 
 * @param {NextApiRequest} req - The HTTP request object containing user data in the body
 * @param {NextApiResponse} res - The HTTP response object used to send back status and data
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Step 1: Check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      // Not connected
      const mongodbUri = process.env.MONGODB_URI;
      if (!mongodbUri) {
        throw new Error('MONGODB_URI not defined in environment variables');
      }
      await mongoose.connect(mongodbUri);
    }

    // Step 2: Extract user information from request body
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Step 3: Check if user already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Step 4: Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 5: Create a new user with the provided information
    const newUser = new User({
      email,
      password: hashedPassword,
      name: name || '',
      watchlist: [],
      customLists: [],
      recommendations: []
    });
    
    // Step 6: Save the new user to the database
    await newUser.save();

    // Step 7: Prepare the user data to return in the response
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      watchlist: newUser.watchlist,
      customLists: newUser.customLists,
      recommendations: newUser.recommendations
    };

    // Step 8: Return successful response with the new user data
    res.status(201).json({ user: userResponse });
  } catch (error) {
    // Step 9: Handle any errors that might occur during registration
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
}