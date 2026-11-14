const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'يرجى اختيار ملف لرفعه',
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: 'تم رفع الملف بنجاح',
    fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

module.exports = router;

