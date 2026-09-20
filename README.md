# StudyPlanner — student study-planner dashboard

A dark-mode, Hebrew/English dashboard that shows the next test countdown, today's school schedule and a short
"Today's Mission" list, and warns about every test one week ahead. It can read the schedule, tests and grades
from a Google Sheet. The full product spec is in [SPEC.md](SPEC.md).

This first build is **plain HTML/CSS/JS** (no install, no build step). It follows the spec's dashboard (§4) and
algorithms (§9).

## Run it

Needs nothing but Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/serve.ps1
```

Then open <http://localhost:5173>. Open <http://localhost:5173/tests.html> to run the logic tests (they check the
worked examples from SPEC §9).

## What works

- **Main dashboard (SPEC §4):** 7-day notice banner (with test-cluster warning), next-test hero with live countdown
  and soft readiness status, today's schedule, Today's Mission (top 3 tasks, streak, weekly goal).
- **Header:** overall-average chip (opens the grades list), sync status + refresh, Google Sheet connection, HE/EN toggle
  (RTL flips automatically; Hebrew date shown by default in Hebrew).
- **Quick add "+":** local tests, hand-entered grades and a hand-entered timetable — saved on the device only and never written to a sheet.
- **Focus timer:** 25-minute session that logs study time (feeds readiness, streak and weekly goal).
- **Sample data** is built relative to today, so the dashboard always looks alive.

## Data sources

Click **מקורות נתונים / Data sources** in the header. Up to three sources can be connected at the same time; they are
merged, refreshed every 15 minutes and cached, so one failing source never hides the others.

| Source | What it gives | Link types |
|---|---|---|
| **School exam calendar** | Test dates for your grade | Published sheet (`…/d/e/2PACX…/pubhtml`) or a regular "anyone with the link" sheet |
| **Student grades sheet** | Grades and the averages | Same |
| **Personal sheet** | Timetable, tests and grades (tabs `Schedule`, `Exams`, `Grades`, optional `Subjects`, `Holidays`; see [`template/`](template)) | Same |

**School exam calendar.** Paste the link; the app lists the tabs of the published sheet (for example one per grade) and
preselects the tab in the link. Rows look like `יום חמישי, 15/10/26, י״א - מבחן ספרות`. The app removes the grade prefix,
finds the subject in the text (Hebrew subject names, including specialty tracks) and the type (בוחן = quiz, מבחן = test,
מתכונת = mock exam, בגרות = bagrut, "מועד ב׳" = second sitting). The calendar has no time of day, so none is shown.

**Student grades sheet.** Needs a **subject** column (`מקצוע`) and a **grade** column (`ציון`); optional `תאריך` (date),
`כותרת`/`מבחן` (title) and `משקל` (weight, default 1). Title rows above the header are skipped, empty grades are ignored,
`87,5` is read as 87.5, and subject names like `ספרות 5 יח"ל` are matched to the calendar's `ספרות`. Rows that cannot be
read are listed with their real row number.

> **Privacy:** prototype mode reads sheets through their public link, so anyone with the link can see them. The school
> calendar is public by design, but use **test data only** for grades until Google sign-in (SPEC decision D19) is added.
> Tested against the school's real published calendar; the grades-only source and the personal sheet were tested only
> with mocked Google responses.

## Enter data by hand (no file needed)

The **+** button opens a menu:

- **Add a grade** — subject, grade (0–100, `87,5` is fine) and date; title is optional. There is **no weight field**:
  every hand-entered grade counts as 1. Entered grades are listed in the grades dialog (tap the average chip) where
  each one can be deleted.
- **Add lessons** — subject, start/end time, optional room, and **one or several weekdays at once**. Lessons are numbered
  by start time, shown in "Today's schedule", and used for free-study-time. The timetable dialog (✎ on the schedule card)
  lists and deletes hand-entered lessons.
- **Import a timetable file** — in the timetable dialog (✎ on the schedule card): choose a CSV with the columns `weekday, period, start, end, subject, room, teacher` (`weekday` 1 = Sunday; see [`template/Schedule.csv`](template/Schedule.csv)). UTF-8 or Excel Hebrew (windows-1255) files, with `,` `;` or tab separators, are accepted. Importing again replaces the previously imported lessons; lessons added by hand stay. Rows that cannot be read are listed with their row number.
- **Add a test** — local test, as before.

Hand-entered data is saved on this device only and is merged with any connected sheets. As soon as something is entered
by hand, the built-in sample data is no longer shown.

## Not built yet

Calendar, Exams, Grades and Settings pages, exam-calendar filtering by class/track, bagrut tracker, push/email notifications, simple mode, real Google
sign-in. See the roadmap in SPEC §12.

## Files

| Path | Purpose |
|---|---|
| `index.html`, `css/styles.css` | Page and dark theme (design tokens from SPEC §6) |
| `js/logic.js` | Pure logic: readiness, countdown, cluster, grades, mission, streak (SPEC §9) |
| `js/sheets.js` | CSV parsing, validation, Google Sheet reading (SPEC §8.1, §9.7) |
| `js/sample.js` | Sample data relative to today |
| `js/i18n.js` | Hebrew/English strings |
| `js/app.js` | Rendering and events |
| `tests.html` | Browser-run tests |
| `tools/serve.ps1` | Static dev server without Node/Python |
