const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID (slug)
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف المطلوب غير موجود',
      });
    }
    res.json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { id, title, titleEn, color, icon, imageAsset, imageUrl, description, bookingFieldsSpecification } = req.body;

    const exists = await Category.findOne({ id });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'معرف التصنيف مستخدم بالفعل',
      });
    }

    const category = await Category.create({
      id,
      title,
      titleEn,
      color,
      icon,
      imageAsset,
      imageUrl,
      description,
      bookingFieldsSpecification: bookingFieldsSpecification || [],
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة التصنيف بنجاح',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود',
      });
    }

    category = await Category.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'تم تحديث التصنيف بنجاح',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({ id: req.params.id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود',
      });
    }
    res.json({
      success: true,
      message: 'تم حذف التصنيف بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

