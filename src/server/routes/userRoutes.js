import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user profile route - protected with JWT authentication
router.get('/profile', authenticateToken, getUserProfile);

// Update user profile route - protected with JWT authentication
router.put('/profile', authenticateToken, updateUserProfile);

// Add to watchlist route
router.post('/watchlist', authenticateToken, async (req, res) => {
  try {
    const { id, title, poster_path, media_type } = req.body;
    
    if (!id || !title || !media_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Check if movie/show is already in watchlist
    const existingItem = user.watchlist.find(item => item.id === id);
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in watchlist' });
    }
    
    // Add to watchlist
    user.watchlist.push({
      id,
      title,
      poster_path,
      media_type,
      date_added: new Date()
    });
    
    await user.save();
    
    res.status(200).json({ 
      message: 'Added to watchlist',
      watchlist: user.watchlist
    });
  } catch (err) {
    console.error('Add to watchlist error:', err);
    res.status(500).json({ message: 'Error updating watchlist' });
  }
});

// Remove from watchlist route
router.delete('/watchlist/:id', authenticateToken, async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const user = await User.findById(req.user.id);
    user.watchlist = user.watchlist.filter(item => item.id !== itemId);
    
    await user.save();
    
    res.status(200).json({ 
      message: 'Removed from watchlist',
      watchlist: user.watchlist
    });
  } catch (err) {
    console.error('Remove from watchlist error:', err);
    res.status(500).json({ message: 'Error updating watchlist' });
  }
});

export default router;
