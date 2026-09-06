# 📐 بنية المشروع المنظمة - Organized Project Structure

## 🎯 نظرة عامة

تم تنظيم المشروع بطريقة احترافية تفصل بين:
- **كود الخادم** (server/)
- **الملفات العامة** (public/)
- **الموارد الثابتة** (assets/)
- **الملفات المؤقتة** (uploads/)
- **المخرجات** (output/)

## 📁 البنية التفصيلية

```
exam-monitoring/
│
├── 🖥️ server/                    # كود الخادم Backend
│   ├── app.js                    # نقطة الدخول الرئيسية
│   │                             # - إعداد Express
│   │                             # - إعداد Multer للرفع
│   │                             # - Routes API
│   │                             # - دوال توليد PDF/Excel
│   │
│   └── algorithms/               # الخوارزميات
│       └── distribution.js       # خوارزمية توزيع المراقبين
│                                 # - runDistribution()
│                                 # - buildMonitorView()
│
├── 🌐 public/                    # الملفات العامة Frontend
│   ├── css/                      # ملفات التنسيق
│   │   └── style.css            # التصميم الرئيسي
│   │
│   ├── js/                       # JavaScript
│   │   └── index.js             # المنطق الأمامي
│   │                            # - رفع الملفات
│   │                            # - عرض النتائج
│   │                            # - تعدد اللغات
│   │
│   ├── images/                   # الصور العامة
│   │   ├── Kalamoon Logo1.png   # شعار الجامعة
│   │   └── download.png         # أيقونة التحميل
│   │
│   └── index.html               # الصفحة الرئيسية
│       # الأقسام:
│       # - Observer Distribution
│       # - Excel to PDF Converter
│       # - How to Use
│
├── 🎨 assets/                    # الموارد الثابتة
│   ├── fonts/                    # الخطوط العربية
│   │   ├── Amiri-Regular.ttf    # خط أميري
│   │   └── Cairo-Regular.ttf    # خط القاهرة
│   │
│   └── images/                   # الصور/الشعارات
│       └── Kalamoon.png         # شعار للـ PDF
│
├── 📤 uploads/                   # الملفات المرفوعة (مؤقتة)
│   └── .gitkeep                 # للحفاظ على المجلد في git
│   # الملفات هنا:
│   # - ملفات Excel المرفوعة
│   # - تحذف تلقائياً (في .gitignore)
│
├── 📥 output/                    # الملفات المولدة
│   ├── pdfs/                    # ملفات PDF
│   │   ├── .gitkeep
│   │   ├── distribution-{timestamp}.pdf
│   │   ├── halls-{timestamp}.pdf
│   │   └── monitors-from-excel-{timestamp}.pdf
│   │
│   ├── excel/                   # ملفات Excel
│   │   ├── .gitkeep
│   │   └── distribution-{timestamp}.xlsx
│   │
│   └── colleges/                # PDF لكل كلية
│       ├── .gitkeep
│       └── {college_name}-{timestamp}.pdf
│
├── 📄 الملفات الأساسية
│   ├── package.json             # معلومات المشروع والمكتبات
│   ├── package-lock.json        # قفل إصدارات المكتبات
│   ├── .gitignore              # ملفات التجاهل في git
│   ├── README.md               # الدليل الرئيسي
│   ├── MIGRATION_GUIDE.md      # دليل التحويل
│   └── PROJECT_STRUCTURE.md    # هذا الملف
│
└── 📦 node_modules/             # المكتبات (في .gitignore)
```

## 🔗 تدفق البيانات (Data Flow)

### 1. Observer Distribution Mode

```
المستخدم
  ↓
[public/index.html] → رفع 3 ملفات Excel
  ↓
[public/js/index.js] → FormData
  ↓
[server/app.js] → POST /api/generate-pdf or /api/generate-excel
  ↓
[multer] → حفظ في uploads/
  ↓
[XLSX] → قراءة البيانات
  ↓
[server/app.js] → تنظيف البيانات
  ↓
[server/algorithms/distribution.js] → runDistribution()
  ↓
[server/algorithms/distribution.js] → buildMonitorView()
  ↓
[server/app.js] → generatePDFWithPuppeteer() or XLSX.writeFile()
  ↓
[output/] → حفظ الملفات
  ↓
[المستخدم] ← روابط التحميل
```

### 2. Excel to PDF Converter Mode

```
المستخدم
  ↓
[public/index.html] → رفع ملف Excel واحد
  ↓
[public/js/index.js] → FormData
  ↓
[server/app.js] → POST /api/upload-monitors-only
  ↓
[multer] → حفظ في uploads/
  ↓
[XLSX] → قراءة البيانات
  ↓
[server/app.js] → تحويل إلى monitorsView
  ↓
[server/app.js] → generatePDFWithPuppeteer()
  ↓
[output/] → حفظ الملفات
  ↓
[المستخدم] ← روابط التحميل
```

## 🛠️ الملفات الرئيسية ووظائفها

### server/app.js (الملف الأساسي)

| الوظيفة | الوصف |
|---------|-------|
| **إعداد Express** | تهيئة السيرفر والmiddleware |
| **إعداد Multer** | رفع الملفات إلى uploads/ |
| **Routes API** | 6 endpoints رئيسية |
| **تنظيف البيانات** | دوال معالجة ملفات Excel |
| **توليد PDF** | Puppeteer + HTML templates |
| **توليد Excel** | XLSX library |
| **خدمة الملفات** | Static file serving |

### server/algorithms/distribution.js (الخوارزمية)

| الوظيفة | الوصف |
|---------|-------|
| **runDistribution()** | توزيع المراقبين على الفترات |
| **buildMonitorView()** | بناء عرض المراقبين |
| **sortByFairness()** | ترتيب حسب العدل |
| **canTakeMain()** | التحقق من إمكانية التعيين |
| **assignMain()** | تعيين مراقبة أساسية |
| **assignReserve()** | تعيين احتياط |

### public/js/index.js (الواجهة)

| الوظيفة | الوصف |
|---------|-------|
| **رفع الملفات** | تحميل الملفات عبر fetch API |
| **عرض النتائج** | إظهار روابط التحميل |
| **تعدد اللغات** | التبديل بين العربية والإنجليزية |
| **التنقل** | بين الصفحات المختلفة |

## 📊 API Endpoints

| Method | Path | الوصف | الملفات المرفوعة |
|--------|------|-------|------------------|
| POST | `/api/upload-all` | رفع 3 ملفات وتنظيف البيانات | monitors, periods, halls |
| POST | `/api/generate-pdf` | توليد جميع ملفات PDF | monitors, periods, halls |
| POST | `/api/generate-excel` | توليد ملف Excel واحد | monitors, periods, halls |
| POST | `/api/upload-monitors-only` | تحويل Excel → PDF | 1 ملف Excel |
| GET | `/api/run-distribution` | تشغيل التوزيع (قديم) | - |
| GET | `/api/download-pdf` | تحميل PDF المراقبين | - |
| GET | `/api/download-halls-pdf` | تحميل PDF القاعات | - |
| GET | `/api/download-pdfs-by-college` | تحميل PDFs الكليات | - |

## 🎨 Assets Management

### الخطوط (assets/fonts/)
- **استخدام**: في توليد PDF عبر Puppeteer
- **الخطوط المطلوبة**: Amiri, Cairo (للعربية)
- **التحميل**: عبر Google Fonts أو Local

### الصور (assets/images/)
- **Kalamoon.png**: يُستخدم في PDF (Base64)
- **التحميل**: عبر `fs.readFileSync()`

## 🔄 التحديثات المستقبلية

يمكن إضافة:

```
server/
├── controllers/        # فصل المنطق
├── services/          # خدمات مشتركة
├── routes/            # فصل الـ routes
├── middleware/        # middleware مخصص
├── utils/             # دوال مساعدة
└── config/            # إعدادات
```

## 🎓 أفضل الممارسات

1. ✅ فصل الاهتمامات (Separation of Concerns)
2. ✅ أسماء ملفات واضحة
3. ✅ تعليقات باللغة العربية
4. ✅ استخدام .gitignore للملفات المؤقتة
5. ✅ توثيق شامل

## 🔐 الأمان

- uploads/ و output/ في .gitignore
- لا يتم رفع الملفات المولدة إلى Git
- تنظيف الملفات المؤقتة (يمكن إضافة)

---

**ملاحظة**: هذه البنية قابلة للتوسع ويمكن تطويرها بسهولة حسب الاحتياجات المستقبلية.

