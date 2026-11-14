const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'ihjizli_super_secret_jwt_key_dz_2026_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// @desc    Register a new user (client or provider)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, city, businessName, commercialRegister, providerCategory } = req.body;

    // Check if user exists by email or phone
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني أو رقم الهاتف مسجل بالفعل في النظام',
      });
    }

    const assignedRole = role === 'admin' ? 'client' : (role || 'client');

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: assignedRole,
      city: city || 'الوادي',
      businessName: businessName || '',
      commercialRegister: commercialRegister || '',
      providerCategory: providerCategory || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        status: user.status,
        businessName: user.businessName,
        commercialRegister: user.commercialRegister,
        providerCategory: user.providerCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال البريد الإلكتروني أو الهاتف وكلمة المرور',
      });
    }

    // Find by email or phone and include password
    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد/الهاتف وكلمة المرور',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة، كلمة المرور غير مطابقة',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'تم تجميد هذا الحساب من قبل الإدارة. يرجى التواصل مع الدعم الفني.',
      });
    }

    const token = generateToken(user._id);

    // If provider, check subscription status
    let subscription = null;
    if (user.role === 'provider') {
      subscription = await Subscription.findOne({
        provider: user._id,
        status: 'active',
        endDate: { $gt: new Date() },
      }).sort({ endDate: -1 });
    }

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        status: user.status,
        avatar: user.avatar,
        businessName: user.businessName,
        commercialRegister: user.commercialRegister,
        providerCategory: user.providerCategory,
        hasActiveSubscription: Boolean(subscription),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let subscription = null;
    if (user.role === 'provider') {
      subscription = await Subscription.findOne({
        provider: user._id,
      }).sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        status: user.status,
        avatar: user.avatar,
        businessName: user.businessName,
        commercialRegister: user.commercialRegister,
        providerCategory: user.providerCategory,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, avatar, businessName, providerCategory } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    if (name) user.name = name;
    if (city) user.city = city;
    if (avatar) user.avatar = avatar;
    if (businessName) user.businessName = businessName;
    if (providerCategory) user.providerCategory = providerCategory;

    if (phone && phone !== user.phone) {
      const phoneTaken = await User.findOne({ phone, _id: { $ne: user._id } });
      if (phoneTaken) {
        return res.status(400).json({ success: false, message: 'رقم الهاتف مستخدم بالفعل بحساب آخر' });
      }
      user.phone = phone;
    }

    await user.save();

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        status: user.status,
        avatar: user.avatar,
        businessName: user.businessName,
        providerCategory: user.providerCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all users with filters
// @route   GET /api/auth/users
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, city, search, status } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (city) filter.city = city;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update user status (activate / suspend)
// @route   PATCH /api/auth/users/:id/status
// @access  Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    res.json({ success: true, message: `تم تحديث حالة المستخدم إلى ${status}`, user });
  } catch (error) {
    next(error);
  }
};

