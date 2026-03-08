class AppError extends Error {
  constructor(message, statusCode, success = false) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
