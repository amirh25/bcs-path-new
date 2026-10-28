"use client";
/**
 * ============================================================================
 * FILE: src/components/ContestTab.js
 * PURPOSE: ১০ দিন অন্তর জাতীয় বিসিএস ২০০-MCQ পরীক্ষা (শিক্ষার্থী অংশ)
 *  - লাইভ কাউন্টডাউন (দিন/ঘণ্টা/মিনিট/সেকেন্ড), ১০/২০/মাসের শেষ তারিখ
 *  - রেজিস্ট্রেশন (নাম, ফোন, শিক্ষাপ্রতিষ্ঠান) → পরীক্ষার UI খুলে যায়
 *  - রিফ্রেশ করলেও পরীক্ষা চালু থাকে (সময় ধরে রাখে), একবারের বেশি দেওয়া যায় না
 *  - বিষয়ভিত্তিক নম্বর ও দুর্বলতা বিশ্লেষণ, লিডারবোর্ড (পরবর্তী পরীক্ষা জমা দেওয়া পর্যন্ত আগের র‍্যাঙ্ক ধরে রাখে)
 * ============================================================================
 */
import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { Trophy, Flame, Clock, Building2, X, UserPlus, ChevronDown } from "lucide-react";
import {
  getCurrentOrNextSlot,
  splitDuration,
  toBn,
  formatDateBn,
  subjectTitle,
  SECONDS_PER_QUESTION,
  PASS_PERCENT,
} from "@/lib/examSchedule";
import { makeAvatarThumb } from "@/lib/clientImage";

const REG_KEY = "bcs_contest_registration";
const sessionKey = (id) => `bcs_contest_session_${id}`;
const OPT = ["ক", "খ", "গ", "ঘ"];
const post = (body) =>
  fetch("/api/contest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());

function DefaultAvatar({ size = "w-11 h-11" }) {
  return (
    <div className={`${size} rounded-full bg-amber-300 border-2 border-white shadow-xs overflow-hidden shrink-0`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M18 95 C20 65, 35 58, 50 58 C65 58, 80 65, 82 95 Z" fill="#2e1065" />
        <polygon points="38,58 62,58 50,86" fill="#ffffff" />
        <polygon points="47,64 53,64 55,84 50,90 45,84" fill="#5b21b6" />
        <ellipse cx="50" cy="36" rx="16" ry="18" fill="#fed7aa" />
        <path d="M33 32 C32 16, 48 12, 60 16 C68 18, 70 28, 66 34 C62 24, 52 22, 42 24 Z" fill="#1e1b4b" />
      </svg>
    </div>
  );
}

function CountdownBoxes({ targetMs, offset }) {
  const [ms, setMs] = useState(() => targetMs - (Date.now() + offset));
  useEffect(() => {
    const tick = () => setMs(targetMs - (Date.now() + offset));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [targetMs, offset]);
  const { d, h, m, s } = splitDuration(ms);
  return (
    <div className="flex gap-2.5">
      {[[d, "দিন"], [h, "ঘণ্টা"], [m, "মিনিট"], [s, "সেকেন্ড"]].map(([v, l]) => (
        <div key={l} className="min-w-[64px] text-center px-3 py-2.5 rounded-2xl bg-white/10 border border-white/20">
          <div className="text-2xl sm:text-3xl font-black tabular-nums text-amber-300">{toBn(String(v).padStart(2, "0"))}</div>
          <div className="text-[11px] font-bold text-purple-200">{l}</div>
        </div>
      ))}
    </div>
  );
}

function SubjectBreakdown({ subjectScores }) {
  if (!subjectScores?.length) return null;
  return (
    <div className="space-y-2">
      {subjectScores.map((s) => {
        const pct = s.total ? Math.max(0, (s.score / s.total) * 100) : 0;
        const color = pct >= PASS_PERCENT ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";
        return (
          <div key={s.subjectId}>
            <div className="flex justify-between text-[11px] font-extrabold text-slate-800">
              <span>{subjectTitle(s.subjectId)}</span>
              <span>
                {s.score} / {s.total} {pct < PASS_PERCENT && <span className="text-rose-600">· দুর্বল</span>}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RegisterModal({ onClose, onSubmit }) {
  const [f, setF] = useState({ name: "", phone: "", institution: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await onSubmit(f);
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };
  const input = "w-full p-3 border rounded-xl text-sm font-bold";
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-text">
      <form onSubmit={go} className="bg-white max-w-md w-full rounded-2xl p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold">📝 পরীক্ষার রেজিস্ট্রেশন</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs font-semibold text-slate-600">
          একবার রেজিস্ট্রেশন করলেই পরবর্তী সব জাতীয় পরীক্ষায় অংশ নিতে পারবেন। পরীক্ষা চলমান থাকলে রেজিস্ট্রেশনের সাথে সাথেই পরীক্ষার পাতা খুলে যাবে।
        </p>
        <input className={input} placeholder="আপনার পূর্ণ নাম *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={input} inputMode="tel" placeholder="মোবাইল নম্বর * (01XXXXXXXXX)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className={input} placeholder="শিক্ষাপ্রতিষ্ঠানের নাম *" value={f.institution} onChange={(e) => setF({ ...f, institution: e.target.value })} />
        {err && <div className="text-xs font-extrabold text-rose-600">⚠️ {err}</div>}
        <button disabled={busy} className="w-full py-3.5 bg-[#2e1065] text-white rounded-xl font-extrabold cursor-pointer disabled:opacity-60">
          {busy ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্ট্রেশন সম্পন্ন করুন →"}
        </button>
        <p className="text-[11px] text-slate-500 font-semibold">আপনার ফোন নম্বর কোথাও প্রকাশ করা হবে না; লিডারবোর্ডে শুধু নাম ও প্রতিষ্ঠান দেখাবে।</p>
      </form>
    </div>
  );
}

const QuestionCard = memo(function QuestionCard({ q, selected, onSelect }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <div className="flex justify-between items-start gap-2 mb-3">
        <h3 className="font-extrabold text-base sm:text-lg">
          {q.qNo}. {q.question}
        </h3>
        <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold shrink-0">{subjectTitle(q.subject)}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(q.qNo, i)}
            className={`p-3.5 rounded-xl border text-left text-sm font-semibold cursor-pointer ${
              selected === i ? "bg-slate-900 text-white border-slate-900 font-extrabold" : "bg-white border-slate-300 hover:border-slate-900"
            }`}
          >
            {OPT[i]}. {opt}
          </button>
        ))}
      </div>
    </div>
  );
});

function TimerBar({ endsAt, offset, answered, total, submitting, onTimeUp, onSubmit }) {
  const calc = () => Math.max(0, Math.ceil((endsAt - (Date.now() + offset)) / 1000));
  const [left, setLeft] = useState(calc);
  const fired = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      const l = calc();
      setLeft(l);
      if (l <= 0 && !fired.current) {
        fired.current = true;
        onTimeUp();
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt, offset, onTimeUp]);
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 sticky top-16 z-30 flex flex-wrap items-center justify-between gap-4 shadow-md">
      <div>
        <div className="text-xs font-extrabold text-rose-600">⚠️ সময় শেষ হলে অটো-সাবমিট হবে · পুনরায় পরীক্ষা দেওয়া যাবে না</div>
        <div className="font-extrabold text-lg text-slate-900">উত্তর দিয়েছেন: {answered} / {total}টি</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="px-4 py-2.5 bg-rose-50 text-rose-700 rounded-xl font-black text-base flex items-center gap-1.5 tabular-nums">
          <Clock className="w-5 h-5" /> সময় বাকি: {h}:{pad(m)}:{pad(s)}
        </div>
        <button onClick={onSubmit} disabled={submitting} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-black cursor-pointer disabled:opacity-60">
          {submitting ? "সাবমিট হচ্ছে..." : "খাতা জমা দিন"}
        </button>
      </div>
    </div>
  );
}

function ExamRoom({ contest, startedAt, initialAnswers, offset, onAnswersChange, onSubmit, submitting }) {
  const [answers, setAnswers] = useState(initialAnswers || {});
  const ref = useRef(answers);
  const total = contest.questions.length;
  const endsAt = startedAt + total * SECONDS_PER_QUESTION * 1000;

  const select = useCallback(
    (qNo, i) => {
      const next = { ...ref.current, [qNo]: i };
      ref.current = next;
      setAnswers(next);
      onAnswersChange(next);
    },
    [onAnswersChange]
  );
  const submitNow = useCallback(() => onSubmit(ref.current), [onSubmit]);

  return (
    <div className="space-y-6">
      <TimerBar endsAt={endsAt} offset={offset} answered={Object.keys(answers).length} total={total} submitting={submitting} onTimeUp={submitNow} onSubmit={submitNow} />
      <div className="space-y-4">
        {contest.questions.map((q) => (
          <QuestionCard key={q.qNo} q={q} selected={answers[q.qNo]} onSelect={select} />
        ))}
      </div>
    </div>
  );
}

export default function ContestTab({ profile, onProfileChange }) {
  const [data, setData] = useState({ contests: [], mySubmissions: {} });
  const [loaded, setLoaded] = useState(false);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const [reg, setReg] = useState(null);
  const [showReg, setShowReg] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [slot, setSlot] = useState(() => getCurrentOrNextSlot(Date.now()));
  const [exam, setExam] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [viewId, setViewId] = useState("");
  const [openRow, setOpenRow] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async (key) => {
    try {
      const res = await fetch(`/api/contest?studentKey=${encodeURIComponent(key || "")}`, { cache: "no-store" });
      const j = await res.json();
      if (j.success) {
        setData({ contests: j.contests || [], mySubmissions: j.mySubmissions || {} });
        offsetRef.current = j.serverNow - Date.now();
        setOffset(offsetRef.current);
      }
    } catch (e) {
      /* offline */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let r = null;
    try {
      r = JSON.parse(localStorage.getItem(REG_KEY) || "null");
    } catch (e) {}
    setReg(r);
    load(r?.studentKey);
  }, [load]);

  // স্লট/ফেজ বদলালে (শুরু, শেষ, ফলাফল প্রকাশ) তবেই রি-রেন্ডার ও রিফ্রেশ
  useEffect(() => {
    const t = setInterval(() => {
      const s = getCurrentOrNextSlot(Date.now() + offsetRef.current);
      setSlot((p) => (p && s && p.dateKey === s.dateKey && p.phase === s.phase ? p : s));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (loaded) load(reg?.studentKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot?.dateKey, slot?.phase]);

  const contests = data.contests;
  const current = contests.find((c) => slot && c.examDate === slot.dateKey) || null;
  const mySubCurrent = current ? data.mySubmissions[current.contestId] : null;
  const examLive = !!current && (current.forceOpen || slot?.phase === "live");
  const hasQuestions = !!current && current.questions.length > 0;

  // রিফ্রেশের পর চলমান পরীক্ষা ফিরিয়ে আনা
  useEffect(() => {
    if (!current || !reg || mySubCurrent || exam || !hasQuestions) return;
    try {
      const s = JSON.parse(localStorage.getItem(sessionKey(current.contestId)) || "null");
      if (s && s.studentKey === reg.studentKey) setExam({ contestId: current.contestId, startedAt: s.startedAt, answers: s.answers || {} });
    } catch (e) {}
  }, [current?.contestId, reg, mySubCurrent, exam, hasQuestions]);

  const startExam = useCallback(() => {
    if (!reg || !current || !hasQuestions || mySubCurrent) return;
    const startedAt = Date.now() + offsetRef.current;
    localStorage.setItem(sessionKey(current.contestId), JSON.stringify({ studentKey: reg.studentKey, startedAt, answers: {} }));
    setExam({ contestId: current.contestId, startedAt, answers: {} });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [reg, current, hasQuestions, mySubCurrent]);

  const onStartClick = () => {
    if (!reg) return setShowReg(true);
    if (confirm("পরীক্ষা শুরু করার পর আর পুনরায় দেওয়া যাবে না। শুরু করতে চান?")) startExam();
  };

  useEffect(() => {
    if (autoStart && reg && examLive && hasQuestions && !mySubCurrent && !exam) {
      setAutoStart(false);
      startExam();
    }
  }, [autoStart, reg, examLive, hasQuestions, mySubCurrent, exam, startExam]);

  const register = async (form) => {
    const j = await post({ action: "REGISTER_STUDENT", payload: form });
    if (!j.success) throw new Error(j.error);
    const r = { studentKey: j.studentKey, name: j.name, institution: j.institution, phone: j.phone };
    localStorage.setItem(REG_KEY, JSON.stringify(r));
    setReg(r);
    setShowReg(false);
    onProfileChange?.({ name: r.name, institution: r.institution });
    await load(r.studentKey);
    setAutoStart(true);
  };

  const persistAnswers = useCallback(
    (answers) => {
      if (!exam) return;
      try {
        const old = JSON.parse(localStorage.getItem(sessionKey(exam.contestId)) || "{}");
        localStorage.setItem(sessionKey(exam.contestId), JSON.stringify({ ...old, answers }));
      } catch (e) {}
    },
    [exam]
  );

  const submitExam = useCallback(
    async (answersMap) => {
      if (submittingRef.current || !exam || !reg) return;
      submittingRef.current = true;
      setSubmitting(true);
      try {
        let avatarUrl = "";
        if (profile?.avatarUrl) avatarUrl = await makeAvatarThumb(profile.avatarUrl, 96).catch(() => "");
        const j = await post({
          action: "SUBMIT_CONTEST_EXAM",
          payload: { contestId: exam.contestId, studentKey: reg.studentKey, answersMap, avatarUrl, hideInstitution: !!profile?.hideProfile },
        });
        if (!j.success) alert(j.error);
        localStorage.removeItem(sessionKey(exam.contestId));
        setExam(null);
        await load(reg.studentKey);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        alert("সাবমিট করতে সমস্যা হয়েছে! ইন্টারনেট চেক করে আবার “খাতা জমা দিন” চাপুন।");
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [exam, reg, profile, load]
  );

  // ---------- লিডারবোর্ড: নিজের সর্বশেষ প্রকাশিত ফলাফল ধরে রাখে (পরের পরীক্ষা জমা না দেওয়া পর্যন্ত) ----------
  const revealed = contests.filter((c) => c.revealed);
  const defaultView = (revealed.find((c) => data.mySubmissions[c.contestId]) || revealed[0])?.contestId || "";
  const viewContest = contests.find((c) => c.contestId === (viewId || defaultView)) || null;
  const mySubView = viewContest ? data.mySubmissions[viewContest.contestId] : null;
  const totalQ = viewContest?.questionCount || 200;
  const passMark = +(totalQ * (PASS_PERCENT / 100)).toFixed(1);

  const weak = useMemo(
    () =>
      (mySubView?.subjectScores || [])
        .map((s) => ({ ...s, pct: s.total ? (s.score / s.total) * 100 : 0 }))
        .filter((s) => s.pct < PASS_PERCENT)
        .sort((a, b) => a.pct - b.pct)
        .slice(0, 3),
    [mySubView]
  );

  const examContest = exam ? contests.find((c) => c.contestId === exam.contestId) : null;

  return (
    <div className="space-y-6">
      {showReg && <RegisterModal onClose={() => setShowReg(false)} onSubmit={register} />}

      {/* HERO + COUNTDOWN */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
              <Flame className="w-4 h-4" /> প্রতি ১০ দিনে ১টি জাতীয় পরীক্ষা (১০, ২০ ও মাসের শেষ তারিখ) · সবার জন্য উন্মুক্ত
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">{current?.title || "বিসিএস স্ট্যান্ডার্ড অল সাবজেক্টস কম্বাইনড প্রিলিমিনারি পরীক্ষা (২০০ এমসিকিউ)"}</h2>
            <p className="text-xs sm:text-sm text-purple-200">
              মোট প্রশ্ন: {current?.questionCount || 200}টি · প্রতি প্রশ্নে ৩৬ সেকেন্ড · পাস মার্ক: ৬০% · নেগেটিভ মার্কিং: ০.৫০ · ১ বারই অংশ নেওয়া যাবে (No Re-Exam)
            </p>
          </div>

          {slot && (
            <div className="space-y-2">
              {current?.forceOpen ? (
                <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm font-extrabold text-amber-300">🧪 টেস্ট মোড চালু — পরীক্ষা এখনই দেওয়া যাচ্ছে</div>
              ) : slot.phase === "upcoming" ? (
                <>
                  <div className="text-xs font-extrabold text-amber-300">⏳ পরবর্তী পরীক্ষা: {formatDateBn(slot.dateKey)}, সকাল ১০:০০ টা</div>
                  <CountdownBoxes targetMs={slot.openAt} offset={offset} />
                </>
              ) : slot.phase === "live" ? (
                <>
                  <div className="text-xs font-extrabold text-emerald-300">🔴 পরীক্ষা চলছে! শুরু করার বাকি সময় (আজ রাত ৮:০০ পর্যন্ত)</div>
                  <CountdownBoxes targetMs={slot.lastStartAt} offset={offset} />
                </>
              ) : (
                <>
                  <div className="text-xs font-extrabold text-amber-300">নতুন করে শুরু করার সময় শেষ · ফলাফল প্রকাশ (রাত ১০:৩০) পর্যন্ত বাকি</div>
                  <CountdownBoxes targetMs={slot.resultAt} offset={offset} />
                </>
              )}
            </div>
          )}
        </div>

        {!exam && (
          <div className="flex flex-wrap items-center gap-3">
            {!reg ? (
              <button onClick={() => setShowReg(true)} className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-2xl text-sm font-black shadow-xl cursor-pointer flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> রেজিস্ট্রেশন করুন
              </button>
            ) : (
              <>
                <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-extrabold">✓ রেজিস্টার্ড: {reg.name}</span>
                {mySubCurrent ? (
                  <span className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-extrabold text-emerald-300">আপনি এই পরীক্ষায় অংশ নিয়েছেন ✓</span>
                ) : examLive && hasQuestions ? (
                  <button onClick={onStartClick} className="px-7 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-2xl text-sm font-black shadow-xl cursor-pointer">
                    🚀 এখনই পরীক্ষা শুরু করুন →
                  </button>
                ) : examLive ? (
                  <span className="text-xs font-bold text-amber-300">এই পর্বের প্রশ্ন এখনো প্রকাশিত হয়নি।</span>
                ) : (
                  <span className="text-xs font-bold text-purple-200">পরীক্ষা শুরুর সময় হলে এখানে “পরীক্ষা শুরু করুন” বাটন আসবে।</span>
                )}
              </>
            )}
            {!current && loaded && <span className="text-xs font-bold text-purple-200">এই তারিখের প্রশ্ন এখনো প্রকাশ করা হয়নি।</span>}
          </div>
        )}
      </div>

      {/* EXAM ROOM */}
      {exam && examContest ? (
        <ExamRoom contest={examContest} startedAt={exam.startedAt} initialAnswers={exam.answers} offset={offset} onAnswersChange={persistAnswers} onSubmit={submitExam} submitting={submitting} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEADERBOARD */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" /> জাতীয় মেধা তালিকা (Leaderboard)
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  টাই-ব্রেকার: সমান নম্বরে আগে English, তারপর Math। পরবর্তী পরীক্ষা জমা দেওয়া পর্যন্ত আপনার আগের অবস্থান অপরিবর্তিত থাকবে; ফলাফল পরীক্ষার দিন রাত ১০:৩০-এ প্রকাশিত হয়।
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-[#2e1065] text-xs font-extrabold">মোট পরীক্ষার্থী: {viewContest?.submissions.length || 0} জন</span>
            </div>

            {revealed.length > 1 && (
              <div className="relative">
                <select value={viewId || defaultView} onChange={(e) => setViewId(e.target.value)} className="w-full p-2.5 pr-8 border rounded-xl bg-slate-50 text-sm font-extrabold appearance-none">
                  {revealed.map((c) => (
                    <option key={c.contestId} value={c.contestId}>
                      {c.examDate ? formatDateBn(c.examDate) : ""} — {c.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {!viewContest || viewContest.submissions.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed text-slate-600 font-bold">
                {loaded ? "এখনো কোনো প্রকাশিত ফলাফল নেই। প্রথম পরীক্ষার পর এখানে মেধা তালিকা দেখা যাবে।" : "লোড হচ্ছে..."}
              </div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                {viewContest.submissions.map((sub) => {
                  const open = openRow === sub.rank;
                  const passed = sub.totalScore >= passMark;
                  return (
                    <div key={sub.rank} onClick={() => setOpenRow(open ? null : sub.rank)} className={`p-4 rounded-2xl border cursor-pointer ${sub.isMe ? "bg-amber-50/80 border-2 border-amber-400" : sub.rank <= 3 ? "bg-purple-50/40 border-purple-200" : "bg-white border-slate-200"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${sub.rank === 1 ? "bg-amber-400 text-slate-950" : sub.rank === 2 ? "bg-slate-300 text-slate-900" : sub.rank === 3 ? "bg-amber-700 text-white" : "bg-slate-100 text-slate-700"}`}>#{sub.rank}</div>
                          {sub.avatarUrl ? <img src={sub.avatarUrl} alt={sub.name} className="w-11 h-11 rounded-full object-cover border-2 border-purple-300 shrink-0" /> : <DefaultAvatar />}
                          <div>
                            <div className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                              <span>{sub.name}</span>
                              {sub.isMe && <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-black">আপনি</span>}
                            </div>
                            <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>{sub.institution || "বিসিএস পরীক্ষার্থী"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-[#2e1065]">
                            {sub.totalScore} <span className="text-xs font-bold text-slate-400">/ {totalQ}</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-500">Eng: {sub.englishScore} · Math: {sub.mathScore}</div>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold ${passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{passed ? "PASSED (60%+)" : "BELOW 60%"}</span>
                        </div>
                      </div>
                      {open && (
                        <div className="mt-3 pt-3 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
                          <div className="text-[11px] font-extrabold text-slate-500 mb-2">বিষয়ভিত্তিক নম্বর</div>
                          <SubjectBreakdown subjectScores={sub.subjectScores} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MY RESULT */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="text-lg font-black text-slate-900 border-b pb-3">📋 আপনার ফলাফল ও দুর্বলতা বিশ্লেষণ</h3>

            {mySubCurrent && !current?.revealed ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
                <div className="text-3xl">✅</div>
                <div className="font-black text-emerald-900">আপনার খাতা জমা হয়েছে</div>
                <div className="text-sm font-bold text-slate-700">প্রাপ্ত নম্বর: {mySubCurrent.totalScore}</div>
                <p className="text-xs font-semibold text-slate-600">মেধাক্রম, বিষয়ভিত্তিক বিশ্লেষণ ও ভুল উত্তরের ব্যাখ্যা পরীক্ষার দিন রাত ১০:৩০-এ প্রকাশিত হবে।</p>
              </div>
            ) : !mySubView ? (
              <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed space-y-3">
                <p className="text-sm font-bold text-slate-700">{reg ? "আপনি এখনো কোনো জাতীয় পরীক্ষায় অংশগ্রহণ করেননি।" : "অংশ নিতে আগে রেজিস্ট্রেশন করুন।"}</p>
                {!reg && (
                  <button onClick={() => setShowReg(true)} className="px-5 py-2.5 bg-[#2e1065] text-white rounded-xl text-xs font-extrabold cursor-pointer">রেজিস্ট্রেশন করুন →</button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[11px] font-bold text-emerald-800">সঠিক উত্তর</div>
                    <div className="text-xl font-black text-emerald-700">{mySubView.correctCount}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="text-[11px] font-bold text-rose-800">ভুল (-০.৫০)</div>
                    <div className="text-xl font-black text-rose-700">{mySubView.wrongCount}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 text-white">
                    <div className="text-[11px] font-bold text-amber-300">মেধা স্থান</div>
                    <div className="text-xl font-black">#{mySubView.rank ?? "-"}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border space-y-2">
                  <div className="text-xs font-extrabold text-slate-700">বিষয়ভিত্তিক নম্বর (৬০% এর নিচে = দুর্বল)</div>
                  <SubjectBreakdown subjectScores={mySubView.subjectScores} />
                </div>

                {weak.length > 0 ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900">
                    ⚠️ সবচেয়ে দুর্বল বিষয়: {weak.map((w) => subjectTitle(w.subjectId)).join(", ")}। এই বিষয়গুলোতে বেশি অনুশীলন করুন।
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">🎉 সব বিষয়ে আপনি ৬০% এর উপরে আছেন — চালিয়ে যান!</div>
                )}

                {viewContest?.questions.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700">ভুল উত্তরের ব্যাখ্যা</span>
                      <button onClick={() => setShowAll(!showAll)} className="text-xs font-extrabold text-blue-600 cursor-pointer">{showAll ? "শুধু ভুল/বাদ পড়া দেখান" : "সব প্রশ্ন দেখুন"}</button>
                    </div>
                    <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                      {viewContest.questions.map((q) => {
                        const my = mySubView.answersMap?.[q.qNo];
                        const skipped = my === undefined;
                        const isWrong = !skipped && Number(my) !== Number(q.correctAnswer);
                        if (!showAll && !isWrong && !skipped) return null;
                        return (
                          <div key={q.qNo} className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${isWrong ? "bg-rose-50/60 border-rose-300" : "bg-slate-50 border-slate-200"}`}>
                            <div className="text-[10px] font-extrabold text-purple-700">{subjectTitle(q.subject)}</div>
                            <div className="font-extrabold text-slate-900">{q.qNo}. {q.question}</div>
                            <div className="text-xs font-bold text-emerald-800">✓ সঠিক উত্তর: {q.options[q.correctAnswer]}</div>
                            {isWrong && <div className="text-xs font-bold text-rose-700">✗ আপনার উত্তর: {q.options[my]}</div>}
                            {skipped && <div className="text-xs font-bold text-slate-500">— উত্তর দেননি</div>}
                            {q.explanation && (
                              <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border mt-1">
                                <strong>ব্যাখ্যা:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
