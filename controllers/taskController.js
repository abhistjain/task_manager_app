const Task = require('../models/Task');
const User = require('../models/User');

const createTask = async (req, res) => {
    const { title, priority, dueDate, assignedTo, checklist, sharedWith } = req.body;
  
    try {
      // Find the users by their emails
      const assignedUsers = await User.find({ email: { $in: assignedTo } });
  
      if (!assignedUsers ) {
        return res.status(404).json({ message: 'Assigned user(s) not found' });
      }
  
      const task = new Task({
        title,
        priority,
        dueDate,
        assignedTo: assignedUsers.map(user => user.id), // Store emails in assignedTo array
        sharedWith,
        checklist,
        createdBy: req.user.id
      });
  
      const savedTask = await task.save();
      res.status(201).json(savedTask);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ message: 'Failed to create task' });
    }
};

const getTasks = async (req, res) => {
    try {
        const { state, dateFilter } = req.query;
        const query = { createdBy: req.user.id };

        if (state) {
            query.state = state; // Filter by state if provided
        }

        if (dateFilter === 'today') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            query.dueDate = { $gte: todayStart, $lte: todayEnd };
        } else if (dateFilter === 'this-week') {
            const startOfWeek = new Date();
            startOfWeek.setHours(0, 0, 0, 0);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            query.dueDate = { $gte: startOfWeek, $lte: endOfWeek };
        } else if (dateFilter === 'this-month') {
            const startOfMonth = new Date();
            startOfMonth.setHours(0, 0, 0, 0);
            startOfMonth.setDate(1);
            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);
            endOfMonth.setDate(0);
            endOfMonth.setHours(23, 59, 59, 999);
            query.dueDate = { $gte: startOfMonth, $lte: endOfMonth };
        }

        const tasks = await Task.find(query)
            .sort({ dueDate: 1 })
            .populate('sharedWith', 'email') // Populate sharedWith if needed
            .exec();

        // Extract unique assignedTo IDs from all tasks
        const assignedToIds = tasks.reduce((acc, task) => {
            acc.push(...task.assignedTo);
            return acc;
        }, []);

        // Find users corresponding to assignedTo IDs
        const assignedUsers = await User.find({ _id: { $in: assignedToIds } });

        // Map assignedTo IDs to emails
        const assignedEmailsMap = {};
        assignedUsers.forEach(user => {
            assignedEmailsMap[user._id.toString()] = user.email;
        });

        // Replace assignedTo IDs with emails in tasks
        const tasksWithAssignedEmails = tasks.map(task => ({
            ...task.toObject(),
            assignedTo: task.assignedTo.map(id => assignedEmailsMap[id])
        }));

        res.json(tasksWithAssignedEmails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};



const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, priority, dueDate, state, checklist } = req.body;

    try {
        const task = await Task.findById(id);

        if (!task || task.createdBy.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.title = title || task.title;
        task.priority = priority || task.priority;
        task.dueDate = dueDate || task.dueDate;
        task.state = state || task.state;
        
        if (checklist) {
            task.checklist = checklist.map(item => ({
                text: item.text,
                completed: item.completed || false
            }));
        }

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this task' });
        }

        console.log(`Task ${id} successfully deleted`);
        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error(`Error deleting task ${id}:`, error);
        res.status(500).json({ message: 'Error deleting task', error });
    }
};

const getTaskByShareToken = async (req, res) => {
    try {
        const task = await Task.findOne({ shareToken: req.params.token });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error('Error fetching task by share token:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getTaskByShareToken };
