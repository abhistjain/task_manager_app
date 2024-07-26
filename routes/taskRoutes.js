const express = require('express');
const { createTask, getTasks, updateTask, deleteTask, getTaskByShareToken } = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/share/:token', getTaskByShareToken);

module.exports = router;
