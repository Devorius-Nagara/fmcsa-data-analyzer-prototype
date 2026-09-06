# Контекст проєкту: FMCSA Data Analyzer (Trackensure) — прототип

Це репозиторій статичного клікабельного HTML/CSS/JS прототипу продукту з аналізу
даних FMCSA (compliance-дашборд: скор компаній, інспекції, порушення, тампери ELD,
краші, страхування, SMS BASIC). Прототип задумано без будь-якого build-степу —
чистий HTML/CSS/vanilla JS, щоб коректно працювати на GitHub Pages.

Репозиторій: `fmcsa-data-analyzer-prototype` (на моєму Маку —
`Desktop/TE stuff/fmcsa-data-analyzer-prototype`).

## Структура файлів

```
/
├── index.html          — головний дашборд (тайли, топ-компанії, топ-стейти)
├── companies.html       — довідник усіх компаній: пошук, фільтри (провайдер,
│                          клієнт/не-клієнт, мін. скор), сортування колонок
├── company.html         — профіль однієї компанії (?dot=XXXXXXX), ОДНА сторінка
│                          з табами замість окремих сторінок:
│                          Inspections / Violations / Crashes / Insurance /
│                          SMS BASIC / Tickets / Uploads / Risk Score
├── providers.html        — список ELD-провайдерів
├── provider.html         — профіль одного провайдера (?id=XXX), включно з
│                          графіком розподілу скорів компаній провайдера
├── state.html            — розбивка тамперингів по штатах (?state=XX)
├── css/style.css         — усі стилі (один файл, без препроцесора)
├── js/data.js            — усі фейкові дані + хелпери-лукапи (COMPANIES,
│                          PROVIDERS, INSPECTIONS, CRASHES, INSURANCE_HISTORY,
│                          SMS_BASICS, SCORE_HISTORY, VEHICLES, STATES, UPLOADS)
├── js/app.js             — спільні UI-хелпери: сайдбар (mountSidebar/sidebarHTML),
│                          хлібні крихти (breadcrumb), іконки (icon/ICONS),
│                          копіювання в буфер (copyToClipboard), scorePill,
│                          getProvider, qs() тощо — підключається на кожній сторінці
├── docs/
│   ├── fmcsa-api-integration.md   — технічна довідка по реальних FMCSA
│   │                                 ендпоінтах (QCMobile API, data.transportation.gov,
│   │                                 MCMIS, SMS BASIC, SAFER) — куди і як
│   │                                 підключати реальні дані замість моків
│   └── handoff-prompt-for-claude-code.md  — цей файл
└── README.md
```

## Що вже зроблено (у хронологічному порядку комітів)

1. **`c8cc748`** — Початковий прототип: дашборд, список компаній, профіль компанії,
   провайдери, розбивка по штатах, базовий набір фейкових даних.
2. **`52dff5a`** — Додано динамічні хлібні крихти (`breadcrumb()` в app.js) замість
   статичного "< Back" усюди, персистентний сайдбар швидкої навігації, індикатор
   тамперингу (Yes/No) скрізь, де показуються інспекції, окремі сторінки-списки
   (tickets/uploads/inspections — пізніше об'єднані назад у таби, див. п.4).
3. **`5103dc0`** — Великий редизайн навігації за мотивами конкурента carrierintel.ai:
   консолідація `company.html` в одну сторінку з in-page табами (Inspections,
   Violations, Tickets, Uploads, Risk Score) замість купи окремих HTML-сторінок.
   Видалено окремі файли `tickets.html`, `uploads.html`, `inspections.html`,
   `inspection.html`, `violation.html`, `risk-score.html` — все тепер таби всередині
   `company.html`.
4. **`11d4ed0`** — Дослідив реальний carrierintel.ai (кожен таб, реальні дані),
   зробив gap-аналіз і за згодою користувача додав усе, чого бракувало:
   - Розширений info-грід компанії: адреса, mailing address, телефон, email,
     офіцер компанії, operation classification, cargo types, дата отримання
     authority, дата/пробіг MCS-150, розмір флоту (units/trailers/drivers).
   - Нові дані й таби: **Crashes** (аварії з деталями авто), **Insurance
     history** (страхові поліси), **SMS BASIC** (5 офіційних категорій BASIC),
     **Score trend** (12-місячний спарклайн скору).
   - Нова структура `VEHICLES` (повні VIN + номери трака/трейлера), використана
     і в інспекціях, і в краш-записах.
5. **`a5d2c8a`** — Фікси за скріншотами користувача:
   - Зменшено занадто великий графік "Company score distribution" на
     `provider.html` (менші паддінги, менша висота барів, менший шрифт).
   - Вирівняно вкладену таблицю в розгорнутому рядку інспекції.
   - VIN трака/трейлера тепер показуються **повністю**, вертикальним списком,
     з кнопкою копіювання (`copyBtn()` + `copyToClipboard()` в app.js), плюс
     індикатор "чи була вигрузка FMCSA цього дня" (`uploadOnDate()` в data.js).
   - Розширено дані по крашах (видно конкретний трак/трейлер по кожній аварії).
   - Створено `companies.html` — повноцінний довідник компаній з пошуком/
     фільтрами/сортуванням; у сайдбарі "Jump to company" (inline-пошук) замінено
     на кнопку **Company**, яка веде на цю сторінку.
6. **`84b5ecb`** (останній коміт) — Додано `docs/fmcsa-api-integration.md`:
   технічна документація для розробників — де взяти реальні дані замість
   фейкових (QCMobile API з процесом реєстрації webKey через Login.gov,
   data.transportation.gov Socrata API для інспекцій/порушень, і чесні нотатки
   про те, що для Crashes/SMS BASIC/SAFER/страхування офіційного живого API
   немає — тільки bulk-завантаження або HTML-сторінки).

## На чому зупинились

Останній запит користувача (виконано) — технічна документація по ендпоінтах.
Після цього комітом `84b5ecb` завершено **всі** явно озвучені задачі цієї сесії.
Прямо зараз немає жодної незавершеної задачі в коді — прототип у стабільному,
робочому стані, всі фічі, про які просив користувач, реалізовані і закомічені.

Окремо (поза цим репозиторієм коду) також була зроблена **статична дизайн-канва**
в Claude Design з мокапами всіх 6 сторінок (Dashboard, Companies, Providers,
Company detail, Provider detail, State breakdown), опублікована як Artifact:
`https://claude.ai/code/artifact/34b51cce-9151-4c8e-93d0-2b71c544bb1c`.
Це НЕ файли в цьому репо — це окремий visual-referance canvas, побудований на
основі реальних CSS-токенів прототипу. Може бути корисним як референс дизайну,
якщо продовжуватимеш верстку.

## Важливо: як має бути влаштована робота з реальними даними

Дивись `docs/fmcsa-api-integration.md` — там повна мапа "яке поле в js/data.js
→ який реальний FMCSA source його має заповнювати". Коротко:

- **QCMobile API** (mobile.fmcsa.dot.gov/qc/services/) — офіційний живий API,
  потребує webKey (реєстрація через Login.gov). Покриває: ідентичність компанії,
  MCS-150, authority, fleet, cargo, basics-зведення.
- **data.transportation.gov** (Socrata, dataset `876r-jsdb`) — офіційний живий
  API без обов'язкової авторизації. Покриває: детальні інспекції/порушення.
- **Тампери ELD** — це НЕ окреме поле FMCSA, а наша власна бізнес-логіка:
  визначається за кодами порушень (395.8(e) та суміжні ELD-коди).
- **Crashes (MCMIS Crash File)**, **SMS BASIC score**, **SAFER** — офіційного
  живого API немає, тільки періодичні bulk-файли або FOIA-запити. Це треба
  архітектурно закладати як scheduled batch ETL, а не request-per-page виклики.
- **Insurance (L&I)** та **ELD registry** — ще не досліджено детально, позначено
  як "unconfirmed" у документації, треба перевірити перед реалізацією.

## Технічні патерни, які варто знати перед подальшою роботою

- Кожна HTML-сторінка підключає `css/style.css`, потім `js/data.js`, потім
  `js/app.js` (у такому порядку), і має контейнери `<div data-topbar></div>` /
  `<div data-sidebar></div>`, які монтуються скриптом в кінці app.js
  (`DOMContentLoaded` → `mountSidebar()`).
- Хлібні крихти: виклик `breadcrumb([{label, href}, ...])` в кожен `#back`-контейнер.
- Табований UI компанії: масив `TABS` (`{key, label, count, render}`), функція
  `selectTab(key)` перемальовує `#tab-panel`.
- Розгортні рядки таблиць (accordion): клас `.exp-row` (клік), парний
  `.exp-panel-row#panel-<key>` (прихований за замовчуванням),
  `bindExpandableRows()` навішує обробники після кожного рендеру.
- Копіювання в буфер: `copyBtn(text)` → `copyToClipboard(this)` (є
  graceful fallback, якщо clipboard API недоступний).
- Дані по машинах: лукап `VEHICLES['482'] → {truckNumber, truckVin,
  trailerNumber, trailerVin}` — і в `INSPECTIONS[].vehicle`, і в
  `CRASHES[dot][].vehicle` лежить посилання на об'єкт з цього лукапу, а не
  окремий рядок.
- Повний набір "деталізованих" даних (Crashes/Insurance/SMS BASIC/Score
  history) на разі є лише для 4 компаній з `hasDetail: true` (dots: 1902244,
  2076111, 4158910, 3075935) — решта 3 компаній мають лише базові поля.

## Наступні можливі кроки (не затверджені користувачем, просто ідеї)

- Підключення реальних даних через джерела з `docs/fmcsa-api-integration.md`
  замість фейкових масивів у `js/data.js`.
- Дослідити Insurance (L&I) та ELD registry джерела докладніше (позначено як
  unconfirmed).
- Розширити `hasDetail: true` дані (Crashes/Insurance/SMS BASIC) на всі 7
  компаній, а не лише на 4.
- Якщо буде бекенд — винести дані з `js/data.js` у реальний API-шар,
  зберігши той самий формат об'єктів, щоб фронтенд не довелось переписувати.

---
Це технічний опис стану проєкту станом на комміт `84b5ecb`. Онови цей файл,
якщо продовжуватимеш роботу далі в новій сесії — так наступний контекст
(людський чи AI) зможе швидко зорієнтуватись.
