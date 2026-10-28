/**
 * ============================================================================
 * FILE: src/app/api/contest/route.js
 * PURPOSE: শিক্ষার্থীদের জন্য জাতীয় ২০০-MCQ পরীক্ষার পাবলিক API
 *   GET  → পরীক্ষা তালিকা, (প্রকাশিত হলে) লিডারবোর্ড, নিজের সাবমিশন
 *   POST → REGISTER_STUDENT, SUBMIT_CONTEST_EXAM (স্কোর সার্ভারেই হিসাব হয়)
 * সুরক্ষা: পরীক্ষা চলাকালীন সঠিক উত্তর/ব্যাখ্যা ক্লায়েন্টে পাঠানো হয় না।
 * ============================================================================
 */
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { connectDB } from "@/lib/mongodb";
import { BiWeeklyContest, ContestRegistration } from "@/models/PlatformModels";
import {
  getContestWindow,
  getCurrentOrNextSlot,
  isResultsRevealed,
  compareSubmissions,
  subjectOfQuestion,
  normalizePhone,
  NEGATIVE_MARK,
} from "@/lib/examSchedule";

// export const dynamic = "force-dynamic";

const SALT = process.env.STUDENT_KEY_SALT || process.env.ADMIN_SECRET_PIN || "bcs2026";
const makeKey = (phone) =>
  crypto.createHash("sha256").update(`bcs|${phone}|${SALT}`).digest("hex").slice(0, 24);
const cleanAvatar = (a) => (typeof a === "string" && a.startsWith("data:image/") && a.length < 60000 ? a : "");
const fail = (error, status = 400) => NextResponse.json({ success: false, error }, { status });

function scoreSubmission(contest, answersMap) {
  const bySub = {};
  let correct = 0;
  let wrong = 0;
  for (const q of contest.questions || []) {
    const sid = subjectOfQuestion(q);
    const s = (bySub[sid] ||= { subjectId: sid, total: 0, correct: 0, wrong: 0, score: 0 });
    s.total += 1;
    const a = answersMap[q.qNo];
    if (a === undefined) continue;
    if (a === Number(q.correctAnswer)) {
      s.correct += 1;
      s.score += 1;
      correct += 1;
    } else {
      s.wrong += 1;
      s.score -= NEGATIVE_MARK;
      wrong += 1;
    }
  }
  const subjectScores = Object.values(bySub).map((s) => ({ ...s, score: +s.score.toFixed(2) }));
  const negativePenalty = wrong * NEGATIVE_MARK;
  return {
    correct,
    wrong,
    negativePenalty,
    totalScore: Math.max(0, +(correct - negativePenalty).toFixed(2)),
    englishScore: subjectScores.find((s) => s.subjectId === "english")?.score ?? 0,
    mathScore: subjectScores.find((s) => s.subjectId === "math")?.score ?? 0,
    subjectScores,
  };
}

export async function GET(req) {
  try {
    await connectDB();
    const studentKey = new URL(req.url).searchParams.get("studentKey") || "";
    const now = Date.now();
    const slot = getCurrentOrNextSlot(now);

    const docs = await BiWeeklyContest.find({ examDate: { $exists: true, $ne: "" } })
      .sort({ examDate: -1 })
      .limit(6)
      .lean();

    const contests = [];
    const mySubmissions = {};

    for (const c of docs) {
      const revealed = isResultsRevealed(c, now);
      const subs = c.submissions || [];
      const mine = studentKey ? subs.find((s) => s.studentKey === studentKey) : null;
      const isCurrent = !!slot && c.examDate === slot.dateKey;

      // প্রশ্ন শুধু চলমান পরীক্ষা বা শিক্ষার্থী যেটায় অংশ নিয়েছে সেটার জন্য পাঠানো হয়
      const questions =
        isCurrent || mine
          ? (c.questions || []).map((q) => {
              const base = { qNo: q.qNo, subject: subjectOfQuestion(q), question: q.question, options: q.options };
              return revealed ? { ...base, correctAnswer: q.correctAnswer, explanation: q.explanation || "" } : base;
            })
          : [];

      let submissions = [];
      let sorted = [];
      if (revealed) {
        sorted = [...subs].sort(compareSubmissions);
        submissions = sorted.map((s, i) => ({
          rank: i + 1,
          name: s.name,
          institution: s.institution,
          avatarUrl: s.avatarUrl && s.avatarUrl.length < 60000 ? s.avatarUrl : "",
          totalScore: s.totalScore,
          englishScore: s.englishScore || 0,
          mathScore: s.mathScore || 0,
          correctCount: s.correctCount || 0,
          wrongCount: s.wrongCount || 0,
          subjectScores: s.subjectScores || [],
          isMe: !!studentKey && s.studentKey === studentKey,
        }));
      }

      if (mine) {
        const idx = revealed ? sorted.findIndex((s) => s.studentKey === studentKey) : -1;
        mySubmissions[c.contestId] = {
          totalScore: mine.totalScore,
          englishScore: mine.englishScore || 0,
          mathScore: mine.mathScore || 0,
          correctCount: mine.correctCount || 0,
          wrongCount: mine.wrongCount || 0,
          subjectScores: mine.subjectScores || [],
          answersMap: mine.answersMap || {},
          rank: idx >= 0 ? idx + 1 : null,
        };
      }

      contests.push({
        contestId: c.contestId,
        title: c.title,
        examWindowText: c.examWindowText,
        examDate: c.examDate,
        forceOpen: !!c.forceOpen,
        revealed,
        questionCount: (c.questions || []).length,
        participantCount: subs.length,
        questions,
        submissions,
      });
    }

    return NextResponse.json({ success: true, serverNow: now, contests, mySubmissions });
  } catch (error) {
    return fail(error.message, 500);
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { action, payload } = await req.json();
    const now = Date.now();

    // ================= রেজিস্ট্রেশন =================
    if (action === "REGISTER_STUDENT") {
      const name = String(payload?.name || "").trim().slice(0, 60);
      const institution = String(payload?.institution || "").trim().slice(0, 100);
      const phone = normalizePhone(payload?.phone);
      if (name.length < 2) return fail("অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।");
      if (!phone) return fail("সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)।");
      if (institution.length < 2) return fail("শিক্ষাপ্রতিষ্ঠানের নাম লিখুন।");

      const studentKey = makeKey(phone);
      await ContestRegistration.findOneAndUpdate(
        { phone },
        { phone, studentKey, name, institution },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return NextResponse.json({ success: true, studentKey, name, institution, phone });
    }

    // ================= পরীক্ষা সাবমিট (এক শিক্ষার্থী = একবার) =================
    if (action === "SUBMIT_CONTEST_EXAM") {
      const { contestId, studentKey, answersMap, avatarUrl, hideInstitution } = payload || {};
      const reg = studentKey ? await ContestRegistration.findOne({ studentKey }).lean() : null;
      if (!reg) return fail("পরীক্ষায় অংশ নিতে আগে রেজিস্ট্রেশন করুন।", 403);

      const contest = await BiWeeklyContest.findOne({ contestId }).lean();
      if (!contest) return fail("পরীক্ষাটি পাওয়া যায়নি!", 404);

      if (!contest.forceOpen && contest.examDate) {
        const w = getContestWindow(contest.examDate);
        if (now < w.openAt) return fail("পরীক্ষা এখনো শুরু হয়নি।", 403);
        if (now > w.resultAt) return fail("পরীক্ষার সময় শেষ হয়ে গেছে, খাতা জমা নেওয়া যাচ্ছে না।", 403);
      }

      if ((contest.submissions || []).some((s) => s.studentKey === studentKey)) {
        return fail("আপনি ইতিমধ্যে এই পরীক্ষায় অংশগ্রহণ করেছেন! নিয়ম অনুযায়ী পুনরায় পরীক্ষা দেওয়া যাবে না।");
      }

      const clean = {};
      for (const [k, v] of Object.entries(answersMap || {})) {
        const n = Number(k);
        const a = Number(v);
        if (Number.isInteger(n) && n >= 1 && n <= 200 && Number.isInteger(a) && a >= 0 && a <= 3) clean[n] = a;
      }

      const r = scoreSubmission(contest, clean);
      const submission = {
        studentKey,
        name: reg.name,
        institution: hideInstitution ? "" : reg.institution,
        avatarUrl: cleanAvatar(avatarUrl),
        totalScore: r.totalScore,
        englishScore: r.englishScore,
        mathScore: r.mathScore,
        correctCount: r.correct,
        wrongCount: r.wrong,
        negativePenalty: r.negativePenalty,
        subjectScores: r.subjectScores,
        answersMap: clean,
        submittedAt: new Date(),
      };

      // অ্যাটমিক: একই শিক্ষার্থী দুইবার সাবমিট করতে পারবে না (রেস কন্ডিশনেও নয়)
      const res = await BiWeeklyContest.updateOne(
        { contestId, "submissions.studentKey": { $ne: studentKey } },
        { $push: { submissions: submission } }
      );
      if (res.modifiedCount === 0) {
        return fail("আপনি ইতিমধ্যে এই পরীক্ষায় অংশগ্রহণ করেছেন!");
      }
      return NextResponse.json({ success: true, totalScore: r.totalScore });
    }

    return fail("Invalid Action");
  } catch (error) {
    return fail(error.message, 500);
  }
}
