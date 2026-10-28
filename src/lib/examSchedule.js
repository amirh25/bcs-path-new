/**
 * ============================================================================
 * FILE: src/lib/examSchedule.js   (Client + Server shared)
 * PURPOSE: ১০ দিন অন্তর জাতীয় বিসিএস পরীক্ষার সময়সূচি, বিষয় তালিকা ও স্কোর হেল্পার
 * সময় সবসময় বাংলাদেশ সময় (UTC+6) ধরে হিসাব হয় — ডিভাইসের টাইমজোন যা-ই হোক।
 * ============================================================================
 */
export const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
export const EXAM_OPEN_HOUR = 10; // সকাল ১০:০০ — পরীক্ষা শুরু
export const EXAM_LAST_START_HOUR = 20; // রাত ৮:০০ — এর পর নতুন করে শুরু করা যাবে না
export const EXAM_RESULT_HOUR = 22.5; // রাত ১০:৩০ — ফলাফল ও লিডারবোর্ড প্রকাশ
export const SECONDS_PER_QUESTION = 36;
export const NEGATIVE_MARK = 0.5;
export const PASS_PERCENT = 60;

// বিসিএস প্রিলিমিনারি ২০০ নম্বরের অফিসিয়াল বণ্টন (ডিফল্ট প্রশ্ন-রেঞ্জ)
export const CONTEST_SUBJECTS = [
  { id: "bangla", title: "বাংলা ভাষা ও সাহিত্য", from: 1, to: 35 },
  { id: "english", title: "English Language & Literature", from: 36, to: 70 },
  { id: "bangladesh", title: "বাংলাদেশ বিষয়াবলি", from: 71, to: 100 },
  { id: "international", title: "আন্তর্জাতিক বিষয়াবলি", from: 101, to: 120 },
  { id: "geography", title: "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা", from: 121, to: 130 },
  { id: "science", title: "সাধারণ বিজ্ঞান", from: 131, to: 145 },
  { id: "ict", title: "কম্পিউটার ও তথ্যপ্রযুক্তি", from: 146, to: 160 },
  { id: "math", title: "গাণিতিক যুক্তি", from: 161, to: 175 },
  { id: "mental", title: "মানসিক দক্ষতা", from: 176, to: 190 },
  { id: "ethics", title: "নৈতিকতা, মূল্যবোধ ও সুশাসন", from: 191, to: 200 },
];
export const subjectTitle = (id) => CONTEST_SUBJECTS.find((s) => s.id === id)?.title || "অন্যান্য";
export const defaultSubjectForQNo = (n) =>
  CONTEST_SUBJECTS.find((s) => n >= s.from && n <= s.to)?.id || "bangla";
// পুরনো ডাটার (category: english/math/general) সাথে সামঞ্জস্য
export const subjectOfQuestion = (q) =>
  q.subject ||
  (q.category === "english" ? "english" : q.category === "math" ? "math" : defaultSubjectForQNo(Number(q.qNo) || 1));

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toBn = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[d]);
export const normalizeDigits = (s) => String(s ?? "").replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

export function normalizePhone(input) {
  let d = normalizeDigits(input).replace(/\D/g, "");
  if (d.startsWith("880")) d = d.slice(2);
  if (/^1[3-9]\d{8}$/.test(d)) d = "0" + d;
  return /^01[3-9]\d{8}$/.test(d) ? d : null;
}

const pad = (n) => String(n).padStart(2, "0");
export const daysInMonth = (y, m0) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
// প্রতি মাসে ৩টি পরীক্ষা: ১০, ২০ এবং মাসের শেষ দিন (সর্বোচ্চ ৩০; ফেব্রুয়ারিতে ২৮/২৯)
export const examDaysOfMonth = (y, m0) => [10, 20, Math.min(30, daysInMonth(y, m0))];
export const dateKeyOf = (y, m0, d) => `${y}-${pad(m0 + 1)}-${pad(d)}`;

export function atBD(dateKey, hour) {
  const h = Math.floor(hour);
  const min = Math.round((hour - h) * 60);
  return new Date(`${dateKey}T${pad(h)}:${pad(min)}:00+06:00`).getTime();
}

export function isValidExamDateKey(key) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || "");
  if (!m) return false;
  return examDaysOfMonth(+m[1], +m[2] - 1).includes(+m[3]);
}

export function getContestWindow(dateKey) {
  return {
    openAt: atBD(dateKey, EXAM_OPEN_HOUR),
    lastStartAt: atBD(dateKey, EXAM_LAST_START_HOUR),
    resultAt: atBD(dateKey, EXAM_RESULT_HOUR),
  };
}

const bdParts = (nowMs) => {
  const d = new Date(nowMs + BD_OFFSET_MS);
  return { y: d.getUTCFullYear(), m0: d.getUTCMonth() };
};

/** এখন যে পরীক্ষা চলছে/বাকি আছে তার স্লট। phase: upcoming | live | closing */
export function getCurrentOrNextSlot(nowMs = Date.now()) {
  let { y, m0 } = bdParts(nowMs);
  for (let i = 0; i < 3; i++) {
    for (const d of examDaysOfMonth(y, m0)) {
      const dateKey = dateKeyOf(y, m0, d);
      const w = getContestWindow(dateKey);
      if (nowMs < w.resultAt) {
        const phase = nowMs < w.openAt ? "upcoming" : nowMs <= w.lastStartAt ? "live" : "closing";
        return { dateKey, ...w, phase };
      }
    }
    m0 += 1;
    if (m0 > 11) {
      m0 = 0;
      y += 1;
    }
  }
  return null;
}

export function getUpcomingExamDateKeys(nowMs = Date.now(), count = 6) {
  const keys = [];
  let { y, m0 } = bdParts(nowMs);
  while (keys.length < count) {
    for (const d of examDaysOfMonth(y, m0)) {
      const k = dateKeyOf(y, m0, d);
      if (nowMs < getContestWindow(k).resultAt && keys.length < count) keys.push(k);
    }
    m0 += 1;
    if (m0 > 11) {
      m0 = 0;
      y += 1;
    }
  }
  return keys;
}

export const isResultsRevealed = (contest, nowMs = Date.now()) => {
  if (contest.forceOpen) return true;
  if (!contest.examDate) return true; // পুরনো (তারিখহীন) পরীক্ষা
  return nowMs >= getContestWindow(contest.examDate).resultAt;
};

const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
export function formatDateBn(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return `${toBn(d)} ${BN_MONTHS[m - 1]} ${toBn(y)}`;
}

export function splitDuration(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}

// টাই-ব্রেকার: মোট নম্বর → English → Math → আগে জমা দেওয়া
export function compareSubmissions(a, b) {
  if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
  if ((b.englishScore || 0) !== (a.englishScore || 0)) return (b.englishScore || 0) - (a.englishScore || 0);
  if ((b.mathScore || 0) !== (a.mathScore || 0)) return (b.mathScore || 0) - (a.mathScore || 0);
  return new Date(a.submittedAt) - new Date(b.submittedAt);
}
