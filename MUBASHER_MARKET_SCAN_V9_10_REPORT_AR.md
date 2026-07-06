# تقرير تطوير V9.10 — ربط الأسعار والبيانات بمسح مباشر من Mubasher

## الهدف
تعديل التطبيق حتى لا يعتمد على بيانات قديمة أو غير مرتبطة بالواقع، ويقوم ببناء `data/market.json` من مسح فعلي للسوق عبر صفحات Mubasher العامة والمتأخرة، مع استخدام صفحات أدوات التحليل التي طلبتها كمصادر إثبات ومراقبة:

- https://www.mubasher.info/analysis-tools/volume-monitor/EGX
- https://www.mubasher.info/analysis-tools/stocks-support-resistance/EGX
- https://www.mubasher.info/analysis-tools/liquidity-monitor/EGX

## ما تم تنفيذه

### 1. إضافة ماسح سوق كامل
تمت إضافة الملف:

`scripts/collect-mubasher-market-scan.js`

يقوم بالآتي:

- تحميل Universe الرسمي من `config/egx-symbols.csv` مع تدعيمه من ملفات `symbols/universe/market/cache`.
- زيارة صفحة كل سهم على Mubasher English:
  - `https://english.mubasher.info/markets/EGX/stocks/{SYMBOL}/`
- استخراج:
  - آخر سعر.
  - نسبة التغير.
  - الافتتاح.
  - الإغلاق السابق.
  - أعلى/أدنى سعر.
  - حجم التداول.
  - قيمة التداول.
  - توقيت آخر تحديث من Mubasher.
- زيارة صفحة الدعم والمقاومة لكل سهم:
  - `https://english.mubasher.info/markets/EGX/stocks/{SYMBOL}/support-resistance`
- استخراج:
  - Pivot.
  - Support 1 / Support 2.
  - Resistance 1 / Resistance 2.
- عدم اختراع أي سعر: إذا لم يتم استخراج السعر، لا يتم قبول السهم في `market.json`.

### 2. التعامل مع صفحات أدوات التحليل التي طلبتها
صفحات أدوات التحليل العامة في Mubasher تظهر في HTML كقوالب Angular مثل `{{row.name}}` و `{{row.volume}}`، ولذلك لا يمكن الاعتماد على الـ HTML وحده كجدول بيانات جاهز. تم جعل التطبيق:

- يزور الصفحات الثلاث ويتحقق من وصولها.
- يسجل حالتها في `data/mubasher-market-scan.json`.
- يستخدم صفحات الأسهم التفصيلية للحصول على الأرقام الفعلية القابلة للاستخراج.
- يبني ملف `data/mubasher-analysis-tools.json` كطبقة Evidence مبنية على نفس المسح الواقعي.

### 3. تحديث نقطة الجلب الأساسية
تم تعديل:

`scripts/fetch-market-data.js`

ليصبح Entry Point متوافقاً، ويشغل ماسح V9.10 الجديد.

### 4. منع الرموز الوهمية
تم تعديل:

`scripts/collect-mubasher-analysis-tools.js`

بحيث لا يسمح بمرور رموز مثل `CSS`, `GPT`, `URL`, `TDWL` إذا لم تكن ضمن Universe الرسمي للبورصة المصرية.

### 5. تحديث GitHub Actions
تم تعديل:

`.github/workflows/update-market-data.yml`

ليعمل المسح الجديد أثناء جلسة السوق تقريباً كل ساعة:

- من 10:05 إلى 16:05 بتوقيت القاهرة تقريباً.
- مع تشغيل إضافي بعد الجلسة.
- مع بقاء التشغيل اليدوي `workflow_dispatch`.

### 6. تحديث واجهة التطبيق
تم تعديل العناوين الظاهرة من V8.10.1/V9.9 إلى:

`V9.10 Mubasher Market Scan + Trust Governor`

حتى لا يختلط الأمر بين النسخ القديمة والجديدة.

## الملفات الناتجة من المسح الجديد
عند تشغيل GitHub Actions بنجاح سيظهر أو يتحدث:

- `data/mubasher-market-scan.json`
- `data/market.json`
- `data/last-good-market.json`
- `data/source-health.json`
- `data/fetch-status.json`
- `data/source-fetch-report.json`
- `data/mubasher-analysis-tools.json`
- ثم يعاد بناء:
  - `data/price-reconciliation-report.json`
  - `data/multi-source-intelligence.json`
  - `data/final-multisource-ranking.json`
  - `data/investment-trust-governor.json`
  - `data/unified-decision-board.json`

## حدود مهمة

- البيانات من Mubasher عامة ومتأخرة، وليست Feed تنفيذ لحظي من وسيط.
- التطبيق الآن يحاول ربط الأسعار بالواقع من مصدر عام موثوق، لكنه يظل مساعد قرار وليس بديل منصة تداول.
- أي توصية شراء لا يجب تنفيذها قبل مطابقة السعر مع منصة التداول أو الوسيط.

## طريقة التفعيل بعد رفع النسخة

1. ارفع محتويات النسخة إلى الريبو.
2. افتح GitHub Actions.
3. شغل Workflow:

`Update EGX Market Data`

4. بعد انتهاء التشغيل، افتح:

`https://rasheadsca-star.github.io/RASHEED-EGX-PRO/?v=910`

5. راجع داخل التطبيق:

- `آخر تحديث`.
- `sourceName` أو مصدر البيانات.
- `mubasher-market-scan`.
- `بوابة الثقة`.
- `القرار الموحد`.

