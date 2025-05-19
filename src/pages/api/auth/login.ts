import { User } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Handler for User Login
 * 
 * This API endpoint handles user authentication by:
 * 1. Validating that the request is using the POST method
 * 2. Finding the user by email in the database
 * 3. Comparing the provided password with the stored hashed password
 * 4. Returning user information without the password for security
 * 
 * @param {NextApiRequest} req - The HTTP request object containing email and password
 * @param {NextApiResponse} res - The HTTP response object used to send back results
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Step 1: Verify the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Ensure database connection - with optimization
    if (mongoose.connection.readyState !== 1) {
      // Not connected
      const mongodbUri = process.env.MONGODB_URI;
      if (!mongodbUri) {
        throw new Error('MONGODB_URI not defined in environment variables');
      }
      
      // Use cached connection if possible
      if (global.mongoose) {
        console.log('Using cached database connection');
      } else {
        console.log('Creating new database connection');
        global.mongoose = await mongoose.connect(mongodbUri);
      }
    }

    // Step 2: Extract login credentials from request body
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Step 3: Find the user in the database by email - with timeout
    console.time('Database query');
    const user = await User.findOne({ email }).lean().exec();
    console.timeEnd('Database query');
    
    // If no user found with that email, return authentication error
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Step 4: Verify password matches using bcrypt
    console.time('Password verification');
    const passwordMatches = await bcrypt.compare(password, user.password);
    console.timeEnd('Password verification');
    
    // If password doesn't match, return authentication error
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Step 5: Create a safe user object without the password
    const safeUserData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      watchlist: user.watchlist,
      customLists: user.customLists,
      recommendations: user.recommendations
    };

    // Step 6: Return success response with user data
    res.status(200).json({ user: safeUserData });
    
  } catch (error) {
    // Handle any errors that occur during the login process
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
}