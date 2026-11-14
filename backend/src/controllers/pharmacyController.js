const Medicine = require('../models/Medicine');
const PharmacyOrder = require('../models/PharmacyOrder');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5; // fallback average distance
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Generate unique order code PH-XXXX
function generateOrderCode() {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'PH-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// @desc    Smart search for medicines across pharmacies with distance & price comparison
// @route   GET /api/pharmacy/search
// @access  Public
exports.searchMedicines = async (req, res, next) => {
  try {
    const { q, lat, lng, sort = 'nearby', category } = req.query;
    const clientLat = parseFloat(lat) || 33.3683; // Default El Oued center
    const clientLng = parseFloat(lng) || 6.8673;

    const filter = { isActive: true, stock: { $gt: 0 } };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ name: regex }, { genericName: regex }, { category: regex }];
    }

    if (category && category.trim()) {
      filter.category = category.trim();
    }

    const medicines = await Medicine.find(filter)
      .populate({
        path: 'pharmacy',
        select: 'name businessName phone city address location isOpen status avatar',
      })
      .lean();

    // Filter out inactive or suspended pharmacies
    const available = medicines.filter(
      (m) => m.pharmacy && m.pharmacy.status !== 'suspended'
    );

    // Attach distance to each result
    const results = available.map((m) => {
      const p = m.pharmacy;
      const pLng = p.location?.coordinates?.[0] || 6.8673;
      const pLat = p.location?.coordinates?.[1] || 33.3683;
      const distance = calculateDistanceKm(clientLat, clientLng, pLat, pLng);

      return {
        _id: m._id,
        id: m._id.toString(),
        name: m.name,
        genericName: m.genericName,
        category: m.category,
        dosage: m.dosage,
        price: m.price,
        stock: m.stock,
        requiresPrescription: m.requiresPrescription,
        image: m.image,
        description: m.description,
        distanceKm: distance,
        pharmacyId: p._id,
        pharmacyName: p.businessName || p.name,
        pharmacyPhone: p.phone,
        pharmacyAddress: p.address || p.city,
        pharmacyCity: p.city,
        pharmacyIsOpen: p.isOpen !== false,
      };
    });

    // Sort results
    if (sort === 'cheapest') {
      results.sort((a, b) => a.price - b.price);
    } else {
      // Default: sort by distance (nearby)
      results.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get nearby pharmacies
// @route   GET /api/pharmacy/nearby
// @access  Public
exports.getNearbyPharmacies = async (req, res, next) => {
  try {
    const clientLat = parseFloat(req.query.lat) || 33.3683;
    const clientLng = parseFloat(req.query.lng) || 6.8673;

    const pharmacies = await User.find({
      role: 'provider',
      providerType: 'pharmacy',
      status: { $ne: 'suspended' },
    })
      .select('name businessName phone city address location isOpen openingHours avatar')
      .lean();

    const results = pharmacies.map((p) => {
      const pLng = p.location?.coordinates?.[0] || 6.8673;
      const pLat = p.location?.coordinates?.[1] || 33.3683;
      const distance = calculateDistanceKm(clientLat, clientLng, pLat, pLng);
      return {
        _id: p._id,
        id: p._id.toString(),
        name: p.businessName || p.name,
        phone: p.phone,
        city: p.city,
        address: p.address || p.city,
        isOpen: p.isOpen !== false,
        openingHours: p.openingHours || 'على مدار 24 ساعة',
        distanceKm: distance,
        location: p.location,
        avatar: p.avatar,
      };
    });

    results.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get inventory / medicines list for pharmacy or public
// @route   GET /api/pharmacy/medicines
// @access  Public or Protected
exports.getMedicines = async (req, res, next) => {
  try {
    let pharmacyId = req.query.pharmacyId;

    // If logged in as pharmacy provider, default to own inventory
    if (!pharmacyId && req.user && req.user.role === 'provider') {
      pharmacyId = req.user._id;
    }

    const filter = { isActive: true };
    if (pharmacyId) {
      filter.pharmacy = pharmacyId;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.q) {
      const regex = new RegExp(req.query.q.trim(), 'i');
      filter.$or = [{ name: regex }, { genericName: regex }];
    }

    const medicines = await Medicine.find(filter)
      .populate('pharmacy', 'name businessName phone city address')
      .sort({ createdAt: -1 })
      .lean();

    // Mark low stock items
    const data = medicines.map((m) => ({
      ...m,
      isLowStock: m.stock <= 5,
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add single or bulk medicines to inventory
// @route   POST /api/pharmacy/medicines
// @access  Protected (Provider: Pharmacy or Admin)
exports.addMedicines = async (req, res, next) => {
  try {
    const pharmacyId = req.user._id;

    // Bulk creation
    if (Array.isArray(req.body.medicines) && req.body.medicines.length > 0) {
      const toInsert = req.body.medicines.map((m) => ({
        ...m,
        pharmacy: pharmacyId,
      }));
      const created = await Medicine.insertMany(toInsert);
      return res.status(201).json({
        success: true,
        count: created.length,
        data: created,
        message: `تم إضافة ${created.length} دواء بنجاح للمخزون`,
      });
    }

    // Single creation
    const {
      name,
      genericName,
      category,
      dosage,
      price,
      stock,
      requiresPrescription,
      image,
      description,
      barcode,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'اسم الدواء والسعر مطلوبان',
      });
    }

    const medicine = await Medicine.create({
      pharmacy: pharmacyId,
      name,
      genericName,
      category,
      dosage,
      price: Number(price),
      stock: Number(stock) || 0,
      requiresPrescription: Boolean(requiresPrescription),
      image: image || '',
      description: description || '',
      barcode: barcode || '',
    });

    res.status(201).json({
      success: true,
      data: medicine,
      message: 'تم إضافة الدواء للمخزون بنجاح',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update medicine price / stock
// @route   PUT /api/pharmacy/medicines/:id
// @access  Protected (Provider: Pharmacy or Admin)
exports.updateMedicine = async (req, res, next) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'الدواء غير موجود' });
    }

    // Check ownership
    if (
      req.user.role !== 'admin' &&
      medicine.pharmacy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل أدوية صيدلية أخرى',
      });
    }

    medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: medicine,
      message: 'تم تحديث بيانات الدواء بنجاح',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or deactivate medicine
// @route   DELETE /api/pharmacy/medicines/:id
// @access  Protected (Provider: Pharmacy or Admin)
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'الدواء غير موجود' });
    }

    // Check ownership
    if (
      req.user.role !== 'admin' &&
      medicine.pharmacy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذا الدواء',
      });
    }

    await Medicine.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف الدواء من المخزون بنجاح',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new pharmacy order
// @route   POST /api/pharmacy/orders
// @access  Protected (Client)
exports.createOrder = async (req, res, next) => {
  try {
    const {
      pharmacyId,
      items,
      prescriptionImage,
      deliveryType = 'pickup',
      deliveryAddress = '',
      customerName,
      customerPhone,
      customerNotes = '',
    } = req.body;

    if (!pharmacyId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'بيانات الطلب غير مكتملة، يرجى اختيار دواء واحد على الأقل',
      });
    }

    const pharmacy = await User.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'الصيدلية غير موجودة' });
    }

    // Calculate item prices and verify stock
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const med = await Medicine.findById(item.medicineId || item.medicine);
      if (!med) {
        return res.status(400).json({
          success: false,
          message: `الدواء المطلوب (${item.name || ''}) لم يعد متاحاً`,
        });
      }

      const qty = parseInt(item.quantity) || 1;
      if (med.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `الكمية المتاحة من ${med.name} هي (${med.stock} علبة) فقط`,
        });
      }

      const unitPrice = med.price;
      const subtotal = unitPrice * qty;
      total += subtotal;

      validatedItems.push({
        medicine: med._id,
        name: med.name,
        dosage: med.dosage,
        quantity: qty,
        unitPrice,
        subtotal,
      });
    }

    const orderCode = generateOrderCode();

    const order = await PharmacyOrder.create({
      orderCode,
      client: req.user._id,
      pharmacy: pharmacy._id,
      pharmacyName: pharmacy.businessName || pharmacy.name,
      pharmacyPhone: pharmacy.phone,
      pharmacyAddress: pharmacy.address || pharmacy.city,
      items: validatedItems,
      prescriptionImage: prescriptionImage || '',
      deliveryType,
      deliveryAddress,
      customerName: customerName || req.user.name,
      customerPhone: customerPhone || req.user.phone,
      customerNotes,
      totalPrice: total,
      status: 'pending',
    });

    // Notify pharmacy provider
    await Notification.create({
      user: pharmacy._id,
      title: 'طلب دواء جديد 💊',
      body: `طلب شراء جديد #${orderCode} من العميل ${order.customerName} بقيمة ${total} د.ج`,
      type: 'pharmacy_order',
      relatedId: order._id.toString(),
    });

    res.status(201).json({
      success: true,
      data: order,
      message: 'تم إرسال طلب الدواء للصيدلية بنجاح وبانتظار الموافقة',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pharmacy orders (for client, pharmacy provider, or admin)
// @route   GET /api/pharmacy/orders
// @access  Protected
exports.getOrders = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'client') {
      filter.client = req.user._id;
    } else if (req.user.role === 'provider') {
      filter.pharmacy = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await PharmacyOrder.find(filter)
      .populate('client', 'name phone city')
      .populate('pharmacy', 'name businessName phone city address')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update pharmacy order status (Accept, Reject, Progress)
// @route   PATCH /api/pharmacy/orders/:id/status
// @access  Protected (Provider: Pharmacy or Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const order = await PharmacyOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    // Check ownership
    if (
      req.user.role !== 'admin' &&
      order.pharmacy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتحديث حالة هذا الطلب',
      });
    }

    // If accepting for the first time, deduct stock from inventory
    if (status === 'accepted' && order.status === 'pending') {
      for (const item of order.items) {
        await Medicine.findByIdAndUpdate(item.medicine, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    order.status = status;
    if (rejectionReason) {
      order.rejectionReason = rejectionReason;
    }

    await order.save();

    // Notify client about status update
    const statusMessages = {
      accepted: 'تم قبول طلبك للصيدلية وجارٍ التحضير',
      preparing: 'طلبك قيد التجهيز الآن في الصيدلية',
      ready_for_pickup: 'طلبك جاهز للاستلام من الصيدلية',
      out_for_delivery: 'طلبك خرج للتوصيل مع المندوب',
      completed: 'تم تسليم طلب الدواء بنجاح، نتمنى لك الشفاء العاجل',
      rejected: `تم الاعتذار عن الطلب: ${rejectionReason || 'غير متوفر حالياً'}`,
    };

    if (statusMessages[status]) {
      await Notification.create({
        user: order.client,
        title: `تحديث طلب الدواء #${order.orderCode}`,
        body: statusMessages[status],
        type: 'pharmacy_order_status',
        relatedId: order._id.toString(),
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'تم تحديث حالة الطلب بنجاح',
    });
  } catch (err) {
    next(err);
  }
};
