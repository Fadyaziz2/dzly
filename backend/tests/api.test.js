const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Ihjizli Dz Backend Integration Tests', () => {
  let adminToken;
  let activeProviderToken;
  let expiredProviderToken;
  let clientToken;

  let activeProviderId;
  let expiredProviderId;
  let clientId;

  let testServiceId;
  let carServiceId;
  let beautyServiceId;
  let farmServiceId;
  let weddingServiceId;
  let hotelServiceId;

  let testBookingId;

  beforeAll(async () => {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ihjizli_dz');
    }

    // Login Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      emailOrPhone: 'admin@dzly.com',
      password: 'admin123456',
    });
    expect(adminRes.statusCode).toBe(200);
    adminToken = adminRes.body.token;

    // Login Active Provider
    const provActiveRes = await request(app).post('/api/auth/login').send({
      emailOrPhone: 'provider.active@dzly.com',
      password: 'provider123456',
    });
    expect(provActiveRes.statusCode).toBe(200);
    activeProviderToken = provActiveRes.body.token;
    activeProviderId = provActiveRes.body.user.id;
    expect(provActiveRes.body.user.hasActiveSubscription).toBe(true);

    // Login Expired Provider
    const provExpiredRes = await request(app).post('/api/auth/login').send({
      emailOrPhone: 'provider.expired@dzly.com',
      password: 'provider123456',
    });
    expect(provExpiredRes.statusCode).toBe(200);
    expiredProviderToken = provExpiredRes.body.token;
    expiredProviderId = provExpiredRes.body.user.id;
    expect(provExpiredRes.body.user.hasActiveSubscription).toBe(false);

    // Login Client
    const clientRes = await request(app).post('/api/auth/login').send({
      emailOrPhone: 'client@dzly.com',
      password: 'client123456',
    });
    expect(clientRes.statusCode).toBe(200);
    clientToken = clientRes.body.token;
    clientId = clientRes.body.user.id;

    // Fetch existing services to get IDs for dynamic bookings
    const servicesRes = await request(app).get('/api/services');
    expect(servicesRes.statusCode).toBe(200);
    expect(servicesRes.body.services.length).toBeGreaterThan(0);

    const srvs = servicesRes.body.services;
    carServiceId = srvs.find((s) => s.categoryId === 'cars')?._id;
    beautyServiceId = srvs.find((s) => s.categoryId === 'beauty')?._id;
    farmServiceId = srvs.find((s) => s.categoryId === 'farms')?._id;
    weddingServiceId = srvs.find((s) => s.categoryId === 'weddings')?._id;
    hotelServiceId = srvs.find((s) => s.categoryId === 'hotels')?._id;
    testServiceId = weddingServiceId || srvs[0]._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1. Health check & Basic Config
  test('GET /api/health should return online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('online');
  });

  // 2. Auth & RBAC
  test('POST /api/auth/login fails on wrong credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      emailOrPhone: 'client@dzly.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me returns current user info', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('client@dzly.com');
  });

  test('RBAC: Client cannot access admin-only routes', async () => {
    const res = await request(app)
      .get('/api/financials/admin')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.statusCode).toBe(403);
  });

  // 3. Categories & Dynamic Schema Verification
  test('GET /api/categories returns all 8 categories with dynamicFieldsSpecification', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.categories.length).toBe(8);

    const carsCat = res.body.categories.find((c) => c.id === 'cars');
    expect(carsCat).toBeDefined();
    expect(carsCat.bookingFieldsSpecification.some((f) => f.name === 'rentalDays')).toBe(true);
    expect(carsCat.bookingFieldsSpecification.some((f) => f.name === 'withDriver')).toBe(true);
  });

  // 4. Dynamic Booking Tests across sections
  test('POST /api/bookings - Cars section with dynamic fields', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: carServiceId,
        date: '2026-12-01',
        timeSlot: 'الفترة الصباحية',
        customerName: 'أحمد بن علي',
        customerPhone: '0661234567',
        dynamicFields: {
          carModel: 'Mercedes E-Class للأعراس',
          rentalDays: 3,
          withDriver: true,
          pickupLocation: 'مطار الجزائر هواري بومدين',
          dropoffLocation: 'فندق الشيراطون',
          licenseDocument: 'license_doc_sample.pdf',
        },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.dynamicFields.rentalDays).toBe(3);
    expect(res.body.booking.dynamicFields.withDriver).toBe(true);
    expect(res.body.booking.commissionAmount).toBeGreaterThan(0);
  });

  test('POST /api/bookings - Beauty section with timeSlot & specialist', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: beautyServiceId,
        date: '2026-12-05',
        timeSlot: '11:30',
        customerName: 'فاطمة الزهراء',
        customerPhone: '0665555555',
        dynamicFields: {
          subService: 'باقة تجهيز عرائس ملكية',
          specialistName: 'سارة خبيرة المكياج',
          timeSlot: '11:30',
          personsCount: 2,
        },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.dynamicFields.subService).toBe('باقة تجهيز عرائس ملكية');
  });

  test('POST /api/bookings - Farms / Pools with guests & bookingType', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: farmServiceId,
        date: '2026-12-10',
        timeSlot: 'يوم كامل',
        customerName: 'أحمد بن علي',
        customerPhone: '0661234567',
        dynamicFields: {
          bookingType: 'عائلي حصراً (Families Only)',
          guestCount: 20,
          period: 'يوم كامل مع مبيت (24 ساعة)',
          additionalServices: ['تجهيز عتاد وموقد الشواء والفحم'],
        },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.booking.dynamicFields.bookingType).toContain('عائلي');
  });

  test('POST /api/bookings - Wedding Halls with eventType & catering', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: weddingServiceId,
        date: '2026-12-15',
        timeSlot: 'فترة المساء',
        customerName: 'أحمد بن علي',
        customerPhone: '0661234567',
        dynamicFields: {
          eventType: 'حفل زفاف ملكي (عرس)',
          approximateGuests: 350,
          cateringPackage: 'باقة العشاء الكاملة',
          period: 'فترة المساء والسهرة (19:00 إلى 01:00)',
        },
      });

    expect(res.statusCode).toBe(201);
    testBookingId = res.body.booking._id;
    expect(res.body.booking.status).toBe('pending');
  });

  test('POST /api/bookings - Hotels with check-in, check-out and guests', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: hotelServiceId,
        date: '2026-12-20',
        customerName: 'أحمد بن علي',
        customerPhone: '0661234567',
        dynamicFields: {
          checkInDate: '2026-12-20',
          checkOutDate: '2026-12-23',
          adultsCount: 2,
          childrenCount: 1,
          unitOrRoomType: 'جناح عائلي Family Suite',
        },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.booking.dynamicFields.adultsCount).toBe(2);
  });

  // 5. Provider actions (Confirm, Reject, Complete)
  test('PATCH /api/bookings/:id/status - Active Provider confirms booking', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${testBookingId}/status`)
      .set('Authorization', `Bearer ${activeProviderToken}`)
      .send({ status: 'confirmed' });

    expect(res.statusCode).toBe(200);
    expect(res.body.booking.status).toBe('confirmed');
  });

  test('PATCH /api/bookings/:id/status - Active Provider rejects booking with reason', async () => {
    // Create new booking to reject
    const newBookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: weddingServiceId,
        date: '2026-12-28',
        customerName: 'سليم بن محمد',
        customerPhone: '0669999999',
      });

    const bId = newBookingRes.body.booking._id;

    const rejectRes = await request(app)
      .patch(`/api/bookings/${bId}/status`)
      .set('Authorization', `Bearer ${activeProviderToken}`)
      .send({
        status: 'rejected',
        rejectionReason: 'التاريخ محجوز مسبقاً لعرس عائلي خاص',
      });

    expect(rejectRes.statusCode).toBe(200);
    expect(rejectRes.body.booking.status).toBe('rejected');
    expect(rejectRes.body.booking.rejectionReason).toContain('التاريخ محجوز');
  });

  test('PATCH /api/bookings/:id/status - Active Provider marks completed', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${testBookingId}/status`)
      .set('Authorization', `Bearer ${activeProviderToken}`)
      .send({ status: 'completed' });

    expect(res.statusCode).toBe(200);
    expect(res.body.booking.status).toBe('completed');
  });

  // 6. Subscription Protection & Guard
  test('POST /api/services - Active Provider CAN create service', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${activeProviderToken}`)
      .send({
        categoryId: 'weddings',
        title: 'قاعة اللؤلؤة الملكية',
        subtitle: 'قاعة جديدة بالوادي',
        city: 'الوادي',
        address: 'حي الشهداء - الوادي',
        price: 75000,
        priceUnit: 'د.ج / لليلة',
        features: ['تكييف مركزي', 'موقف واسع'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.service.title).toBe('قاعة اللؤلؤة الملكية');
  });

  test('POST /api/services - Expired Provider CANNOT create service (Blocked by Subscription Guard)', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${expiredProviderToken}`)
      .send({
        categoryId: 'cars',
        title: 'سيارة تويوتا ياريس 2024',
        city: 'الوادي',
        address: 'وسط المدينة',
        price: 6000,
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.subscriptionExpired).toBe(true);
    expect(res.body.message).toContain('انتهى اشتراك حسابك');
  });

  test('PATCH /api/bookings/:id/status - Expired Provider CANNOT confirm booking', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${testBookingId}/status`)
      .set('Authorization', `Bearer ${expiredProviderToken}`)
      .send({ status: 'confirmed' });

    expect(res.statusCode).toBe(403);
    expect(res.body.subscriptionExpired).toBe(true);
  });

  // 7. Subscription Renewal & Admin Activation
  test('POST /api/subscriptions/request-renewal - Provider requests renewal', async () => {
    const res = await request(app)
      .post('/api/subscriptions/request-renewal')
      .set('Authorization', `Bearer ${expiredProviderToken}`)
      .send({
        plan: 'monthly',
        paymentMethod: 'baridimob',
        paymentReference: 'BM-TEST-12345',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/subscriptions/admin/activate - Admin activates provider subscription', async () => {
    const res = await request(app)
      .post('/api/subscriptions/admin/activate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        providerId: expiredProviderId,
        plan: 'annual',
        durationDays: 365,
        amountPaid: 50000,
        notes: 'تم الدفع نقداً بمقر الإدارة',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.subscription.status).toBe('active');
  });

  // 8. Settings & Financials
  test('GET /api/settings - Public can read settings', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.monthlySubscriptionPrice).toBe(5000);
  });

  test('PUT /api/settings - Admin can update subscription prices', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        monthlySubscriptionPrice: 6000,
        platformCommissionPercent: 12,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.settings.monthlySubscriptionPrice).toBe(6000);
    expect(res.body.settings.platformCommissionPercent).toBe(12);
  });

  test('GET /api/financials/provider - Provider gets revenue and net receivable', async () => {
    const res = await request(app)
      .get('/api/financials/provider')
      .set('Authorization', `Bearer ${activeProviderToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.confirmedEarnings).toBeGreaterThanOrEqual(0);
    expect(res.body.transactions).toBeInstanceOf(Array);
  });

  test('GET /api/financials/admin - Admin gets platform-wide KPIs', async () => {
    const res = await request(app)
      .get('/api/financials/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.kpis.totalPlatformProfit).toBeGreaterThan(0);
    expect(res.body.statusCounts).toBeDefined();
  });
});

