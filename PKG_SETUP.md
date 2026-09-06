# 📦 إعداد pkg للمشروع

## ✅ ما تم إنجازه

### 1. تثبيت pkg
- تم إضافة `pkg` كـ dev dependency
- تم تثبيته في `node_modules`

### 2. تحديث package.json
- إضافة تكوين `pkg` مع:
  - **scripts**: ملفات JavaScript المطلوبة
  - **assets**: الملفات الثابتة (public, assets)
  - **targets**: الأنظمة المدعومة (Windows, Linux, macOS)
  - **outputPath**: مجلد الإخراج (dist)

### 3. تحديث server/app.js
- إضافة دالة `getBasePath()` للتعامل مع المسارات عند استخدام pkg
- إضافة دالة `getAssetPath()` للوصول إلى الملفات المضمنة
- تحديث جميع المسارات لاستخدام الدوال الجديدة:
  - الملفات الديناميكية (uploads, output) → بجانب الملف التنفيذي
  - الملفات المضمنة (public, assets) → من snapshot

### 4. إنشاء ملفات مساعدة
- `.pkgignore`: لتحديد الملفات المستبعدة من البناء
- `BUILD_INSTRUCTIONS.md`: تعليمات مفصلة للبناء والاستخدام

## 🚀 كيفية الاستخدام

### البناء:
```bash
npm run build        # لجميع الأنظمة
npm run build:win    # Windows فقط
npm run build:linux # Linux فقط
npm run build:mac   # macOS فقط
```

### الملفات المولدة:
ستكون في مجلد `dist/:
- `exam-monitoring-win.exe` (Windows)
- `exam-monitoring-linux` (Linux)
- `exam-monitoring-macos` (macOS)

## 📝 ملاحظات مهمة

1. **الملفات المضمنة**: 
   - `public/` و `assets/` مُضمنة في الملف التنفيذي
   - لا حاجة لنسخها يدوياً

2. **الملفات الديناميكية**:
   - `uploads/` و `output/` تُنشأ تلقائياً بجانب الملف التنفيذي
   - تأكد من صلاحيات الكتابة

3. **Puppeteer**:
   - قد تحتاج متطلبات إضافية على بعض الأنظمة
   - الكود يحتوي على `--no-sandbox` للمساعدة

4. **حجم الملف**:
   - الملف التنفيذي كبير (50-100 MB) لأنه يحتوي على Node.js والمكتبات

## 🔍 التحقق من البناء

بعد البناء، يمكنك:
1. نسخ الملف التنفيذي إلى أي جهاز
2. تشغيله مباشرة (بدون Node.js)
3. فتح المتصفح على `http://localhost:3000`

## ⚠️ استكشاف الأخطاء

- إذا فشل البناء: تأكد من تثبيت جميع dependencies
- إذا لم يعمل الملف: تأكد من استخدام الملف المناسب لنظام التشغيل
- إذا فشل Puppeteer: قد تحتاج لتثبيت Chromium على Linux

