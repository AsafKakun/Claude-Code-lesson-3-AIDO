# SPEC — Student Study-Planner Dashboard

A dark-mode web dashboard that helps students manage tests, exams and bagruts, and plan their study time by showing test dates, countdowns and how much study time is left.

- **Status:** Draft v0.2 (adds Google Sheets data source, school-schedule-driven dashboard, mandatory 1-week test notice, per-subject grade averages)
- **Languages:** Hebrew (RTL) and English (LTR), switchable at runtime
- **Theme:** Dark mode (primary and only theme in v1)

---

## 1. Overview & Goals

### 1.1 Problem
Students juggle many tests, quizzes, exams and (later) bagrut exams with dates spread across subjects. They usually notice a deadline too late and do not know how much study time they actually have left, so they cram or under-prepare.

### 1.2 Purpose
A single dashboard, **built around the student's school schedule and fed from Google Sheets**, that answers at a glance:
1. **What is coming up?** (next tests/exams, sorted by date — always announced **one week ahead**)
2. **How long do I have?** (live countdown)
3. **Am I ready?** (study time planned/logged vs. study time needed)
4. **What should I do today?** (today's lessons from the school schedule + generated study tasks)
5. **How am I doing?** (average grade per subject and overall)

### 1.2.1 Core ideas
1. **School-schedule-based:** the weekly timetable is the backbone of the dashboard. It shows today's lessons, links each test to its lesson slot, and defines when the student is free to study.
2. **One-week notice:** every test gets an automatic notice **7 days before** it, no matter how it was added.
3. **Google Sheets as the data source:** schedule, tests and grades are read from Google Sheets. No manual re-typing; the sheet is the source of truth.
4. **Grades & averages:** grades are read from the sheet and the average is calculated for every subject (and overall).

### 1.3 Success criteria
- A new student can add their first exam and see a countdown in under **60 seconds**.
- The dashboard clearly flags any exam where the student is "behind" on study time.
- Reminders fire at the configured lead times without the user opening the site.
- **100% of tests found in the sheet get a 7-day notice**, including tests added to the sheet less than 7 days ahead (notice fires on the next sync).
- Changes made in Google Sheets appear on the dashboard within **15 minutes** (or immediately on manual refresh).
- The per-subject average shown matches a manual calculation from the same sheet rows.
- All screens are usable in both Hebrew (RTL) and English (LTR) with no layout breakage.
- Text/background contrast meets **WCAG AA** in dark mode.

### 1.4 Non-goals (v1)
- Not a full school management system (no attendance or teacher tools). Grades are **read-only and displayed**, not managed here.
- **Read-only from Google Sheets in v1:** the website never writes back to the sheet.
- No social/multi-student features.
- No light theme.
- No AI tutoring or content delivery.

---

## 2. Target Users

**Primary:** students in **middle school and above** (approx. ages 12–18+), including students preparing for **bagrut** exams. Younger students are possible but not designed for.

| Persona | Age | Needs | Design implication |
|---|---|---|---|
| **Middle schooler** (grades 7–9) | 12–15 | Simple view of upcoming tests; friendly reminders; low setup effort | Simple defaults, playful but not childish tone, few required fields |
| **High schooler** (grades 10–11) | 15–17 | Many subjects, overlapping tests, planning ahead | Calendar view, per-subject readiness, plan generator |
| **Bagrut-year student** (grade 12) | 17–19 | High-stakes exams, large syllabi, moed A/B, weighted subjects (units/יחידות) | Bagrut tracker, topic-level progress, longer planning horizon |

Secondary (later): parents viewing a read-only summary.

---

## 3. Features

### 3.1 MVP (v1)

#### F0. Google Sheets data source
- The student (or parent/teacher) connects **one Google Spreadsheet** by pasting its link or signing in with Google.
- The app reads these tabs (exact columns in §8.1): **Schedule**, **Exams**, **Grades**, and optionally **Subjects**.
- **Sync:** on app open, then every 15 minutes while open, plus a manual "Refresh" button. Last-sync time is shown in the header.
- **Validation:** rows with a bad date, unknown subject or non-numeric grade are skipped and listed in a "Sync issues" panel with the row number, so the student knows what to fix in the sheet.
- **Offline:** the last successful sync is cached and shown with an "offline / last updated" label.
- **Read-only:** the site never edits the sheet. Tests or grades added by hand in the app (optional) are stored locally and marked as "local".
- A **template spreadsheet** is provided so students can start with the correct tabs and headers.

#### F0.1. School schedule (timetable)
- Shows the weekly timetable (day, lesson number/time, subject, room, teacher) from the **Schedule** tab.
- The dashboard's **Today** widget lists today's lessons in order, highlights the current/next lesson, and shows the tests that fall on that day.
- Each test is matched to its lesson slot by subject + date, so the calendar shows "Math test — period 3".
- **Free time is derived from the schedule:** hours outside lessons (after school, free periods, days off) become the student's default study availability (replaces most manual availability entry; manual blocked time still works on top).
- Holidays / days off can be added in the sheet (a `Schedule` row with `type = off`).

#### F1. Exams & tests manager
- Tests are **loaded from the Exams tab** of the sheet (subject, title, **type**, date & time, weight, topics, notes). Manual add/edit in the app is optional and local-only.
- **Exam types:** quiz (בוחן), test (מבחן), exam (בחינה), project deadline, bagrut (בגרות) with moed A / moed B.
- Exams sorted by date; past exams move to a "Done" archive with an optional score.

#### F2. Live countdown
- Every upcoming exam shows time left as **days · hours · minutes** (minutes only within the final 24h).
- Countdown color follows urgency (see Design System §6.4).

#### F3. Study-time-left calculator
- For each exam computes:
  - **Time available** = study hours the student has free between now and the exam (from their weekly availability, minus blocked days).
  - **Time needed** = recommended study hours (from weight, difficulty, and number of topics).
  - **Time logged** = hours already studied.
- Shows a **readiness status:** `On track` / `Tight` / `Behind`, plus the number of hours to add per day to catch up.
- Formula details in §9.

#### F4. Reminders & notifications
- **One-week notice (mandatory):** for **every** test, quiz, exam and bagrut, the student is notified **7 days before** the test date. This notice is on by default and **cannot be turned off per test** (the student may change only its channel and the time of day, default 16:00).
  - Message example: "Math test in 7 days (Sun 28 Sep, period 3). Start planning — you have ~9h of free study time."
  - The notice shows the study-time-left result (F3) so it is actionable.
  - If a test is added or moved so that it is **less than 7 days away**, the notice fires immediately on the next sync (once per test).
  - If the test date moves, the 7-day notice is recomputed and re-sent once.
  - Deduplicated: one 7-day notice per test, even if several tests fall on the same day (they are grouped into a single notification).
- Additional configurable lead times per exam, defaults: **3 days, 1 day, morning of, 1 hour before** (7 days is always included).
- Channels: in-app banner + browser push notification (opt-in). Email is later (§3.2).
- Daily "today's plan" reminder at a user-chosen time.
- Quiet hours (no notifications at night; default 21:30–07:00).

#### F5. Study plan generator
- Splits an exam's topics across the available days before the test.
- Respects blocked days (other exams, activities) and the student's daily study cap.
- Produces **tasks** ("Chapter 4 – Trigonometry, 45 min") the student can check off, move, or regenerate.
- Auto-rebalances when a task is missed or the exam date changes.

#### F6. Subjects
- Add subjects with a color and (for bagrut subjects) the number of units (יחידות).
- Subject color is used consistently across the calendar, cards and charts.

#### F7. Calendar
- Week and month views showing exams, study tasks and blocked time.
- Drag a study task to another day to reschedule.

#### F8. Study session logging
- Start/stop a timer or add a manual entry (subject, topic, duration).
- Logged time feeds the readiness calculation.

#### F8.1. Grades & averages
- Grades are loaded from the **Grades** tab (subject, grade, date, weight, title/type).
- **Per-subject average** is calculated for every subject and shown as a card with: average, number of grades, trend arrow (compared with the previous average), and lowest/highest grade.
- **Overall average** across all subjects; for bagrut subjects, optionally weighted by units (יחידות).
- **Weighting:** if a `weight` column is filled, a weighted average is used; if empty, all grades count equally (see §9.6).
- **Grade scale:** 0–100 by default (Israeli standard); configurable per sheet (e.g., 1–10, A–F is out of scope for v1).
- **Grade history:** tap a subject to see a line chart of grades over time and the list of grades.
- **"What do I need?" helper:** the student sets a target average per subject and sees the grade needed on the next test to reach it.
- Grade colors: ≥ 85 `--ok`, 60–84 neutral/`--primary`, < 60 `--urgent` (always with a number, never color alone). Passing threshold configurable (default 55).
- Subjects with no grades yet show "No grades yet" instead of 0.

#### F9. Settings
- Language toggle (Hebrew / English), notification settings, **Google Sheets connection**, weekly availability (auto-derived from the school schedule, editable), daily study cap, week start day (Sunday default in Hebrew, configurable), grade scale and target averages.

### 3.2 Later (post-v1)
- Streaks and gentle gamification (study streak, weekly goal).
- Pomodoro focus timer with break reminders.
- Email/WhatsApp reminders.
- Import from Google Calendar / iCal; export study plan to calendar.
- Shared class calendar (one student adds a test, classmates get it).
- Parent read-only view.
- Weekly summary report ("You studied 6h 30m, 2 tasks missed").
- Topic templates for common bagrut subjects.
- Light theme.

---

## 4. Dashboard Layout

The dashboard is the home screen. Widgets are cards on a responsive grid (12 columns desktop, single column mobile). Order below is desktop, top-to-bottom, left-to-right.

| # | Widget | Content | Notes |
|---|---|---|---|
| 1 | **Next exam hero card** | Subject, title, date, lesson slot (from schedule), big countdown (d/h/m), readiness badge, "Start studying" button | Largest card; accent gradient border matching urgency |
| 2 | **One-week notice banner** | "Tests in the next 7 days" — every test that has entered its 7-day window, with days left and hours free to study | Shown at the top while at least one test is ≤ 7 days away; dismissible per session, never removed from the exam list |
| 3 | **Today's schedule** | Today's lessons in order (time, subject, room), current/next lesson highlighted, tests of the day flagged | Driven by the **Schedule** tab; empty on days off |
| 4 | **Countdown strip** | Horizontally scrollable chips of the next 5–6 exams with days left | Click to open exam details |
| 5 | **Today's plan** | Checklist of today's study tasks with duration; total hours planned vs. done | Progress ring for the day |
| 6 | **Grades overview** | Overall average (large number) + one row per subject with its average, trend arrow and mini sparkline | Sorted by subject or by lowest average; tap for grade history |
| 7 | **This week** | Mini week agenda: lessons, exams, tasks, blocked days | Links to full calendar |
| 8 | **Study hours** | Bar chart: hours studied per day this week vs. goal | Recharts |
| 9 | **Subject readiness** | One row per subject: progress bar of (logged ÷ needed) with status color | Sorted by urgency |
| 10 | **Bagrut tracker** | List of bagrut subjects, units, moed dates, done/remaining, current average | Hidden if the student has no bagrut exams |
| 11 | **Quick add** | Floating "+" button: add local exam / log session / add task | Always visible |

**Header:** logo, language toggle (HE/EN), **sync status ("Updated 3 min ago" + Refresh)**, notifications bell, avatar/settings.
**Navigation:** left sidebar on desktop (right side in RTL), bottom tab bar on mobile: Dashboard · Schedule · Calendar · Exams · Grades · Settings.

**Empty states:** friendly illustration + one clear call to action ("Connect your Google Sheet" / "Add your first exam").

---

## 5. Key User Flows

1. **First run:** choose language → connect Google Sheet (or open the template) → data loads → allow notifications → land on dashboard with today's schedule, countdowns and grade averages.
2. **New test appears in the sheet:** next sync picks it up → dashboard shows it → if ≤ 7 days away a notice fires now, otherwise it fires exactly 7 days before → plan generated from free time in the schedule.
3. **Seven days before a test:** push/in-app notice with days left and study hours available → tap → exam details with plan → accept or adjust plan.
4. **Daily use:** open dashboard → check Today's schedule and Today's plan → tick tasks / start timer → see readiness update.
5. **Falling behind:** dashboard flags "Behind" → tap → "Rebalance plan" suggests extra time per day → accept.
6. **Exam date changes in the sheet:** next sync updates the exam → plan and reminders (including the 7-day notice) regenerate automatically.
7. **New grade added in the sheet:** next sync updates that subject's average and trend; a toast shows "Math average: 87.4 (+1.2)".
8. **Sheet problem:** invalid rows or lost access → "Sync issues" panel explains what to fix; cached data stays visible.

---

## 6. Design System (Dark Mode)

Goal: dark, calm and easy on the eyes late at night, but **not dull** — layered surfaces, vivid accents and soft glows keep it feeling modern and motivating.

### 6.1 Color tokens
Defined as CSS variables so they can be tuned in one place.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0E1117` | App background (near-black with a blue tint, not pure black) |
| `--surface` | `#161B26` | Cards |
| `--surface-2` | `#1E2533` | Raised elements, inputs, hover |
| `--border` | `#2A3345` | Card and divider borders |
| `--text` | `#E8ECF4` | Primary text |
| `--text-muted` | `#9AA5BA` | Secondary text |
| `--primary` | `#7C6CFF` | Main accent (violet-indigo), buttons, focus |
| `--primary-glow` | `rgba(124,108,255,.35)` | Glows and focus rings |
| `--accent` | `#3DDBD9` | Secondary accent (teal), charts, highlights |
| `--ok` | `#3DDC97` | On track / done |
| `--warn` | `#FFB454` | Tight / soon |
| `--urgent` | `#FF6B7A` | Behind / very close exam |

Subject colors: a fixed 10-color palette of medium-saturation hues, all tested against `--surface` for AA contrast.

### 6.2 Making dark mode appealing
- **Depth through lightness, not shadows:** each elevation level is slightly lighter (`bg` → `surface` → `surface-2`).
- **Gradients:** subtle violet→teal gradient on the hero card border and primary buttons.
- **Soft glow** on the most urgent element only, so it draws the eye without clutter.
- **Rounded shapes:** card radius 16px, buttons/inputs 12px, chips fully rounded.
- **Generous spacing:** 8px base grid; 24px card padding on desktop, 16px on mobile.
- **Avoid pure white text** on dark to reduce glare; avoid saturated colors for large fills.

### 6.3 Typography
- **Font:** a family with full Hebrew + Latin support (e.g., **Heebo** or **Assistant**) for consistent look in both languages.
- Scale: 12 / 14 / 16 (body) / 20 / 24 / 32 / 48 (countdown numerals).
- Countdown numerals use tabular figures so digits don't jitter as they tick.

### 6.4 Urgency color coding
| Time to exam | Color | Behavior |
|---|---|---|
| > 14 days | `--accent` (teal) | Static |
| 4–14 days | `--primary` | Static |
| 1–3 days | `--warn` | Subtle glow |
| < 24 hours | `--urgent` | Glow + gentle pulse (respects reduced motion) |

Readiness status uses `--ok` / `--warn` / `--urgent` **plus an icon and label**, never color alone.

### 6.5 Components
Card, stat tile, countdown, progress bar, progress ring, chip, checklist item, modal/sheet, toast, form controls, tabs, sidebar, bottom nav, empty state, calendar cell.

### 6.6 Motion
- 150–250 ms ease-out transitions; number count-up on load; check-off animation on tasks.
- Honor `prefers-reduced-motion`: disable pulse/count-up.

### 6.7 Accessibility
- WCAG AA contrast (≥ 4.5:1 body text, ≥ 3:1 large text/UI).
- Visible focus ring using `--primary-glow`.
- Full keyboard navigation; ARIA labels on countdowns (announce as "in 3 days, 4 hours").
- Touch targets ≥ 44px.

---

## 7. Internationalization (Hebrew / English)

- **Toggle** in header and settings; choice persisted; default from browser language.
- **Direction:** `dir="rtl"` for Hebrew, `dir="ltr"` for English, set on `<html>`.
- Use **CSS logical properties** (`margin-inline-start`, `padding-inline-end`, `inset-inline`) instead of left/right so layouts flip automatically.
- Mirror direction-sensitive icons (arrows, chevrons); do **not** mirror numbers, charts' time axis semantics need explicit decision (charts flow in reading direction).
- Sidebar moves to the right in RTL; progress bars fill from the reading-start side.
- **Dates & numbers:** `Intl.DateTimeFormat` / `date-fns` locale (`he`, `en`); week starts Sunday by default in Hebrew.
- Optional display of the Hebrew calendar date (setting, off by default).
- All strings in translation files (`locales/he.json`, `locales/en.json`); no hard-coded text; pluralization via i18next (Hebrew has distinct plural forms).
- Mixed-direction text (English subject names inside Hebrew UI) wrapped with `<bdi>` to avoid punctuation flipping.

---

## 8. Data Model

Entities and key fields (types are indicative).

```
User
  id, displayName, language ("he"|"en"), gradeLevel, createdAt

Settings
  userId, dailyStudyCapMinutes, weekStartsOn, quietHoursStart, quietHoursEnd,
  dailyReminderTime, defaultLeadTimes[], showHebrewDate

SheetConnection             // the linked Google Spreadsheet
  userId, spreadsheetId, authMode ("oauth"|"public_csv"), lastSyncAt,
  status ("ok"|"error"|"no_access"), lastError?

SyncIssue                   // row-level problems found during sync
  id, tab, rowNumber, message, detectedAt

ScheduleEntry               // weekly timetable, from the Schedule tab
  id, weekday (0-6), period, startTime, endTime, subjectId?, room?, teacher?,
  type ("lesson"|"off"), validFrom?, validTo?

AvailabilitySlot            // free study time; derived from ScheduleEntry, editable
  userId, weekday (0-6), startTime, endTime, source ("schedule"|"manual")

BlockedTime                 // one-off unavailable time
  userId, start, end, reason

Subject
  id, userId, name, color, units? (bagrut), isBagrut, targetAverage?

Exam
  id, userId, subjectId, title, type ("quiz"|"test"|"exam"|"project"|"bagrut"),
  moed? ("A"|"B"), startsAt, weight (1-5), difficulty (1-5),
  recommendedMinutes (computed, overridable), notes, status ("upcoming"|"done"),
  score?, source ("sheet"|"local"), sheetRowKey?, scheduleEntryId? (matched lesson slot)

Grade                       // from the Grades tab
  id, subjectId, value, scaleMax (default 100), weight (default 1), date, title?,
  type?, source ("sheet"|"local"), sheetRowKey?

Topic
  id, examId, title, estimatedMinutes, status ("todo"|"in_progress"|"done")

StudyTask                   // generated or manual plan item
  id, examId, topicId?, date, plannedMinutes, status ("planned"|"done"|"skipped")

StudySession                // actual time logged
  id, userId, subjectId, examId?, topicId?, startedAt, durationMinutes

Reminder
  id, examId, kind ("week_before"|"custom"|"day_before"|"morning_of"|"hour_before"),
  fireAt, channel ("in_app"|"push"), sentAt?
```

**Relationships:** User 1—1 SheetConnection; User 1—* Subject 1—* Exam 1—* Topic; Subject 1—* Grade; Subject 1—* ScheduleEntry; Exam *—1 ScheduleEntry (matched lesson); Exam 1—* StudyTask; User 1—* StudySession; Exam 1—* Reminder (always includes one `week_before`).

### 8.1 Google Sheet template

One spreadsheet per student (see Open Questions). Row 1 of every tab is a header; header names are matched case-insensitively and may be Hebrew or English (aliases table in the code). Dates use `YYYY-MM-DD` (or the sheet's native date format), times `HH:MM`.

| Tab | Columns | Notes |
|---|---|---|
| **Schedule** | `weekday`, `period`, `start`, `end`, `subject`, `room`, `teacher`, `type` | `weekday` 1–7 (Sun–Sat) or name; `type` = `lesson` (default) or `off` |
| **Exams** | `date`, `time`, `subject`, `title`, `type`, `weight`, `difficulty`, `topics`, `notes` | `type` = quiz/test/exam/project/bagrut; `topics` comma-separated; `weight` and `difficulty` optional (default 3) |
| **Grades** | `date`, `subject`, `title`, `grade`, `weight` | `grade` numeric; `weight` optional (default 1) |
| **Subjects** *(optional)* | `name`, `color`, `units`, `isBagrut`, `targetAverage` | If missing, subjects are created from names found in other tabs |

Rules:
- Subject names are matched exactly (after trimming and case-folding) across tabs; unknown names are reported in Sync issues.
- Each row gets a stable key (`tab + row number + hash of subject/date/title`) so edits update the same record rather than creating duplicates.
- Empty rows are ignored; invalid rows are skipped and reported, never crash the sync.

---

## 9. Key Algorithms

### 9.1 Time needed (recommended study minutes)
```
base        = 120 min per exam                    (tunable)
byType      = { quiz: 0.5, test: 1, exam: 1.5, project: 1, bagrut: 3 }
byDifficulty= 0.6 + 0.2 * difficulty              (difficulty 1–5 → 0.8–1.6)
byTopics    = sum(topic.estimatedMinutes) if provided, else base
needed      = max(byTopics, base) * byType * byDifficulty * (0.8 + 0.1 * weight)
```
User can override `recommendedMinutes` per exam. Constants live in one config file.

### 9.2 Time available
Free time comes from the **school schedule**:
```
freeWindows(day) = [dayStart, dayEnd] − lessons(day) − BlockedTime(day)
                   (dayStart/dayEnd default 14:00–21:30 on school days, 09:00–21:30 on days off;
                    also removes 30 min buffer after the last lesson; tunable)
available = Σ over days from now → exam:
              min( minutes(freeWindows(day)) , dailyStudyCapMinutes )
```
Manual `AvailabilitySlot` entries (`source = "manual"`) override the derived windows for that weekday. Days marked `off` in the schedule count as fully free.

### 9.3 Readiness
```
remainingNeeded = max(0, needed − logged)
ratio           = available / remainingNeeded      (∞ if remainingNeeded = 0)

status = ratio ≥ 1.25 → "On track"
         ratio ≥ 0.9  → "Tight"
         else         → "Behind"

extraPerDay = (remainingNeeded − available) / daysLeft   (shown when Behind)
```

### 9.4 Plan generation
1. Collect available days (with minutes) up to the exam; exclude the final 12h before the exam.
2. Order topics by estimated size (largest first) and by status (skip `done`).
3. Distribute topic minutes across days, chunked to 25–60 min blocks, never exceeding the daily cap.
4. Reserve the last 1–2 days for revision when time allows.
5. On missed tasks or date change → regenerate remaining tasks only; keep completed history.

### 9.5 Reminder scheduling
- **Always create a `week_before` reminder** for every exam: `fireAt = date(exam.startsAt) − 7 days` at the chosen notice time (default 16:00).
  - If that moment is already in the past but the exam is still in the future → `fireAt = now` (fires on the next sync, once).
  - If the exam moves → delete the unsent `week_before`, create a new one; if the old one was already sent, send a new one only when the new date is different and still ≥ 1 day away.
  - Several exams sharing the same `fireAt` day are merged into one notification listing all of them.
  - The notification body includes readiness from §9.3 (hours free vs. hours needed).
- For other lead times: `fireAt = exam.startsAt − leadTime`; skip times in the past.
- Shift any `fireAt` that falls in quiet hours to the next allowed time (but never after the exam).
- Store timezone-aware (default `Asia/Jerusalem`); recompute on exam edit.

### 9.6 Grade averages
For a subject with grades `g₁…gₙ` and weights `w₁…wₙ` (weight defaults to 1):
```
simple average   = Σ gᵢ / n                       (all weights empty or equal)
weighted average = Σ (gᵢ · wᵢ) / Σ wᵢ             (any weight present)
overall average  = mean of subject averages       (default)
                 = Σ (avgₛ · unitsₛ) / Σ unitsₛ   (when "weight by units" is on and units are set)
trend            = avg(all grades) − avg(all grades except the latest by date)
neededGrade      = (target · (W + w) − Σ gᵢ·wᵢ) / w      (W = Σ wᵢ, w = weight of the next test)
```
- Round for display to **1 decimal**; keep full precision internally.
- Grades are normalized to the configured scale (`grade / scaleMax * 100`) before averaging across subjects.
- No grades → `null` ("No grades yet"), never 0. A subject with a single grade shows no trend.
- `neededGrade > scaleMax` → show "Target not reachable with the next test"; `neededGrade ≤ 0` → "Target already secured".
- **Worked example:** grades 90 (w=1) and 80 (w=2) → weighted average = (90·1 + 80·2) / 3 = **83.3**; simple average would be 85.0.

### 9.7 Sync
1. Fetch the tabs (Sheets API `values.batchGet` on Schedule, Exams, Grades, Subjects) — one request per sync.
2. Parse and validate each row; collect `SyncIssue`s for bad rows.
3. Upsert records by `sheetRowKey`; delete local copies of `source = "sheet"` rows that vanished from the sheet.
4. Diff against the previous state: new/changed exams → (re)schedule reminders (§9.5); new grades → recompute averages and toast changes.
5. Recompute readiness (§9.3) and the plan (§9.4) only for exams affected by the change.
6. On network/permission failure: keep cached data, set `SheetConnection.status`, retry with exponential backoff (1 → 2 → 5 → 15 min).

---

## 10. Suggested Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **React + TypeScript** with **Vite** | Fast dev, strong typing for the data model |
| Styling | **Tailwind CSS** with theme tokens as CSS variables | Fast UI work; logical-property utilities support RTL |
| i18n | **i18next / react-i18next** | Plurals, namespaces, runtime language switch |
| Dates | **date-fns** (+ `he`, `en` locales) | Lightweight, locale-aware |
| Charts | **Recharts** | Simple, themeable |
| State | **Zustand** or React Query for server state | Small and simple |
| Data source | **Google Sheets API v4**, read-only scope `spreadsheets.readonly`, sign-in with **Google Identity Services** | Works with private sheets; grades are sensitive so the sheet should not need to be public |
| Data source (prototype fallback) | Sheet "Publish to web" as CSV, fetched and parsed with **PapaParse** | Fastest way to demo; **not for real grades** (public link) |
| Persistence (v1) | **Local-first cache:** IndexedDB (Dexie) holding the last sync | Offline display; the sheet stays the source of truth |
| Backend (later) | **Supabase** or **Firebase** (auth + DB + scheduled jobs + push) | Needed for reliable notifications when the app is closed, and multi-device sync |
| Notifications | **Web Notifications API + Service Worker**; Web Push via backend | The 7-day notice must reach the student even if the tab is closed |
| PWA | Installable, offline shell | Students use phones |
| Testing | **Vitest** + **React Testing Library**, **Playwright** for e2e | Cover algorithms and RTL layouts |

**Google Sheets notes**
- One `batchGet` call per sync keeps usage far below API quotas (60 read requests/min/user); with a 15-minute interval this is negligible.
- Without a backend, the browser can only fire the 7-day notice when the app or its service worker gets to run (open tab, installed PWA with periodic sync where supported). A backend with a daily scheduled job is the reliable option — decision recorded in Open Questions.
- Google Cloud OAuth consent screen and app verification are required before real students can sign in; plan lead time for this.

Alternative if simpler is preferred: plain HTML/CSS/JS with the published-CSV approach for a first prototype.

---

## 11. Non-Functional Requirements

- **Responsive, mobile-first:** breakpoints 360 / 768 / 1200 px; students mostly use phones.
- **Performance:** first contentful paint < 2 s on mid-range phone over 4G; dashboard interactive < 3 s.
- **Offline:** dashboard, exams, and plan usable offline (PWA).
- **Accessibility:** WCAG 2.1 AA (see §6.7).
- **Browser support:** latest two versions of Chrome, Safari, Firefox, Edge; iOS Safari 16.4+ for push.
- **Privacy & minors:**
  - Collect the minimum data (no real name required, no location).
  - **Grades are sensitive data about minors:** request only the read-only Sheets scope, read only the tabs listed in §8.1, never share data with third parties, no analytics on grade values.
  - Do not require a public sheet link for real data; if the CSV prototype is used, warn the user that anyone with the link can see the grades.
  - Data stays on the device (cache) in v1; OAuth tokens kept in memory/secure storage, revocable from Settings ("Disconnect Google Sheet" also wipes the cache).
  - Clear privacy statement in both languages, including exactly what is read from the sheet.
  - Before adding accounts/backend: review Israeli Privacy Protection Law and parental-consent requirements for users under 14/16.
  - Allow full data export and deletion.
- **Reliability of reminders:** local scheduling must survive reload; document limits of browser notifications when the browser is closed. The 7-day notice is the highest-priority reminder: it must never be silently dropped (if it cannot be delivered as push, it must appear as an in-app banner on the next open).
- **Sync:** ≤ 15-minute staleness while open; sync of a typical sheet (≤ 500 rows) completes in < 3 s; malformed rows never block the rest of the data.
- **Sheet permissions:** losing access (revoked, sheet deleted, not shared) shows a clear message with a "Reconnect" action; cached data remains visible.

---

## 12. Roadmap

| Milestone | Scope |
|---|---|
| **M0 — Design** | Wireframes for dashboard, calendar, exam form; finalize dark palette; HE/EN copy; **Google Sheet template (Schedule / Exams / Grades / Subjects)** |
| **M1 — Data & core** | **Google Sheets connection + sync + cache + Sync issues panel**, data model, subjects, exams from sheet, countdown, dashboard hero + countdown strip, **Today's schedule** |
| **M2 — Planning & grades** | Free time derived from schedule, time-left calculator, readiness status, study plan generator, Today's plan, **grade averages per subject + overall + grades overview widget** |
| **M3 — Reminders** | **Mandatory 7-day notice for every test** (in-app banner + push), other lead times, quiet hours, grouping/dedup |
| **M4 — Calendar & logging** | Calendar views (lessons + tests + tasks), drag-to-reschedule, study timer/log, study-hours chart, grade history charts, "what do I need?" helper |
| **M5 — Polish** | RTL audit, accessibility audit, empty states, PWA/offline, bagrut tracker |
| **M6+ — Later** | Accounts + sync, streaks, sharing, imports, parent view |

---

## 13. Open Questions

1. Should the bagrut tracker come with **pre-filled subject/topic templates** (Ministry of Education syllabi), and who maintains them?
2. Is a **cache-only, no-backend** v1 acceptable? Without a backend the 7-day notice only fires when the app can run; a backend (scheduled job + Web Push) makes it reliable but adds accounts, hosting and privacy obligations.
3. Minimum age to support without parental consent (privacy law review)?
4. Should the Hebrew calendar date be shown by default for Hebrew users?
5. Do we want teachers or schools to be able to push official exam dates to students?
6. Final product name and logo.
7. **Who fills the Google Sheet** — the student, a parent, or the school/teacher? This decides who needs edit access and how much validation the template needs.
8. **One sheet per student** (assumed in §8.1) or one shared sheet with a `student` column (e.g., a class sheet)? The shared option raises privacy concerns because grades of others must not be visible.
9. **Grade rules:** which scale and weighting does the school use (0–100, weights per test type, bagrut unit weighting, rounding rules)? Should the passing threshold be configurable per subject?
10. **7-day notice format:** one notification per test (current spec, grouped when on the same day) or a single weekly digest of all tests in the next 7 days? Should tests less than 7 days away at first sync notify immediately (current spec)?
11. **Schedule changes:** does the timetable change during the year (semester, substitute lessons)? The spec supports `validFrom`/`validTo`, but is that enough?
