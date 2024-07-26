const express = require('express');
const { register, login, getUserDetails, updateUserDetails } = require('../controllers/authController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.route('/me').get(authMiddleware, getUserDetails).put(authMiddleware, updateUserDetails);

module.exports = router;
