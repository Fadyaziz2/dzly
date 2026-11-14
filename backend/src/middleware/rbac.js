// Role-Based Access Control Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالوصول',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `دورك الحالي (${req.user.role}) لا يملك الصلاحية للقيام بهذا الإجراء`,
      });
    }

    next();
  };
};

module.exports = { authorize };

