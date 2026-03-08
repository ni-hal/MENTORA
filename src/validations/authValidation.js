const AppError = require('../utils/AppError');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateSignup = (req, res, next) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return next(new AppError('All fields are required', 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError('Invalid email format', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  const upperRole = role.toUpperCase();
  if (!['PARENT', 'MENTOR'].includes(upperRole)) {
    return next(new AppError('Role must be either PARENT or MENTOR', 400));
  }

  req.body.role = upperRole;
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  next();
};

module.exports = { validateSignup, validateLogin };
