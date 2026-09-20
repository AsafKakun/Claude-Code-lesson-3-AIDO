/* Built-in sample data, generated relative to "today" so the dashboard always looks alive. */
(function () {
  const SP = (window.SP = window.SP || {});
  const L = SP.logic;

  const NAMES = {
    en: { math: 'Math', eng: 'English', phys: 'Physics', hist: 'History', lit: 'Literature' },
    he: { math: 'מתמטיקה', eng: 'אנגלית', phys: 'פיזיקה', hist: 'היסטוריה', lit: 'ספרות' },
  };
  const TOPICS = {
    en: {
      math: ['Trigonometry', 'Functions', 'Sequences'],
      eng: ['Vocabulary', 'Reading comprehension', 'Essay writing'],
      phys: ['Kinematics', 'Forces'],
      hist: ['Causes of WWI', 'The interwar period'],
    },
    he: {
      math: ['טריגונומטריה', 'פונקציות', 'סדרות'],
      eng: ['אוצר מילים', 'הבנת הנקרא', 'כתיבת חיבור'],
      phys: ['קינמטיקה', 'כוחות'],
      hist: ['הסיבות למלחמת העולם הראשונה', 'תקופת בין המלחמות'],
    },
  };

  function build(now, lang) {
    const n = NAMES[lang];
    const P = SP.sheets.PALETTE;
    const subjects = [
      { name: n.math, color: P[0], targetAverage: 85 },
      { name: n.eng, color: P[1], targetAverage: null },
      { name: n.phys, color: P[2], targetAverage: null },
      { name: n.hist, color: P[3], targetAverage: null },
      { name: n.lit, color: P[4], targetAverage: null },
    ];

    // Sunday–Thursday timetable, 6 periods; Friday and Saturday are off
    const periods = [
      ['08:00', '08:45'], ['08:50', '09:35'], ['09:55', '10:40'],
      ['10:45', '11:30'], ['11:50', '12:35'], ['12:40', '13:25'],
    ];
    const plan = {
      1: ['math', 'eng', 'lit', 'phys', 'hist', 'math'],
      2: ['phys', 'math', 'eng', 'hist', 'lit', 'eng'],
      3: ['eng', 'phys', 'math', 'lit', 'hist', 'math'],
      4: ['hist', 'math', 'phys', 'eng', 'lit', 'phys'],
      5: ['math', 'lit', 'eng', 'hist', 'phys', 'eng'],
    };
    const rooms = { math: '204', eng: '117', phys: 'Lab 2', hist: '312', lit: '117' };
    const schedule = [];
    for (const wd of Object.keys(plan)) {
      plan[wd].forEach((key, i) =>
        schedule.push({
          weekday: +wd, date: null, period: String(i + 1), start: periods[i][0], end: periods[i][1],
          subject: n[key], room: rooms[key], teacher: '', type: 'lesson', validFrom: null, validTo: null,
        })
      );
    }

    // place tests on upcoming school days (k-th school day from tomorrow)
    const schoolDays = [];
    for (let i = 1; schoolDays.length < 30; i++) {
      const d = L.addDays(L.startOfDay(now), i);
      if (d.getDay() <= 4) schoolDays.push(d);
    }
    const mk = (idx, time, key, title, type, weight, difficulty, topics) => {
      const date = L.ymd(schoolDays[idx]);
      const startsAt = L.parseYmd(date);
      const [h, m] = time.split(':').map(Number);
      startsAt.setHours(h, m, 0, 0);
      return {
        id: 'sample:' + key + ':' + date, source: 'sample', subject: n[key], title, type, date, time, startsAt,
        weight, difficulty, topics: topics || [], notes: '',
      };
    };
    const T = TOPICS[lang];
    const T_ = lang === 'he'
      ? { m1: 'מבחן טריגונומטריה', e1: 'בוחן אוצר מילים', h1: 'מבחן מלחמת העולם הראשונה', p1: 'מבחן מכניקה', b1: 'בגרות באנגלית' }
      : { m1: 'Trigonometry test', e1: 'Vocabulary quiz', h1: 'World War I test', p1: 'Mechanics test', b1: 'Final bagrut' };
    const exams = [
      mk(1, '09:00', 'eng', T_.e1, 'quiz', 2, 2, T.eng.slice(0, 2)),
      mk(2, '10:00', 'math', T_.m1, 'test', 4, 4, T.math),
      mk(3, '11:00', 'hist', T_.h1, 'test', 3, 3, T.hist),
      mk(11, '10:00', 'phys', T_.p1, 'test', 3, 3, T.phys),
      mk(24, '09:00', 'eng', T_.b1, 'bagrut', 5, 4, T.eng),
    ];

    const g = (daysAgo, key, title, grade, weight) => ({
      date: L.ymd(L.addDays(L.startOfDay(now), -daysAgo)), subject: n[key], title, grade, weight,
    });
    const grades = [
      g(60, 'math', 'Quiz', 88, 1), g(35, 'math', 'Test', 82, 2), g(9, 'math', 'Test', 79, 2),
      g(50, 'eng', 'Essay', 90, 1), g(28, 'eng', 'Test', 92, 2), g(6, 'eng', 'Quiz', 95, 1),
      g(40, 'phys', 'Test', 70, 2), g(12, 'phys', 'Quiz', 74, 1),
      g(45, 'hist', 'Test', 58, 2), g(15, 'hist', 'Quiz', 70, 1),
      g(30, 'lit', 'Essay', 84, 1),
    ];
    return { subjects, schedule, exams, grades, holidays: [] };
  }

  Object.assign(SP, { sample: { build } });
})();
