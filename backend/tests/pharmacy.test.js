const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Medicine = require('../src/models/Medicine');

describe('Pharmacy Module Integration Tests', () => {
  let pharmacyToken;
  let pharmacyId;
  let clientToken;
  let clientId;
  let testMedicineId;
  let testOrderId;
  let initialStock = 25;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ihjizli_dz');
    }

    // Login Pharmacy Provider
    const pharmRes = await request(app).post('/api/auth/login').send({
      emailOrPhone: 'pharmacy.alshifa@dzly.com',
      password: 'provider123456',
    });
    expect(pharmRes.statusCode).toBe(200);
    pharmacyToken = pharmRes.body.token;
    pharmacyId = pharmRes.body.user.id;

    // Login Client
    const clientRes = await request(app).post('/api/auth/login').send({
      emailOrPhone: 'client@dzly.com',
      password: 'client123456',
    });
    expect(clientRes.statusCode).toBe(200);
    clientToken = clientRes.body.token;
    clientId = clientRes.body.user.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('1. Public Medicine Search & Geolocation', () => {
    it('should search medicines by name and return pharmacies with distance and price', async () => {
      const res = await request(app)
        .get('/api/pharmacy/search?q=Doliprane&lat=33.3683&lng=6.8673')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const first = res.body.data[0];
      expect(first).toHaveProperty('price');
      expect(first).toHaveProperty('distanceKm');
      expect(first).toHaveProperty('pharmacyName');
    });

    it('should sort medicines by cheapest when sort=cheapest', async () => {
      const res = await request(app)
        .get('/api/pharmacy/search?q=Doliprane&sort=cheapest')
        .expect(200);

      expect(res.body.success).toBe(true);
      for (let i = 0; i < res.body.data.length - 1; i++) {
        expect(res.body.data[i].price).toBeLessThanOrEqual(res.body.data[i + 1].price);
      }
    });

    it('should list nearby pharmacies sorted by distance', async () => {
      const res = await request(app)
        .get('/api/pharmacy/nearby?lat=33.3683&lng=6.8673')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('isOpen');
      expect(res.body.data[0]).toHaveProperty('address');
    });
  });

  describe('2. Pharmacy Inventory Management (Provider RBAC)', () => {
    it('should allow pharmacy provider to add a new medicine', async () => {
      const res = await request(app)
        .post('/api/pharmacy/medicines')
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .send({
          name: 'Vitamin C 1000mg Effervescent',
          genericName: 'Ascorbic Acid',
          category: 'فيتامينات ومكملات غذائية',
          dosage: 'أنبوب 20 قرص فوار',
          price: 450,
          stock: initialStock,
          requiresPrescription: false,
          description: 'فيتامين سي مقوي للمناعة ومضاد للأكسدة',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Vitamin C 1000mg Effervescent');
      expect(res.body.data.stock).toBe(initialStock);
      testMedicineId = res.body.data._id;
    });

    it('should allow pharmacy provider to update price and stock', async () => {
      const res = await request(app)
        .put(`/api/pharmacy/medicines/${testMedicineId}`)
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .send({
          price: 480,
          stock: 30,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(480);
      expect(res.body.data.stock).toBe(30);
    });

    it('should list medicines for the authenticated pharmacy', async () => {
      const res = await request(app)
        .get('/api/pharmacy/medicines')
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.some(m => m._id.toString() === testMedicineId);
      expect(found).toBe(true);
    });
  });

  describe('3. Order Placement, Commission, and Stock Deduction Lifecycle', () => {
    it('should allow client to create a pharmacy order', async () => {
      const res = await request(app)
        .post('/api/pharmacy/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          pharmacyId: pharmacyId,
          items: [
            {
              medicineId: testMedicineId,
              quantity: 2,
            },
          ],
          deliveryType: 'pickup',
          customerName: 'كريم بلحاج',
          customerPhone: '0661234567',
          notes: 'سأستلم الطلب خلال ساعتين',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('orderCode');
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.totalPrice).toBe(480 * 2); // 960
      expect(res.body.data.platformCommission).toBe(Math.round(960 * 0.05)); // 48
      expect(res.body.data.pharmacyNetEarnings).toBe(960 - 48); // 912
      testOrderId = res.body.data._id;
    });

    it('should allow pharmacy to view incoming orders', async () => {
      const res = await request(app)
        .get('/api/pharmacy/orders')
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const order = res.body.data.find(o => o._id.toString() === testOrderId);
      expect(order).toBeDefined();
      expect(order.status).toBe('pending');
    });

    it('should accept order and automatically deduct stock from medicine inventory', async () => {
      const medicineBefore = await Medicine.findById(testMedicineId);
      expect(medicineBefore.stock).toBe(30);

      const res = await request(app)
        .put(`/api/pharmacy/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .send({
          status: 'accepted',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('accepted');

      // Verify stock deduction
      const medicineAfter = await Medicine.findById(testMedicineId);
      expect(medicineAfter.stock).toBe(28); // 30 - 2
    });

    it('should progress order to ready_for_pickup and completed', async () => {
      const res1 = await request(app)
        .put(`/api/pharmacy/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .send({ status: 'ready_for_pickup' })
        .expect(200);
      expect(res1.body.data.status).toBe('ready_for_pickup');

      const res2 = await request(app)
        .put(`/api/pharmacy/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .send({ status: 'completed' })
        .expect(200);
      expect(res2.body.data.status).toBe('completed');
    });

    it('should clean up the test medicine', async () => {
      const res = await request(app)
        .delete(`/api/pharmacy/medicines/${testMedicineId}`)
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
