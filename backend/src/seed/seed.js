const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Subscription = require('../models/Subscription');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const Favorite = require('../models/Favorite');
const Medicine = require('../models/Medicine');
const PharmacyOrder = require('../models/PharmacyOrder');

const categoriesData = [
  {
    id: 'cars',
    title: 'كراء السيارات',
    titleEn: 'Car Rental',
    color: '#2563EB',
    icon: 'directions_car_rounded',
    imageAsset: 'assets/images/categories/cars.jpg',
    description: 'تأجير أحدث السيارات السياحية والفارهة وسيارات الأعراس بسائق وبدون سائق',
    bookingFieldsSpecification: [
      {
        name: 'carModel',
        label: 'موديل وفئة السيارة',
        type: 'select',
        required: true,
        options: ['سيدان سياحية (Renault Symbol / Dacia Logan)', 'فاخرة للأعراس (Mercedes E-Class)', 'دفع رباعي SUV (Hyundai Tucson)', 'اقتصادية (Seat Ibiza / Kia Picanto)'],
        defaultValue: 'سيدان سياحية (Renault Symbol / Dacia Logan)',
        helperText: 'اختر فئة أو موديل السيارة المناسب لك',
      },
      {
        name: 'rentalDays',
        label: 'مدة الإيجار (أيام)',
        type: 'number',
        required: true,
        defaultValue: 1,
        helperText: 'الحد الأدنى للتأجير هو يوم واحد',
      },
      {
        name: 'withDriver',
        label: 'طلب سائق خاص محترف',
        type: 'boolean',
        required: false,
        defaultValue: false,
        helperText: 'خيار طلب سائق خاص مرافق خلال فترة الإيجار (3,000 د.ج/يوم)',
      },
      {
        name: 'pickupLocation',
        label: 'مكان استلام المركبة',
        type: 'text',
        required: true,
        defaultValue: 'مقر الوكالة أو مطار قمار - الوادي',
        helperText: 'حدد مكان استلام مفاتيح السيارة',
      },
      {
        name: 'dropoffLocation',
        label: 'مكان تسليم المركبة',
        type: 'text',
        required: true,
        defaultValue: 'مقر الوكالة أو مطار قمار - الوادي',
        helperText: 'حدد مكان إعادة السيارة عند نهاية المدة',
      },
      {
        name: 'licenseDocument',
        label: 'صورة رخصة القيادة / بطاقة التعريف',
        type: 'file',
        required: false,
        defaultValue: '',
        helperText: 'مطلوبة للتأكد من الهوية عند الاستئجار بدون سائق',
      },
    ],
  },
  {
    id: 'beauty',
    title: 'التجميل والحلاقة',
    titleEn: 'Beauty & Spa',
    color: '#EC4899',
    icon: 'face_retouching_natural',
    imageAsset: 'assets/images/categories/beauty.jpg',
    description: 'أفضل صالونات الحلاقة وتجهيز العرائس والعناية بالبشرة والمساج',
    bookingFieldsSpecification: [
      {
        name: 'subService',
        label: 'الخدمة الفرعية المختارة',
        type: 'select',
        required: true,
        options: ['باقة تجهيز عرائس ملكية', 'قص وتسريح شعر ومكياج', 'جلسة تنظيف بشرة عميق HydraFacial', 'حلاقة VIP وسشوار رجالي', 'مساج واستجمام سبا'],
        defaultValue: 'باقة تجهيز عرائس ملكية',
        helperText: 'حدد نوع الخدمة التي ترغب بحجزها',
      },
      {
        name: 'specialistName',
        label: 'المختص / خبير التجميل',
        type: 'text',
        required: false,
        defaultValue: 'أي مختص متاح حالياً',
        helperText: 'يمكنك كتابة اسم الموظف المفضل أو تركه عاماً',
      },
      {
        name: 'timeSlot',
        label: 'الساعة الدقيقة للموعد',
        type: 'time',
        required: true,
        defaultValue: '10:30',
        helperText: 'حدد وقت الحضور بدقة لتفادي الانتظار',
      },
      {
        name: 'personsCount',
        label: 'عدد الأشخاص أو المرافقين',
        type: 'number',
        required: true,
        defaultValue: 1,
        helperText: 'عدد الأشخاص المستفيدين من الخدمة',
      },
    ],
  },
  {
    id: 'farms',
    title: 'المزارع',
    titleEn: 'Farms',
    color: '#10B981',
    icon: 'eco_rounded',
    imageAsset: 'assets/images/categories/farms.jpg',
    description: 'مزارع ريفية خلابة وجلسات عائلية ممتعة للاستجمام وإقامة الحفلات',
    bookingFieldsSpecification: [
      {
        name: 'bookingType',
        label: 'نوع الحجز',
        type: 'select',
        required: true,
        options: ['عائلي حصراً (Families Only)', 'شبابي / أصدقاء (Youth Group)'],
        defaultValue: 'عائلي حصراً (Families Only)',
        helperText: 'طبيعة الحجز لضمان ملاءمة المكان',
      },
      {
        name: 'guestCount',
        label: 'عدد الضيوف الإجمالي',
        type: 'number',
        required: true,
        defaultValue: 12,
        helperText: 'الحد الأقصى للمزرعة هو 40 ضيفاً',
      },
      {
        name: 'period',
        label: 'فترة الحجز',
        type: 'select',
        required: true,
        options: ['الفترة الصباحية (09:00 إلى 17:00)', 'الفترة المسائية (18:00 إلى 23:30)', 'يوم كامل مع مبيت (24 ساعة)'],
        defaultValue: 'يوم كامل مع مبيت (24 ساعة)',
        helperText: 'اختر الفترة الزمنية المناسبة لكم',
      },
      {
        name: 'additionalServices',
        label: 'خدمات إضافية مرغوبة',
        type: 'multiselect',
        required: false,
        options: ['تجهيز عتاد وموقد الشواء والفحم', 'توفير طباخ خاص للولائم', 'تنظيف شامل بعد المناسبة', 'إنارة ليلية خاصة وحفلات'],
        defaultValue: ['تجهيز عتاد وموقد الشواء والفحم'],
        helperText: 'اختر الخدمات التكميلية لراحتك',
      },
    ],
  },
  {
    id: 'weddings',
    title: 'قاعات الأفراح',
    titleEn: 'Wedding Halls',
    color: '#EF4444',
    icon: 'celebration_rounded',
    imageAsset: 'assets/images/categories/weddings.jpg',
    description: 'قاعات أفراح فخمة ومجهزة بأحدث المؤثرات الصوتية والضوئية وباقات الضيافة',
    bookingFieldsSpecification: [
      {
        name: 'eventType',
        label: 'نوع المناسبة',
        type: 'select',
        required: true,
        options: ['حفل زفاف ملكي (عرس)', 'حفل خطوبة وقراءة فاتحة', 'مأدبة عشاء عائلية', 'حفل تكريم وتخرج', 'ندوة أو مؤتمر'],
        defaultValue: 'حفل زفاف ملكي (عرس)',
        helperText: 'طبيعة الاحتفال لتجهيز الديكور المناسب',
      },
      {
        name: 'approximateGuests',
        label: 'عدد المدعوين التقريبي',
        type: 'number',
        required: true,
        defaultValue: 300,
        helperText: 'عدد الكراسي والطاولات المطلوب تجهيزها',
      },
      {
        name: 'cateringPackage',
        label: 'باقة الضيافة والإطعام',
        type: 'select',
        required: true,
        options: ['القاعة فقط بدون خدمات طعام', 'باقة الشاي والحلويات والمشروبات', 'باقة العشاء الكاملة (طواجن، كسكسي، مشويات، سلطات، فواكه)'],
        defaultValue: 'باقة العشاء الكاملة (طواجن، كسكسي، مشويات، سلطات، فواكه)',
        helperText: 'نوع باقة الضيافة المقدمة للمدعوين',
      },
      {
        name: 'period',
        label: 'فترة الحفل',
        type: 'select',
        required: true,
        options: ['فترة المساء والسهرة (19:00 إلى 01:00)', 'فترة الغداء والظهيرة (12:00 إلى 17:00)'],
        defaultValue: 'فترة المساء والسهرة (19:00 إلى 01:00)',
        helperText: 'توقيت بدء وانتهاء فعاليات الحفل',
      },
    ],
  },
  {
    id: 'pools',
    title: 'مسابح',
    titleEn: 'Swimming Pools',
    color: '#06B6D4',
    icon: 'pool_rounded',
    imageAsset: 'assets/images/categories/pools.jpg',
    description: 'مسابح خاصة مغطاة ومفتوحة مع خصوصية تامة للعائلات والشباب',
    bookingFieldsSpecification: [
      {
        name: 'bookingType',
        label: 'نوع الحجز',
        type: 'select',
        required: true,
        options: ['عائلي بخصوصية تامة', 'شباب ورياضيين'],
        defaultValue: 'عائلي بخصوصية تامة',
        helperText: 'تحديد نوع الحجز لضمان الخصوصية',
      },
      {
        name: 'guestCount',
        label: 'عدد السباحين / الحضور',
        type: 'number',
        required: true,
        defaultValue: 8,
        helperText: 'أقصى عدد مسموح به في حوض السباحة',
      },
      {
        name: 'period',
        label: 'فترة السباحة',
        type: 'select',
        required: true,
        options: ['حصة صباحية (09:00 إلى 14:00)', 'حصة مسائية (15:00 إلى 20:00)', 'سهرة ليلية (20:30 إلى 01:00)'],
        defaultValue: 'حصة مسائية (15:00 إلى 20:00)',
        helperText: 'الفترة المخصصة لاستخدام المسبح',
      },
      {
        name: 'additionalServices',
        label: 'إضافات المسبح',
        type: 'multiselect',
        required: false,
        options: ['تدفئة مياه المسبح Jacuzzi', 'سترات سباحة وألعاب أطفال', 'جلسة شاي وكراسي استرخاء'],
        defaultValue: ['جلسة شاي وكراسي استرخاء'],
        helperText: 'خدمات إضافية متوفرة في المسبح',
      },
    ],
  },
  {
    id: 'hotels',
    title: 'فنادق',
    titleEn: 'Hotels',
    color: '#3B82F6',
    icon: 'hotel_rounded',
    imageAsset: 'assets/images/categories/hotels.jpg',
    description: 'إقامات فندقية مريحة ومميزة في مختلف الولايات بأفضل الأسعار',
    bookingFieldsSpecification: [
      {
        name: 'checkInDate',
        label: 'تاريخ الدخول (Check-in)',
        type: 'date',
        required: true,
        defaultValue: '2026-11-20',
        helperText: 'يبدأ الدخول اعتباراً من الساعة 13:00 زوالاً',
      },
      {
        name: 'checkOutDate',
        label: 'تاريخ الخروج (Check-out)',
        type: 'date',
        required: true,
        defaultValue: '2026-11-22',
        helperText: 'تسليم المفاتيح حتى الساعة 12:00 ظهراً',
      },
      {
        name: 'adultsCount',
        label: 'عدد البالغين',
        type: 'number',
        required: true,
        defaultValue: 2,
        helperText: 'النزلاء البالغين 12 سنة فما فوق',
      },
      {
        name: 'childrenCount',
        label: 'عدد الأطفال',
        type: 'number',
        required: false,
        defaultValue: 0,
        helperText: 'الأطفال أقل من 12 سنة',
      },
      {
        name: 'unitOrRoomType',
        label: 'نوع الغرفة أو الجناح',
        type: 'select',
        required: true,
        options: ['غرفة فردية Single', 'غرفة مزدوجة Double / Twin', 'جناح تنفيذي Executive Suite', 'جناح عائلي Family Suite'],
        defaultValue: 'جناح عائلي Family Suite',
        helperText: 'اختر السعة والغرفة المفضلة',
      },
    ],
  },
  {
    id: 'farms_halls',
    title: 'المزارع والقاعات',
    titleEn: 'Farms & Halls',
    color: '#8B5CF6',
    icon: 'villa_rounded',
    imageAsset: 'assets/images/categories/farms_halls.jpg',
    description: 'مجمعات تجمع بين سحر المزارع وفخامة قاعات الحفلات المفتوحة والمغلقة',
    bookingFieldsSpecification: [
      {
        name: 'eventType',
        label: 'نوع الحفل / اللقاء',
        type: 'select',
        required: true,
        options: ['حفل زفاف في الهواء الطلق', 'حفل عقد قران واستقبال', 'ملتقى أو يوم تدريبي مفتوح'],
        defaultValue: 'حفل زفاف في الهواء الطلق',
        helperText: 'نوع الفعالية لتنسيق المساحة العشبية والقاعة',
      },
      {
        name: 'approximateGuests',
        label: 'عدد الحضور التقريبي',
        type: 'number',
        required: true,
        defaultValue: 180,
        helperText: 'القدرة الاستيعابية الإجمالية',
      },
      {
        name: 'cateringPackage',
        label: 'باقة التموين والضيافة',
        type: 'select',
        required: true,
        options: ['بوفيه مفتوح Open Buffet', 'وليمة عشاء تقليدية جزائرية', 'ضيافة قهوة وشاي ومقبلات خفيفة'],
        defaultValue: 'وليمة عشاء تقليدية جزائرية',
        helperText: 'باقة الإطعام المناسبة لضيوفكم',
      },
      {
        name: 'period',
        label: 'فترة الحفل',
        type: 'select',
        required: true,
        options: ['فترة مسائية مع سهرة (17:00 إلى 00:00)', 'يوم كامل من الصباح للمساء (10:00 إلى 22:00)'],
        defaultValue: 'فترة مسائية مع سهرة (17:00 إلى 00:00)',
        helperText: 'المدة الزمنية لحجز المزرعة والقاعة',
      },
    ],
  },
  {
    id: 'houses',
    title: 'كراء المنازل',
    titleEn: 'Houses & Apartments',
    color: '#0D9488',
    icon: 'home_work_rounded',
    imageAsset: 'assets/images/categories/houses.jpg',
    description: 'شقق مفروشة ومنازل وفيلات سياحية راقية للإيجار اليومي والأسبوعي',
    bookingFieldsSpecification: [
      {
        name: 'checkInDate',
        label: 'تاريخ الوصول (Check-in)',
        type: 'date',
        required: true,
        defaultValue: '2026-11-18',
        helperText: 'تاريخ استلام مفاتيح المنزل أو الشقة',
      },
      {
        name: 'checkOutDate',
        label: 'تاريخ المغادرة (Check-out)',
        type: 'date',
        required: true,
        defaultValue: '2026-11-21',
        helperText: 'تاريخ تسليم الشقة',
      },
      {
        name: 'adultsCount',
        label: 'عدد البالغين',
        type: 'number',
        required: true,
        defaultValue: 4,
        helperText: 'عدد النزلاء البالغين',
      },
      {
        name: 'childrenCount',
        label: 'عدد الأطفال',
        type: 'number',
        required: false,
        defaultValue: 2,
        helperText: 'عدد الأطفال المرافقين',
      },
      {
        name: 'unitOrRoomType',
        label: 'نوع العقار المستأجر',
        type: 'select',
        required: true,
        options: ['شقة F2 عصرية مجهزة', 'شقة F3 واسعة للعائلات', 'شقة F4 فاخرة بإطلالة بانورامية', 'فيلا طابقين مع حديقة ومرآب'],
        defaultValue: 'شقة F3 واسعة للعائلات',
        helperText: 'اختر سعة ونوع العقار المناسب لعائلتك',
      },
    ],
  },
  {
    id: 'pharmacy',
    title: 'الصيدليات',
    titleEn: 'Pharmacies',
    color: '#0D9488',
    icon: 'local_pharmacy_rounded',
    imageAsset: 'assets/images/categories/pharmacy.png',
    description: 'ابحث عن الأدوية، قارن بين الأسعار وتعرف على أقرب الصيدليات المتاحة مع خدمة الاستلام أو التوصيل',
    bookingFieldsSpecification: [
      {
        name: 'deliveryType',
        label: 'طريقة الاستلام',
        type: 'select',
        required: true,
        options: ['استلام مباشر من الصيدلية (Pickup)', 'توصيل منزلي سريع (Delivery)'],
        defaultValue: 'استلام مباشر من الصيدلية (Pickup)',
        helperText: 'حدد إن كنت ترغب بالاستلام بنفسك أو التوصيل لعنوانك',
      },
      {
        name: 'prescriptionFile',
        label: 'صورة الوصفة الطبية (الروشتة)',
        type: 'file',
        required: false,
        defaultValue: '',
        helperText: 'مطلوبة للأدوية التي تستوجب وصفة طبية قانونية',
      },
    ],
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ihjizli_dz';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Category.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Subscription.deleteMany();
    await Settings.deleteMany();
    await Notification.deleteMany();
    await Favorite.deleteMany();
    await Medicine.deleteMany();
    await PharmacyOrder.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Seed Settings
    const settings = await Settings.create({
      key: 'global_settings',
      monthlySubscriptionPrice: 5000,
      annualSubscriptionPrice: 50000,
      platformCommissionPercent: 10,
      supportPhone: '0661234567',
      supportEmail: 'support@dzly.com',
      baridimobAccount: '007999990022334455',
      ccpAccount: '1234567 clé 89',
      announcementText: 'أعلن عن مشروعك معنا ليصل إعلانك إلى آلاف المستخدمين في 58 ولاية',
      termsAndConditions: 'شروط وأحكام منصة احجزلي Dz المعمول بها في الجزائر.',
    });
    console.log('Global settings seeded.');

    // 2. Seed Users
    // Admin
    const admin = await User.create({
      name: 'مدير المنصة العام',
      email: 'admin@dzly.com',
      phone: '0660000000',
      password: 'admin123456',
      role: 'admin',
      city: 'الجزائر العاصمة',
      status: 'active',
    });

    // Active Provider (One full active subscription)
    const activeProvider = await User.create({
      name: 'محمد الهادي مزود خدمات',
      email: 'provider.active@dzly.com',
      phone: '0661111111',
      password: 'provider123456',
      role: 'provider',
      city: 'الوادي',
      businessName: 'مؤسسة الواحة للخدمات السياحية والأفراح',
      commercialRegister: '39/00-1284920B21',
      providerCategory: 'weddings',
      status: 'active',
    });

    // Expired Provider (Subscription ended 30 days ago)
    const expiredProvider = await User.create({
      name: 'عبد القادر للتأجير المنتهي',
      email: 'provider.expired@dzly.com',
      phone: '0662222222',
      password: 'provider123456',
      role: 'provider',
      city: 'الوادي',
      businessName: 'وكالة رمال الصحراء لتأجير السيارات',
      commercialRegister: '39/00-9874102B19',
      providerCategory: 'cars',
      status: 'active',
    });

    // Client user
    const client = await User.create({
      name: 'أحمد بن علي',
      email: 'client@dzly.com',
      phone: '0661234567',
      password: 'client123456',
      role: 'client',
      city: 'الوادي',
      status: 'active',
    });

    // 3 Demo Pharmacy Providers in El Oued
    const pharmacyAlshifa = await User.create({
      name: 'د. أمين بن عمار',
      email: 'pharmacy.alshifa@dzly.com',
      phone: '0663333331',
      password: 'provider123456',
      role: 'provider',
      providerType: 'pharmacy',
      city: 'الوادي',
      businessName: 'صيدلية الشفاء المركزية',
      address: 'شارع فلسطين، وسط المدينة - الوادي',
      commercialRegister: '39/00-482910B22',
      providerCategory: 'pharmacy',
      location: {
        type: 'Point',
        coordinates: [6.8673, 33.3683], // Downtown El Oued
      },
      isOpen: true,
      openingHours: 'على مدار 24 ساعة (مناوبة ليلية)',
      status: 'active',
    });

    const pharmacyAlnoor = await User.create({
      name: 'د. سارة لعموري',
      email: 'pharmacy.alnoor@dzly.com',
      phone: '0663333332',
      password: 'provider123456',
      role: 'provider',
      providerType: 'pharmacy',
      city: 'الوادي',
      businessName: 'صيدلية النور الحديثة',
      address: 'حي الرمال، مقابل المستشفى - الوادي',
      commercialRegister: '39/00-759281B20',
      providerCategory: 'pharmacy',
      location: {
        type: 'Point',
        coordinates: [6.8790, 33.3750], // Hay Al-Rimal (approx 1.4 km)
      },
      isOpen: true,
      openingHours: '08:00 - 23:00',
      status: 'active',
    });

    const pharmacyAlwiam = await User.create({
      name: 'د. كريم بوزيد',
      email: 'pharmacy.alwiam@dzly.com',
      phone: '0663333333',
      password: 'provider123456',
      role: 'provider',
      providerType: 'pharmacy',
      city: 'الوادي',
      businessName: 'صيدلية الوفاء والسلام',
      address: 'طريق المطار، بجوار المحطة - الوادي',
      commercialRegister: '39/00-918234B21',
      providerCategory: 'pharmacy',
      location: {
        type: 'Point',
        coordinates: [6.8520, 33.3550], // Airport Road (approx 2.3 km)
      },
      isOpen: true,
      openingHours: '08:30 - 22:30',
      status: 'active',
    });

    console.log('Users seeded (Admin, Active Provider, Expired Provider, Client, 3 Pharmacies).');

    // 3. Seed Subscriptions
    // Active subscription for activeProvider (1 year from now)
    const subStartDate = new Date();
    const subEndDate = new Date();
    subEndDate.setFullYear(subEndDate.getFullYear() + 1);

    await Subscription.create({
      provider: activeProvider._id,
      plan: 'annual',
      startDate: subStartDate,
      endDate: subEndDate,
      amountPaid: 50000,
      status: 'active',
      paymentMethod: 'baridimob',
      paymentReference: 'BM-2026-998822',
      notes: 'اشتراك سنوي ساري المفعول',
    });

    // Expired subscription for expiredProvider (ended 30 days ago)
    const pastStart = new Date();
    pastStart.setDate(pastStart.getDate() - 60);
    const pastEnd = new Date();
    pastEnd.setDate(pastEnd.getDate() - 5);

    await Subscription.create({
      provider: expiredProvider._id,
      plan: 'monthly',
      startDate: pastStart,
      endDate: pastEnd,
      amountPaid: 5000,
      status: 'expired',
      paymentMethod: 'ccp',
      paymentReference: 'CCP-2026-112233',
      notes: 'اشتراك شهري منتهي الصلاحية لاختبار حماية المزود',
    });

    // Active subscriptions for the 3 pharmacies
    for (const p of [pharmacyAlshifa, pharmacyAlnoor, pharmacyAlwiam]) {
      await Subscription.create({
        provider: p._id,
        plan: 'annual',
        startDate: subStartDate,
        endDate: subEndDate,
        amountPaid: 50000,
        status: 'active',
        paymentMethod: 'baridimob',
        paymentReference: `BM-PHARM-${p._id.toString().slice(-4)}`,
        notes: `اشتراك سنوي نشط لصيدلية ${p.businessName}`,
      });
    }
    console.log('Subscriptions seeded (including 3 active pharmacies).');

    // 4. Seed Categories
    await Category.insertMany(categoriesData);
    console.log('8 Categories with dynamic fields seeded.');

    // 5. Seed Services
    const servicesData = [
      {
        provider: activeProvider._id,
        categoryId: 'weddings',
        title: 'قاعة الأفق - الوادي',
        subtitle: 'لجميع المناسبات والأفراح الملكية الفاخرة',
        description: 'قاعة فخمة تسع حتى 600 مدعو مع نظام تكييف مركزي متطور، نظام صوتي حديث، طاقم ضيافة نسائي ورجالي محترف، وغرفة خاصة بالعروس مجهزة بالكامل.',
        city: 'الوادي',
        address: 'حي الرمال، طريق المطار - الوادي',
        price: 85000,
        priceUnit: 'د.ج / لليلة',
        discountPercent: 20,
        badgeLabel: 'خصم خاص',
        rating: 4.9,
        reviewsCount: 142,
        accentColor: '#EF4444',
        imageAsset: 'assets/images/offers/hall.jpg',
        images: ['assets/images/offers/hall.jpg', 'assets/images/categories/weddings.jpg'],
        features: ['تكييف مركزي', 'موقف سيارات واسع', 'نظام صوتي حديث', 'طاقم ضيافة متميز', 'جناح خاص للعروس'],
        approvalStatus: 'approved',
      },
      {
        provider: activeProvider._id,
        categoryId: 'beauty',
        title: 'صالون الجمال الراقي',
        subtitle: 'عناية كاملة بالبشرة والشعر وتجهيز العرائس',
        description: 'صالون تجميل متخصص في أحدث صيحات المكياج وتصفيف الشعر للعرائس والمناسبات السعيدة، بأيدي خبيرات تجميل معتمدات وباستخدام ماركات عالمية أصلية.',
        city: 'الوادي',
        address: 'وسط المدينة، شارع فلسطين - الوادي',
        price: 12000,
        priceUnit: 'د.ج / باقة',
        discountPercent: 15,
        badgeLabel: 'عرض',
        rating: 4.8,
        reviewsCount: 98,
        accentColor: '#EC4899',
        imageAsset: 'assets/images/offers/salon.jpg',
        images: ['assets/images/offers/salon.jpg', 'assets/images/categories/beauty.jpg'],
        features: ['منتجات عالمية', 'غرف VIP خاصة', 'حجز مسبق بدون انتظار', 'خبراء تجميل معتمدون'],
        approvalStatus: 'approved',
      },
      {
        provider: activeProvider._id,
        categoryId: 'farms',
        title: 'مزرعة النخيل الذهبية',
        subtitle: 'تنظيم حفلات ومناسبات وجلسات عائلية ممتعة',
        description: 'مزرعة هادئة واسعة وسط غابات النخيل بوادي سوف، تضم مسبحاً خاصاً، جلسات تراثية مظللة، منطقة شواء مجهزة، ومرافق ترفيهية للأطفال.',
        city: 'الوادي',
        address: 'منطقة تكسبت السياحية - الوادي',
        price: 35000,
        priceUnit: 'د.ج / لليوم',
        discountPercent: 30,
        badgeLabel: 'عرض',
        rating: 4.9,
        reviewsCount: 210,
        accentColor: '#10B981',
        imageAsset: 'assets/images/offers/farm.jpg',
        images: ['assets/images/offers/farm.jpg', 'assets/images/categories/farms.jpg'],
        features: ['مسبح خاص', 'مساحات خضراء شاسعة', 'منطقة شواء متكاملة', 'واي فاي مجاني', 'خصوصية عائلية تامة'],
        approvalStatus: 'approved',
      },
      {
        provider: expiredProvider._id,
        categoryId: 'cars',
        title: 'كراء سيارات الفخامة',
        subtitle: 'تشكيلة واسعة من السيارات الحديثة للأفراح والسفر',
        description: 'أسطول سيارات حديث موديلات 2024-2026 مع تأمين شامل وسائق اختياري للأعراس ومناسبات كبار الشخصيات والتنقلات الرسمية.',
        city: 'الوادي',
        address: 'حي 8 ماي - الوادي',
        price: 9000,
        priceUnit: 'د.ج / لليوم',
        discountPercent: 20,
        badgeLabel: 'عرض',
        rating: 4.7,
        reviewsCount: 76,
        accentColor: '#2563EB',
        imageAsset: 'assets/images/offers/car.jpg',
        images: ['assets/images/offers/car.jpg', 'assets/images/categories/cars.jpg'],
        features: ['تأمين شامل ضد الحوادث', 'توصيل للمطار مجاناً', 'سائق خاص اختياري', 'سيارات نظيفة ومعقمة'],
        approvalStatus: 'approved',
      },
      {
        provider: activeProvider._id,
        categoryId: 'pools',
        title: 'مسبح الواحة الأزرق المغطى',
        subtitle: 'مسبح عائلي دافئ ومغطى بخصوصية تامة',
        description: 'مسبح داخلي بنظام تعقيم حديث وتدفئة مياه مع جلسات استرخاء وجاكوزي، مثالي للعائلات والأطفال على مدار السنة.',
        city: 'الوادي',
        address: 'طريق المطار الجديد - الوادي',
        price: 15000,
        priceUnit: 'د.ج / للحصة',
        discountPercent: 10,
        badgeLabel: 'عرض',
        rating: 4.8,
        reviewsCount: 52,
        accentColor: '#06B6D4',
        imageAsset: 'assets/images/categories/pools.jpg',
        images: ['assets/images/categories/pools.jpg'],
        features: ['مياه مدفأة', 'خصوصية عائلية تامة', 'جاكوزي ومرافق سبا', 'ألعاب مائية للأطفال'],
        approvalStatus: 'approved',
      },
      {
        provider: activeProvider._id,
        categoryId: 'hotels',
        title: 'فندق الواحة الذهبية',
        subtitle: 'إقامة فندقية فاخرة بأجنحة عائلية مريحة وخدمة 4 نجوم',
        description: 'غرف وأجنحة فندقية مجهزة بأحدث وسائل الراحة، إفطار بوفيه مجاني، ومسبح داخلي، مع إطلالة خلابة على واحات النخيل.',
        city: 'الوادي',
        address: 'الحي الإداري - الوادي',
        price: 14000,
        priceUnit: 'د.ج / لليلة',
        discountPercent: 10,
        badgeLabel: 'جديد',
        rating: 4.8,
        reviewsCount: 64,
        accentColor: '#3B82F6',
        imageAsset: 'assets/images/categories/hotels.jpg',
        images: ['assets/images/categories/hotels.jpg'],
        features: ['إفطار بوفيه مجاني', 'مسبح داخلي', 'قاعة اجتماعات كبرى', 'واي فاي فائق السرعة', 'استقبال 24/7'],
        approvalStatus: 'approved',
      },
      {
        provider: activeProvider._id,
        categoryId: 'farms_halls',
        title: 'منتجع الأندلس للمزارع والقاعات',
        subtitle: 'مزيج فاخر بين القاعة المغلقة والحدائق الخضراء المفتوحة',
        description: 'موقع استثنائي للمناسبات الملكية والزفاف في الهواء الطلق مع قاعة طوارئ مكيفة ومطابخ ولائم مجهزة بالكامل.',
        city: 'الوادي',
        address: 'منطقة كوينين السياحية - الوادي',
        price: 110000,
        priceUnit: 'د.ج / للمناسبة',
        discountPercent: 15,
        badgeLabel: 'ملكي',
        rating: 4.9,
        reviewsCount: 88,
        accentColor: '#8B5CF6',
        imageAsset: 'assets/images/categories/farms_halls.jpg',
        images: ['assets/images/categories/farms_halls.jpg'],
        features: ['مساحة خارجية تسع 800 فرد', 'قاعة داخلية فخمة', 'إنارة ليلية سينمائية', 'مواقف خاصة محروسة'],
        approvalStatus: 'approved',
      },
      {
        provider: activeProvider._id,
        categoryId: 'houses',
        title: 'إقامة الياسمين المفروشة',
        subtitle: 'شقق ومنازل راقية للإيجار اليومي والأسبوعي للعائلات',
        description: 'شقق F3 وF4 مؤثثة بأثاث عصري مريح مع تكييف كامل، مطبخ مجهز بأحدث الأجهزة المنزلية، ومدخل مستقل وموقف خاص.',
        city: 'الوادي',
        address: 'حي النور - الوادي',
        price: 7500,
        priceUnit: 'د.ج / لليلة',
        discountPercent: 0,
        badgeLabel: 'عائلي',
        rating: 4.6,
        reviewsCount: 51,
        accentColor: '#0D9488',
        imageAsset: 'assets/images/categories/houses.jpg',
        images: ['assets/images/categories/houses.jpg'],
        features: ['مطبخ مجهز بالكامل', 'تكييف في كل الغرف', 'مدخل مستقل تماماً', 'أمان عالي وكاميرات مراقبة'],
        approvalStatus: 'approved',
      },
    ];

    const seededServices = await Service.insertMany(servicesData);
    console.log(`Seeded ${seededServices.length} services across 8 categories.`);

    // 6. Seed Demo Bookings
    const hallService = seededServices.find((s) => s.categoryId === 'weddings');
    const farmService = seededServices.find((s) => s.categoryId === 'farms');
    const carService = seededServices.find((s) => s.categoryId === 'cars');

    await Booking.create([
      {
        bookingCode: 'DZ-8492',
        client: client._id,
        service: hallService._id,
        provider: hallService.provider,
        categoryId: 'weddings',
        serviceTitle: hallService.title,
        city: 'الوادي',
        date: '2026-11-25',
        timeSlot: 'فترة المساء والسهرة (19:00 إلى 01:00)',
        customerName: 'أحمد بن علي',
        customerPhone: '0661234567',
        dynamicFields: {
          eventType: 'حفل زفاف ملكي (عرس)',
          approximateGuests: 300,
          cateringPackage: 'باقة العشاء الكاملة (طواجن، كسكسي، مشويات، سلطات، فواكه)',
          period: 'فترة المساء والسهرة (19:00 إلى 01:00)',
        },
        totalPrice: 68000,
        commissionRate: 10,
        commissionAmount: 6800,
        providerNet: 61200,
        status: 'confirmed',
      },
      {
        bookingCode: 'DZ-7310',
        client: client._id,
        service: farmService._id,
        provider: farmService.provider,
        categoryId: 'farms',
        serviceTitle: farmService.title,
        city: 'الوادي',
        date: '2026-10-14',
        timeSlot: 'يوم كامل مع مبيت (24 ساعة)',
        customerName: 'أحمد بن علي',
        customerPhone: '0661234567',
        dynamicFields: {
          bookingType: 'عائلي حصراً (Families Only)',
          guestCount: 15,
          period: 'يوم كامل مع مبيت (24 ساعة)',
          additionalServices: ['تجهيز عتاد وموقد الشواء والفحم'],
        },
        totalPrice: 24500,
        commissionRate: 10,
        commissionAmount: 2450,
        providerNet: 22050,
        status: 'completed',
      },
      {
        bookingCode: 'DZ-5190',
        client: client._id,
        service: carService._id,
        provider: carService.provider,
        categoryId: 'cars',
        serviceTitle: carService.title,
        city: 'الوادي',
        date: '2026-11-28',
        timeSlot: 'صباحي',
        customerName: 'أحمد بن علي',
        customerPhone: '0661234567',
        dynamicFields: {
          carModel: 'سيدان سياحية (Renault Symbol / Dacia Logan)',
          rentalDays: 3,
          withDriver: false,
          pickupLocation: 'مطار قمار - الوادي',
          dropoffLocation: 'مقر الوكالة - الوادي',
        },
        totalPrice: 21600,
        commissionRate: 10,
        commissionAmount: 2160,
        providerNet: 19440,
        status: 'pending',
      },
    ]);
    console.log('Demo bookings seeded.');

    // 7. Seed Notifications
    await Notification.create([
      {
        user: client._id,
        title: 'خصم 30% على مزرعة النخيل الذهبية!',
        body: 'استفد من العرض الحصري لنهاية الأسبوع في ولاية الوادي.',
        isOffer: true,
        isRead: false,
      },
      {
        user: client._id,
        title: 'تم تأكيد حجزك بنجاح (#DZ-8492)',
        body: 'حجزك في قاعة الأفق - الوادي مؤكد في الموعد المحدد.',
        isOffer: false,
        isRead: true,
        bookingId: 'DZ-8492',
      },
      {
        user: activeProvider._id,
        title: 'طلب حجز وارد (#DZ-5190)',
        body: 'وصلك طلب حجز جديد بانتظار التأكيد لخدمة "كراء سيارات الفخامة"',
        bookingId: 'DZ-5190',
      },
    ]);
    console.log('Notifications seeded.');

    // 8. Seed Favorites
    await Favorite.create([
      { user: client._id, service: hallService._id },
      { user: client._id, service: farmService._id },
    ]);
    console.log('Favorites seeded.');

    // 9. Seed Medicines (15 distinct medicines across 3 pharmacies for comparison)
    const medicinesData = [
      // Doliprane in all 3 pharmacies (price & distance comparison)
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Doliprane 1000mg',
        genericName: 'Paracetamol',
        category: 'مسكنات وخافضات حرارة',
        dosage: 'علبة 8 أقراص فوارة',
        price: 220,
        stock: 35,
        requiresPrescription: false,
        image: 'assets/images/categories/pharmacy.png',
        description: 'مسكن للآلام وخافض للحرارة فعال للصداع وآلام الجسم',
      },
      {
        pharmacy: pharmacyAlnoor._id,
        name: 'Doliprane 1000mg',
        genericName: 'Paracetamol',
        category: 'مسكنات وخافضات حرارة',
        dosage: 'علبة 8 أقراص فوارة',
        price: 205, // Cheapest
        stock: 20,
        requiresPrescription: false,
        image: 'assets/images/categories/pharmacy.png',
        description: 'مسكن للآلام وخافض للحرارة فعال للصداع وآلام الجسم',
      },
      {
        pharmacy: pharmacyAlwiam._id,
        name: 'Doliprane 1000mg',
        genericName: 'Paracetamol',
        category: 'مسكنات وخافضات حرارة',
        dosage: 'علبة 8 أقراص فوارة',
        price: 215,
        stock: 18,
        requiresPrescription: false,
        image: 'assets/images/categories/pharmacy.png',
        description: 'مسكن للآلام وخافض للحرارة فعال للصداع وآلام الجسم',
      },

      // Panadol Extra
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Panadol Extra 500mg',
        genericName: 'Paracetamol + Caffeine',
        category: 'مسكنات وخافضات حرارة',
        dosage: 'علبة 24 قرص',
        price: 280,
        stock: 15,
        requiresPrescription: false,
        description: 'مسكن قوي وفعال للصداع النصفي وآلام الأسنان',
      },
      {
        pharmacy: pharmacyAlnoor._id,
        name: 'Panadol Extra 500mg',
        genericName: 'Paracetamol + Caffeine',
        category: 'مسكنات وخافضات حرارة',
        dosage: 'علبة 24 قرص',
        price: 260,
        stock: 12,
        requiresPrescription: false,
        description: 'مسكن قوي وفعال للصداع النصفي وآلام الأسنان',
      },

      // Augmentin (Antibiotic - Requires Prescription)
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Augmentin 1g',
        genericName: 'Amoxicilline + Acide Clavulanique',
        category: 'مضادات حيوية',
        dosage: 'علبة 14 قرص مغلف',
        price: 950,
        stock: 18,
        requiresPrescription: true,
        description: 'مضاد حيوي واسع المجال لعلاج التهابات الجهاز التنفسي والمسالك',
      },
      {
        pharmacy: pharmacyAlnoor._id,
        name: 'Augmentin 1g',
        genericName: 'Amoxicilline + Acide Clavulanique',
        category: 'مضادات حيوية',
        dosage: 'علبة 14 قرص مغلف',
        price: 920,
        stock: 10,
        requiresPrescription: true,
        description: 'مضاد حيوي واسع المجال لعلاج التهابات الجهاز التنفسي والمسالك',
      },

      // Amoxicilline Biocare 500mg (Antibiotic - Requires Prescription)
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Amoxicilline Biocare 500mg',
        genericName: 'Amoxicilline',
        category: 'مضادات حيوية',
        dosage: 'علبة 12 كبسولة',
        price: 380,
        stock: 25,
        requiresPrescription: true,
        description: 'مضاد حيوي لعلاج الالتهابات البكتيرية الشائعة',
      },
      {
        pharmacy: pharmacyAlwiam._id,
        name: 'Amoxicilline Biocare 500mg',
        genericName: 'Amoxicilline',
        category: 'مضادات حيوية',
        dosage: 'علبة 12 كبسولة',
        price: 360,
        stock: 14,
        requiresPrescription: true,
        description: 'مضاد حيوي لعلاج الالتهابات البكتيرية الشائعة',
      },

      // Vitamine C 1000mg
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Vitamine C 1000mg Upsa',
        genericName: 'Acide Ascorbique',
        category: 'فيتامينات ومكملات',
        dosage: 'أنبوب 10 أقراص فوارة',
        price: 450,
        stock: 22,
        requiresPrescription: false,
        description: 'فيتامين سي لتقوية المناعة ومكافحة التعب والإرهاق ونزلات البرد',
      },
      {
        pharmacy: pharmacyAlnoor._id,
        name: 'Vitamine C 1000mg Upsa',
        genericName: 'Acide Ascorbique',
        category: 'فيتامينات ومكملات',
        dosage: 'أنبوب 10 أقراص فوارة',
        price: 420,
        stock: 30,
        requiresPrescription: false,
        description: 'فيتامين سي لتقوية المناعة ومكافحة التعب والإرهاق ونزلات البرد',
      },

      // Maxilase Sirop (Sore throat)
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Maxilase Sirop 100ml',
        genericName: 'Alpha-amylase',
        category: 'مسكنات وخافضات حرارة',
        dosage: 'قارورة شراب 100 مل',
        price: 320,
        stock: 16,
        requiresPrescription: false,
        description: 'مضاد للالتهاب ومسكن لآلام الحلق واللوزتين',
      },

      // Spasfon (Antispasmodic)
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Spasfon 80mg',
        genericName: 'Phloroglucinol',
        category: 'مسكنات وخافضات حرارة',
        dosage: 'علبة 30 قرص',
        price: 340,
        stock: 28,
        requiresPrescription: false,
        description: 'علاج تقلصات وآلام المعدة والقولون والمغص الكلوي',
      },
      {
        pharmacy: pharmacyAlwiam._id,
        name: 'Spasfon 80mg',
        genericName: 'Phloroglucinol',
        category: 'مسكنات وخافضات حرارة',
        dosage: 'علبة 30 قرص',
        price: 330,
        stock: 19,
        requiresPrescription: false,
        description: 'علاج تقلصات وآلام المعدة والقولون والمغص الكلوي',
      },

      // Ibuprofène 400mg
      {
        pharmacy: pharmacyAlnoor._id,
        name: 'Ibuprofène 400mg Saidal',
        genericName: 'Ibuprofen',
        category: 'مسكنات وخافضات حرارة',
        dosage: 'علبة 20 قرص',
        price: 240,
        stock: 25,
        requiresPrescription: false,
        description: 'مضاد للالتهاب ومسكن لآلام المفاصل والأسنان',
      },

      // Smecta (Digestive)
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Smecta 3g',
        genericName: 'Diosmectite',
        category: 'أخرى',
        dosage: 'علبة 30 كيس بودرة',
        price: 390,
        stock: 20,
        requiresPrescription: false,
        description: 'حماية وتلطيف الغشاء المخاطي للمعدة والأمعاء وعلاج الإسهال',
      },

      // Cétirizine 10mg (Anti-allergy)
      {
        pharmacy: pharmacyAlwiam._id,
        name: 'Cétirizine 10mg Saidal',
        genericName: 'Cetirizine',
        category: 'أمراض مزمنة',
        dosage: 'علبة 20 قرص',
        price: 280,
        stock: 12,
        requiresPrescription: false,
        description: 'مضاد للحساسية والرشح وحكة العيون والجلد',
      },

      // Gaviscon Sirop
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Gaviscon Sirop 250ml',
        genericName: 'Alginate de sodium',
        category: 'أخرى',
        dosage: 'قارورة سائلة 250 مل',
        price: 580,
        stock: 15,
        requiresPrescription: false,
        description: 'علاج حرقة المعدة وارتجاع المريء وحموضة المعدة',
      },

      // Bétadine Dermique
      {
        pharmacy: pharmacyAlwiam._id,
        name: 'Bétadine Dermique 10%',
        genericName: 'Povidone iodée',
        category: 'عناية جلدية ومستحضرات',
        dosage: 'قارورة 125 مل',
        price: 300,
        stock: 15,
        requiresPrescription: false,
        description: 'مطهر جلدي واسع المدى للجروح والخدوش والحروق السطحية',
      },

      // Physiol Sérum
      {
        pharmacy: pharmacyAlnoor._id,
        name: 'Physiol Sérum 40 dosettes',
        genericName: 'Chlorure de sodium 0.9%',
        category: 'أطفال ورضع',
        dosage: 'علبة 40 جرعة 5 مل',
        price: 400,
        stock: 22,
        requiresPrescription: false,
        description: 'محلول ملحي معقم لتنظيف الأنف والعيون للرضع والأطفال',
      },

      // Paracétamol Sirop Enfants
      {
        pharmacy: pharmacyAlwiam._id,
        name: 'Paracétamol Sirop Enfants 100ml',
        genericName: 'Paracetamol',
        category: 'أطفال ورضع',
        dosage: 'قارورة شراب 100 مل مع ملعقة قياس',
        price: 170,
        stock: 20,
        requiresPrescription: false,
        description: 'خافض حرارة ومسكن للآلام مخصص للأطفال والرضع',
      },

      // Aspegic 100mg Nourrissons (Low stock example: 4 units!)
      {
        pharmacy: pharmacyAlshifa._id,
        name: 'Aspegic 100mg Nourrissons',
        genericName: 'Acétylsalicylate de lysine',
        category: 'أطفال ورضع',
        dosage: 'علبة 20 كيس بودرة',
        price: 220,
        stock: 4, // Low stock demo!
        requiresPrescription: false,
        description: 'خافض حرارة ومسكن مخصص للرضع بحذر وفق الجرعات الطبية',
      },
    ];

    const createdMedicines = await Medicine.insertMany(medicinesData);
    console.log(`Seeded ${createdMedicines.length} medicines across 3 pharmacies.`);

    // 10. Seed Demo Pharmacy Orders
    const dolipraneAlshifa = createdMedicines.find(
      (m) => m.name === 'Doliprane 1000mg' && m.pharmacy.toString() === pharmacyAlshifa._id.toString()
    );
    const vitCAlshifa = createdMedicines.find(
      (m) => m.name.includes('Vitamine C') && m.pharmacy.toString() === pharmacyAlshifa._id.toString()
    );

    await PharmacyOrder.create([
      {
        orderCode: 'PH-4821',
        client: client._id,
        pharmacy: pharmacyAlshifa._id,
        pharmacyName: pharmacyAlshifa.businessName,
        pharmacyPhone: pharmacyAlshifa.phone,
        pharmacyAddress: pharmacyAlshifa.address,
        items: [
          {
            medicine: dolipraneAlshifa._id,
            name: dolipraneAlshifa.name,
            dosage: dolipraneAlshifa.dosage,
            quantity: 2,
            unitPrice: dolipraneAlshifa.price,
            subtotal: dolipraneAlshifa.price * 2,
          },
          {
            medicine: vitCAlshifa._id,
            name: vitCAlshifa.name,
            dosage: vitCAlshifa.dosage,
            quantity: 1,
            unitPrice: vitCAlshifa.price,
            subtotal: vitCAlshifa.price,
          },
        ],
        deliveryType: 'pickup',
        customerName: client.name,
        customerPhone: client.phone,
        customerNotes: 'سأمر للاستلام خلال ساعتين إن شاء الله',
        totalPrice: dolipraneAlshifa.price * 2 + vitCAlshifa.price,
        platformCommissionRate: 5,
        status: 'accepted',
      },
      {
        orderCode: 'PH-7193',
        client: client._id,
        pharmacy: pharmacyAlnoor._id,
        pharmacyName: pharmacyAlnoor.businessName,
        pharmacyPhone: pharmacyAlnoor.phone,
        pharmacyAddress: pharmacyAlnoor.address,
        items: [
          {
            medicine: createdMedicines.find((m) => m.name === 'Augmentin 1g')._id,
            name: 'Augmentin 1g',
            dosage: 'علبة 14 قرص مغلف',
            quantity: 1,
            unitPrice: 920,
            subtotal: 920,
          },
        ],
        deliveryType: 'delivery',
        deliveryAddress: 'حي 19 مارس، عمارة 4، الوادي',
        prescriptionImage: 'assets/images/categories/pharmacy.png',
        customerName: client.name,
        customerPhone: client.phone,
        customerNotes: 'يرجى التأكد من الوصفة المرفقة والتوصيل للعنوان',
        totalPrice: 920,
        platformCommissionRate: 5,
        status: 'pending',
      },
    ]);
    console.log('Pharmacy orders seeded.');

    console.log('====================================================');
    console.log('Database Seeding Completed Successfully! 🚀');
    console.log('Ready-to-use Accounts:');
    console.log('1. Admin: admin@dzly.com / admin123456');
    console.log('2. Active General Provider: provider.active@dzly.com / provider123456');
    console.log('3. Pharmacy Provider (Al-Shifa): pharmacy.alshifa@dzly.com / provider123456');
    console.log('4. Pharmacy Provider (Al-Noor): pharmacy.alnoor@dzly.com / provider123456');
    console.log('5. Pharmacy Provider (Al-Wafa): pharmacy.alwiam@dzly.com / provider123456');
    console.log('6. Expired Provider: provider.expired@dzly.com / provider123456');
    console.log('7. Client: client@dzly.com / client123456');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDB();

