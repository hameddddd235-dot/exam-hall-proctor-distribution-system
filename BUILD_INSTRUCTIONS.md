# 📦 تعليمات بناء ملف تنفيذي باستخدام pkg

## 🎯 الهدف
إنشاء ملف تنفيذي يعمل على أي جهاز بدون الحاجة لتثبيت Node.js

## 📋 المتطلبات
- Node.js مثبت على جهازك (للبناء فقط)
- npm أو yarn

## 🚀 خطوات البناء

### 1. تثبيت pkg
```bash
npm install
```

### 2. بناء الملف التنفيذي

#### بناء لجميع الأنظمة (Windows, Linux, macOS):
```bash
npm run build
```

#### بناء لنظام معين:

**Windows:**
```bash
npm run build:win
```

**Linux:**
```bash
npm run build:linux
```

**macOS:**
```bash
npm run build:mac
```

### 3. الملفات المولدة
بعد البناء، ستجد الملفات التنفيذية في مجلد `dist/`:
- `exam-monitoring-win.exe` (لـ Windows)
- `exam-monitoring-linux` (لـ Linux)
- `exam-monitoring-macos` (لـ macOS)

## 📁 استخدام الملف التنفيذي

### Windows:
1. انسخ `exam-monitoring-win.exe` إلى أي مجلد
2. انقر نقراً مزدوجاً لتشغيله
3. سيعمل السيرفر على `http://localhost:3000`

### Linux:
1. انسخ `exam-monitoring-linux` إلى أي مجلد
2. امنحه صلاحيات التنفيذ:
   ```bash
   chmod +x exam-monitoring-linux
   ```
3. شغله:
   ```bash
   ./exam-monitoring-linux
   ```

### macOS:
1. انسخ `exam-monitoring-macos` إلى أي مجلد
2. امنحه صلاحيات التنفيذ:
   ```bash
   chmod +x exam-monitoring-macos
   ```
3. شغله:
   ```bash
   ./exam-monitoring-macos
   ```

## ⚠️ ملاحظات مهمة

1. **المجلدات الديناميكية**: 
   - المجلدات `uploads/` و `output/` ستُنشأ تلقائياً بجانب الملف التنفيذي
   - تأكد من أن الملف التنفيذي في مجلد لديه صلاحيات الكتابة

2. **Puppeteer**: 
   - قد تحتاج إلى تثبيت متطلبات إضافية لـ Puppeteer على بعض الأنظمة
   - على Linux، قد تحتاج: `apt-get install -y chromium-browser` أو `yum install chromium`

3. **الملفات المضمنة**:
   - الملفات في `public/` و `assets/` مُضمنة في الملف التنفيذي
   - لا حاجة لنسخها يدوياً

4. **حجم الملف**:
   - الملف التنفيذي سيكون كبيراً (حوالي 50-100 MB) لأنه يحتوي على Node.js والمكتبات

## 🔧 استكشاف الأخطاء

### المشكلة: الملف لا يعمل
- تأكد من أنك تستخدم الملف المناسب لنظام التشغيل
- على Linux/macOS، تأكد من صلاحيات التنفيذ

### المشكلة: Puppeteer لا يعمل
- على Linux، قد تحتاج لتثبيت Chromium
- جرب إضافة `--no-sandbox` في إعدادات Puppeteer (موجود بالفعل في الكود)

### المشكلة: الملفات لا تُحفظ
- تأكد من صلاحيات الكتابة في المجلد الذي يحتوي على الملف التنفيذي

## 📝 ملاحظات التطوير

- عند التطوير، استخدم `npm start` لتشغيل التطبيق بشكل عادي
- استخدم `npm run build` فقط عند الحاجة لإنشاء ملف تنفيذي للتوزيع

