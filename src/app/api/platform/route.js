/**
 * ============================================================================
 * FILE: src/app/api/platform/route.js
 * PURPOSE: REST API — Lectures, Vocab Stories, Question Bank, Exam Sets,
 *          Admin: জাতীয় ২০০-MCQ পরীক্ষা সেভ/লোড
 * NOTE: শিক্ষার্থীদের পরীক্ষা/রেজিস্ট্রেশন/লিডারবোর্ড এখন /api/contest এ।
 * ============================================================================
 */
// import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  Lecture,
  VocabStory,
  QuestionBankDoc,
  ExamSet,
  BiWeeklyContest,
  ContestRegistration,
  StudentProfile,
} from "@/models/PlatformModels";
import { CONTEST_SUBJECTS, isValidExamDateKey, defaultSubjectForQNo } from "@/lib/examSchedule";

// export const dynamic = "force-dynamic";

const SUBJECT_IDS = new Set(CONTEST_SUBJECTS.map((s) => s.id));

export async function GET() {
  try {
    await connectDB();

    const lectures = await Lecture.find().sort({ lectureNo: 1 });
    const vocabStories = await VocabStory.find().sort({ storyNo: 1 });
    const qbankDocs = await QuestionBankDoc.find().sort({ createdAt: -1 });
    const examSets = await ExamSet.find().sort({ lectureNo: 1, testNumber: 1 });
    const studentsCount = (await StudentProfile.countDocuments()) + (await ContestRegistration.countDocuments());

    return NextResponse.json({
      success: true,
      lectures,
      vocabStories,
      qbankDocs,
      examSets,
      contests: [], // জাতীয় পরীক্ষার ডাটা এখন /api/contest থেকে আসে
      studentsCount: studentsCount || 1,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { action, adminPin, payload } = body;

    // 1. Public Student Action: Save Profile
    if (action === "SAVE_PROFILE") {
      const p = payload || {};
      const profile = await StudentProfile.findOneAndUpdate(
        { phone: p.phone || "student_default" },
        {
          phone: p.phone || "student_default",
          name: p.name,
          targetBcs: p.targetBcs,
          institution: p.institution,
          hideProfile: p.hideProfile,
          avatarUrl: p.avatarUrl,
        },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, data: profile });
    }

    // ================= ADMIN PIN VERIFICATION =================
    const SECRET = process.env.ADMIN_SECRET_PIN || "bcs2026";
    if (adminPin !== SECRET) {
      return NextResponse.json({ success: false, error: "ভুল অ্যাডমিন পিন!" }, { status: 401 });
    }

    // 3. Save / Delete Lecture
    if (action === "SAVE_LECTURE") {
      if (payload._id) {
        const updated = await Lecture.findByIdAndUpdate(payload._id, payload, { new: true });
        return NextResponse.json({ success: true, data: updated });
      }
      const created = await Lecture.create(payload);
      return NextResponse.json({ success: true, data: created });
    }

    if (action === "DELETE_LECTURE") {
      await Lecture.findByIdAndDelete(payload.id);
      return NextResponse.json({ success: true });
    }

    // 4. Save / Delete Vocabulary Story
    if (action === "SAVE_VOCAB_STORY") {
      if (payload._id) {
        const updated = await VocabStory.findByIdAndUpdate(payload._id, payload, { new: true });
        return NextResponse.json({ success: true, data: updated });
      }
      const created = await VocabStory.create(payload);
      return NextResponse.json({ success: true, data: created });
    }

    if (action === "DELETE_VOCAB_STORY") {
      await VocabStory.findByIdAndDelete(payload.id);
      return NextResponse.json({ success: true });
    }

    // 5. Save / Delete Question Bank Document
    if (action === "SAVE_QBANK_DOC") {
      if (payload._id) {
        const updated = await QuestionBankDoc.findByIdAndUpdate(payload._id, payload, { new: true });
        return NextResponse.json({ success: true, data: updated });
      }
      const created = await QuestionBankDoc.create(payload);
      return NextResponse.json({ success: true, data: created });
    }

    if (action === "DELETE_QBANK_DOC") {
      await QuestionBankDoc.findByIdAndDelete(payload.id);
      return NextResponse.json({ success: true });
    }

    // 6. Save / Delete Chapter Test 1 & Test 2
    if (action === "SAVE_EXAM_SET") {
      const { courseType, subjectId, lectureNo, testNumber, chapterName, title, questions } = payload;
      const validQuestions = (questions || []).filter((q) => q.question && q.question.trim() !== "");

      if (validQuestions.length === 0) {
        return NextResponse.json(
          { success: false, error: "কমপক্ষে ১টি প্রশ্ন পূরণ করে Publish করুন!" },
          { status: 400 }
        );
      }

      const savedSet = await ExamSet.findOneAndUpdate(
        {
          courseType: courseType || "bcs",
          subjectId,
          lectureNo: Number(lectureNo),
          testNumber: Number(testNumber),
        },
        {
          courseType: courseType || "bcs",
          subjectId,
          lectureNo: Number(lectureNo),
          chapterName,
          testNumber: Number(testNumber),
          title: title || `Test ${testNumber}`,
          questions: validQuestions,
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({ success: true, data: savedSet });
    }

    if (action === "DELETE_EXAM_SET") {
      await ExamSet.findByIdAndDelete(payload.id);
      return NextResponse.json({ success: true });
    }

    // 7a. Admin: নির্দিষ্ট তারিখের পরীক্ষা (উত্তরসহ) লোড করা — সাবমিশন ছাড়া
    if (action === "ADMIN_GET_CONTEST") {
      const c = await BiWeeklyContest.findOne({ contestId: payload.contestId }).lean();
      if (!c) return NextResponse.json({ success: true, data: null, submissionCount: 0 });
      const submissionCount = (c.submissions || []).length;
      delete c.submissions;
      return NextResponse.json({ success: true, data: c, submissionCount });
    }

    // 7b. Admin: জাতীয় ২০০-MCQ পরীক্ষা Publish / Update (তারিখ অনুযায়ী)
    if (action === "SAVE_BIWEEKLY_CONTEST") {
      const { examDate, title, examWindowText, questions, resetSubmissions, forceOpen } = payload;

      if (!isValidExamDateKey(examDate)) {
        return NextResponse.json(
          { success: false, error: "পরীক্ষার তারিখ ১০, ২০ অথবা মাসের শেষ দিন (সর্বোচ্চ ৩০) হতে হবে!" },
          { status: 400 }
        );
      }

      const validQuestions = (questions || [])
        .filter((q) => q.question && String(q.question).trim() !== "")
        .map((q) => {
          const qNo = Number(q.qNo);
          return {
            qNo,
            subject: SUBJECT_IDS.has(q.subject) ? q.subject : defaultSubjectForQNo(qNo),
            question: String(q.question).trim(),
            options: [0, 1, 2, 3].map((i) => String((q.options || [])[i] ?? "").trim()),
            correctAnswer: [0, 1, 2, 3].includes(Number(q.correctAnswer)) ? Number(q.correctAnswer) : 0,
            explanation: String(q.explanation || "").trim(),
          };
        })
        .filter((q) => Number.isInteger(q.qNo) && q.qNo >= 1 && q.qNo <= 200)
        .sort((a, b) => a.qNo - b.qNo);

      if (validQuestions.length === 0) {
        return NextResponse.json(
          { success: false, error: "কমপক্ষে ১টি প্রশ্ন পূরণ করে পরীক্ষাটি Publish করুন!" },
          { status: 400 }
        );
      }

      const update = {
        contestId: `bcs-${examDate}`,
        examDate,
        title: title || "বিসিএস স্ট্যান্ডার্ড অল সাবজেক্টস কম্বাইনড প্রিলিমিনারি পরীক্ষা (২০০ নম্বর)",
        examWindowText: examWindowText || "প্রতি ১০ দিনে ১টি জাতীয় মেধা যাচাই পরীক্ষা",
        forceOpen: !!forceOpen,
        isActive: true,
        questions: validQuestions,
      };
      if (resetSubmissions) update.submissions = [];

      const saved = await BiWeeklyContest.findOneAndUpdate({ contestId: update.contestId }, update, {
        upsert: true,
        new: true,
      });

      return NextResponse.json({
        success: true,
        data: { contestId: saved.contestId, examDate: saved.examDate, questionCount: saved.questions.length },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid Action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
