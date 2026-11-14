# دليل التشغيل والتثبيت الشامل (System Runbook & Deployment Guide)
## مشروع منصة وتطبيق "احجزلي Dz" (Ihjizli Dz Platform)

---

## 1. بنية المشروع الصارمة (Project Architecture)

المشروع مقسم إلى أربعة مجلدات رئيسية ومستقلة تماماً:

```text
dzly/
├── SYSTEM_ANALYSIS.md       # وثيقة التحليل الشامل للمنظومة والحقول الديناميكية
├── RUNBOOK.md               # دليل التشغيل والرفع على السيرفر
├── backend/                 # خادم Node.js + Express.js + MongoDB + JWT
│   ├── src/
│   │   ├── config/          # إعدادات قاعدة البيانات والمتغيرات
│   │   ├── models/          # نماذج Mongoose (User, Category, Service, Booking, Subscription, Settings, ...)
│   │   ├── middleware/      # حماية التوثيق، الصلاحيات RBAC، وحارس الاشتراك Subscription Guard
│   │   ├── controllers/     # المنطق البرمجي لكافة المسارات
│   │   ├── routes/          # مسارات REST API
│   │   └── seed/            # سكربت ملء قاعدة البيانات (seed.js)
│   ├── tests/               # اختبارات Jest + Supertest الشاملة
│   ├── server.js            # نقطة انطلاق السيرفر الرئيسي
│   └── package.json
│
├── admin-dashboard/         # لوحة تحكم الإدارة العليا (React + Tailwind CSS RTL)
│   ├── src/
│   │   ├── api/             # ربط Axios مع الـ Backend
│   │   ├── context/         # إدارة حالة الجلسة والتسجيل
│   │   ├── components/      # شاشات التحليلات، الحجوزات، الخدمات، الأقسام، الاشتراكات، الإعدادات
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
│
├── provider-dashboard/      # لوحة تحكم مزودي الخدمات (React + Tailwind CSS RTL)
│   ├── src/
│   │   ├── api/             # ربط Axios مع الـ Backend
│   │   ├── context/         # فحص صلاحية الاشتراك وحالة المزود
│   │   ├── components/      # بانر حماية الاشتراك، الحجوزات، الخدمات، المستحقات، التقارير
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
│
└── mobile-app/              # تطبيق الموبايل الأصلي (Flutter MVC)
    ├── lib/
    │   ├── core/
    │   │   ├── config/      # api_config.dart للتحكم في Base URL
    │   │   ├── constants/   # المسارات الثابتة للصور والأيقونات
    │   │   └── theme/       # الهوية البصرية والألوان
    │   ├── models/          # UserModel, CategoryModel, ServiceModel, BookingModel
    │   ├── services/        # ApiService, AuthService
    │   ├── controllers/     # HomeController, BookingController, AuthController, ...
    │   ├── views/           # شاشات الدخول، الرئيسية، تفاصيل الخدمة، الحجز الديناميكي، الحساب
    │   └── main.dart
    └── pubspec.yaml
```

---

## 2. جدول بيانات الدخول الجاهزة فوراً (Ready-to-Use Accounts)

تم ملء قاعدة البيانات مسبقاً عبر سكربت البذور `seed.js` بالحسابات والبيانات التالية:

| نوع الحساب | الدور (Role) | البريد الإلكتروني (Email) | كلمة المرور (Password) | حالة الاشتراك / الحساب | الصلاحيات والوظيفة |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **الأدمن العام (Admin)** | `admin` | `admin@dzly.com` | `admin123456` | نشط دائم | إدارة كاملة، تعديل أسعار الاشتراكات والعمولات، اعتماد الخدمات، تفعيل المزودين. |
| **مزود خدمة نشط (Active)** | `provider` | `provider.active@dzly.com` | `provider123456` | **اشتراك ساري المفعول** (سنة كاملة) | استقبال الحجوزات، تأكيد ورفض وإتمام الطلبات، إضافة الخدمات، وسحب التقارير. |
| **مزود خدمة منتهي (Expired)** | `provider` | `provider.expired@dzly.com` | `provider123456` | **اشتراك منتهٍ** (منذ 30 يوماً) | **مخصص لاختبار حارس الاشتراك (Subscription Guard)**: يمنعه النظام من استقبال الحجوزات أو إضافة خدمات وتظهر له شاشة المطالبة بالتجديد. |
| **عميل تجريبي (Client)** | `client` | `client@dzly.com` | `client123456` | نشط | حجز الخدمات من كافة الأقسام الثمانية، متابعة الحجوزات، وإلغاء الحجوزات. |

---

## 3. خطوات التشغيل بالترتيب (Step-by-Step Runbook)

### الخطوة 1: تشغيل قاعدة البيانات (MongoDB)
تأكد من تشغيل خادم MongoDB على المنفذ الافتراضي `27017`:
```bash
mongod --dbpath /path/to/data/db
# أو عبر خدمة Homebrew على macOS:
brew services start mongodb-community
```

---

### الخطوة 2: تشغيل الخادم وتعبئة البيانات (`/backend`)
```bash
cd backend

# 1. تثبيت الحزم (إن لم تكن مثبتة):
npm install

# 2. ملء قاعدة البيانات بالأقسام والخدمات والحسابات التجريبية:
npm run seed

# 3. تشغيل الاختبارات الآلية (22 اختبار متكامل):
npm test

# 4. تشغيل خادم الـ API:
npm start
# يعمل السيرفر على: http://localhost:7001 (أو http://169.58.109.98:7001)
```

---

### الخطوة 3: تشغيل لوحة تحكم الإدارة العليا (`/admin-dashboard`)
```bash
cd admin-dashboard

# 1. تثبيت الحزم:
npm install

# 2. تشغيل اللوحة في وضع التطوير:
npm run dev
# تفتح اللوحة على: http://localhost:7002
```
*سجل الدخول باستخدام:* `admin@dzly.com` / `admin123456`.

---

### الخطوة 4: تشغيل لوحة تحكم مزود الخدمة (`/provider-dashboard`)
```bash
cd provider-dashboard

# 1. تثبيت الحزم:
npm install

# 2. تشغيل اللوحة في وضع التطوير:
npm run dev
# تفتح اللوحة على: http://localhost:7003
```
*سجل الدخول باستخدام:*
* المزود النشط: `provider.active@dzly.com` / `provider123456`
* المزود منتهي الاشتراك: `provider.expired@dzly.com` / `provider123456` (لاختبار ظهور نافذة تجديد الاشتراك وتجميد الحجوزات).

---

### الخطوة 5: تشغيل تطبيق الموبايل (`/mobile-app` - Flutter)
```bash
cd mobile-app

# 1. تحميل الحزم:
flutter pub get

# 2. فحص الأكواد:
flutter analyze

# 3. تشغيل التطبيق على المحاكي أو المتصفح أو الهاتف:
flutter run
```

---

## 4. كيفية تغيير عنوان الخادم (Base URL) عند الرفع على الاستضافة

تم توحيد عنوان الخادم في مكان مركزي واحد في كل جزء من أجزاء المنظومة:

### 1. في تطبيق الفلاتر (`/mobile-app`):
افتح الملف:
[`lib/core/config/api_config.dart`](file:///Users/fadygamil/Desktop/dzly/mobile-app/lib/core/config/api_config.dart)
وقم بتعديل المتغير:
```dart
class ApiConfig {
  // عنوان السيرفر والباك إند:
  static String baseUrl = 'http://169.58.109.98:7001/api';
}
```

### 2. في لوحة تحكم الأدمن (`/admin-dashboard`):
أنشئ أو عدّل ملف `.env` داخل المجلد:
```env
VITE_API_URL=http://localhost:7001/api
```

### 3. في لوحة تحكم مزود الخدمة (`/provider-dashboard`):
أنشئ أو عدّل ملف `.env` داخل المجلد:
```env
VITE_API_URL=http://localhost:7001/api
```

### 4. في الباك اند (`/backend`):
عدّل ملف `.env` لضبط رابط قاعدة البيانات والمنفذ:
```env
PORT=7001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ihjizli_dz
JWT_SECRET=ihjizli_super_secret_jwt_key_dz_2026_production
BASE_URL=http://localhost:7001
```

---

## 5. نتائج الاختبارات الآلية (Automated Integration Tests)

تم تشغيل الاختبارات الآلية باستخدام `Jest` و `Supertest` بنجاح 100%:
* **22 اختباراً متكاملاً (22 passed out of 22)**
* تغطية شاملة تشمل:
  1. توثيق وتسجيل دخول الأدمن والعميل والمزودين وفحص صلاحيات JWT.
  2. منع الوصول غير المصرح به والتحقق من جدار الصلاحيات RBAC.
  3. إنشاء الحجوزات بالحقول الديناميكية للأقسام الثمانية (سيارات، تجميل، مزارع، قاعات، فنادق).
  4. تأكيد ورفض وإتمام الحجوزات وإرسال الإشعارات.
  5. فحص حارس الاشتراك (Subscription Guard): حظر المزود المنتهي من إضافة الخدمات أو قبول الحجوزات وسماح المزود النشط.
  6. تجديد واشتراكات المزودين وتفعيل الأدمن.
  7. قراءة وحفظ وتعديل الإعدادات والعمولات والتقارير المالية.

