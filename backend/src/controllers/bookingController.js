const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const Subscription = require('../models/Subscription');

// Helper to generate booking code
const generateBookingCode = async () => {
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    code = `DZ-${randomNum}`;
    const existing = await Booking.findOne({ bookingCode: code });
    if (!existing) isUnique = true;
  }
  return code;
};

// @desc    Create new dynamic booking
// @route   POST /api/bookings
// @access  Private (Client)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      serviceId,
      date,
      timeSlot,
      customerName,
      customerPhone,
      customerNotes,
      dynamicFields,
      customPrice,
    } = req.body;

    const service = await Service.findById(serviceId).populate('provider');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة المراد حجزها غير موجودة',
      });
    }

    // Determine total price:
    // If client supplied custom calculated price (e.g. from dynamic calculation on mobile), validate or default to service discounted price
    let calculatedTotal = service.discountedPrice;
    if (customPrice && Number(customPrice) > 0) {
      calculatedTotal = Number(customPrice);
    } else if (dynamicFields) {
      // Dynamic calculations based on category:
      if (service.categoryId === 'cars' && dynamicFields.rentalDays) {
        const days = Math.max(1, Number(dynamicFields.rentalDays));
        let daily = service.discountedPrice;
        if (dynamicFields.withDriver) {
          daily += 3000; // 3000 DZD driver fee per day
        }
        calculatedTotal = daily * days;
      } else if ((service.categoryId === 'hotels' || service.categoryId === 'houses') && dynamicFields.checkInDate && dynamicFields.checkOutDate) {
        const inDate = new Date(dynamicFields.checkInDate);
        const outDate = new Date(dynamicFields.checkOutDate);
        const diffTime = Math.abs(outDate - inDate);
        const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        calculatedTotal = service.discountedPrice * nights;
      } else if (service.categoryId === 'beauty' && dynamicFields.personsCount) {
        const count = Math.max(1, Number(dynamicFields.personsCount));
        calculatedTotal = service.discountedPrice * count;
      }
    }

    // Get current platform settings for commission
    let settings = await Settings.findOne({ key: 'global_settings' });
    const commissionRate = settings ? settings.platformCommissionPercent : 10;
    const commissionAmount = Math.round((calculatedTotal * commissionRate) / 100);
    const providerNet = calculatedTotal - commissionAmount;

    const bookingCode = await generateBookingCode();

    const booking = await Booking.create({
      bookingCode,
      client: req.user._id,
      service: service._id,
      provider: service.provider._id,
      categoryId: service.categoryId,
      serviceTitle: service.title,
      city: service.city,
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || 'الفترة المسائية',
      customerName: customerName || req.user.name,
      customerPhone: customerPhone || req.user.phone,
      customerNotes: customerNotes || '',
      dynamicFields: dynamicFields || {},
      totalPrice: calculatedTotal,
      commissionRate,
      commissionAmount,
      providerNet,
      status: 'pending',
    });

    // Send notification to provider
    await Notification.create({
      user: service.provider._id,
      title: `طلب حجز جديد (#${bookingCode})`,
      body: `وصلك طلب حجز جديد لخدمة "${service.title}" من العميل ${customerName || req.user.name}`,
      bookingId: bookingCode,
      serviceId: service._id,
    });

    res.status(201).json({
      success: true,
      message: 'تم إرسال طلب الحجز بنجاح وهو بانتظار تأكيد المزود',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get client's own bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Client)
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { client: req.user._id };

    if (status === 'active') {
      filter.status = { $in: ['pending', 'confirmed'] };
    } else if (status === 'past') {
      filter.status = { $in: ['completed', 'cancelled', 'rejected'] };
    } else if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('service', 'title imageAsset images accentColor price priceUnit address city')
      .populate('provider', 'name phone email businessName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Client cancels booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Client)
exports.cancelBooking = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findOne({
      $or: [{ _id: req.params.id }, { bookingCode: req.params.id }],
      client: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز المطلوب غير موجود أو لا يخص حسابك',
      });
    }

    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن إلغاء الحجز لأنه بحالة (${booking.status}) مسبقاً`,
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'تم الإلغاء من قبل العميل';
    await booking.save();

    // Notify provider
    await Notification.create({
      user: booking.provider,
      title: `تم إلغاء الحجز (#${booking.bookingCode})`,
      body: `قام العميل ${booking.customerName} بإلغاء حجزه لخدمة "${booking.serviceTitle}"`,
      bookingId: booking.bookingCode,
      serviceId: booking.service,
    });

    res.json({
      success: true,
      message: 'تم إلغاء الحجز بنجاح',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider bookings
// @route   GET /api/bookings/provider-bookings
// @access  Private (Provider)
exports.getProviderBookings = async (req, res, next) => {
  try {
    const { status, categoryId, search } = req.query;
    const filter = { provider: req.user._id };

    if (status) filter.status = status;
    if (categoryId) filter.categoryId = categoryId;
    if (search) {
      filter.$or = [
        { bookingCode: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { serviceTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('service', 'title imageAsset images accentColor price address')
      .populate('client', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Provider updates booking status (confirm, reject, complete)
// @route   PATCH /api/bookings/:id/status
// @access  Private (Provider)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['confirmed', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'الحالة المختارة غير صالحة، يجب أن تكون confirmed أو rejected أو completed',
      });
    }

    // Check provider subscription
    const activeSub = await Subscription.findOne({
      provider: req.user._id,
      status: 'active',
      endDate: { $gt: new Date() },
    });

    if (!activeSub && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        message: 'لا يمكنك اتخاذ إجراء على الحجوزات لأن اشتراكك منتهٍ أو غير مفعل. يرجى تجديد اشتراكك أولاً.',
      });
    }

    const booking = await Booking.findOne({
      $or: [{ _id: req.params.id }, { bookingCode: req.params.id }],
      provider: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود أو لا يتبع لخدماتك',
      });
    }

    booking.status = status;
    if (status === 'rejected') {
      booking.rejectionReason = rejectionReason || 'تم الرفض لعدم توفر الموعد أو لأسباب تشغيلية';
    }
    await booking.save();

    // Notify client
    const statusArabic =
      status === 'confirmed' ? 'تأكيد' : status === 'rejected' ? 'اعتذار عن قبول' : 'إتمام';

    await Notification.create({
      user: booking.client,
      title: `تم ${statusArabic} حجزك (#${booking.bookingCode})`,
      body:
        status === 'confirmed'
          ? `تهانينا! أكد مزود الخدمة حجزك لـ "${booking.serviceTitle}" بتاريخ ${booking.date}.`
          : status === 'rejected'
          ? `نعتذر منك، لم يتمكن مزود الخدمة من تأكيد حجزك: ${booking.rejectionReason}`
          : `تم إتمام تقديم الخدمة بنجاح، شكراً لاختيارك احجزلي Dz!`,
      bookingId: booking.bookingCode,
      serviceId: booking.service,
    });

    res.json({
      success: true,
      message: `تم تحديث حالة الحجز إلى (${status}) بنجاح`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all bookings in platform
// @route   GET /api/bookings/admin/all
// @access  Private (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, categoryId, city, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (categoryId) filter.categoryId = categoryId;
    if (city && city !== 'كل الولايات') filter.city = city;
    if (search) {
      filter.$or = [
        { bookingCode: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { serviceTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('provider', 'name phone email businessName city')
      .populate('client', 'name phone email')
      .populate('service', 'title price accentColor address')
      .sort({ createdAt: -1 });

    // Summary calculations
    const totalVolume = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalCommissions = bookings
      .filter((b) => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.commissionAmount || 0), 0);

    res.json({
      success: true,
      count: bookings.length,
      analytics: {
        totalVolume,
        totalCommissions,
      },
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

