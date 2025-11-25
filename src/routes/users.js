const express = require('express');
const User = require('../models/User');
const filterService = require('../services/filterService');
const { authenticateToken } = require('../middleware/auth-simple');

const router = express.Router();

// Create/update user criteria (protected route)
router.post('/criteria', authenticateToken, (req, res) => {
  try {
    const { criteria } = req.body;
    const userId = req.user.userId;
    const userEmail = req.user.email;
    
    if (!criteria) {
      return res.status(400).json({ error: 'Criteria is required' });
    }

    let user = filterService.getUser(userId);
    
    if (!user) {
      // Create new user with Supabase ID
      user = new User(userId, userEmail, criteria);
      filterService.addUser(user);
    } else {
      // Update existing user criteria
      user.updateCriteria(criteria);
    }
    
    res.status(201).json({
      message: 'User criteria saved successfully',
      user: {
        id: user.id,
        email: user.email,
        criteria: user.criteria,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile (protected route)
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const user = filterService.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User profile not found',
        message: 'Please set up your filtering criteria first'
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      criteria: user.criteria,
      createdAt: user.createdAt,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user criteria (protected route)
router.put('/criteria', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const user = filterService.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    user.updateCriteria(req.body);
    
    res.json({
      message: 'Criteria updated successfully',
      criteria: user.criteria
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user notifications (protected route)
router.get('/notifications', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = filterService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check user criteria
router.get('/debug', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const user = filterService.getUser(userId);
    
    res.json({
      userId: userId,
      userExists: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        criteria: user.criteria
      } : null,
      allUsers: filterService.getAllUsers().map(u => ({ id: u.id, email: u.email }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;