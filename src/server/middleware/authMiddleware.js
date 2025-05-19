import jwt from 'jsonwebtoken';

// Middleware to authenticate JWT token
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Middleware to handle session timeout
export const sessionTimeout = (req, res, next) => {
  const sessionStart = req.user.sessionStart;
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes

  if (now - sessionStart > timeout) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }

  next();
};
