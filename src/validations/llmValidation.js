const AppError = require('../utils/AppError');

const validateSummarize = (req, res, next) => {
  const { text } = req.body;

  if (!text) {
    return next(new AppError('Text is required', 400));
  }

  if (text.length < 50) {
    return next(new AppError('Text must be at least 50 characters', 400));
  }

  if (text.length > 10000) {
    return next(new AppError('Text exceeds maximum length of 10000 characters', 413));
  }

  next();
};

module.exports = { validateSummarize };
