const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Enhanced CORS headers for development and production
const headers = {
  'Access-Control-Allow-Origin': '*',  // Allow requests from any origin
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',  // 24 hours
  'Access-Control-Allow-Credentials': 'true'
};

exports.handler = async (event, context) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { email, password, name } = JSON.parse(event.body);

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      await client.close();
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'User already exists' })
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      name,
      watchlist: [],
      favorites: []  // Add favorites array for consistency
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await client.close();
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        token, 
        user: {
          id: result.insertedId.toString(),
          email,
          name,
          watchlist: [],
          favorites: []  // Add favorites to response
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Server error', error: error.message })
    };
  }
};