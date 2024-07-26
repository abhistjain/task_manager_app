// routes/analytics.js

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to get task analytics
router.get('/analytics', authMiddleware, async (req, res) => {
    try {
      const totalTasks = await Task.countDocuments();
      const backlogTasks = await Task.countDocuments({ state: 'backlog' });
      const todoTasks = await Task.countDocuments({ state: 'todo' });
      const inProgressTasks = await Task.countDocuments({ state: 'in-progress' });
      const completedTasks = await Task.countDocuments({ state: 'done' });
  
      const lowPriorityTasks = await Task.countDocuments({ priority: 'low' });
      const mediumPriorityTasks = await Task.countDocuments({ priority: 'medium' });
      const highPriorityTasks = await Task.countDocuments({ priority: 'high' });
  
      // Due date tasks count
      const dueDateTasks = await Task.countDocuments({ dueDate: { $exists: true } });
  
      res.json({
        totalTasks,
        backlogTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        lowPriorityTasks,
        mediumPriorityTasks,
        highPriorityTasks,
        dueDateTasks,
        // Add more analytics as needed
      });
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      res.status(500).json({ error: 'Failed to fetch task analytics' });
    }
  });

module.exports = router;
