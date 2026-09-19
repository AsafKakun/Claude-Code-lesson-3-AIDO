# SPEC — Student Study-Planner Dashboard

A dark-mode web dashboard that helps students manage tests, exams and bagruts, and plan their study time by showing test dates, countdowns and how much study time is left.

- **Status:** Draft v0.1
- **Languages:** Hebrew (RTL) and English (LTR), switchable at runtime
- **Theme:** Dark mode (primary and only theme in v1)

---

## 1. Overview & Goals

### 1.1 Problem
Students juggle many tests, quizzes, exams and (later) bagrut exams with dates spread across subjects. They usually notice a deadline too late and do not know how much study time they actually have left, so they cram or under-prepare.

### 1.2 Purpose
A single dashboard that answers, at a glance:
1. **What is coming up?** (next tests/exams, sorted by date)
2. **How long do I have?** (live countdown)
3. **Am I ready?** (study time planned/logged vs. study time needed)
4. **What should I do today?** (generated study tasks)

### 1.3 Success criteria
- A new student can add their first exam and see a countdown in under **60 seconds**.
- The dashboard clearly flags any exam where the student is "behind" on study time.
- Reminders fire at the configured lead times without the user opening the site.
- All screens are usable in both Hebrew (RTL) and English (LTR) with no layout breakage.
- Text/background contrast meets **WCAG AA** in dark mode.

### 1.4 Non-goals (v1)
- Not a full school management system (no grades book, attendance, or teacher tools).
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

#### F1. Exams & tests manager
- Create/edit/delete an exam with: subject, title, **type**, date & time, weight, topics, notes.
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
- Configurable lead times per exam, defaults: **14 days, 7 days, 3 days, 1 day, morning of, 1 hour before**.
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

#### F9. Settings
- Language toggle (Hebrew / English), notification settings, weekly availability, daily study cap, week start day (Sunday default in Hebrew, configurable).

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
| 1 | **Next exam hero card** | Subject, title, date, big countdown (d/h/m), readiness badge, "Start studying" button | Largest card; accent gradient border matching urgency |
| 2 | **Countdown strip** | Horizontally scrollable chips of the next 5–6 exams with days left | Click to open exam details |
| 3 | **Today's plan** | Checklist of today's study tasks with duration; total hours planned vs. done | Progress ring for the day |
| 4 | **This week** | Mini week agenda: exams, tasks, blocked days | Links to full calendar |
| 5 | **Study hours** | Bar chart: hours studied per day this week vs. goal | Recharts |
| 6 | **Subject readiness** | One row per subject: progress bar of (logged ÷ needed) with status color | Sorted by urgency |
| 7 | **Bagrut tracker** | List of bagrut subjects, units, moed dates, done/remaining | Hidden if the student has no bagrut exams |
| 8 | **Quick add** | Floating "+" button: add exam / log session / add task | Always visible |

**Header:** logo, language toggle (HE/EN), notifications bell, avatar/settings.
**Navigation:** left sidebar on desktop (right side in RTL), bottom tab bar on mobile: Dashboard · Calendar · Exams · Study log · Settings.

**Empty states:** friendly illustration + one clear call to action ("Add your first exam").

---

## 5. Key User Flows

1. **First run:** choose language → pick grade/level → add subjects → set weekly availability → add first exam → land on dashboard with countdown.
2. **Add exam:** Quick add → fill form → choose topics → plan generated → confirm reminders.
3. **Daily use:** open dashboard → check Today's plan → tick tasks / start timer → see readiness update.
4. **Falling behind:** dashboard flags "Behind" → tap → "Rebalance plan" suggests extra time per day → accept.
5. **Exam date changes:** edit exam → plan and reminders regenerate automatically.

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

AvailabilitySlot            // weekly recurring free study time
  userId, weekday (0-6), startTime, endTime

BlockedTime                 // one-off unavailable time
  userId, start, end, reason

Subject
  id, userId, name, color, units? (bagrut), isBagrut

Exam
  id, userId, subjectId, title, type ("quiz"|"test"|"exam"|"project"|"bagrut"),
  moed? ("A"|"B"), startsAt, weight (1-5), difficulty (1-5),
  recommendedMinutes (computed, overridable), notes, status ("upcoming"|"done"), score?

Topic
  id, examId, title, estimatedMinutes, status ("todo"|"in_progress"|"done")

StudyTask                   // generated or manual plan item
  id, examId, topicId?, date, plannedMinutes, status ("planned"|"done"|"skipped")

StudySession                // actual time logged
  id, userId, subjectId, examId?, topicId?, startedAt, durationMinutes

Reminder
  id, examId, fireAt, channel ("in_app"|"push"), sentAt?
```

**Relationships:** User 1—* Subject 1—* Exam 1—* Topic; Exam 1—* StudyTask; User 1—* StudySession; Exam 1—* Reminder.

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
```
available = Σ over days from now → exam:
              (AvailabilitySlot minutes that day − BlockedTime overlap)
              capped at dailyStudyCapMinutes
```

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
- Compute `fireAt = exam.startsAt − leadTime` for each lead time; skip times in the past.
- Shift any `fireAt` that falls in quiet hours to the next allowed time (but never after the exam).
- Store timezone-aware; recompute on exam edit.

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
| Persistence (v1) | **Local-first:** IndexedDB (Dexie) | Works offline, no backend or sign-up needed |
| Backend (later) | **Supabase** or **Firebase** (auth + DB + push) | Sync across devices, email reminders |
| Notifications | **Web Notifications API + Service Worker**; Web Push when backend exists | Reminders while the tab is closed |
| PWA | Installable, offline shell | Students use phones |
| Testing | **Vitest** + **React Testing Library**, **Playwright** for e2e | Cover algorithms and RTL layouts |

Alternative if simpler is preferred: plain HTML/CSS/JS with localStorage for a first prototype.

---

## 11. Non-Functional Requirements

- **Responsive, mobile-first:** breakpoints 360 / 768 / 1200 px; students mostly use phones.
- **Performance:** first contentful paint < 2 s on mid-range phone over 4G; dashboard interactive < 3 s.
- **Offline:** dashboard, exams, and plan usable offline (PWA).
- **Accessibility:** WCAG 2.1 AA (see §6.7).
- **Browser support:** latest two versions of Chrome, Safari, Firefox, Edge; iOS Safari 16.4+ for push.
- **Privacy & minors:**
  - Collect the minimum data (no real name required, no location).
  - Data stays on device in v1; clear privacy statement in both languages.
  - Before adding accounts/backend: review Israeli Privacy Protection Law and parental-consent requirements for users under 14/16.
  - Allow full data export and deletion.
- **Reliability of reminders:** local scheduling must survive reload; document limits of browser notifications when the browser is closed.

---

## 12. Roadmap

| Milestone | Scope |
|---|---|
| **M0 — Design** | Wireframes for dashboard, calendar, exam form; finalize dark palette; HE/EN copy |
| **M1 — Core** | Data model, exams CRUD, subjects, countdown, dashboard hero + countdown strip |
| **M2 — Planning** | Availability settings, time-left calculator, readiness status, study plan generator, Today's plan |
| **M3 — Reminders** | In-app + push notifications, quiet hours |
| **M4 — Calendar & logging** | Calendar views, drag-to-reschedule, study timer/log, study-hours chart |
| **M5 — Polish** | RTL audit, accessibility audit, empty states, PWA/offline, bagrut tracker |
| **M6+ — Later** | Accounts + sync, streaks, sharing, imports, parent view |

---

## 13. Open Questions

1. Should the bagrut tracker come with **pre-filled subject/topic templates** (Ministry of Education syllabi), and who maintains them?
2. Is **local-only storage** acceptable for v1, or are accounts needed from day one (multi-device use)?
3. Minimum age to support without parental consent (privacy law review)?
4. Should the Hebrew calendar date be shown by default for Hebrew users?
5. Do we want teachers or schools to be able to push official exam dates to students?
6. Final product name and logo.
