const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

const getUserDetails = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user details', error });
    }
  };
  
  const updateUserDetails = async (req, res) => {
    const { name, email, oldPassword, newPassword, addedEmails } = req.body;
  
    try {
      const user = await User.findById(req.user.id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if old password matches
      if (oldPassword && !(await user.matchPassword(oldPassword))) {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }
  
      // Update user details
      if (name) user.name = name;
      if (email) user.email = email;
      if (newPassword) user.password = newPassword;
      if (addedEmails) user.addedEmails = [...user.addedEmails, ...addedEmails];
  
      await user.save();
  
      res.json({ message: 'User details updated successfully', user });
    } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).json({ message: 'Error updating user details', error });
    }
  };

module.exports = { register, login, getUserDetails, updateUserDetails };
