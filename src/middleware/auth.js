const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
