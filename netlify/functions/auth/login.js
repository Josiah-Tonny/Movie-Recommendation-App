const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configure CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const { email, password } = JSON.parse(event.body);

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ email });
    
    if (!user) {
      await client.close();
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      await client.close();
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await client.close();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          watchlist: user.watchlist || []
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