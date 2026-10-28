/**
 * ============================================================================
 * FILE: src/models/PlatformModels.js
 * PURPOSE: MongoDB Mongoose Schemas for BCS Path & Defense/Police Platform
 * NEW IN THIS UPDATE:
 *   - BiWeeklyContest: examDate (১০ দিন অন্তর), forceOpen (টেস্ট মোড),
 *     প্রতি প্রশ্নে subject, প্রতি সাবমিশনে subjectScores (বিষয়ভিত্তিক নম্বর)
 *   - ContestRegistration: নাম + ফোন + শিক্ষাপ্রতিষ্ঠান দিয়ে রেজিস্ট্রেশন
 *   - MediaAsset: এডিটরে যোগ করা ছবি (ছোট /api/media/ID লিংকে ব্যবহার হয়)
 * ============================================================================
 */
import mongoose from "mongoose";

/** LECTURE SCHEMA */
const LectureSchema = new mongoose.Schema(
  {
    courseType: { type: String, default: "bcs" },
    subjectId: { type: String, required: true },
    lectureNo: { type: Number, required: true },
    chapterName: { type: String, default: "" },
    title: { type: String, required: true },
    isFree: { type: Boolean, default: true },

    videoUrl: { type: String, default: "" },
    videoDuration: { type: String, default: "১৫ মিনিট" },

    lecturePdfUrl: { type: String, default: "" },
    mcqPdfUrl: { type: String, default: "" },
    writtenPdfUrl: { type: String, default: "" },

    mainContent: { type: String, default: "" },
    mnemonic: { type: String, default: "" },
    confusionBox: { type: String, default: "" },
    mcqTextContent: { type: String, default: "" },
    writtenTextContent: { type: String, default: "" },

    mcqTwoColumn: { type: Boolean, default: true },
    lectureTwoColumn: { type: Boolean, default: false },
    writtenTwoColumn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/** VOCABULARY STORY SCHEMA */
const VocabStorySchema = new mongoose.Schema(
  {
    storyNo: { type: Number, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    storyContent: { type: String, required: true },
    image1Url: { type: String, default: "" },
    image1Position: { type: String, default: "right" },
    image2Url: { type: String, default: "" },
    image2Position: { type: String, default: "left" },
    wordMeaningBox: { type: String, default: "" },
  },
  { timestamps: true }
);

/** QUESTION BANK DOCUMENT SCHEMA */
const QuestionBankDocSchema = new mongoose.Schema(
  {
    courseType: { type: String, default: "bcs" },
    subjectId: { type: String, required: true },
    bcsBatch: { type: String, default: "১০ম - ৪৬তম বিসিএস" },
    title: { type: String, required: true },
    pdfUrl: { type: String, default: "" },
    textContent: { type: String, default: "" },
    highlightBox: { type: String, default: "" },
    twoColumn: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/** CHAPTER EXAM TEST SET SCHEMA (Test 1 & Test 2) */
const ExamSetSchema = new mongoose.Schema(
  {
    courseType: { type: String, default: "bcs" },
    subjectId: { type: String, required: true },
    lectureNo: { type: Number, required: true },
    chapterName: { type: String, required: true },
    testNumber: { type: Number, required: true, enum: [1, 2] },
    title: { type: String, default: "" },
    questions: [
      {
        qNo: { type: Number, required: true },
        question: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: Number, default: 0 },
        explanation: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

/**
 * জাতীয় বিসিএস ২০০-MCQ পরীক্ষা (১০, ২০ ও মাসের শেষ তারিখে)
 * contestId = "bcs-YYYY-MM-DD"
 */
const BiWeeklyContestSchema = new mongoose.Schema(
  {
    contestId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    examWindowText: { type: String, default: "প্রতি ১০ দিনে ১টি জাতীয় মেধা যাচাই পরীক্ষা" },
    examDate: { type: String, default: "", index: true }, // "YYYY-MM-DD" (বাংলাদেশ সময়)
    forceOpen: { type: Boolean, default: false }, // টেস্ট মোড
    isActive: { type: Boolean, default: true },
    questions: [
      {
        qNo: { type: Number, required: true },
        subject: { type: String, default: "" }, // bangla | english | math | ...
        category: { type: String, default: "" }, // পুরনো ডাটার জন্য (legacy)
        question: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: Number, default: 0 },
        explanation: { type: String, default: "" },
      },
    ],
    submissions: [
      {
        studentKey: { type: String, required: true }, // রেজিস্ট্রেশন থেকে পাওয়া ইউনিক কী (পুনরায় পরীক্ষা ঠেকাতে)
        name: { type: String, required: true },
        institution: { type: String, default: "" },
        avatarUrl: { type: String, default: "" },
        totalScore: { type: Number, required: true },
        englishScore: { type: Number, default: 0 },
        mathScore: { type: Number, default: 0 },
        correctCount: { type: Number, default: 0 },
        wrongCount: { type: Number, default: 0 },
        negativePenalty: { type: Number, default: 0 },
        subjectScores: [
          {
            _id: false,
            subjectId: String,
            total: Number,
            correct: Number,
            wrong: Number,
            score: Number,
          },
        ],
        answersMap: { type: Object, default: {} },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

/** পরীক্ষার রেজিস্ট্রেশন (নাম + ফোন + শিক্ষাপ্রতিষ্ঠান) */
const ContestRegistrationSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    studentKey: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    institution: { type: String, required: true },
  },
  { timestamps: true }
);

/** STUDENT PROFILE SCHEMA */
const StudentProfileSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    targetBcs: { type: String, default: "লক্ষ্য: ৪৭তম BCS" },
    institution: { type: String, default: "" },
    hideProfile: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

/** এডিটরে আপলোড করা ছবি */
const MediaAssetSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    contentType: { type: String, required: true },
    size: { type: Number, default: 0 },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

const m = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

export const Lecture = m("Lecture", LectureSchema);
export const VocabStory = m("VocabStory", VocabStorySchema);
export const QuestionBankDoc = m("QuestionBankDoc", QuestionBankDocSchema);
export const ExamSet = m("ExamSet", ExamSetSchema);
export const BiWeeklyContest = m("BiWeeklyContest", BiWeeklyContestSchema);
export const ContestRegistration = m("ContestRegistration", ContestRegistrationSchema);
export const StudentProfile = m("StudentProfile", StudentProfileSchema);
export const MediaAsset = m("MediaAsset", MediaAssetSchema);
