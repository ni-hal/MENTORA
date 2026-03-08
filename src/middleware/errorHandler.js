const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.success = err.success !== undefined ? err.success : false;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      success: err.success,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      success: err.success,
      message: err.isOperational ? err.message : 'Something went wrong'
    });
  }
};

module.exports = errorHandler;
