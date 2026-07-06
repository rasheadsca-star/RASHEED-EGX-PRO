# تقرير تطوير EGX Pro Hub V9.9 — Investment Trust Governor

تم تطوير النسخة المرفقة لتتحول من لوحة فرص عالية الثقة ظاهرياً إلى نظام توصيات محافظ لا يسمح بأي توصية استثمارية قابلة للمراجعة إلا بعد المرور على بوابات جودة صارمة.

## ما تم إضافته

1. **بوابة موثوقية التوصيات Investment Trust Governor**
   - ملف جديد: `scripts/build-recommendation-trust-governor.js`
   - مخرجات جديدة:
     - `data/investment-trust-governor.json`
     - `data/actionable-investment-recommendations.json`
   - لا يسمح بترقية أي سهم إلى مراجعة استثمارية إلا إذا تحقق الآتي:
     - الرمز موجود في Universe الرسمي.
     - السعر آمن ولا يوجد conflict/precision risk.
     - التاريخ كافٍ: 20 جلسة للتنفيذ، و10 جلسات للمراجعة المشروطة.
     - قوة أدلة المصادر لا تقل عن 65%.
     - R/R مقبول والعائد المتوقع موجب.
     - لا توجد قيود عامة من Confidence Guard أو Data Operations أو Workflow Verification.

2. **وضع تحليل منفصل عن وضع تنفيذ**
   - `price-reconciliation-report.json` أصبح يفرق بين:
     - `isExecutionSafe`: صالح لتنفيذ لحظي/قريب.
     - `isAnalysisSafe`: صالح للتحليل من آخر جلسة فقط.
   - السعر القديم لا يساوي بالضرورة سعر خاطئ، لكنه لا يسمح بتنفيذ مباشر.

3. **فلترة رموز Mubasher Analysis Tools**
   - تم تعديل `scripts/collect-mubasher-analysis-tools.js`.
   - تم تعديل `scripts/build-multi-source-intelligence.js`.
   - أي رمز غير موجود في `config/egx-symbols.csv` أو Universe الرسمي يتم استبعاده.
   - يعالج هذا مشكلة الرموز الوهمية مثل CSS / GPT / URL / TDWL.

4. **القرار الموحد أصبح بعد بوابة الثقة**
   - تم تحديث `scripts/build-unified-decision-board.js`.
   - `data/unified-decision-board.json` أصبح هو المصدر النهائي بعد Trust Governor.
   - لا توجد حالة `go` إلا إذا كانت `executionAllowed=true`.

5. **تحديث الواجهة**
   - تمت إضافة شاشة جديدة: **بوابة موثوقية التوصيات**.
   - تظهر القواعد والقيود العامة وجدول القرار النهائي.
   - تم تعديل القائمة الجانبية والاختصارات لتبدأ ببوابة الثقة والقرار الموحد.

6. **تحديث محركات الإشارات بعد الحوكمة**
   - `build-signal-quality-engine.js` أصبح يلتزم بنتيجة Trust Governor.
   - `build-actionable-watchlist.js` لم يعد يسمح بفرص A+/A إذا بوابة الثقة لا تسمح.
   - `build-entry-trigger-engine.js` يستمر كتنبيه مراقبة وليس تنفيذ.

7. **تحسين التشغيل على Render/GitHub**
   - إضافة `server.js` مع endpoint `/health`.
   - إضافة `npm start` في `package.json`.
   - نسخ أيقونات PWA إلى مجلد `icons/` حتى تعمل روابط manifest/service-worker.

## نتيجة التشغيل الحالية على بيانات النسخة المرفقة

- `price-reconciliation-report`: لا يوجد سعر صالح للتنفيذ اللحظي حالياً بسبب قدم البيانات حسب وقت التشغيل، لكن يوجد 82 سعر صالح للتحليل فقط.
- `investment-trust-governor`: 0 جاهز للمراجعة، 55 مراقبة فقط، 166 محجوب.
- `unified-decision-board`: 0 تنفيذ، 79 مراقبة، 142 محجوب.
- السبب الرئيسي: التاريخ غير مكتمل جداً، عينة الأداء المغلقة غير كافية، وتعارض الأسعار/حجب الأسعار مرتفع.

## مبدأ النسخة الجديدة

إذا كانت البيانات غير كافية، فالقرار الموثوق ليس “شراء”، بل “مراقبة فقط” أو “محجوب”. هذه النسخة تقلل عدد الفرص لكنها تمنع توصيات مضللة.
