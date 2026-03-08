const express = require('express');
const { signup, login,  } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validations/authValidation');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter, validateSignup, signup);
router.post('/login', authLimiter, validateLogin, login);


module.exports = router;
