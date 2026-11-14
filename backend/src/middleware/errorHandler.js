const errorHandler = (err, req, res, next) => {
  console.error('Error Handler Caught:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'حدث خطأ غير متوقع في الخادم الداخلي';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'المعرف المطلوب غير موجود أو غير صالح';
    statusCode = 404;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `القيمة المدخلة في الحقل (${field}) مستخدمة بالفعل، يرجى اختيار قيمة أخرى`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;

