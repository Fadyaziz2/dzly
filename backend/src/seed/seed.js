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

    console.log('Users seeded (Admin, Active Provider, Expired Provider, Client).');

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
    console.log('Subscriptions seeded.');

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

    console.log('====================================================');
    console.log('Database Seeding Completed Successfully! 🚀');
    console.log('Ready-to-use Accounts:');
    console.log('1. Admin: admin@dzly.com / admin123456');
    console.log('2. Active Provider: provider.active@dzly.com / provider123456');
    console.log('3. Expired Provider: provider.expired@dzly.com / provider123456');
    console.log('4. Client: client@dzly.com / client123456');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDB();

