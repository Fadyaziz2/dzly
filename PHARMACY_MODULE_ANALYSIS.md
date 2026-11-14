# وثيقة التحليل الفني والهندسي لمنظومة الصيدليات وطلب الأدوية (Pharmacy & Medicine Module)
**منصة "احجزلي Dz" — نظام موحد ومتكامل لكافة الخدمات في الجزائر**

---

## 1. الفلسفة المعمارية لقسم الصيدليات مقارنة بباقي الأقسام
تختلف الصيدليات عن الخدمات التقليدية (مثل حجز قاعة أو كراء سيارة أو موعد حلاقة) بأنها:
1. **قائمة على المخزون اللحظي (Real-time Inventory-driven):** الدواء مرتبط بكمية مخزنة تتناقص عند تأكيد كل طلب (`stock`).
2. **شديدة الحساسية للموقع الجغرافي (Location & Proximity-critical):** المريض أو ذووه يبحثون عن أقرب صيدلية مفتوحة لتسريع الحصول على العلاج، خصوصاً في الحالات الطارئة.
3. **محكومة بالرقابة الطبية والقانونية (Prescription Regulation):** تتطلب أدوية محددة روشتة طبية معتمدة (`requiresPrescription: true`)، مما يوجب رفع صورة الروشتة وفحصها من قبل الصيدلي قبل الاعتماد.
4. **مقارنة الأسعار وتوافر الدواء (Price & Availability Comparison):** توفير محرك بحث ذكي يبحث بالاسم التجاري أو العلمي (Generic Name)، ويعرض صيدليات الولاية التي يتوفر لديها الدواء مع مقارنة فورية بين الأسعار والمسافة بالكيلومترات.

---

## 2. النماذج وقواعد البيانات (Data Architecture & Mongoose Schemas)

### أ. تحديث نموذج المستخدم / مزود الخدمة (`User`)
* إضافة حقل `providerType: { type: String, enum: ['general', 'pharmacy'], default: 'general' }`
* إضافة حقل الإحداثيات الجغرافية:
  ```json
  "location": {
    "type": { "type": String, "enum": ["Point"], "default": "Point" },
    "coordinates": { "type": [Number], "default": [6.8673, 33.3683] } // [lng, lat]
  }
  ```
* إنشاء فهرس جيوجرافي ثنائي الأبعاد: `userSchema.index({ location: '2dsphere' })`.

### ب. نموذج كتالوج ومخزون الأدوية (`Medicine`)
```javascript
{
  pharmacy: { type: ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, index: true }, // مثل: Doliprane 1000mg
  genericName: { type: String, default: '', index: true },        // مثل: Paracetamol
  category: { 
    type: String, 
    enum: ['مسكنات وخافضات حرارة', 'مضادات حيوية', 'فيتامينات ومكملات', 'أمراض مزمنة', 'أطفال ورضع', 'عناية جلدية ومستحضرات', 'أخرى'],
    default: 'مسكنات وخافضات حرارة'
  },
  dosage: { type: String, default: '' },                           // مثل: 1000mg أقراص
  price: { type: Number, required: true, min: 0 },                 // السعر بالدينار الجزائري د.ج
  stock: { type: Number, required: true, min: 0, default: 0 },     // الكمية المتاحة
  requiresPrescription: { type: Boolean, default: false },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}
```

### ج. نموذج طلبات الصيدلية (`PharmacyOrder`)
```javascript
{
  orderCode: { type: String, required: true, unique: true, index: true }, // PH-XXXX
  client: { type: ObjectId, ref: 'User', required: true, index: true },
  pharmacy: { type: ObjectId, ref: 'User', required: true, index: true },
  pharmacyName: { type: String, required: true },
  pharmacyPhone: { type: String, required: true },
  pharmacyAddress: { type: String, required: true },
  items: [
    {
      medicine: { type: ObjectId, ref: 'Medicine', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true },
      subtotal: { type: Number, required: true }
    }
  ],
  prescriptionImage: { type: String, default: '' },
  deliveryType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
  deliveryAddress: { type: String, default: '' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerNotes: { type: String, default: '' },
  totalPrice: { type: Number, required: true },
  platformCommission: { type: Number, default: 0 },
  pharmacyNetEarnings: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'rejected'],
    default: 'pending',
    index: true
  },
  rejectionReason: { type: String, default: '' }
}
```

---

## 3. محرك البحث الذكي وحساب المسافات الجغرافية
تستخدم دالة البحث معادلة هافرسين (Haversine Formula) أو الاستعلام الجغرافي `$nearSphere` في MongoDB لحساب المسافة الدقيقة بين العميل والصيدلية:
$$\text{Distance (km)} = 2 \cdot R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lng}}{2}\right)}\right)$$
حيث $R = 6371\text{ km}$.
* تتيح واجهة الموبايل التبديل المباشر بين فرزين:
  1. **الأقرب إليك أولاً (`sort=nearby`):** الصيدليات الأقرب للعميل بغض النظر عن السعر.
  2. **الأقل سعراً أولاً (`sort=cheapest`):** لتمكين المواطن من إيجاد أفضل سعر لنفس الدواء في الولاية.

---

## 4. التكامل الشامل مع منظومة المنصة القائمة
1. **ربط الشاشة الرئيسية:**
   * إضافة قسم الصيدليات ضمن الأقسام الرئيسية بلون مميز `#0D9488` وأيقونة طبية.
   * إتاحة البحث المباشر عن الدواء عبر شريط البحث الرئيسي في التطبيق.
2. **ربط الحجوزات والطلبات:**
   * تظهر طلبات الأدوية ضمن صفحة **"حجوزاتي وطلباتي"** في التطبيق مع مراحل التتبع الحية.
   * تظهر في لوحة الأدمن وفي لوحة تحكم الصيدلي مع أزرار القبول والرفض وتحديث مراحل التجهيز.
3. **الخصم التلقائي من المخزون (Inventory Auto-deduct):**
   * عند قبول الصيدلي للطلب، يتم فوراً إنقاص الكميات المطلوبة من رصيد الأدوية في قاعدة البيانات.
   * في حال رفض الطلب أو إلغائه، يتم التنبيه وتظل الكميات محفوظة.
4. **المستحقات المالية والاشتراكات:**
   * يتم تطبيق عمولة المنصة وحساب صافي مستحقات الصيدلية تلقائياً لكل طلب ودمجه في شاشة المستحقات والتقارير المالية.
   * خضوع الصيدلية لنظام فحص صلاحية الاشتراك، فإذا كان اشتراك الصيدلية منتهياً تظهر لها شاشة التجديد ولا تظهر أدوية الصيدلية في نتائج البحث.
