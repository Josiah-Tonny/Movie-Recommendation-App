// This file will proxy requests to your intended function
const { handler } = require('./auth/login');

// Export the same handler
exports.handler = handler;