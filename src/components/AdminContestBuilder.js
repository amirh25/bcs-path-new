"use client";
/**
 * ============================================================================
 * FILE: src/components/AdminContestBuilder.js
 * PURPOSE: জাতীয় ২০০-MCQ পরীক্ষা সেটআপ (অ্যাডমিন)
 *  - পরীক্ষার তারিখ নির্বাচন (১০ / ২০ / মাসের শেষ দিন)
 *  - ডকুমেন্ট (.docx/.txt/.csv/.json) বা পেস্ট করা টেক্সট থেকে বাল্ক প্রশ্ন বসানো
 *  - প্রতি ২৫টি প্রশ্নের ব্লকের জন্য বিষয় (Subject) নির্বাচন → বিষয়ভিত্তিক নম্বর/দুর্বলতা বিশ্লেষণ
 * ============================================================================
 */
import React, { useEffect, useMemo, useState } from "react";
import { Upload, Download } from "lucide-react";
import {
  CONTEST_SUBJECTS,
  defaultSubjectForQNo,
  subjectTitle,
  getUpcomingExamDateKeys,
  formatDateBn,
  subjectOfQuestion,
} from "@/lib/examSchedule";
import { parseQuestionFile, parseQuestionsText, SAMPLE_TXT, SAMPLE_CSV } from "@/lib/questionParser";

const blankSlots = () =>
  Array.from({ length: 200 }, (_, i) => ({
    qNo: i + 1,
    subject: defaultSubjectForQNo(i + 1),
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  }));
const RANGES = Array.from({ length: 8 }, (_, i) => [i * 25 + 1, (i + 1) * 25]);
const defaultTitle = (d) => `বিসিএস স্ট্যান্ডার্ড অল সাবজেক্টস কম্বাইনড প্রিলিমিনারি পরীক্ষা (২০০ এমসিকিউ) — ${formatDateBn(d)}`;
const WINDOW_TEXT = "প্রতি ১০ দিনে ১টি জাতীয় মেধা যাচাই পরীক্ষা · পাস মার্ক ৬০%";

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminContestBuilder({ adminPin }) {
  const dateKeys = useMemo(() => getUpcomingExamDateKeys(Date.now(), 6), []);
  const [examDate, setExamDate] = useState(dateKeys[0]);
  const [meta, setMeta] = useState({ title: "", examWindowText: WINDOW_TEXT, forceOpen: false, resetSubmissions: false });
  const [subCount, setSubCount] = useState(0);
  const [slots, setSlots] = useState(blankSlots);
  const [range, setRange] = useState(0);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");

  const [pasteText, setPasteText] = useState("");
  const [startNo, setStartNo] = useState(1);
  const [parsed, setParsed] = useState(null);
  const [parsing, setParsing] = useState(false);

  const api = (action, payload) =>
    fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminPin, payload }),
    }).then((r) => r.json());

  // তারিখ বদলালে সেই তারিখের পরীক্ষা (থাকলে) লোড
  useEffect(() => {
    let dead = false;
    (async () => {
      setBusy(true);
      try {
        const j = await api("ADMIN_GET_CONTEST", { contestId: `bcs-${examDate}` });
        if (dead) return;
        if (!j.success) throw new Error(j.error);
        const c = j.data;
        setMeta({ title: c?.title || defaultTitle(examDate), examWindowText: c?.examWindowText || WINDOW_TEXT, forceOpen: !!c?.forceOpen, resetSubmissions: false });
        setSubCount(j.submissionCount || 0);
        const base = blankSlots();
        (c?.questions || []).forEach((q) => {
          const i = Number(q.qNo) - 1;
          if (i >= 0 && i < 200)
            base[i] = {
              qNo: i + 1,
              subject: subjectOfQuestion(q),
              question: q.question || "",
              options: q.options?.length === 4 ? [...q.options] : ["", "", "", ""],
              correctAnswer: Number(q.correctAnswer || 0),
              explanation: q.explanation || "",
            };
        });
        setSlots(base);
        setInfo(c ? `এই তারিখের পরীক্ষায় আগে ${c.questions?.length || 0}টি প্রশ্ন প্রকাশিত আছে।` : "এই তারিখের জন্য নতুন পরীক্ষা সেটআপ করছেন।");
      } catch (e) {
        if (!dead) setInfo("⚠️ লোড করা যায়নি: " + e.message);
      } finally {
        if (!dead) setBusy(false);
      }
    })();
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examDate, adminPin]);

  const updateSlot = (qNo, field, value, optIdx = null) =>
    setSlots((prev) =>
      prev.map((s) => {
        if (s.qNo !== qNo) return s;
        if (optIdx !== null) {
          const options = [...s.options];
          options[optIdx] = value;
          return { ...s, options };
        }
        return { ...s, [field]: value };
      })
    );

  const [lo, hi] = RANGES[range];
  const blockSlots = slots.slice(lo - 1, hi);
  const blockSubject = useMemo(() => {
    const c = {};
    blockSlots.forEach((s) => (c[s.subject] = (c[s.subject] || 0) + 1));
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || "bangla";
  }, [blockSlots]);
  const setBlockSubject = (sid) =>
    setSlots((prev) => prev.map((s) => (s.qNo >= lo && s.qNo <= hi ? { ...s, subject: sid } : s)));

  const filledCount = slots.filter((q) => q.question.trim()).length;
  const subjectCounts = useMemo(() => {
    const c = {};
    slots.forEach((s) => (c[s.subject] = (c[s.subject] || 0) + 1));
    return c;
  }, [slots]);

  // ---------- বাল্ক ইমপোর্ট ----------
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setParsing(true);
    try {
      setParsed(await parseQuestionFile(file));
    } catch (err) {
      alert("⚠️ " + err.message);
    } finally {
      setParsing(false);
    }
  };
  const onParseText = () => {
    if (!pasteText.trim()) return alert("আগে প্রশ্নগুলো বক্সে পেস্ট করুন।");
    setParsed(parseQuestionsText(pasteText));
  };
  const applyParsed = () => {
    if (!parsed?.questions.length) return;
    const start = Math.max(1, Math.min(200, Number(startNo) || 1));
    const list = parsed.questions.slice(0, 200 - start + 1);
    setSlots((prev) =>
      prev.map((s) => {
        const k = s.qNo - start;
        if (k < 0 || k >= list.length) return s;
        const q = list[k];
        return { ...s, question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation };
      })
    );
    setRange(Math.floor((start - 1) / 25));
    setInfo(`✅ ${list.length}টি প্রশ্ন #${start} থেকে #${start + list.length - 1} ঘরে বসানো হয়েছে${parsed.questions.length > list.length ? ` (বাকি ${parsed.questions.length - list.length}টি ২০০-এর বাইরে বলে বাদ)` : ""}। নিচে দেখে নিয়ে Publish করুন।`);
    setParsed(null);
    setPasteText("");
  };

  const publish = async (e) => {
    e.preventDefault();
    const filled = slots.filter((q) => q.question.trim());
    if (!filled.length) return alert("⚠️ কমপক্ষে ১টি প্রশ্ন পূরণ করুন!");
    const bad = filled.filter((q) => q.options.some((o) => !o.trim())).map((q) => q.qNo);
    if (bad.length) return alert(`⚠️ এই প্রশ্নগুলোর ৪টি অপশন পূরণ হয়নি: ${bad.slice(0, 15).join(", ")}${bad.length > 15 ? " ..." : ""}`);
    if (meta.forceOpen && !confirm("টেস্ট মোড চালু আছে — সময় নির্বিশেষে পরীক্ষা খোলা থাকবে ও ফলাফল সাথে সাথে দেখাবে। লাইভ পরীক্ষার আগে এটি বন্ধ করতে ভুলবেন না। এগিয়ে যাবেন?")) return;
    setBusy(true);
    try {
      const j = await api("SAVE_BIWEEKLY_CONTEST", { ...meta, examDate, questions: filled });
      if (!j.success) throw new Error(j.error);
      alert(`🎉 ${formatDateBn(examDate)} তারিখের জাতীয় পরীক্ষা (${filled.length}টি প্রশ্নসহ) প্রকাশিত হয়েছে!`);
      setMeta((m) => ({ ...m, resetSubmissions: false }));
    } catch (err) {
      alert("⚠️ " + err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-amber-400 space-y-5">
      <div>
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black">প্রতি ১০ দিনে ১টি জাতীয় পরীক্ষা (১০, ২০ ও মাসের শেষ তারিখ) · ২০০টি MCQ</span>
        <h3 className="text-xl font-extrabold text-slate-900 mt-1">🏆 বিসিএস স্ট্যান্ডার্ড অল সাবজেক্টস কম্বাইনড প্রিলিমিনারি পরীক্ষা সেটআপ (১ - ২০০ নম্বর প্রশ্ন)</h3>
        <p className="text-xs sm:text-sm text-slate-600">প্রতি ২৫টি প্রশ্নের ব্লকে একটি বিষয় নির্বাচন করুন — এর ভিত্তিতেই লিডারবোর্ডে বিষয়ভিত্তিক নম্বর ও শিক্ষার্থীর দুর্বলতা দেখানো হবে। টাই-ব্রেকারে English ও Math ব্যবহৃত হয়।</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm">
        <div>
          <label className="font-extrabold block mb-1">পরীক্ষার তারিখ *</label>
          <select value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full p-3 border rounded-xl bg-white font-bold">
            {dateKeys.map((k) => (
              <option key={k} value={k}>{formatDateBn(k)}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="font-extrabold block mb-1">পরীক্ষার শিরোনাম *</label>
          <input type="text" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} className="w-full p-3 border rounded-xl bg-white font-bold" />
        </div>
        <label className="flex items-center gap-2 p-3 rounded-xl bg-white border cursor-pointer font-extrabold text-xs text-rose-700">
          <input type="checkbox" checked={meta.resetSubmissions} onChange={(e) => setMeta({ ...meta, resetSubmissions: e.target.checked })} />
          <span>এই তারিখের আগের সাবমিশন/লিডারবোর্ড রিসেট করুন ({subCount} জন জমা দিয়েছে)</span>
        </label>
        <label className="sm:col-span-2 flex items-center gap-2 p-3 rounded-xl bg-white border cursor-pointer font-extrabold text-xs text-purple-800">
          <input type="checkbox" checked={meta.forceOpen} onChange={(e) => setMeta({ ...meta, forceOpen: e.target.checked })} />
          <span>🧪 টেস্ট মোড: সময় নির্বিশেষে পরীক্ষা চালু ও ফলাফল সাথে সাথে দেখাবে (শুধু নিজে পরীক্ষা করার জন্য; লাইভে দেওয়ার আগে বন্ধ করুন)</span>
        </label>
      </div>

      {info && <div className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-extrabold text-slate-800">{busy ? "⏳ " : ""}{info}</div>}

      {/* ===== বাল্ক ইমপোর্ট ===== */}
      <div className="p-5 rounded-2xl bg-blue-50/60 border-2 border-blue-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-extrabold text-base text-blue-950">📥 ডকুমেন্ট / বাল্ক প্রশ্ন আপলোড (স্বয়ংক্রিয়ভাবে ১–২৫, ২৬–৫০ ... ২০০ পর্যন্ত বসবে)</h4>
          <div className="flex gap-2">
            <button type="button" onClick={() => download("question-template.txt", SAMPLE_TXT, "text/plain;charset=utf-8")} className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-extrabold text-blue-900 flex items-center gap-1 cursor-pointer">
              <Download className="w-3.5 h-3.5" /> টেমপ্লেট (.txt)
            </button>
            <button type="button" onClick={() => download("question-template.csv", SAMPLE_CSV, "text/csv;charset=utf-8")} className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-extrabold text-blue-900 flex items-center gap-1 cursor-pointer">
              <Download className="w-3.5 h-3.5" /> টেমপ্লেট (Excel .csv)
            </button>
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-600">
          সাপোর্টেড: Word (.docx), .txt, Excel থেকে Save as CSV, .json। প্রতিটি প্রশ্ন “১. প্রশ্ন → ক) খ) গ) ঘ) → উত্তর: খ → ব্যাখ্যা: ...” ফরম্যাটে লিখুন (বাংলা/ইংরেজি সংখ্যা ও A/B/C/D উভয়ই চলবে)। PDF হলে টেক্সট কপি করে নিচের বক্সে পেস্ট করুন।
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-extrabold text-sm cursor-pointer flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> {parsing ? "পড়া হচ্ছে..." : "ফাইল আপলোড করুন"}
            <input type="file" accept=".docx,.txt,.md,.csv,.tsv,.json" onChange={onFile} className="hidden" />
          </label>
          <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
            শুরুর প্রশ্ন নম্বর:
            <input type="number" min={1} max={200} value={startNo} onChange={(e) => setStartNo(e.target.value)} className="w-20 p-2 border rounded-lg text-sm font-bold" />
          </label>
        </div>
        <textarea rows={4} value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="অথবা এখানে প্রশ্নগুলো পেস্ট করুন..." className="w-full p-3 border rounded-xl text-sm bg-white" />
        <button type="button" onClick={onParseText} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-extrabold cursor-pointer">পেস্ট করা টেক্সট বিশ্লেষণ করুন</button>

        {parsed && (
          <div className="p-4 rounded-xl bg-white border space-y-2">
            <div className="font-extrabold text-sm text-slate-900">
              ✅ {parsed.questions.length}টি প্রশ্ন শনাক্ত হয়েছে{parsed.warnings.length > 0 && <span className="text-rose-600"> · {parsed.warnings.length}টিতে সমস্যা আছে</span>}
            </div>
            {parsed.warnings.slice(0, 8).map((w) => (
              <div key={w.index} className="text-xs font-bold text-rose-700">প্রশ্ন {w.index}: {w.text}</div>
            ))}
            {parsed.warnings.length > 8 && <div className="text-xs font-bold text-rose-700">... আরও {parsed.warnings.length - 8}টি</div>}
            <button type="button" onClick={applyParsed} disabled={!parsed.questions.length} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black cursor-pointer disabled:opacity-50">
              ✓ প্রশ্ন #{Math.max(1, Number(startNo) || 1)} থেকে ঘরগুলোতে বসান
            </button>
          </div>
        )}
      </div>

      {/* বিষয়ভিত্তিক সারসংক্ষেপ */}
      <div className="flex flex-wrap gap-1.5">
        {CONTEST_SUBJECTS.map((s) => (
          <span key={s.id} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-extrabold text-slate-700">
            {subjectTitle(s.id)}: {subjectCounts[s.id] || 0}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-3 rounded-xl">
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map(([a, b], i) => (
            <button key={i} type="button" onClick={() => setRange(i)} className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${range === i ? "bg-slate-900 text-white" : "bg-white border"}`}>
              প্রশ্ন {a}-{b}
            </button>
          ))}
        </div>
        <span className="text-xs font-black text-amber-900">পূরণকৃত প্রশ্ন: {filledCount} / ২০০টি</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-purple-50 border border-purple-200">
        <span className="text-xs font-extrabold text-purple-900">প্রশ্ন {lo}–{hi} এই ২৫টির বিষয়:</span>
        <select value={blockSubject} onChange={(e) => setBlockSubject(e.target.value)} className="px-3 py-1.5 rounded-lg border bg-white text-xs font-extrabold text-purple-900">
          {CONTEST_SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        <span className="text-[11px] font-semibold text-slate-600">(নির্বাচন করলে ব্লকের সব প্রশ্নে প্রযোজ্য হবে; দরকারে নিচে প্রশ্নভেদে বদলানো যাবে)</span>
      </div>

      <form onSubmit={publish} className="space-y-4">
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {blockSlots.map((slot) => (
            <div key={slot.qNo} className="p-4 rounded-2xl border bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-slate-900 text-amber-300 text-xs font-black">জাতীয় পরীক্ষা · প্রশ্ন #{slot.qNo}</span>
                <select value={slot.subject} onChange={(e) => updateSlot(slot.qNo, "subject", e.target.value)} className="px-3 py-1 rounded-lg border bg-white text-xs font-extrabold text-purple-900">
                  {CONTEST_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <input type="text" placeholder={`প্রশ্ন #${slot.qNo} এখানে লিখুন...`} value={slot.question} onChange={(e) => updateSlot(slot.qNo, "question", e.target.value)} className="w-full p-2.5 border rounded-xl bg-white text-sm font-bold" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["ক", "খ", "গ", "ঘ"].map((lbl, idx) => (
                  <input key={idx} type="text" placeholder={`অপশন ${lbl}`} value={slot.options[idx]} onChange={(e) => updateSlot(slot.qNo, "options", e.target.value, idx)} className="p-2 border rounded-xl bg-white text-xs font-semibold" />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select value={slot.correctAnswer} onChange={(e) => updateSlot(slot.qNo, "correctAnswer", Number(e.target.value))} className="p-2 border rounded-xl bg-white text-xs font-extrabold text-emerald-800">
                  <option value={0}>সঠিক উত্তর: ক</option>
                  <option value={1}>সঠিক উত্তর: খ</option>
                  <option value={2}>সঠিক উত্তর: গ</option>
                  <option value={3}>সঠিক উত্তর: ঘ</option>
                </select>
                <input type="text" placeholder="ভুল উত্তরের ব্যাখ্যা লিখুন..." value={slot.explanation} onChange={(e) => updateSlot(slot.qNo, "explanation", e.target.value)} className="sm:col-span-2 p-2 border rounded-xl bg-white text-xs" />
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={busy} className="w-full py-4 bg-amber-400 text-slate-950 rounded-2xl text-base font-black hover:bg-amber-300 cursor-pointer shadow-lg disabled:opacity-60">
          🚀 {formatDateBn(examDate)}-এর জাতীয় বিসিএস পরীক্ষা (২০০ MCQ) Publish করুন
        </button>
      </form>
    </div>
  );
}
