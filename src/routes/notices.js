const express = require('express');
const tedService = require('../services/tedService');

const router = express.Router();

// Get all notices (optionally filtered by user criteria)
router.get('/', (req, res) => {
  try {
    const notices = tedService.getAllNotices();
    
    // If user is authenticated and has criteria, filter notices
    const userId = req.query.userId;
    if (userId) {
      const filterService = require('../services/filterService');
      const user = filterService.getUser(userId);
      
      if (user && user.criteria) {
        const filtered = notices.filter(notice => user.matchesNotice(notice));
        return res.json(filtered);
      }
    }
    
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notice by ID
router.get('/:id', (req, res) => {
  try {
    const notice = tedService.getNoticeById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger notice fetching (for testing)
router.post('/fetch', async (req, res) => {
  try {
    const { date, maxPages } = req.body;
    
    // Validate date is provided
    if (!date) {
      return res.status(400).json({ 
        error: 'Date is required',
        message: 'Please provide a date in YYYY-MM-DD format'
      });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }
    
    // Fetch notices for the specific date
    const pages = maxPages || 30; // Default 30 pages = 3000 notices per day
    const newNotices = await tedService.fetchAndProcessNotices({ 
      date,
      maxPages: pages 
    });
    
    res.json({
      message: `Notices fetched for ${date}`,
      date: date,
      count: newNotices.length,
      notices: newNotices,
      totalInSystem: tedService.getAllNotices().length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;