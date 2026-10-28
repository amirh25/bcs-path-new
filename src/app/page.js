"use client";

/**
 * ============================================================================
 * FILE: src/app/page.js
 * PROJECT: BCS Path & Defense/Police Foundation — Complete Responsive Platform
 * HIGHLIGHTS IN THIS VERSION:
 * 1. Gateway Portal features:
 *    - Navy/Gold Hero Banner ("স্বাগতম! আপনার কোর্স সিলেক্ট করুন")
 *    - Live 10-Day 200-MCQ National Exam Card right on the Gateway
 *    - Modern Course Cards with Pill Badges (লেকচার, MCQ, মক টেস্ট) + Footer Banner
 * 2. Upgraded Dashboard, Mock Test (Ready vs "🔒 শিগগির আসছে"), and Question Bank
 *    cards with direct "PDF খুলুন" & "Text View" buttons.
 * 3. Mobile Sticky Bottom Navigation Bar (হোম, লেকচার, পরীক্ষা, প্রোফাইল).
 * 4. Admin Panel strictly hides 10-Day 200-MCQ Contest & Vocab Stories when
 *    "Course 02: Defense & Police" is selected.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen, CheckCircle2, Sparkles, Trash2, Clock, ShieldCheck,
  KeyRound, Camera, Building2, FileText, HelpCircle, PenTool,
  RotateCcw, Upload, ChevronRight, ArrowLeft, Maximize2, Minimize2,
  PanelLeftClose, PanelLeftOpen, CheckSquare, Edit3, PlayCircle,
  Shield, Award, LayoutGrid, Check, Columns, Type, Plus, Minus,
  Image as ImageIcon, Trophy, Calendar, UserCheck, FileSpreadsheet,
  AlertCircle, Filter, Lock, Home, User, Lightbulb, Star, Bell
} from "lucide-react";
import { initialSubjects } from "../data/bcsData";

/**
 * ============================================================================
 * BCS & DEFENSE SUBJECT CONFIGURATIONS
 * ============================================================================
 */
const EXTRA_GRAMMAR_SUBJECTS = [
  {
    id: "bangla_grammar",
    title: "বাংলা ব্যাকরণ",
    initial: "ব্য",
    bg: "bg-teal-100",
    text: "text-teal-900",
    preliMarks: 15,
    writtenMarks: 30,
    syllabusBreakdown: [
      { topic: "ধ্বনি, বর্ণ, সন্ধি, উপসর্গ ও প্রত্যয়", marks: 5, details: "বিসিএস প্রিলিমিনারি ও লিখিত ব্যাকরণের মূল ভিত্তি।" },
      { topic: "সমাস, কারক-বিভক্তি ও বাক্য প্রকরণ", marks: 5, details: "উদাহরণ ও শর্টকাট টেকনিকসহ বিস্তারিত আলোচনা।" },
      { topic: "বানান শুদ্ধিকরণ, প্রবাদ-প্রবচন ও পারিভাষিক শব্দ", marks: 5, details: "প্রিলিমিনারি ও লিখিত উভয় পরীক্ষার জন্য অপরিহার্য।" },
    ],
  },
  {
    id: "english_grammar",
    title: "English Grammar & Vocabulary",
    initial: "Gr",
    bg: "bg-violet-100",
    text: "text-violet-900",
    preliMarks: 20,
    writtenMarks: 100,
    syllabusBreakdown: [
      { topic: "Parts of Speech, Clauses, Phrases & Idioms", marks: 8, details: "BCS Preliminary & Written Grammar Rules." },
      { topic: "Right Form of Verbs, Prepositions & Voice/Narration", marks: 6, details: "High-yield grammar transformations and corrections." },
      { topic: "গল্পে গল্পে বিসিএস স্ট্যান্ডার্ড ভোকাবুলারি (Story Vocabulary)", marks: 6, details: "চিত্র ও গল্পের মাধ্যমে সিনোনিম, অ্যান্টোনিম ও ভোকাবুলারি আয়ত্ত।" },
    ],
  },
];

const FULL_BCS_SUBJECTS = [
  ...initialSubjects.slice(0, 2),
  ...EXTRA_GRAMMAR_SUBJECTS,
  ...initialSubjects.slice(2),
];

const DEFENSE_SUBJECTS = [
  {
    id: "def_math",
    title: "গণিত — বিষয়ভিত্তিক প্রস্তুতি",
    subtitle: "প্রশ্ন ব্যাংক ও সমাধান",
    initial: "গ",
    bg: "bg-purple-100",
    text: "text-purple-900",
    examMarks: 40,
    writtenMarks: 40,
    syllabusBreakdown: [
      { topic: "পাটিগণিত (সংখ্যার ধারণা, লসাগু-গসাগু, শতকরা, লাভ-ক্ষতি)", marks: 20, details: "সৈনিক ও পুলিশ কনস্টেবল লিখিত ও এমসিকিউ পরীক্ষার মূল ভিত্তি।" },
      { topic: "বীজগণিত (মান নির্ণয়, উৎপাদক, সরল সমীকরণ)", marks: 10, details: "সূত্রের প্রয়োগ ও দ্রুত সমাধানের শর্টকাট ট্রিকস।" },
      { topic: "জ্যামিতি ও পরিমিতি (ত্রিভুজ, বৃত্ত, ক্ষেত্রফল)", marks: 10, details: "মৌলিক জ্যামিতিক ধারণা ও কোণের পরিমাপ।" },
    ],
  },
  {
    id: "def_bangla",
    title: "বাংলা ব্যাকরণ ও রচনা",
    subtitle: "বিষয়ভিত্তিক MCQ ও লিখিত প্রশ্ন",
    initial: "বাং",
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    examMarks: 30,
    writtenMarks: 30,
    syllabusBreakdown: [
      { topic: "বাংলা ব্যাকরণ (সন্ধি, সমাস, কারক, বাগধারা)", marks: 15, details: "প্রতিরক্ষা ও পুলিশ নিয়োগে সর্বাধিক কমন ব্যাকরণ টপিক।" },
      { topic: "অনুচ্ছেদ, দরখাস্ত ও ভাবসম্প্রসারণ", marks: 15, details: "কনস্টেবল ও সৈনিক পদের লিখিত পরীক্ষার ফরম্যাট।" },
    ],
  },
  {
    id: "def_english",
    title: "ইংরেজি (English Foundation)",
    subtitle: "Grammar, vocabulary ও practice",
    initial: "ইং",
    bg: "bg-blue-100",
    text: "text-blue-900",
    examMarks: 30,
    writtenMarks: 30,
    syllabusBreakdown: [
      { topic: "Grammar (Parts of Speech, Tense, Preposition, Voice)", marks: 15, details: "বেসিক গ্রামার রুলস ও শূন্যস্থান পূরণ।" },
      { topic: "Vocabulary, Translation & Paragraph Writing", marks: 15, details: "বাংলা থেকে ইংরেজি অনুবাদ ও শর্ট প্যারাগ্রাফ।" },
    ],
  },
  {
    id: "def_gk",
    title: "সাধারণ জ্ঞান ও সশস্ত্র বাহিনী",
    subtitle: "বাংলাদেশ ও প্রতিরক্ষা বাহিনী পরিচিতি",
    initial: "সা",
    bg: "bg-amber-100",
    text: "text-amber-900",
    examMarks: 20,
    writtenMarks: 20,
    syllabusBreakdown: [
      { topic: "মুক্তিযুদ্ধ, বাংলাদেশের ইতিহাস ও ভৌগোলিক পরিচিতি", marks: 10, details: "বীরশ্রেষ্ঠ, সেক্টর ও সাম্প্রতিক বাংলাদেশ।" },
      { topic: "সেনা, নৌ, বিমান বাহিনী ও বাংলাদেশ পুলিশের র‍্যাংক", marks: 10, details: "ভাইভা ও লিখিত পরীক্ষার জন্য অপরিহার্য তথ্য।" },
    ],
  },
  {
    id: "def_iq",
    title: "আইকিউ ও মনস্তত্ত্ব (IQ & Viva)",
    subtitle: "ভার্বাল, নন-ভার্বাল আইকিউ ও ভাইভা",
    initial: "IQ",
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-900",
    examMarks: 20,
    writtenMarks: 0,
    syllabusBreakdown: [
      { topic: "ভার্বাল ও নন-ভার্বাল আইকিউ (সিরিজ, কোডিং)", marks: 10, details: "প্রতিরক্ষা বাহিনীর প্রাথমিক নির্বাচনী পরীক্ষার আইকিউ।" },
      { topic: "চূড়ান্ত ভাইভা ও মনস্তাত্ত্বিক প্রশ্নোত্তর", marks: 10, details: "বোর্ড ভাইভায় নিজেকে স্মার্টভাবে উপস্থাপনের কৌশল।" },
    ],
  },
  {
    id: "def_fitness",
    title: "শারীরিক যোগ্যতা ও মেডিকেল গাইড",
    subtitle: "মাঠ পরীক্ষা ও মেডিকেল চেকআপ গাইডলাইন",
    initial: "ফি",
    bg: "bg-rose-100",
    text: "text-rose-900",
    examMarks: 20,
    writtenMarks: 0,
    syllabusBreakdown: [
      { topic: "উচ্চতা, বুকের মাপ, দৌড়, পুশ-আপ ও লং জাম্প প্রস্তুতি", marks: 10, details: "মাঠ পরীক্ষায় ১০০% উত্তীর্ণ হওয়ার প্র্যাকটিক্যাল রুটিন।" },
      { topic: "চোখের দৃষ্টি, শ্রবণশক্তি ও প্রাথমিক মেডিকেল চেকআপ", marks: 10, details: "মেডিকেল টেস্টের পূর্বপ্রস্তুতি ও সতর্কতা।" },
    ],
  },
];

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */
function formatSecurePdfUrl(url) {
  if (!url) return "";
  if (url.startsWith("data:application/pdf")) {
    return `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
  }
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  return `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
}

function getYoutubeEmbedUrl(url) {
  if (!url) return "";
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  return url;
}

function renderRichTextWithShortImageTokens(htmlText, embeddedImages = {}) {
  if (!htmlText) return "";
  return htmlText.replace(/\{\{(IMG_\d+):(left|right|top|bottom)\}\}/g, (match, imgKey, align) => {
    const src = embeddedImages?.[imgKey];
    if (!src) return "";
    let styleStr =
      "max-width:260px;width:100%;border-radius:12px;border:2px solid #cbd5e1;margin:8px 0;";
    if (align === "left") {
      styleStr =
        "float:left;max-width:240px;width:45%;margin:4px 16px 10px 0;border-radius:12px;border:2px solid #cbd5e1;";
    } else if (align === "right") {
      styleStr =
        "float:right;max-width:240px;width:45%;margin:4px 0 10px 16px;border-radius:12px;border:2px solid #cbd5e1;";
    } else if (align === "top" || align === "bottom") {
      styleStr =
        "display:block;max-width:440px;width:100%;margin:14px auto;border-radius:14px;border:2px solid #cbd5e1;clear:both;";
    }
    return `<img src="${src}" alt="Visual Illustration" style="${styleStr}" />`;
  });
}

function getNext10DayExamTargetDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const thirdExamDay = daysInMonth < 30 ? daysInMonth : 30;

  const candidateDays = [10, 20, thirdExamDay];
  for (const d of candidateDays) {
    const target = new Date(year, month, d, 23, 59, 59);
    if (now < target) {
      return {
        targetDate: target,
        scheduleLabel: `চলমান মাসের ${d} তারিখের জাতীয় পরীক্ষা (১০, ২০ ও ${thirdExamDay} তারিখ)`,
      };
    }
  }
  const nextMonth10 = new Date(year, month + 1, 10, 23, 59, 59);
  return {
    targetDate: nextMonth10,
    scheduleLabel: `আগামী মাসের ১০ তারিখের জাতীয় পরীক্ষা (প্রতি মাসের ১০, ২০ ও শেষ তারিখ)`,
  };
}

function parseBulkQuestionsTextOrJson(rawText, maxSlots = 200) {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) {
        return arr.slice(0, maxSlots).map((item, idx) => ({
          qNo: Number(item.qNo || idx + 1),
          question: item.question || "",
          options:
            item.options?.length === 4
              ? item.options
              : [item.opt0 || "", item.opt1 || "", item.opt2 || "", item.opt3 || ""],
          correctAnswer: Number(item.correctAnswer || 0),
          explanation: item.explanation || "",
        }));
      }
    } catch (e) {}
  }

  const blocks = trimmed.split(/\n\s*\n/).filter((b) => b.trim().length > 5);
  const parsedList = [];

  blocks.forEach((block, idx) => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return;

    let questionText = lines[0].replace(/^(Q\d*[:.)]|প্রশ্ন\s*\d*[:.)]|\d+[.)])\s*/i, "").trim();
    let opts = ["", "", "", ""];
    let correctIdx = 0;
    let explanation = "";

    lines.slice(1).forEach((line) => {
      if (/^(A|ক|1)[.):\s]/i.test(line)) {
        opts[0] = line.replace(/^(A|ক|1)[.):\s]+/i, "").trim();
      } else if (/^(B|খ|2)[.):\s]/i.test(line)) {
        opts[1] = line.replace(/^(B|খ|2)[.):\s]+/i, "").trim();
      } else if (/^(C|গ|3)[.):\s]/i.test(line)) {
        opts[2] = line.replace(/^(C|গ|3)[.):\s]+/i, "").trim();
      } else if (/^(D|ঘ|4)[.):\s]/i.test(line)) {
        opts[3] = line.replace(/^(D|ঘ|4)[.):\s]+/i, "").trim();
      } else if (/^(Ans|Answer|সঠিক|উত্তর)[:\s]/i.test(line)) {
        const val = line.replace(/^(Ans|Answer|সঠিক|উত্তর)[:\s]+/i, "").trim().toUpperCase();
        if (val.startsWith("A") || val.startsWith("ক") || val === "0") correctIdx = 0;
        else if (val.startsWith("B") || val.startsWith("খ") || val === "1") correctIdx = 1;
        else if (val.startsWith("C") || val.startsWith("গ") || val === "2") correctIdx = 2;
        else if (val.startsWith("D") || val.startsWith("ঘ") || val === "3") correctIdx = 3;
      } else if (/^(Exp|Explanation|ব্যাখ্যা)[:\s]/i.test(line)) {
        explanation = line.replace(/^(Exp|Explanation|ব্যাখ্যা)[:\s]+/i, "").trim();
      }
    });

    if (questionText) {
      parsedList.push({
        qNo: idx + 1,
        question: questionText,
        options: opts,
        correctAnswer: correctIdx,
        explanation,
      });
    }
  });

  return parsedList.slice(0, maxSlots);
}

function createEmpty50QuestionsTemplate() {
  return Array.from({ length: 50 }, (_, idx) => ({
    qNo: idx + 1,
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  }));
}

function createEmpty200QuestionsTemplate() {
  const defaultBlockSubjects = [
    { id: "bangla", title: "বাংলা ভাষা ও সাহিত্য", cat: "general" },
    { id: "english", title: "ইংরেজি ভাষা ও সাহিত্য", cat: "english" },
    { id: "bangladesh", title: "বাংলাদেশ বিষয়াবলি", cat: "general" },
    { id: "international", title: "আন্তর্জাতিক বিষয়াবলি", cat: "general" },
    { id: "science", title: "সাধারণ বিজ্ঞান", cat: "general" },
    { id: "ict", title: "কম্পিউটার ও তথ্য প্রযুক্তি", cat: "general" },
    { id: "math", title: "গাণিতিক যুক্তি", cat: "math" },
    { id: "mental", title: "মানসিক দক্ষতা ও নৈতিকতা", cat: "general" },
  ];

  return Array.from({ length: 200 }, (_, idx) => {
    const qNo = idx + 1;
    const blockIdx = Math.min(7, Math.floor((qNo - 1) / 25));
    const subInfo = defaultBlockSubjects[blockIdx];
    return {
      qNo,
      subjectId: subInfo.id,
      subjectTitle: subInfo.title,
      category: subInfo.cat,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    };
  });
}

/**
 * ============================================================================
 * COMPONENT: RICH TEXT & SHORT-TOKEN IMAGE EDITOR (NO SCROLL JUMP)
 * ============================================================================
 */
function RichTextColorEditor({
  label,
  value,
  onChange,
  embeddedImages = {},
  onUpdateImages,
  placeholder,
  rows = 6,
}) {
  const textareaRef = useRef(null);
  const [fontSizePx, setFontSizePx] = useState(18);
  const [imgAlign, setImgAlign] = useState("right");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const applyFormattingWithoutScrollJump = (openTag, closeTag) => {
    const el = textareaRef.current;
    if (!el) return;
    const savedScrollTop = el.scrollTop;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.substring(start, end) || "এখানে লিখুন";
    const updated =
      value.substring(0, start) + openTag + selectedText + closeTag + value.substring(end);

    onChange(updated);

    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      el.scrollTop = savedScrollTop;
      el.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
    });
  };

  const handleFontSizeStep = (delta) => {
    const nextSize = Math.min(34, Math.max(13, fontSizePx + delta));
    setFontSizePx(nextSize);
    applyFormattingWithoutScrollJump(
      `<span style="font-size:${nextSize}px;line-height:1.6;font-weight:700;">`,
      `</span>`
    );
  };

  const handleAddShortTokenImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("⚠️ শুধুমাত্র ইমেজ ফাইল (JPG, PNG, WEBP) গ্রহণযোগ্য!");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      alert("⚠️ ছবির সাইজ ২.৫ মেগাবাইটের কম হতে হবে!");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const nextIndex = Object.keys(embeddedImages || {}).length + 1;
      const tokenKey = `IMG_${nextIndex}`;
      const tokenString = `\n{{${tokenKey}:${imgAlign}}}\n`;

      if (onUpdateImages) {
        onUpdateImages({ ...(embeddedImages || {}), [tokenKey]: reader.result });
      }

      const el = textareaRef.current;
      const savedScrollTop = el ? el.scrollTop : 0;
      const pos = el ? el.selectionStart : value.length;
      const nextText = value.substring(0, pos) + tokenString + value.substring(pos);
      onChange(nextText);

      if (el) {
        requestAnimationFrame(() => {
          el.focus({ preventScroll: true });
          el.scrollTop = savedScrollTop;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-2xs">
      <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-200 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-extrabold text-xs sm:text-sm text-slate-900">{label}</span>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              const file = e.dataTransfer?.files?.[0];
              if (file) handleAddShortTokenImage(file);
            }}
            className={`flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-dashed transition ${
              isDraggingOver ? "border-purple-600 bg-purple-100" : "border-purple-300 bg-white"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-purple-700" />
            <span className="text-[11px] font-extrabold text-slate-700">ইমেজ পজিশন:</span>
            <select
              value={imgAlign}
              onChange={(e) => setImgAlign(e.target.value)}
              className="text-xs font-extrabold text-purple-900 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200 outline-none"
            >
              <option value="right">ডানে (Side Right)</option>
              <option value="left">বামে (Side Left)</option>
              <option value="top">উপরে (Top)</option>
              <option value="bottom">নিচে (Bottom)</option>
            </select>

            <label className="px-3 py-1 bg-purple-700 text-white rounded-lg text-xs font-extrabold cursor-pointer hover:bg-purple-800 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> ইমেজ নিন বা Drag করুন
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAddShortTokenImage(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyFormattingWithoutScrollJump("<b>", "</b>")}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-black hover:bg-slate-200 cursor-pointer"
          >
            B (বোল্ড)
          </button>

          <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => handleFontSizeStep(-2)}
              className="px-2.5 py-1 hover:bg-slate-200 text-slate-900 font-black text-xs flex items-center gap-0.5 border-r border-slate-200 cursor-pointer"
            >
              <Type className="w-3.5 h-3.5" /> <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 text-[11px] font-extrabold text-blue-700 bg-blue-50/50">
              {fontSizePx}px
            </span>
            <button
              type="button"
              onClick={() => handleFontSizeStep(2)}
              className="px-2.5 py-1 hover:bg-slate-200 text-slate-900 font-black text-xs flex items-center gap-0.5 border-l border-slate-200 cursor-pointer"
            >
              <Type className="w-3.5 h-3.5" /> <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              applyFormattingWithoutScrollJump('<span style="color:#dc2626;font-weight:700;">', "</span>")
            }
            className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-extrabold cursor-pointer"
          >
            🔴 লাল টেক্সট
          </button>
          <button
            type="button"
            onClick={() =>
              applyFormattingWithoutScrollJump('<span style="color:#2563eb;font-weight:700;">', "</span>")
            }
            className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-extrabold cursor-pointer"
          >
            🔵 নীল টেক্সট
          </button>
          <button
            type="button"
            onClick={() =>
              applyFormattingWithoutScrollJump('<span style="color:#059669;font-weight:700;">', "</span>")
            }
            className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-extrabold cursor-pointer"
          >
            🟢 সবুজ টেক্সট
          </button>

          <button
            type="button"
            onClick={() =>
              applyFormattingWithoutScrollJump(
                '<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:10px 14px;border-radius:8px;margin:8px 0;color:#78350f;font-weight:600;clear:both;">',
                "</div>"
              )
            }
            className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-extrabold cursor-pointer"
          >
            🟨 হলুদ বক্স
          </button>
          <button
            type="button"
            onClick={() =>
              applyFormattingWithoutScrollJump(
                '<div style="background:#dcfce7;border-left:4px solid #10b981;padding:10px 14px;border-radius:8px;margin:8px 0;color:#064e3b;font-weight:600;clear:both;">',
                "</div>"
              )
            }
            className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-extrabold cursor-pointer"
          >
            🟩 সবুজ বক্স
          </button>
          <button
            type="button"
            onClick={() =>
              applyFormattingWithoutScrollJump(
                '<div style="background:#dbeafe;border-left:4px solid #3b82f6;padding:10px 14px;border-radius:8px;margin:8px 0;color:#1e3a8a;font-weight:600;clear:both;">',
                "</div>"
              )
            }
            className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-xs font-extrabold cursor-pointer"
          >
            🟦 নীল বক্স
          </button>
        </div>

        {Object.keys(embeddedImages || {}).length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-extrabold text-purple-800">যুক্তকৃত শর্ট-ট্যাগ ইমেজ:</span>
            {Object.entries(embeddedImages).map(([key, src]) => (
              <div
                key={key}
                className="inline-flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-purple-200 text-[11px] font-bold"
              >
                <img src={src} alt={key} className="w-6 h-6 rounded object-cover" />
                <span className="text-purple-900">{`{{${key}}}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const file = e.dataTransfer?.files?.[0];
          if (file && file.type.startsWith("image/")) {
            e.preventDefault();
            handleAddShortTokenImage(file);
          }
        }}
        placeholder={`${placeholder} (ইমেজ যুক্ত করলে {{IMG_1:right}} এরকম ছোট ট্যাগ বসবে)`}
        className="w-full p-3.5 text-sm text-slate-900 outline-none leading-relaxed font-medium"
      />
    </div>
  );
}

/**
 * ============================================================================
 * COMPONENT: MINI 2D EXECUTIVE AVATAR (FOR PROFILE & LEADERBOARD)
 * ============================================================================
 */
function MiniExecutive2DAvatar({ size = "w-14 h-14" }) {
  return (
    <div className={`${size} rounded-full bg-amber-300 border-2 border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center`}>
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

/**
 * ============================================================================
 * COMPONENT: GATEWAY STUDENT ILLUSTRATION (THUMBS UP & BOOK WITH "ব")
 * Matches the user's 4th reference image ("স্বাগতম! আপনার কোর্স সিলেক্ট করুন")
 * ============================================================================
 */
function GatewayWelcomeStudentIllustration() {
  return (
    <div className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto select-none">
      {/* Golden Yellow Semi-Circle Aura */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 shadow-xl" />
      <svg viewBox="0 0 260 260" className="relative z-10 w-full h-full">
        {/* Sparkle Rays */}
        <line x1="42" y1="95" x2="25" y2="85" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="38" y1="112" x2="20" y2="112" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="215" y1="78" x2="232" y2="66" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="222" y1="96" x2="238" y2="94" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />

        {/* Backpack Straps & White Shirt */}
        <path d="M68 250 C72 175, 102 160, 135 160 C168 160, 198 175, 202 250 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M84 166 L76 248" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
        <path d="M186 166 L194 248" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />

        {/* Collar & Navy Blue Tie */}
        <polygon points="112,158 135,178 118,188" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        <polygon points="158,158 135,178 152,188" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        <polygon points="130,174 140,174 144,232 135,242 126,232" fill="#1e3a8a" />

        {/* Neck & Face */}
        <rect x="124" y="135" width="22" height="26" rx="8" fill="#fdba74" />
        <ellipse cx="135" cy="106" rx="32" ry="36" fill="#fed7aa" />
        <circle cx="103" cy="108" r="6" fill="#fdba74" />
        <circle cx="167" cy="108" r="6" fill="#fdba74" />

        {/* Styled Dark Navy Hair */}
        <path d="M101 98 C98 62, 130 52, 156 60 C174 65, 176 86, 168 100 C162 82, 146 78, 128 80 C112 82, 106 90, 101 98 Z" fill="#0f172a" />

        {/* Confident Smile & Eyes */}
        <ellipse cx="123" cy="106" rx="3.2" ry="3.8" fill="#0f172a" />
        <ellipse cx="147" cy="106" rx="3.2" ry="3.8" fill="#0f172a" />
        <path d="M116 96 Q123 92 130 96" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M140 96 Q147 92 154 96" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M126 124 Q135 131 145 124" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Thumbs Up Hand (Left) */}
        <rect x="52" y="160" width="13" height="24" rx="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
        <rect x="48" y="176" width="26" height="28" rx="8" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />

        {/* Navy Book with Golden "ব" (Right) */}
        <g transform="rotate(10 175 210)">
          <rect x="148" y="180" width="52" height="66" rx="5" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
          <rect x="152" y="184" width="44" height="58" rx="3" fill="#172554" />
          <text x="165" y="220" fill="#fbbf24" fontSize="24" fontWeight="900">ব</text>
        </g>
      </svg>
    </div>
  );
}

export default function BCSPathPlatform() {
  const studyResourceRef = useRef(null);
  const vocabReaderRef = useRef(null);
  const qbankReaderRef = useRef(null);

  const smoothScrollToRef = (refObj) => {
    setTimeout(() => {
      if (refObj?.current) {
        refObj.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  };

  // Navigation & Portal State
  const [activePortal, setActivePortal] = useState("gateway");
  const [selectedCourse, setSelectedCourse] = useState("bcs");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [navHistory, setNavHistory] = useState([]);

  const navigateTo = (tabName) => {
    if (tabName !== activeTab) {
      setNavHistory((prev) => [...prev, activeTab]);
      setActiveTab(tabName);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoBack = () => {
    if (navHistory.length > 0) {
      const prevTab = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));
      setActiveTab(prevTab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (activeTab !== "dashboard") {
      setActiveTab("dashboard");
    } else {
      setActivePortal("gateway");
    }
  };

  const enterCourseDashboard = (courseKey, targetTab = "dashboard") => {
    setSelectedCourse(courseKey);
    setActivePortal("course_app");
    setActiveTab(targetTab);
    setNavHistory([]);
    const defaultSub = courseKey === "bcs" ? "bangla" : "def_math";
    setActiveSubjectId(defaultSub);
    setMockFilterSubject(defaultSub);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Core Database Collections
  const [bcsSubjects] = useState(FULL_BCS_SUBJECTS);
  const [defenseSubjects] = useState(DEFENSE_SUBJECTS);
  const currentCourseSubjects = selectedCourse === "bcs" ? bcsSubjects : defenseSubjects;

  const [lectures, setLectures] = useState([]);
  const [vocabStories, setVocabStories] = useState([]);
  const [qbankDocs, setQbankDocs] = useState([]);
  const [examSets, setExamSets] = useState([]);
  const [contests, setContests] = useState([]);
  const [studentsCount, setStudentsCount] = useState(1);
  const [dbLoading, setDbLoading] = useState(true);

  const [progressMap, setProgressMap] = useState({});
  const [completedQuizzesCount, setCompletedQuizzesCount] = useState(0);

  // Student Profile State
  const fileInputRef = useRef(null);
  const [studentUniqueKey, setStudentUniqueKey] = useState("student_default");
  const [profile, setProfile] = useState({
    name: "Hamza",
    phone: "",
    targetBcs: "লক্ষ্য: ৪৭তম BCS",
    institution: "Metropolitan University, Sylhet",
    hideProfile: false,
    avatarUrl: "",
  });
  const [isEditingPortalName, setIsEditingPortalName] = useState(false);
  const [tempPortalName, setTempPortalName] = useState("Hamza");
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);

  // Lecture & Story Vocabulary State
  const [activeSubjectId, setActiveSubjectId] = useState("bangla");
  const [activeLecture, setActiveLecture] = useState(null);
  const [activePdfStep, setActivePdfStep] = useState("lecture");
  const [activeVocabStory, setActiveVocabStory] = useState(null);
  const [contentViewMode, setContentViewMode] = useState("pdf");
  const [studentTwoColumnOverride, setStudentTwoColumnOverride] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);

  // Question Bank State
  const [selectedQbSubject, setSelectedQbSubject] = useState("ALL");
  const [activeQbankDoc, setActiveQbankDoc] = useState(null);
  const [qbankViewMode, setQbankViewMode] = useState("pdf");
  const [qbankTwoCol, setQbankTwoCol] = useState(true);

  // Chapter Test 1 & Test 2 State
  const [mockFilterSubject, setMockFilterSubject] = useState("def_math");
  const [mockFilterLectureNo, setMockFilterLectureNo] = useState("ALL");
  const [activeExamSet, setActiveExamSet] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examTitle, setExamTitle] = useState("");
  const [examAnswers, setExamAnswers] = useState({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // 10-Day National BCS 200-MCQ Exam State
  const [countdownParts, setCountdownParts] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    label: "",
  });
  const [showContestRegModal, setShowContestRegModal] = useState(false);
  const [contestRegForm, setContestRegForm] = useState({
    name: "",
    phone: "",
    institution: "",
  });
  const [isRegisteredForContest, setIsRegisteredForContest] = useState(false);
  const [isContestRoomActive, setIsContestRoomActive] = useState(false);
  const [contestAnswers, setContestAnswers] = useState({});
  const [contestTimeLeft, setContestTimeLeft] = useState(0);
  const [contestSubmitting, setContestSubmitting] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const { targetDate, scheduleLabel } = getNext10DayExamTargetDate();
      const diffMs = Math.max(0, targetDate.getTime() - Date.now());
      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      setCountdownParts({ days, hours, minutes, seconds, label: scheduleLabel });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Admin CMS State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [adminCourseTrack, setAdminCourseTrack] = useState("bcs");
  const [adminSection, setAdminSection] = useState("lectures");
  const [adminLectureFilterSubject, setAdminLectureFilterSubject] = useState("ALL");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    courseType: "bcs",
    subjectId: "bangla",
    lectureNo: 1,
    chapterName: "",
    title: "",
    videoUrl: "",
    videoDuration: "১৫ মিনিট",
    lecturePdfUrl: "",
    mcqPdfUrl: "",
    writtenPdfUrl: "",
    mainContent: "",
    mnemonic: "",
    confusionBox: "",
    mcqTextContent: "",
    writtenTextContent: "",
    embeddedImages: {},
    mcqTwoColumn: true,
    lectureTwoColumn: false,
    writtenTwoColumn: false,
  });

  const [vocabFormData, setVocabFormData] = useState({
    storyNo: 1,
    title: "",
    subtitle: "",
    storyContent: "",
    image1Url: "",
    image1Position: "right",
    image2Url: "",
    image2Position: "left",
    wordMeaningBox: "",
    embeddedImages: {},
  });
  const [editingVocabId, setEditingVocabId] = useState(null);

  const [qbFormData, setQbFormData] = useState({
    courseType: "bcs",
    subjectId: "bangla",
    bcsBatch: "১০ম - ৪৬তম বিসিএস",
    title: "",
    pdfUrl: "",
    textContent: "",
    highlightBox: "",
    twoColumn: true,
    embeddedImages: {},
  });
  const [editingQbId, setEditingQbId] = useState(null);

  const [examBuilderMeta, setExamBuilderMeta] = useState({
    courseType: "bcs",
    subjectId: "bangla",
    lectureNo: 1,
    chapterName: "Lecture 01",
    testNumber: 1,
  });
  const [template50Questions, setTemplate50Questions] = useState(() =>
    createEmpty50QuestionsTemplate()
  );
  const [activeSlotRange, setActiveSlotRange] = useState("1-10");
  const [bulk50TextInput, setBulk50TextInput] = useState("");

  const [contestBuilderMeta, setContestBuilderMeta] = useState({
    contestId: "bcs-biweekly-main",
    title: "৪৭তম বিসিএস স্ট্যান্ডার্ড অল সাবজেক্টস কম্বাইনড পরীক্ষা (২০০ এমসিকিউ)",
    examWindowText: "প্রতি ১০ দিনে ১টি জাতীয় মেধা যাচাই পরীক্ষা (১০, ২০ ও মাসের শেষ তারিখ) · পাস মার্ক ৬০%",
    resetSubmissions: false,
  });
  const [template200Questions, setTemplate200Questions] = useState(() =>
    createEmpty200QuestionsTemplate()
  );
  const [active200Range, setActive200Range] = useState("1-25");
  const [bulk200TextInput, setBulk200TextInput] = useState("");

  // Fetch Cloud Data
  const fetchCloudData = async () => {
    setDbLoading(true);
    try {
      const res = await fetch("/api/platform");
      const data = await res.json();
      if (data.success) {
        setLectures(data.lectures || []);
        setVocabStories(data.vocabStories || []);
        if (data.vocabStories?.length > 0 && !activeVocabStory) {
          setActiveVocabStory(data.vocabStories[0]);
        }
        setQbankDocs(data.qbankDocs || []);
        setExamSets(data.examSets || []);
        setContests(data.contests || []);
        setStudentsCount(data.studentsCount || 1);

        if (data.contests?.length > 0) {
          const activeC = data.contests[0];
          setContestBuilderMeta((prev) => ({
            ...prev,
            contestId: activeC.contestId,
            title: activeC.title,
            examWindowText: activeC.examWindowText,
          }));
          const merged200 = createEmpty200QuestionsTemplate().map((slot) => {
            const found = activeC.questions?.find((q) => Number(q.qNo) === slot.qNo);
            return found
              ? {
                  qNo: slot.qNo,
                  subjectId: found.subjectId || slot.subjectId,
                  subjectTitle: found.subjectTitle || slot.subjectTitle,
                  category: found.category || slot.category,
                  question: found.question || "",
                  options: found.options?.length === 4 ? [...found.options] : ["", "", "", ""],
                  correctAnswer: Number(found.correctAnswer || 0),
                  explanation: found.explanation || "",
                }
              : slot;
          });
          setTemplate200Questions(merged200);
        }
      }
    } catch (err) {
      console.error("Database fetch error:", err);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudData();
    let uKey = localStorage.getItem("bcs_student_unique_key");
    if (!uKey) {
      uKey = "stu_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
      localStorage.setItem("bcs_student_unique_key", uKey);
    }
    setStudentUniqueKey(uKey);

    const savedProf = localStorage.getItem("bcs_student_profile");
    if (savedProf) {
      try {
        const parsed = JSON.parse(savedProf);
        setProfile(parsed);
        setTempPortalName(parsed.name || "Hamza");
        setContestRegForm({
          name: parsed.name || "",
          phone: parsed.phone || "",
          institution: parsed.institution || "",
        });
      } catch (e) {}
    }

    const savedReg = localStorage.getItem("bcs_10day_contest_registered");
    if (savedReg === "true") setIsRegisteredForContest(true);

    const savedProg = localStorage.getItem("bcs_lecture_progress_v2");
    if (savedProg) {
      try { setProgressMap(JSON.parse(savedProg)); } catch (e) {}
    }
    const savedQuizzes = localStorage.getItem("bcs_completed_quizzes_count");
    if (savedQuizzes) setCompletedQuizzesCount(Number(savedQuizzes) || 0);
  }, []);

  const courseFilteredQbankDocs = qbankDocs.filter(
    (d) =>
      (d.courseType || "bcs") === selectedCourse &&
      (selectedQbSubject === "ALL" || d.subjectId === selectedQbSubject)
  );

  useEffect(() => {
    if (courseFilteredQbankDocs.length > 0) {
      const exists = courseFilteredQbankDocs.some(
        (d) => (d._id || d.id) === (activeQbankDoc?._id || activeQbankDoc?.id)
      );
      if (!exists) setActiveQbankDoc(courseFilteredQbankDocs[0]);
    } else {
      setActiveQbankDoc(null);
    }
  }, [qbankDocs, selectedCourse, selectedQbSubject]);

  useEffect(() => {
    const existingSet = examSets.find(
      (s) =>
        (s.courseType || "bcs") === examBuilderMeta.courseType &&
        s.subjectId === examBuilderMeta.subjectId &&
        Number(s.lectureNo) === Number(examBuilderMeta.lectureNo) &&
        Number(s.testNumber) === Number(examBuilderMeta.testNumber)
    );

    if (existingSet) {
      const merged50 = createEmpty50QuestionsTemplate().map((emptySlot) => {
        const found = existingSet.questions?.find((q) => Number(q.qNo) === emptySlot.qNo);
        return found
          ? {
              qNo: emptySlot.qNo,
              question: found.question || "",
              options: found.options?.length === 4 ? [...found.options] : ["", "", "", ""],
              correctAnswer: Number(found.correctAnswer || 0),
              explanation: found.explanation || "",
            }
          : emptySlot;
      });
      setTemplate50Questions(merged50);
      setExamBuilderMeta((prev) => ({
        ...prev,
        chapterName: existingSet.chapterName || prev.chapterName,
      }));
    } else {
      const matchedLec = lectures.find(
        (l) =>
          (l.courseType || "bcs") === examBuilderMeta.courseType &&
          l.subjectId === examBuilderMeta.subjectId &&
          Number(l.lectureNo) === Number(examBuilderMeta.lectureNo)
      );
      setTemplate50Questions(createEmpty50QuestionsTemplate());
      if (matchedLec) {
        setExamBuilderMeta((prev) => ({ ...prev, chapterName: matchedLec.title }));
      }
    }
  }, [
    examBuilderMeta.courseType,
    examBuilderMeta.subjectId,
    examBuilderMeta.lectureNo,
    examBuilderMeta.testNumber,
    examSets,
  ]);

  /**
   * IMPORTANT FIX (Requirement 4):
   * When Admin switches to "defense" (Course 02), strictly hide & exit "biweekly_200"
   * and "vocab_stories" because those are exclusively for BCS Preparation!
   */
  const handleAdminCourseSwitch = (track) => {
    setAdminCourseTrack(track);
    const defaultSub = track === "bcs" ? "bangla" : "def_math";
    setFormData((prev) => ({ ...prev, courseType: track, subjectId: defaultSub }));
    setQbFormData((prev) => ({ ...prev, courseType: track, subjectId: defaultSub }));
    setExamBuilderMeta((prev) => ({
      ...prev,
      courseType: track,
      subjectId: defaultSub,
      lectureNo: 1,
      chapterName: "Lecture 01",
    }));
    if (track === "defense" && (adminSection === "biweekly_200" || adminSection === "vocab_stories")) {
      setAdminSection("lectures");
    }
  };

  const completeAndGoToNextLecture = (lec, subjectLecs) => {
    const lecId = lec._id || lec.id;
    setProgressMap((prev) => {
      const nextMap = {
        ...prev,
        [lecId]: { ...(prev[lecId] || {}), completed: true },
      };
      localStorage.setItem("bcs_lecture_progress_v2", JSON.stringify(nextMap));
      return nextMap;
    });

    const currentIndex = subjectLecs.findIndex((l) => (l._id || l.id) === lecId);
    if (currentIndex !== -1 && currentIndex + 1 < subjectLecs.length) {
      const nextLec = subjectLecs[currentIndex + 1];
      setActiveLecture(nextLec);
      setActivePdfStep(selectedCourse === "defense" ? "video" : "lecture");
      smoothScrollToRef(studyResourceRef);
    } else {
      alert(`🎉 অভিনন্দন! আপনি এই বিষয়ের লেকচার ${lec.lectureNo} সম্পন্ন করেছেন!`);
    }
  };

  const courseFilteredLectures = lectures.filter(
    (l) => (l.courseType || "bcs") === selectedCourse
  );

  const getSubjectDynamicStats = (subId) => {
    const subLecs = courseFilteredLectures.filter((l) => l.subjectId === subId);
    const totalCount = subLecs.length;
    const completedCount = subLecs.filter((l) => progressMap[l._id || l.id]?.completed).length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return { totalCount, completedCount, percent };
  };

  const totalUploadedLectures = courseFilteredLectures.length;
  const totalCompletedLectures = courseFilteredLectures.filter(
    (l) => progressMap[l._id || l.id]?.completed
  ).length;
  const overallProgressPercent =
    totalUploadedLectures > 0 ? Math.round((totalCompletedLectures / totalUploadedLectures) * 100) : 0;

  const updateProfile = async (updatedFields) => {
    const newProf = { ...profile, ...updatedFields };
    setProfile(newProf);
    setTempPortalName(newProf.name);
    localStorage.setItem("bcs_student_profile", JSON.stringify(newProf));
    try {
      await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_PROFILE",
          payload: { ...newProf, phone: newProf.phone || studentUniqueKey },
        }),
      });
    } catch (e) {}
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ ছবির সাইজ সর্বোচ্চ ২ মেগাবাইট (2MB) হতে পারবে!");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateProfile({ avatarUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const handleAdminPdfFileSelect = (e, fieldName, isQbank = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4.5 * 1024 * 1024) {
      alert("⚠️ ৪.৫ মেগাবাইটের চেয়ে বড় PDF হলে Google Drive-এ আপলোড করে লিংকটি পেস্ট করুন!");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (isQbank) setQbFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
      else setFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleVocabStoryImageUpload = (e, imgField) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert("⚠️ স্টোরি ইমেজের সাইজ সর্বোচ্চ ২.৫ মেগাবাইট হতে পারবে!");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setVocabFormData((prev) => ({ ...prev, [imgField]: reader.result }));
    reader.readAsDataURL(file);
  };

  const launchSpecificExamSet = (examSetDoc) => {
    if (!examSetDoc || !examSetDoc.questions || examSetDoc.questions.length === 0) {
      alert("⚠️ এই টেস্টে এখনো কোনো প্রশ্ন সেট করা হয়নি!");
      return;
    }
    setActiveExamSet(examSetDoc);
    setExamQuestions(examSetDoc.questions);
    setExamTitle(
      `${examSetDoc.chapterName} — Test ${examSetDoc.testNumber} (${examSetDoc.questions.length}টি প্রশ্ন)`
    );
    setExamAnswers({});
    setExamSubmitted(false);
    setTimeLeft(examSetDoc.questions.length * 36);
    navigateTo("active_exam_room");
  };

  const handleFinishExam = () => {
    setExamSubmitted(true);
    const nextCount = completedQuizzesCount + 1;
    setCompletedQuizzesCount(nextCount);
    localStorage.setItem("bcs_completed_quizzes_count", String(nextCount));
  };

  useEffect(() => {
    if (activeTab !== "active_exam_room" || examSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, examSubmitted]);

  const calculateExamResult = () => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const totalQ = examQuestions.length;

    examQuestions.forEach((q, idx) => {
      const qKey = q._id || q.qNo || idx;
      if (examAnswers[qKey] === undefined) unanswered += 1;
      else if (Number(examAnswers[qKey]) === Number(q.correctAnswer)) correct += 1;
      else wrong += 1;
    });

    const negativePenalty = wrong * 0.5;
    const finalScore = Math.max(0, correct - negativePenalty);
    const passMarkRequired = +(totalQ * 0.6).toFixed(2);
    const scorePercentage = totalQ > 0 ? Math.round((finalScore / totalQ) * 100) : 0;
    const isPassed = finalScore >= passMarkRequired;

    return {
      totalQ,
      correct,
      wrong,
      unanswered,
      negativePenalty,
      finalScore,
      passMarkRequired,
      scorePercentage,
      isPassed,
    };
  };

  /**
   * ==========================================================================
   * 10-DAY NATIONAL 200-MCQ COMBINED BCS EXAM & REGISTRATION HANDLERS
   * ==========================================================================
   */
  const currentActiveContest = contests[0] || null;
  const myContestSubmission = currentActiveContest?.submissions?.find(
    (sub) =>
      sub.studentKey === studentUniqueKey ||
      (profile.phone && sub.phone === profile.phone)
  );

  const sortedLeaderboard = currentActiveContest?.submissions
    ? [...currentActiveContest.submissions].sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if ((b.englishScore || 0) !== (a.englishScore || 0))
          return (b.englishScore || 0) - (a.englishScore || 0);
        if ((b.mathScore || 0) !== (a.mathScore || 0))
          return (b.mathScore || 0) - (a.mathScore || 0);
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      })
    : [];

  const myLeaderboardRank = myContestSubmission
    ? sortedLeaderboard.findIndex((s) => s.studentKey === myContestSubmission.studentKey) + 1
    : null;

  const handleContestRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!contestRegForm.name.trim() || !contestRegForm.phone.trim() || !contestRegForm.institution.trim()) {
      alert("⚠️ পরীক্ষায় অংশগ্রহণের জন্য আপনার নাম, মোবাইল নম্বর এবং শিক্ষাপ্রতিষ্ঠানের নাম পূরণ করুন!");
      return;
    }

    updateProfile({
      name: contestRegForm.name.trim(),
      phone: contestRegForm.phone.trim(),
      institution: contestRegForm.institution.trim(),
    });

    try {
      await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REGISTER_CONTEST_EXAM",
          payload: {
            contestId: currentActiveContest?.contestId || "bcs-biweekly-main",
            studentKey: studentUniqueKey,
            phone: contestRegForm.phone.trim(),
            name: contestRegForm.name.trim(),
            institution: contestRegForm.institution.trim(),
          },
        }),
      });
    } catch (err) {}

    localStorage.setItem("bcs_10day_contest_registered", "true");
    setIsRegisteredForContest(true);
    setShowContestRegModal(false);

    // Ensure we are inside the BCS Course App on the 10-day contest tab
    setSelectedCourse("bcs");
    setActivePortal("course_app");
    setActiveTab("biweekly_contest");

    if (currentActiveContest && currentActiveContest.questions?.length > 0 && !myContestSubmission) {
      setContestAnswers({});
      setContestTimeLeft(currentActiveContest.questions.length * 36);
      setIsContestRoomActive(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (!currentActiveContest?.questions?.length) {
      alert("✅ আপনার রেজিস্ট্রেশন সম্পন্ন হয়েছে! অ্যাডমিন প্রশ্ন পাবলিশ করলেই পরীক্ষা শুরু হবে।");
    }
  };

  const handleOpenOrStart10DayContest = () => {
    setSelectedCourse("bcs");
    setActivePortal("course_app");
    setActiveTab("biweekly_contest");

    if (myContestSubmission) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!isRegisteredForContest || !profile.phone) {
      setContestRegForm({
        name: profile.name || "",
        phone: profile.phone || "",
        institution: profile.institution || "",
      });
      setShowContestRegModal(true);
      return;
    }
    if (!currentActiveContest || !currentActiveContest.questions?.length) {
      alert("⚠️ অ্যাডমিন প্যানেল থেকে এখনো এই পর্বের ২০০টি প্রশ্ন প্রকাশ করা হয়নি!");
      return;
    }
    setContestAnswers({});
    setContestTimeLeft(currentActiveContest.questions.length * 36);
    setIsContestRoomActive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitBiWeeklyContestExam = async () => {
    if (!currentActiveContest || contestSubmitting) return;
    setContestSubmitting(true);

    let correct = 0;
    let wrong = 0;
    let engScore = 0;
    let mathScore = 0;
    const subMap = {};

    currentActiveContest.questions.forEach((q, idx) => {
      const qKey = q.qNo || idx + 1;
      const ans = contestAnswers[qKey];
      const subId = q.subjectId || "general";
      const subTitle =
        q.subjectTitle ||
        bcsSubjects.find((s) => s.id === subId)?.title ||
        "সাধারণ বিষয়";

      if (!subMap[subId]) {
        subMap[subId] = {
          subjectId: subId,
          subjectTitle: subTitle,
          total: 0,
          correct: 0,
          wrong: 0,
          marks: 0,
        };
      }
      subMap[subId].total += 1;

      const isEng =
        q.category === "english" ||
        subId === "english" ||
        subId === "english_grammar";
      const isMath = q.category === "math" || subId === "math";

      if (ans !== undefined) {
        if (Number(ans) === Number(q.correctAnswer)) {
          correct += 1;
          subMap[subId].correct += 1;
          subMap[subId].marks += 1;
          if (isEng) engScore += 1;
          if (isMath) mathScore += 1;
        } else {
          wrong += 1;
          subMap[subId].wrong += 1;
          subMap[subId].marks -= 0.5;
          if (isEng) engScore -= 0.5;
          if (isMath) mathScore -= 0.5;
        }
      }
    });

    const subjectBreakdown = Object.values(subMap).map((s) => ({
      ...s,
      marks: +Math.max(0, s.marks).toFixed(2),
    }));

    const weakSubjects = subjectBreakdown
      .filter((s) => s.wrong > 0 && (s.marks / s.total < 0.5 || s.wrong >= 2))
      .map((s) => `${s.subjectTitle} (ভুল: ${s.wrong}টি)`);

    const negativePenalty = wrong * 0.5;
    const totalScore = Math.max(0, +(correct - negativePenalty).toFixed(2));

    const submissionPayload = {
      studentKey: studentUniqueKey,
      phone: profile.phone || contestRegForm.phone || "",
      name: profile.name || "বিসিএস পরীক্ষার্থী",
      institution: profile.hideProfile ? "" : profile.institution || "স্বতন্ত্র পরীক্ষার্থী",
      avatarUrl: profile.avatarUrl || "",
      totalScore,
      englishScore: +engScore.toFixed(2),
      mathScore: +mathScore.toFixed(2),
      correctCount: correct,
      wrongCount: wrong,
      negativePenalty,
      subjectBreakdown,
      weakSubjects,
      answersMap: contestAnswers,
    };

    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_CONTEST_EXAM",
          payload: {
            contestId: currentActiveContest.contestId,
            submission: submissionPayload,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsContestRoomActive(false);
        await fetchCloudData();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(data.error);
        setIsContestRoomActive(false);
      }
    } catch (e) {
      alert("সাবমিট করতে সমস্যা হয়েছে!");
    } finally {
      setContestSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isContestRoomActive) return;
    const timer = setInterval(() => {
      setContestTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitBiWeeklyContestExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isContestRoomActive, contestAnswers]);

  /**
   * ==========================================================================
   * ADMIN CRUD HANDLERS
   * ==========================================================================
   */
  const handleSaveLecture = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.lectureNo) {
      alert("অনুগ্রহ করে লেকচার নম্বর এবং শিরোনাম দিন!");
      return;
    }
    const payload = {
      ...(editingId ? { _id: editingId } : {}),
      ...formData,
      courseType: adminCourseTrack,
      lectureNo: Number(formData.lectureNo),
      isFree: true,
    };
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SAVE_LECTURE", adminPin: adminPinInput, payload }),
    });
    const data = await res.json();
    if (data.success) {
      alert(editingId ? "✅ লেকচার সফলভাবে আপডেট হয়েছে!" : "🎉 নতুন লেকচার পাবলিশ হয়েছে!");
      setEditingId(null);
      setFormData((prev) => ({
        ...prev,
        lectureNo: Number(prev.lectureNo) + 1,
        title: "",
        videoUrl: "",
        lecturePdfUrl: "",
        mcqPdfUrl: "",
        writtenPdfUrl: "",
        mainContent: "",
        mnemonic: "",
        confusionBox: "",
        mcqTextContent: "",
        writtenTextContent: "",
        embeddedImages: {},
      }));
      fetchCloudData();
    } else {
      alert(data.error);
    }
  };

  const handleDeleteLecture = async (id) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই লেকচারটি ডিলিট করতে চান?")) return;
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_LECTURE", adminPin: adminPinInput, payload: { id } }),
    });
    const data = await res.json();
    if (data.success) fetchCloudData();
  };

  const handleSaveVocabStory = async (e) => {
    e.preventDefault();
    if (!vocabFormData.title || !vocabFormData.storyContent) {
      alert("অনুগ্রহ করে স্টোরির শিরোনাম এবং গল্পের টেক্সট লিখুন!");
      return;
    }
    const payload = {
      ...(editingVocabId ? { _id: editingVocabId } : {}),
      ...vocabFormData,
      storyNo: Number(vocabFormData.storyNo || 1),
    };
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SAVE_VOCAB_STORY", adminPin: adminPinInput, payload }),
    });
    const data = await res.json();
    if (data.success) {
      alert(editingVocabId ? "✅ ভোকাবুলারি স্টোরি আপডেট হয়েছে!" : "🎉 নতুন ভোকাবুলারি স্টোরি পাবলিশ হয়েছে!");
      setEditingVocabId(null);
      setVocabFormData((prev) => ({
        storyNo: Number(prev.storyNo) + 1,
        title: "",
        subtitle: "",
        storyContent: "",
        image1Url: "",
        image1Position: "right",
        image2Url: "",
        image2Position: "left",
        wordMeaningBox: "",
        embeddedImages: {},
      }));
      fetchCloudData();
    } else {
      alert(data.error);
    }
  };

  const handleDeleteVocabStory = async (id) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ভোকাবুলারি স্টোরিটি ডিলিট করতে চান?")) return;
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_VOCAB_STORY", adminPin: adminPinInput, payload: { id } }),
    });
    const data = await res.json();
    if (data.success) fetchCloudData();
  };

  const handleSaveQbankDoc = async (e) => {
    e.preventDefault();
    if (!qbFormData.title) {
      alert("অনুগ্রহ করে প্রশ্নব্যাংকের শিরোনাম দিন!");
      return;
    }
    const payload = {
      ...(editingQbId ? { _id: editingQbId } : {}),
      ...qbFormData,
      courseType: adminCourseTrack,
    };
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SAVE_QBANK_DOC", adminPin: adminPinInput, payload }),
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ প্রশ্নব্যাংক পাবলিশ হয়েছে!");
      setEditingQbId(null);
      setQbFormData((prev) => ({ ...prev, title: "", pdfUrl: "", textContent: "", highlightBox: "", embeddedImages: {} }));
      fetchCloudData();
    } else {
      alert(data.error);
    }
  };

  const handleDeleteQbankDoc = async (id) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই প্রশ্নব্যাংকটি ডিলিট করতে চান?")) return;
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_QBANK_DOC", adminPin: adminPinInput, payload: { id } }),
    });
    const data = await res.json();
    if (data.success) fetchCloudData();
  };

  const updateTemplateSlot = (slotNumber, field, value, optIdx = null) => {
    setTemplate50Questions((prev) =>
      prev.map((item) => {
        if (item.qNo !== slotNumber) return item;
        if (optIdx !== null) {
          const updatedOpts = [...item.options];
          updatedOpts[optIdx] = value;
          return { ...item, options: updatedOpts };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleBulkFill50Slots = (rawString) => {
    const parsed = parseBulkQuestionsTextOrJson(rawString, 50);
    if (parsed.length === 0) {
      alert("⚠️ কোনো প্রশ্ন শনাক্ত করা যায়নি! নমুনা ফরম্যাট অনুযায়ী প্রশ্ন দিন।");
      return;
    }
    setTemplate50Questions((prev) =>
      prev.map((slot, idx) => {
        const match = parsed[idx];
        return match
          ? {
              qNo: slot.qNo,
              question: match.question,
              options: match.options,
              correctAnswer: match.correctAnswer,
              explanation: match.explanation,
            }
          : slot;
      })
    );
    setBulk50TextInput("");
    alert(`🎉 এক ক্লিকে ${parsed.length}টি প্রশ্ন স্বয়ংক্রিয়ভাবে ১ থেকে ${parsed.length} নম্বর ঘরে বসে গেছে!`);
  };

  const handlePublishExamSet = async (e) => {
    e.preventDefault();
    const filledCount = template50Questions.filter((q) => q.question.trim() !== "").length;
    if (filledCount === 0) {
      alert("⚠️ কমপক্ষে ১টি প্রশ্নের ঘর পূরণ করুন!");
      return;
    }
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SAVE_EXAM_SET",
        adminPin: adminPinInput,
        payload: {
          ...examBuilderMeta,
          courseType: adminCourseTrack,
          questions: template50Questions,
        },
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 Test ${examBuilderMeta.testNumber} (${filledCount}টি প্রশ্নসহ) প্রকাশিত হয়েছে!`);
      fetchCloudData();
    } else {
      alert(data.error);
    }
  };

  const update200TemplateSlot = (slotNumber, field, value, optIdx = null) => {
    setTemplate200Questions((prev) =>
      prev.map((item) => {
        if (item.qNo !== slotNumber) return item;
        if (optIdx !== null) {
          const updatedOpts = [...item.options];
          updatedOpts[optIdx] = value;
          return { ...item, options: updatedOpts };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const assignSubjectTo25Block = (rangeStr, newSubjectId) => {
    const [min, max] = rangeStr.split("-").map(Number);
    const subObj = bcsSubjects.find((s) => s.id === newSubjectId);
    const subTitle = subObj ? subObj.title : "সাধারণ বিষয়";
    const tieCat =
      newSubjectId === "english" || newSubjectId === "english_grammar"
        ? "english"
        : newSubjectId === "math"
        ? "math"
        : "general";

    setTemplate200Questions((prev) =>
      prev.map((item) =>
        item.qNo >= min && item.qNo <= max
          ? { ...item, subjectId: newSubjectId, subjectTitle: subTitle, category: tieCat }
          : item
      )
    );
  };

  const handleBulkFill200Slots = (rawString, fillMode = "ALL") => {
    const parsed = parseBulkQuestionsTextOrJson(rawString, 200);
    if (parsed.length === 0) {
      alert("⚠️ ফাইল বা টেক্সটে কোনো প্রশ্ন পাওয়া যায়নি!");
      return;
    }

    if (fillMode === "CURRENT_25_BLOCK") {
      const [min, max] = active200Range.split("-").map(Number);
      setTemplate200Questions((prev) =>
        prev.map((slot) => {
          if (slot.qNo < min || slot.qNo > max) return slot;
          const localIdx = slot.qNo - min;
          const match = parsed[localIdx];
          return match
            ? {
                ...slot,
                question: match.question,
                options: match.options,
                correctAnswer: match.correctAnswer,
                explanation: match.explanation,
              }
            : slot;
        })
      );
      alert(`🎉 "${active200Range}" ব্লকে ${Math.min(25, parsed.length)}টি প্রশ্ন স্বয়ংক্রিয়ভাবে বসে গেছে!`);
    } else {
      setTemplate200Questions((prev) =>
        prev.map((slot, idx) => {
          const match = parsed[idx];
          return match
            ? {
                ...slot,
                question: match.question,
                options: match.options,
                correctAnswer: match.correctAnswer,
                explanation: match.explanation,
              }
            : slot;
        })
      );
      alert(`🎉 এক ক্লিকে ১ থেকে ${parsed.length} নম্বর স্লটে সবগুলো প্রশ্ন বসে গেছে!`);
    }
    setBulk200TextInput("");
  };

  const handleBulkFileUploadForQuestions = (e, targetType = "200_ALL") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      if (targetType === "50_SET") handleBulkFill50Slots(text);
      else if (targetType === "200_BLOCK") handleBulkFill200Slots(text, "CURRENT_25_BLOCK");
      else handleBulkFill200Slots(text, "ALL");
    };
    reader.readAsText(file);
  };

  const handlePublish200Contest = async (e) => {
    e.preventDefault();
    const filledCount = template200Questions.filter((q) => q.question.trim() !== "").length;
    if (filledCount === 0) {
      alert("⚠️ কমপক্ষে ১টি প্রশ্ন পূরণ করে Publish করুন!");
      return;
    }
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SAVE_BIWEEKLY_CONTEST",
        adminPin: adminPinInput,
        payload: {
          ...contestBuilderMeta,
          questions: template200Questions,
        },
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 ১০ দিনের জাতীয় বিসিএস পরীক্ষা (${filledCount}টি প্রশ্নসহ) সফলভাবে প্রকাশিত হয়েছে!`);
      setContestBuilderMeta((prev) => ({ ...prev, resetSubmissions: false }));
      fetchCloudData();
    } else {
      alert(data.error);
    }
  };

  const handleEditLectureClick = (lec) => {
    setEditingId(lec._id || lec.id);
    setAdminCourseTrack(lec.courseType || "bcs");
    setAdminSection("lectures");
    setFormData({
      courseType: lec.courseType || "bcs",
      subjectId: lec.subjectId,
      lectureNo: lec.lectureNo,
      chapterName: lec.chapterName || "",
      title: lec.title,
      videoUrl: lec.videoUrl || "",
      videoDuration: lec.videoDuration || "১৫ মিনিট",
      lecturePdfUrl: lec.lecturePdfUrl || "",
      mcqPdfUrl: lec.mcqPdfUrl || "",
      writtenPdfUrl: lec.writtenPdfUrl || "",
      mainContent: lec.mainContent || "",
      mnemonic: lec.mnemonic || "",
      confusionBox: lec.confusionBox || "",
      mcqTextContent: lec.mcqTextContent || "",
      writtenTextContent: lec.writtenTextContent || "",
      embeddedImages: lec.embeddedImages || {},
      mcqTwoColumn: lec.mcqTwoColumn !== undefined ? lec.mcqTwoColumn : true,
      lectureTwoColumn: lec.lectureTwoColumn || false,
      writtenTwoColumn: lec.writtenTwoColumn || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentSubject =
    currentCourseSubjects.find((s) => s.id === activeSubjectId) || currentCourseSubjects[0];
  const subjectLectures = courseFilteredLectures
    .filter((l) => l.subjectId === activeSubjectId)
    .sort((a, b) => a.lectureNo - b.lectureNo);

  const currentLectureExamSets = activeLecture
    ? examSets.filter(
        (s) =>
          (s.courseType || "bcs") === selectedCourse &&
          s.subjectId === activeLecture.subjectId &&
          Number(s.lectureNo) === Number(activeLecture.lectureNo)
      )
    : [];
  const test1Set = currentLectureExamSets.find((s) => Number(s.testNumber) === 1);
  const test2Set = currentLectureExamSets.find((s) => Number(s.testNumber) === 2);

  const handleSelectSubject = (subId) => {
    setActiveSubjectId(subId);
    const subLecs = courseFilteredLectures
      .filter((l) => l.subjectId === subId)
      .sort((a, b) => a.lectureNo - b.lectureNo);
    if (subLecs.length > 0) {
      setActiveLecture(subLecs[0]);
      if (!subLecs[0].lecturePdfUrl && subLecs[0].mainContent) setContentViewMode("text");
      else setContentViewMode("pdf");
    } else {
      setActiveLecture(null);
    }
    setActivePdfStep(selectedCourse === "defense" ? "video" : "lecture");
    setStudentTwoColumnOverride(null);
    navigateTo("subject_lectures");
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isCurrentTextTwoColumn = () => {
    if (studentTwoColumnOverride !== null) return studentTwoColumnOverride;
    if (!activeLecture) return false;
    if (activePdfStep === "mcq_pdf") return activeLecture.mcqTwoColumn !== false;
    if (activePdfStep === "written_pdf") return !!activeLecture.writtenTwoColumn;
    return !!activeLecture.lectureTwoColumn;
  };

  /**
   * ==========================================================================
   * VIEW 1: PORTAL GATEWAY LANDING PAGE (MATCHES IMAGE 4 + LIVE 10-DAY EXAM CARD)
   * ==========================================================================
   */
  if (activePortal === "gateway") {
    return (
      <div className="min-h-screen bg-[#f4f6fb] text-slate-900 pb-16">
        {/* Top Dark Navy App Header (Matches Image 4) */}
        <header className="bg-[#0b1736] text-white border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3b1d82] to-[#1e1b4b] border border-purple-400/30 text-amber-400 flex items-center justify-center font-black text-2xl shadow-md">
                ব
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                  BCS Path & Defense Foundation
                </h1>
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  স্বপ্নজয়ী প্রস্তুতির সঙ্গী
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleOpenOrStart10DayContest}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center relative hover:bg-white/20 cursor-pointer"
                title="১০ দিনের জাতীয় বিসিএস পরীক্ষা"
              >
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#0b1736]" />
              </button>
              <button
                onClick={() => {
                  setActivePortal("course_app");
                  setActiveTab("admin");
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-extrabold text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> অ্যাডমিন
              </button>
            </div>
          </div>
        </header>

        {/* Hero Banner ("স্বাগতম! আপনার কোর্স সিলেক্ট করুন" - Matches Image 4) */}
        <section className="bg-gradient-to-r from-[#0b1736] via-[#13285c] to-[#1e3a8a] text-white overflow-hidden relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-12 items-center gap-4">
            <div className="col-span-7 sm:col-span-7 space-y-3 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-extrabold text-amber-300">
                <span>👋 {profile.name}</span>
                <button
                  onClick={() => {
                    const newName = prompt("আপনার নাম লিখুন:", profile.name);
                    if (newName && newName.trim()) updateProfile({ name: newName.trim() });
                  }}
                  className="underline text-white/90 hover:text-white cursor-pointer"
                >
                  (নাম পরিবর্তন)
                </button>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">
                স্বাগতম! <br />
                আপনার <span className="text-amber-400">কোর্স</span> <br />
                সিলেক্ট করুন
              </h2>
              <p className="text-xs sm:text-base text-slate-200 max-w-md leading-relaxed font-medium">
                আপনার লক্ষ্য অনুযায়ী সঠিক কোর্স নির্বাচন করুন এবং শুরু করুন আপনার প্রস্তুতির যাত্রা।
              </p>
            </div>

            <div className="col-span-5 sm:col-span-5 flex justify-end">
              <GatewayWelcomeStudentIllustration />
            </div>
          </div>
        </section>

        {/* Main Content Container */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-5 relative z-20 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-200/80 space-y-6">
            {/* ================= 10-DAY NATIONAL BCS 200-MCQ OPEN EXAM BANNER (VISIBLE RIGHT WHEN APP OPENS!) ================= */}
            <div
              onClick={handleOpenOrStart10DayContest}
              className="premium-card rounded-2xl bg-gradient-to-r from-[#1e1b4b] via-[#31105f] to-[#2e1065] text-white p-5 sm:p-6 border-2 border-amber-400/70 shadow-md cursor-pointer"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase">
                    <Trophy className="w-3.5 h-3.5" /> সবার জন্য উন্মুক্ত · প্রতি ১০ দিনে জাতীয় বিসিএস পরীক্ষা (১০, ২০ ও ৩০ তারিখ)
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {currentActiveContest?.title || "বিসিএস স্ট্যান্ডার্ড অল সাবজেক্টস কম্বাইনড লাইভ পরীক্ষা (২০০ MCQ)"}
                  </h3>
                  <p className="text-xs text-purple-200 font-medium">
                    এখানে ক্লিক করে নাম, মোবাইল ও প্রতিষ্ঠান দিয়ে রেজিস্ট্রেশন করুন এবং জাতীয় মেধা তালিকায় নিজের অবস্থান যাচাই করুন!
                  </p>
                </div>

                {/* Live Mini Countdown & CTA */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-1.5 bg-slate-950/70 px-3 py-2 rounded-xl border border-purple-400/30 text-center">
                    <div>
                      <span className="text-sm sm:text-base font-black text-amber-400">{countdownParts.days}</span>
                      <span className="text-[10px] text-purple-200 block">দিন</span>
                    </div>
                    <span className="text-amber-400 font-bold">:</span>
                    <div>
                      <span className="text-sm sm:text-base font-black text-amber-400">{countdownParts.hours}</span>
                      <span className="text-[10px] text-purple-200 block">ঘণ্টা</span>
                    </div>
                    <span className="text-amber-400 font-bold">:</span>
                    <div>
                      <span className="text-sm sm:text-base font-black text-amber-400">{countdownParts.minutes}</span>
                      <span className="text-[10px] text-purple-200 block">মিনিট</span>
                    </div>
                    <span className="text-amber-400 font-bold">:</span>
                    <div>
                      <span className="text-sm sm:text-base font-black text-emerald-400">{countdownParts.seconds}</span>
                      <span className="text-[10px] text-purple-200 block">সে.</span>
                    </div>
                  </div>

                  <button className="px-4 py-3 rounded-xl bg-amber-400 text-slate-950 font-black text-xs sm:text-sm whitespace-nowrap shadow-md">
                    {myContestSubmission ? `মেধা স্থান #${myLeaderboardRank}` : "রেজিস্টার ও পরীক্ষা →"}
                  </button>
                </div>
              </div>
            </div>

            {/* Section Header: Available Courses (Matches Image 4) */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Available Courses</h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">আপনার জন্য সেরা প্রস্তুতির পথ</p>
              </div>
            </div>

            {/* 2 Course Cards (Matches Image 4 layout & works seamlessly on Desktop/Mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* COURSE 1: BCS PREPARATION */}
              <div
                onClick={() => enterCourseDashboard("bcs")}
                className="premium-card group rounded-2xl border-2 border-purple-100 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/40 p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer shadow-xs hover:border-purple-500"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5b21b6] to-[#3b0764] text-white flex flex-col items-center justify-center font-black shrink-0 shadow-md">
                    <FileText className="w-6 h-6 mb-0.5" />
                    <span className="text-[11px] tracking-wider">BCS</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#3b0764]">
                      BCS Preparation
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                      বাংলাদেশ সিভিল সার্ভিস (BCS) পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি নিন।
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-purple-200 text-xs font-extrabold text-slate-800 shadow-2xs">
                        <BookOpen className="w-3.5 h-3.5 text-purple-700" /> লেকচার
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-purple-200 text-xs font-extrabold text-slate-800 shadow-2xs">
                        <FileText className="w-3.5 h-3.5 text-purple-700" /> MCQ
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-purple-200 text-xs font-extrabold text-slate-800 shadow-2xs">
                        <Star className="w-3.5 h-3.5 text-purple-700" /> মক টেস্ট
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

              {/* COURSE 2: DEFENSE & POLICE FOUNDATION */}
              <div
                onClick={() => enterCourseDashboard("defense")}
                className="premium-card group rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white via-blue-50/30 to-sky-100/40 p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer shadow-xs hover:border-blue-500"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-[#1e3a8a] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-900">
                      Defense & Police Foundation
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                      আর্মি, নেভি, এয়ারফোর্স ও পুলিশ নিয়োগ পরীক্ষার জন্য বিশেষ প্রস্তুতি।
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-extrabold text-slate-800 shadow-2xs">
                        <BookOpen className="w-3.5 h-3.5 text-blue-700" /> লেকচার
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-extrabold text-slate-800 shadow-2xs">
                        <FileText className="w-3.5 h-3.5 text-blue-700" /> MCQ
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-extrabold text-slate-800 shadow-2xs">
                        <Star className="w-3.5 h-3.5 text-blue-700" /> মক টেস্ট
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Bottom Motivational Banner (Matches Image 4) */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0b1736] via-[#13285c] to-[#0b1736] text-white p-5 sm:p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="border-l border-slate-600 pl-4">
                  <div className="text-xs sm:text-sm font-bold text-slate-200">আজকের সঠিক সিদ্ধান্ত</div>
                  <div className="text-base sm:text-xl font-black text-white">
                    আগামীর <span className="text-amber-400">সফলতা</span> গড়ে দেয়
                  </div>
                </div>
              </div>

              <div className="text-right hidden sm:block italic text-sky-300 font-bold text-xs leading-snug">
                Better Preparation <br />
                <span className="text-amber-400 underline">Brighter Future</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /**
   * ==========================================================================
   * VIEW 2: COURSE APPLICATION (MATCHES IMAGES 1, 2, 3, 5, 6, 7)
   * ==========================================================================
   */
  return (
    <div className={`min-h-screen bg-[#f4f6fb] text-slate-900 pb-24 ${activeTab !== "admin" ? "select-none" : ""}`}>
      {/* TOP HEADER & ICON NAVIGATION BAR (Matches Images 1, 2, 3) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActivePortal("gateway")}
              className="w-11 h-11 bg-[#2e1065] text-amber-400 rounded-2xl flex items-center justify-center font-black text-2xl cursor-pointer shadow-xs"
            >
              ব
            </div>
            <div onClick={() => navigateTo("dashboard")} className="cursor-pointer">
              <h1 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                {selectedCourse === "bcs" ? "বিসিএস পাঠ (BCS)" : "Defense & Police Foundation"}
              </h1>
              <p className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {dbLoading ? "ক্লাউড সিঙ্ক হচ্ছে..." : "কোর্স ড্যাশবোর্ড"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePortal("gateway")}
            className="premium-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3b0764] to-[#4c1d95] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-amber-300" />
            <span>কোর্স পরিবর্তন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* SECOND ROW ICON TAB BAR (Visible on Mobile, Tablet & Desktop — Matches Images 1, 2, 3) */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex overflow-x-auto border-t border-slate-100 bg-white gap-5 sm:gap-8 text-xs sm:text-sm font-extrabold whitespace-nowrap text-slate-700">
          <button
            onClick={() => setActivePortal("gateway")}
            className="py-3 flex items-center gap-1.5 text-slate-700 hover:text-[#3b0764] cursor-pointer"
          >
            <Home className="w-4 h-4" /> পোর্টাল
          </button>
          <button
            onClick={() => navigateTo("dashboard")}
            className={`py-3 flex items-center gap-1.5 border-b-3 transition cursor-pointer ${
              activeTab === "dashboard"
                ? "border-[#4c1d95] text-[#4c1d95] font-black"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> ড্যাশবোর্ড
          </button>
          <button
            onClick={() => navigateTo("syllabus")}
            className={`py-3 flex items-center gap-1.5 border-b-3 transition cursor-pointer ${
              activeTab === "syllabus"
                ? "border-[#4c1d95] text-[#4c1d95] font-black"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" /> সিলেবাস
          </button>
          <button
            onClick={() => navigateTo("subject_lectures")}
            className={`py-3 flex items-center gap-1.5 border-b-3 transition cursor-pointer ${
              activeTab === "subject_lectures"
                ? "border-[#4c1d95] text-[#4c1d95] font-black"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <PlayCircle className="w-4 h-4" /> লেকচার
          </button>
          <button
            onClick={() => navigateTo("mock_test_hub")}
            className={`py-3 flex items-center gap-1.5 border-b-3 transition cursor-pointer ${
              activeTab === "mock_test_hub" || activeTab === "active_exam_room"
                ? "border-[#4c1d95] text-[#4c1d95] font-black"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" /> মক টেস্ট
          </button>
          <button
            onClick={() => navigateTo("qbank")}
            className={`py-3 flex items-center gap-1.5 border-b-3 transition cursor-pointer ${
              activeTab === "qbank"
                ? "border-[#4c1d95] text-[#4c1d95] font-black"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-4 h-4" /> প্রশ্ন ব্যাংক
          </button>
          {selectedCourse === "bcs" && (
            <button
              onClick={() => navigateTo("biweekly_contest")}
              className={`py-3 flex items-center gap-1.5 border-b-3 transition cursor-pointer ${
                activeTab === "biweekly_contest"
                  ? "border-amber-600 text-amber-800 font-black"
                  : "border-transparent text-amber-700"
              }`}
            >
              <Trophy className="w-4 h-4" /> ১০ দিনের জাতীয় পরীক্ষা (২০০ MCQ)
            </button>
          )}
          <button
            onClick={() => navigateTo("admin")}
            className={`py-3 flex items-center gap-1.5 border-b-3 transition cursor-pointer ${
              activeTab === "admin"
                ? "border-blue-600 text-blue-600 font-black"
                : "border-transparent text-blue-600"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> অ্যাডমিন প্যানেল
          </button>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5">
        {/* BACK NAVIGATION PILL BAR (Matches Images 2 & 3) */}
        {activeTab !== "dashboard" && (
          <div className="mb-5">
            <button
              onClick={handleGoBack}
              className="w-full sm:w-auto inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#eef0f8] hover:bg-[#e2e6f3] text-[#1e1b4b] text-sm font-black transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> আগের পেজে ফিরুন
            </button>
          </div>
        )}

        {/* ================= 1. DASHBOARD (MATCHES IMAGE 1 DESIGN) ================= */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* PROFILE SUMMARY CARD (Matches Image 1 Top Profile Card on Mobile & Left Sidebar on Desktop) */}
            <aside className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-amber-300 border-4 border-amber-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <MiniExecutive2DAvatar size="w-full h-full" />
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </div>

                  <div>
                    <h3 className="font-black text-xl text-slate-900">{profile.name}</h3>
                    <p className="text-xs font-extrabold text-[#4c1d95] mt-0.5">{profile.targetBcs}</p>
                    {profile.institution && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-900 text-[11px] font-extrabold">
                        <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{profile.hideProfile ? "লুকানো আছে" : profile.institution}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Right Edit Button (Matches Image 1) */}
                <button
                  onClick={() => setShowProfileEditModal(true)}
                  className="px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-[#3b0764] text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="leading-tight text-left">প্রোফাইল ও<br />প্রতিষ্ঠান এডিট</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between text-sm font-black mb-2">
                  <span className="text-slate-900">মোট অগ্রগতি</span>
                  <span className="text-emerald-600">{overallProgressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2.5">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(3, overallProgressPercent)}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {totalCompletedLectures}/{totalUploadedLectures} টি লেকচার সম্পন্ন • {completedQuizzesCount} টি পরীক্ষা সম্পন্ন
                </p>
              </div>
            </aside>

            {/* RIGHT MAIN AREA (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* HERO BANNER WITH SHIELD & BOOKS ILLUSTRATION (Matches Image 1) */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#1e0b45] via-[#31105f] to-[#4c1d95] text-white p-6 sm:p-8 shadow-lg overflow-hidden">
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-12 sm:col-span-8 space-y-4 z-10">
                    <span className="inline-block px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                      {selectedCourse === "defense" ? "DEFENSE & POLICE FOUNDATION" : "BCS PREPARATION HUB"}
                    </span>

                    <h2 className="text-xl sm:text-3xl font-black leading-snug">
                      লেকচার PDF, ২-কলাম Text View ও অধ্যায়ভিত্তিক Test 1 / Test 2
                    </h2>

                    {/* 4 Info Stats Row (Matches Image 1) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs font-bold text-purple-100">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>প্রতি টেস্ট ২৫/৫০টি প্রশ্ন</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>৩৬ সেকেন্ড/প্রশ্ন</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>নেগেটিভ মার্কিং ০.৫০</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>পাস মার্ক ৬০%</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => navigateTo("mock_test_hub")}
                        className="premium-btn px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg cursor-pointer"
                      >
                        অধ্যায়ভিত্তিক মক টেস্ট দিন →
                      </button>

                      {selectedCourse === "bcs" && (
                        <button
                          onClick={handleOpenOrStart10DayContest}
                          className="premium-btn px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 border border-amber-300/40 text-amber-300 font-black text-xs sm:text-sm cursor-pointer"
                        >
                          🏆 ১০ দিনের জাতীয় পরীক্ষা (২০০ MCQ)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right 3D Shield & Books Vector Illustration (Matches Image 1) */}
                  <div className="hidden sm:flex sm:col-span-4 justify-end">
                    <svg viewBox="0 0 180 160" className="w-40 h-36 drop-shadow-xl">
                      <rect x="20" y="115" width="130" height="22" rx="6" fill="#2563eb" />
                      <rect x="25" y="120" width="120" height="12" rx="3" fill="#fde047" />
                      <rect x="28" y="95" width="115" height="22" rx="6" fill="#f59e0b" />
                      <rect x="33" y="100" width="105" height="12" rx="3" fill="#fef3c7" />
                      <path d="M90 20 L135 38 L135 78 C135 108 90 128 90 128 C90 128 45 108 45 78 L45 38 Z" fill="#a855f7" stroke="#e9d5ff" strokeWidth="4" />
                      <path d="M90 30 L125 44 L125 76 C125 98 90 115 90 115 C90 115 55 98 55 76 L55 44 Z" fill="#6b21a8" />
                      <polygon points="90,48 96,62 111,64 100,74 103,89 90,81 77,89 80,74 69,64 84,62" fill="#facc15" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* SUBJECTS LIST SECTION ("আপনার বিষয়সমূহ" - Matches Image 1) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#4c1d95]" /> আপনার বিষয়সমূহ
                  </h3>
                  <span className="px-3.5 py-1 rounded-full bg-purple-100 text-[#3b0764] text-xs font-extrabold">
                    {currentCourseSubjects.length}টি বিষয়
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCourseSubjects.map((sub) => {
                    const stats = getSubjectDynamicStats(sub.id);
                    const isEngGrammar = sub.id === "english_grammar";
                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleSelectSubject(sub.id)}
                        className="premium-card bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3.5 flex-1">
                          <div className={`w-13 h-13 rounded-2xl ${sub.bg} ${sub.text} font-black flex items-center justify-center text-lg shrink-0`}>
                            {sub.initial}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-black text-base text-slate-900 truncate">
                                {sub.title}
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-extrabold shrink-0">
                                মক টেস্ট: {sub.examMarks || sub.preliMarks}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-slate-500 mt-0.5">
                              আপলোডকৃত লেকচার: {stats.totalCount}টি
                            </p>

                            {isEngGrammar && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-violet-50 text-violet-800 text-[10px] font-extrabold">
                                📖 গল্পে গল্পে ভোকাবুলারি যুক্ত
                              </span>
                            )}

                            {/* Green Progress Bar (Matches Image 1) */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5 mb-1.5">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${stats.totalCount > 0 ? Math.max(8, stats.percent) : 0}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[11px] font-extrabold text-slate-600">
                              <span>সম্পন্ন {stats.completedCount}/{stats.totalCount}</span>
                              <span>{stats.percent}%</span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. MOCK TEST HUB (MATCHES IMAGE 2: TEST 1 READY & TEST 2 "🔒 শিগগির আসছে") ================= */}
        {activeTab === "mock_test_hub" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Filter Card (Matches Image 2) */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#4c1d95] flex items-center justify-center shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    অধ্যায়ভিত্তিক মক টেস্ট
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500">
                    বিষয় ও অধ্যায় নির্বাচন করে পরীক্ষা দিন
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-black text-xs sm:text-sm flex items-center gap-1.5 mb-2 text-slate-800">
                    <BookOpen className="w-4 h-4 text-[#4c1d95]" /> বিষয় নির্বাচন করুন
                  </label>
                  <select
                    value={mockFilterSubject}
                    onChange={(e) => {
                      setMockFilterSubject(e.target.value);
                      setMockFilterLectureNo("ALL");
                    }}
                    className="w-full p-3.5 border border-slate-300 rounded-2xl bg-slate-50/70 font-extrabold text-sm text-slate-900 outline-none"
                  >
                    <option value="ALL">সকল বিষয়</option>
                    {currentCourseSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-black text-xs sm:text-sm flex items-center gap-1.5 mb-2 text-slate-800">
                    <FileText className="w-4 h-4 text-[#4c1d95]" /> Chapter / Lecture নির্বাচন করুন
                  </label>
                  <select
                    value={mockFilterLectureNo}
                    onChange={(e) => setMockFilterLectureNo(e.target.value)}
                    className="w-full p-3.5 border border-slate-300 rounded-2xl bg-slate-50/70 font-extrabold text-sm text-slate-900 outline-none"
                  >
                    <option value="ALL">সকল Chapter / Lecture</option>
                    {Array.from(
                      new Set([
                        ...courseFilteredLectures
                          .filter((l) => mockFilterSubject === "ALL" || l.subjectId === mockFilterSubject)
                          .map((l) => l.lectureNo),
                        ...examSets
                          .filter(
                            (s) =>
                              (s.courseType || "bcs") === selectedCourse &&
                              (mockFilterSubject === "ALL" || s.subjectId === mockFilterSubject)
                          )
                          .map((s) => s.lectureNo),
                      ])
                    )
                      .sort((a, b) => Number(a) - Number(b))
                      .map((lecNo) => (
                        <option key={lecNo} value={lecNo}>
                          Lecture {lecNo}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Chapter Test Cards (Renders TEST 1 and TEST 2 side-by-side or stacked like Image 2!) */}
            {(() => {
              const targetSubObj =
                currentCourseSubjects.find((s) => s.id === mockFilterSubject) ||
                currentCourseSubjects[0];

              // Gather all chapter numbers for the selected subject
              const lectureNumbers = Array.from(
                new Set([
                  ...courseFilteredLectures
                    .filter((l) => mockFilterSubject === "ALL" || l.subjectId === mockFilterSubject)
                    .map((l) => Number(l.lectureNo)),
                  ...examSets
                    .filter(
                      (s) =>
                        (s.courseType || "bcs") === selectedCourse &&
                        (mockFilterSubject === "ALL" || s.subjectId === mockFilterSubject)
                    )
                    .map((s) => Number(s.lectureNo)),
                ])
              )
                .filter((n) => mockFilterLectureNo === "ALL" || n === Number(mockFilterLectureNo))
                .sort((a, b) => a - b);

              const chaptersToRender = lectureNumbers.length > 0 ? lectureNumbers : [1];

              return (
                <div className="space-y-6">
                  {chaptersToRender.map((lecNo) => {
                    const matchedLec = courseFilteredLectures.find(
                      (l) =>
                        (mockFilterSubject === "ALL" || l.subjectId === mockFilterSubject) &&
                        Number(l.lectureNo) === lecNo
                    );
                    const t1 = examSets.find(
                      (s) =>
                        (s.courseType || "bcs") === selectedCourse &&
                        (mockFilterSubject === "ALL" || s.subjectId === mockFilterSubject) &&
                        Number(s.lectureNo) === lecNo &&
                        Number(s.testNumber) === 1
                    );
                    const t2 = examSets.find(
                      (s) =>
                        (s.courseType || "bcs") === selectedCourse &&
                        (mockFilterSubject === "ALL" || s.subjectId === mockFilterSubject) &&
                        Number(s.lectureNo) === lecNo &&
                        Number(s.testNumber) === 2
                    );

                    const chapterHeading =
                      t1?.chapterName ||
                      t2?.chapterName ||
                      matchedLec?.title ||
                      "অধ্যায়ভিত্তিক অনুশীলনী";

                    return (
                      <div key={lecNo} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                          { num: 1, doc: t1 },
                          { num: 2, doc: t2 },
                        ].map(({ num, doc }) => {
                          const isReady = doc && doc.questions?.length > 0;
                          const qCount = isReady ? doc.questions.length : 25;
                          const totalMin = Math.max(1, Math.round((qCount * 36) / 60));

                          return (
                            <div
                              key={num}
                              className={`bg-white p-6 rounded-3xl border shadow-xs space-y-4 ${
                                isReady ? "border-slate-200" : "border-slate-200/70 opacity-90"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-3.5 py-1 rounded-full bg-purple-100 text-[#4c1d95] text-xs font-extrabold">
                                  {targetSubObj.title} • Lecture {lecNo}
                                </span>
                                <span
                                  className={`px-3.5 py-1 rounded-full text-xs font-black ${
                                    isReady
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  TEST {num}
                                </span>
                              </div>

                              <h3
                                className={`text-xl font-black ${
                                  isReady ? "text-slate-900" : "text-slate-500"
                                }`}
                              >
                                {chapterHeading}
                              </h3>

                              {/* 4 Pill Badges (Matches Image 2) */}
                              <div className="flex flex-wrap gap-2 text-xs font-extrabold text-slate-700">
                                <span className="px-3 py-1.5 rounded-xl bg-slate-100 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-[#4c1d95]" /> {qCount}টি প্রশ্ন
                                </span>
                                <span className="px-3 py-1.5 rounded-xl bg-slate-100 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-[#4c1d95]" /> {totalMin} মিনিট
                                </span>
                                <span className="px-3 py-1.5 rounded-xl bg-slate-100 flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-[#4c1d95]" /> পাস মার্ক ৬০%
                                </span>
                                <span className="px-3 py-1.5 rounded-xl bg-slate-100 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 text-[#4c1d95]" /> নেগেটিভ ০.৫০
                                </span>
                              </div>

                              {isReady ? (
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                  <div className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span>প্রস্তুত হলে পরীক্ষা শুরু করুন</span>
                                  </div>
                                  <button
                                    onClick={() => launchSpecificExamSet(doc)}
                                    className="premium-btn w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#3b0764] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                                  >
                                    <PlayCircle className="w-5 h-5" /> পরীক্ষা শুরু করুন →
                                  </button>
                                </div>
                              ) : (
                                <div className="pt-2 border-t border-slate-100">
                                  <button
                                    disabled
                                    className="w-full py-3.5 rounded-2xl bg-slate-200 text-slate-600 font-extrabold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                                  >
                                    <Lock className="w-4 h-4" /> শিগগির আসছে
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= 3. QUESTION BANK HUB (MATCHES IMAGE 3: CARDS WITH DIRECT "PDF খুলুন" & "Text View" BUTTONS) ================= */}
        {activeTab === "qbank" && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Top Filter & View Toggle Card (Matches Image 3) */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#4c1d95] flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    বিষয়ভিত্তিক প্রশ্ন ব্যাংক
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500">
                    PDF অথবা Text View-তে প্রশ্ন অনুশীলন করুন
                  </p>
                </div>
              </div>

              <div>
                <label className="font-black text-xs sm:text-sm flex items-center gap-1.5 mb-2 text-slate-800">
                  <BookOpen className="w-4 h-4 text-[#4c1d95]" /> বিষয় নির্বাচন করুন
                </label>
                <select
                  value={selectedQbSubject}
                  onChange={(e) => setSelectedQbSubject(e.target.value)}
                  className="w-full p-3.5 border border-slate-300 rounded-2xl bg-slate-50/70 font-extrabold text-sm text-slate-900 outline-none"
                >
                  <option value="ALL">সকল বিষয় ({currentCourseSubjects.length}টি)</option>
                  {currentCourseSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              {/* Segmented Toggle Bar (PDF View vs Text View - Matches Image 3) */}
              <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
                <button
                  onClick={() => setQbankViewMode("pdf")}
                  className={`py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                    qbankViewMode === "pdf"
                      ? "bg-gradient-to-r from-[#3b0764] to-[#4c1d95] text-white shadow-sm"
                      : "text-slate-700"
                  }`}
                >
                  <FileText className="w-4 h-4" /> PDF View
                </button>
                <button
                  onClick={() => setQbankViewMode("text")}
                  className={`py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                    qbankViewMode === "text"
                      ? "bg-gradient-to-r from-[#3b0764] to-[#4c1d95] text-white shadow-sm"
                      : "text-slate-700"
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Text View
                </button>
              </div>
            </div>

            {/* Question Bank List Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#4c1d95]" /> প্রশ্ন ব্যাংক তালিকা
              </h3>
              <span className="px-3.5 py-1 rounded-full bg-purple-100 text-[#3b0764] text-xs font-extrabold">
                {courseFilteredQbankDocs.length > 0 ? `${courseFilteredQbankDocs.length}টি ফাইল` : `${currentCourseSubjects.length}টি বিষয়`}
              </span>
            </div>

            {/* Question Bank Cards with Direct "PDF খুলুন" & "Text View" Buttons (Matches Image 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(courseFilteredQbankDocs.length > 0
                ? courseFilteredQbankDocs
                : currentCourseSubjects
                    .filter((s) => selectedQbSubject === "ALL" || s.id === selectedQbSubject)
                    .map((s) => ({
                      _id: s.id,
                      subjectId: s.id,
                      title: s.title,
                      bcsBatch: s.subtitle || "প্রশ্ন ব্যাংক ও সমাধান",
                      pdfUrl: "",
                      textContent: "",
                    }))
              ).map((doc) => {
                const dId = doc._id || doc.id;
                const isSelected = (activeQbankDoc?._id || activeQbankDoc?.id) === dId;
                return (
                  <div
                    key={dId}
                    className={`premium-card bg-white p-5 rounded-3xl border shadow-2xs flex items-start justify-between gap-4 ${
                      isSelected ? "border-[#4c1d95] ring-2 ring-purple-200" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-13 h-13 rounded-2xl bg-purple-50 border border-purple-200 text-[#4c1d95] flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="space-y-2.5">
                        <div>
                          <h4 className="font-black text-base sm:text-lg text-slate-900">{doc.title}</h4>
                          <p className="text-xs font-semibold text-slate-500">{doc.bcsBatch}</p>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          <button
                            onClick={() => {
                              setActiveQbankDoc(doc);
                              setQbankViewMode("pdf");
                              smoothScrollToRef(qbankReaderRef);
                            }}
                            className="premium-btn px-4 py-2 rounded-xl bg-gradient-to-r from-[#3b0764] to-[#4c1d95] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" /> PDF খুলুন
                          </button>
                          <button
                            onClick={() => {
                              setActiveQbankDoc(doc);
                              setQbankViewMode("text");
                              smoothScrollToRef(qbankReaderRef);
                            }}
                            className="premium-btn px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3b0764] border border-purple-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" /> Text View
                          </button>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-2" />
                  </div>
                );
              })}
            </div>

            {/* Active Question Bank Reader Area */}
            {activeQbankDoc && (activeQbankDoc.pdfUrl || activeQbankDoc.textContent) && (
              <div ref={qbankReaderRef} className="bg-white rounded-3xl border border-slate-200 p-6 scroll-mt-20 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
                  <h3 className="font-black text-lg text-slate-900">{activeQbankDoc.title}</h3>
                  <div className="flex gap-2">
                    {qbankViewMode === "text" && (
                      <button
                        onClick={() => setQbankTwoCol(!qbankTwoCol)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold cursor-pointer"
                      >
                        {qbankTwoCol ? "২-কলাম ভিউ (চালু)" : "২-কলামে দেখুন"}
                      </button>
                    )}
                    {qbankViewMode === "pdf" && activeQbankDoc.pdfUrl && (
                      <button
                        onClick={() => setIsPdfFullscreen(true)}
                        className="px-3.5 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" /> ফুলস্ক্রিন
                      </button>
                    )}
                  </div>
                </div>

                {qbankViewMode === "pdf" && activeQbankDoc.pdfUrl ? (
                  <iframe src={formatSecurePdfUrl(activeQbankDoc.pdfUrl)} className="w-full h-[760px] border-0 rounded-2xl" title="QBank PDF" />
                ) : (
                  <div
                    className={`p-6 rounded-2xl bg-blue-50/40 border border-blue-200 text-base text-slate-900 leading-relaxed whitespace-pre-line font-medium clearfix ${
                      qbankTwoCol ? "md:columns-2 md:gap-10 [column-rule:1px_solid_#bfdbfe]" : ""
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: renderRichTextWithShortImageTokens(
                        activeQbankDoc.textContent || "এই ফাইলের টেক্সট নোট এখনো যুক্ত করা হয়নি।",
                        activeQbankDoc.embeddedImages
                      ),
                    }}
                  />
                )}
              </div>
            )}

            {/* Bottom Tip Banner (Matches Image 3) */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200/80 text-center text-xs sm:text-sm font-extrabold text-[#3b0764] flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-700 shrink-0" />
              <span>আপনার পছন্দের বিষয় নির্বাচন করে প্রশ্ন অনুশীলন শুরু করুন</span>
            </div>
          </div>
        )}

        {/* ================= 4. LECTURE HUB ================= */}
        {activeTab === "subject_lectures" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#3b0764] text-white p-6 rounded-3xl shadow-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{currentSubject.title} — লেকচার ও পিডিএফ হাব</h2>
                <p className="text-sm text-purple-200 mt-0.5">
                  মোট আপলোডকৃত লেকচার: {subjectLectures.length}টি
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {activeSubjectId === "english_grammar" && (
                  <button
                    onClick={() => {
                      setActivePdfStep("vocab_story");
                      if (vocabStories.length > 0 && !activeVocabStory) {
                        setActiveVocabStory(vocabStories[0]);
                      }
                      smoothScrollToRef(vocabReaderRef);
                    }}
                    className={`premium-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md cursor-pointer ${
                      activePdfStep === "vocab_story"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-white/15 text-amber-300 border border-amber-400/40"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" /> 📖 গল্পে গল্পে ভোকাবুলারি ({vocabStories.length}টি গল্প)
                  </button>
                )}

                <select
                  value={activeSubjectId}
                  onChange={(e) => handleSelectSubject(e.target.value)}
                  className="px-4 py-2.5 rounded-xl text-sm font-extrabold bg-white text-slate-900"
                >
                  {currentCourseSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeSubjectId === "english_grammar" && activePdfStep === "vocab_story" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-3 bg-white rounded-2xl border border-violet-200 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="font-extrabold text-base text-violet-950">
                      📖 ভোকাবুলারি স্টোরি ({vocabStories.length}টি)
                    </span>
                    <button
                      onClick={() => setActivePdfStep("lecture")}
                      className="text-xs font-extrabold text-blue-600 hover:underline cursor-pointer"
                    >
                      ← লেকচারে ফিরুন
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
                    {vocabStories.map((st) => {
                      const stId = st._id || st.id;
                      const isSelected = (activeVocabStory?._id || activeVocabStory?.id) === stId;
                      return (
                        <div
                          key={stId}
                          onClick={() => {
                            setActiveVocabStory(st);
                            smoothScrollToRef(vocabReaderRef);
                          }}
                          className={`premium-card p-3.5 rounded-xl border cursor-pointer ${
                            isSelected ? "bg-[#2e1065] text-white border-[#2e1065]" : "bg-white hover:border-violet-400"
                          }`}
                        >
                          <div className={`text-[11px] font-extrabold ${isSelected ? "text-amber-300" : "text-violet-700"}`}>
                            Story #{st.storyNo < 10 ? `0${st.storyNo}` : st.storyNo}
                          </div>
                          <div className="font-extrabold text-sm mt-0.5">{st.title}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div ref={vocabReaderRef} className="lg:col-span-9 scroll-mt-20">
                  {activeVocabStory && (
                    <div className="bg-white rounded-3xl border-2 border-violet-200 p-6 sm:p-9 shadow-sm space-y-6">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                        {activeVocabStory.title}
                      </h3>
                      <div className="clearfix text-base sm:text-lg text-slate-900 leading-relaxed font-medium space-y-4">
                        {activeVocabStory.image1Url && (
                          <img
                            src={activeVocabStory.image1Url}
                            alt={activeVocabStory.title}
                            className="rounded-2xl border-4 border-amber-200 shadow-md object-cover sm:float-right sm:w-72 sm:ml-6 mb-4"
                          />
                        )}
                        <div
                          className="whitespace-pre-line leading-loose"
                          dangerouslySetInnerHTML={{
                            __html: renderRichTextWithShortImageTokens(
                              activeVocabStory.storyContent,
                              activeVocabStory.embeddedImages
                            ),
                          }}
                        />
                        {activeVocabStory.image2Url && (
                          <img
                            src={activeVocabStory.image2Url}
                            alt="Story 2"
                            className="rounded-2xl border-4 border-violet-200 shadow-md object-cover sm:float-left sm:w-72 sm:mr-6 mt-4 mb-4"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="font-extrabold text-base border-b pb-3">
                    লেকচার তালিকা ({subjectLectures.length}টি)
                  </div>
                  <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                    {subjectLectures.map((lec) => {
                      const lecId = lec._id || lec.id;
                      const isSelected = (activeLecture?._id || activeLecture?.id) === lecId;
                      const isDone = progressMap[lecId]?.completed;
                      const num = lec.lectureNo < 10 ? `0${lec.lectureNo}` : lec.lectureNo;
                      return (
                        <div
                          key={lecId}
                          onClick={() => {
                            setActiveLecture(lec);
                            setActivePdfStep(selectedCourse === "defense" ? "video" : "lecture");
                            setStudentTwoColumnOverride(null);
                            smoothScrollToRef(studyResourceRef);
                          }}
                          className={`premium-card p-3.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                            isSelected ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:border-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-lg text-xs font-extrabold flex items-center justify-center ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-900"}`}>
                              {num}
                            </span>
                            <div>
                              <div className="text-sm font-bold leading-snug">Lecture {num}: {lec.title}</div>
                              <div className={`text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                {isDone ? "✓ সম্পন্ন" : "চলমান"}
                              </div>
                            </div>
                          </div>
                          <CheckCircle2 className={`w-5 h-5 shrink-0 ${isDone ? "text-emerald-500" : "text-slate-300"}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div ref={studyResourceRef} className="lg:col-span-9 space-y-6 scroll-mt-20">
                  {!activeLecture ? (
                    <div className="bg-white rounded-2xl border p-14 text-center text-slate-600 font-bold">
                      বাম পাশের তালিকা থেকে একটি লেকচার নির্বাচন করুন।
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                        <div>
                          <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-md bg-blue-50 text-blue-800">
                            {currentSubject.title} • LECTURE 0{activeLecture.lectureNo}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
                            {activeLecture.title}
                          </h3>
                        </div>

                        {activePdfStep !== "video" && (
                          <div className="flex flex-wrap items-center gap-2.5">
                            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                              <button
                                onClick={() => setContentViewMode("pdf")}
                                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold cursor-pointer ${
                                  contentViewMode === "pdf" ? "bg-slate-900 text-white" : "text-slate-700"
                                }`}
                              >
                                📄 PDF View
                              </button>
                              <button
                                onClick={() => setContentViewMode("text")}
                                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold cursor-pointer ${
                                  contentViewMode === "text" ? "bg-slate-900 text-white" : "text-slate-700"
                                }`}
                              >
                                📝 Text View
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {selectedCourse === "defense" && (
                          <button
                            onClick={() => setActivePdfStep("video")}
                            className={`premium-btn p-4 rounded-xl border text-left flex items-center gap-3 cursor-pointer ${
                              activePdfStep === "video" ? "bg-[#2e1065] text-white border-[#2e1065]" : "bg-slate-50 text-slate-900"
                            }`}
                          >
                            <PlayCircle className="w-5 h-5 shrink-0 text-amber-400" />
                            <div>
                              <div className="text-sm font-extrabold">ভিডিও লেকচার</div>
                              <div className="text-xs opacity-80">YouTube Unlisted</div>
                            </div>
                          </button>
                        )}

                        <button
                          onClick={() => setActivePdfStep("lecture")}
                          className={`premium-btn p-4 rounded-xl border text-left flex items-center gap-3 cursor-pointer ${
                            activePdfStep === "lecture" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-900"
                          }`}
                        >
                          <FileText className="w-5 h-5 shrink-0" />
                          <div>
                            <div className="text-sm font-extrabold">১. মূল লেকচার নোট</div>
                            <div className="text-xs opacity-80">PDF ও রঙিন Text View</div>
                          </div>
                        </button>

                        <button
                          onClick={() => setActivePdfStep("mcq_pdf")}
                          className={`premium-btn p-4 rounded-xl border text-left flex items-center gap-3 cursor-pointer ${
                            activePdfStep === "mcq_pdf" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-900"
                          }`}
                        >
                          <HelpCircle className="w-5 h-5 shrink-0" />
                          <div>
                            <div className="text-sm font-extrabold">২. এই Chapter-এর সকল MCQ</div>
                            <div className="text-xs opacity-80">PDF ও ২-কলাম Text View</div>
                          </div>
                        </button>

                        {selectedCourse === "bcs" && (
                          <button
                            onClick={() => setActivePdfStep("written_pdf")}
                            className={`premium-btn p-4 rounded-xl border text-left flex items-center gap-3 cursor-pointer ${
                              activePdfStep === "written_pdf" ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-900"
                            }`}
                          >
                            <PenTool className="w-5 h-5 shrink-0" />
                            <div>
                              <div className="text-sm font-extrabold">৩. লিখিত প্রশ্ন ও উত্তর</div>
                              <div className="text-xs opacity-80">PDF ও রঙিন Text View</div>
                            </div>
                          </button>
                        )}
                      </div>

                      {activePdfStep === "video" && (
                        <div>
                          {activeLecture.videoUrl ? (
                            <div className="rounded-2xl overflow-hidden border-2 border-[#2e1065] bg-black aspect-video">
                              <iframe src={getYoutubeEmbedUrl(activeLecture.videoUrl)} className="w-full h-full border-0" allowFullScreen title="Video" />
                            </div>
                          ) : (
                            <div className="p-10 rounded-2xl border border-dashed text-center bg-slate-50 font-bold text-slate-600">
                              ভিডিও লিংক দেওয়া হয়নি। পাশের PDF বা Text View দেখুন।
                            </div>
                          )}
                        </div>
                      )}

                      {activePdfStep === "lecture" && (
                        <div>
                          {contentViewMode === "pdf" && activeLecture.lecturePdfUrl ? (
                            <iframe src={formatSecurePdfUrl(activeLecture.lecturePdfUrl)} className="w-full h-[760px] rounded-2xl border" title="Lecture PDF" />
                          ) : (
                            <div
                              className={`p-6 rounded-2xl bg-white border text-base leading-relaxed whitespace-pre-line clearfix ${
                                isCurrentTextTwoColumn() ? "md:columns-2 md:gap-8" : ""
                              }`}
                              dangerouslySetInnerHTML={{
                                __html: renderRichTextWithShortImageTokens(
                                  activeLecture.mainContent || "এই লেকচারে এখনো কোনো নোট যুক্ত করা হয়নি।",
                                  activeLecture.embeddedImages
                                ),
                              }}
                            />
                          )}
                        </div>
                      )}

                      {activePdfStep === "mcq_pdf" && (
                        <div>
                          {contentViewMode === "pdf" && activeLecture.mcqPdfUrl ? (
                            <iframe src={formatSecurePdfUrl(activeLecture.mcqPdfUrl)} className="w-full h-[760px] rounded-2xl border" title="MCQ PDF" />
                          ) : (
                            <div
                              className="p-6 rounded-2xl bg-emerald-50/40 border text-base leading-relaxed whitespace-pre-line md:columns-2 md:gap-8 clearfix"
                              dangerouslySetInnerHTML={{
                                __html: renderRichTextWithShortImageTokens(
                                  activeLecture.mcqTextContent || "এই অধ্যায়ের MCQ এখনো আপলোড করা হয়নি।",
                                  activeLecture.embeddedImages
                                ),
                              }}
                            />
                          )}
                        </div>
                      )}

                      {activePdfStep === "written_pdf" && (
                        <div>
                          {contentViewMode === "pdf" && activeLecture.writtenPdfUrl ? (
                            <iframe src={formatSecurePdfUrl(activeLecture.writtenPdfUrl)} className="w-full h-[760px] rounded-2xl border" title="Written PDF" />
                          ) : (
                            <div
                              className="p-6 rounded-2xl bg-purple-50/40 border text-base leading-relaxed whitespace-pre-line clearfix"
                              dangerouslySetInnerHTML={{
                                __html: renderRichTextWithShortImageTokens(
                                  activeLecture.writtenTextContent || "লিখিত প্রশ্নোত্তর এখনো আপলোড করা হয়নি।",
                                  activeLecture.embeddedImages
                                ),
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 5. 10-DAY NATIONAL 200-MCQ COMBINED BCS LIVE EXAM & LEADERBOARD ================= */}
        {activeTab === "biweekly_contest" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
                    <Calendar className="w-4 h-4" /> প্রতি ১০ দিনে ১টি জাতীয় পরীক্ষা (১০, ২০ এবং মাসের শেষ তারিখ ২৮/২৯/৩০)
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black">
                    {currentActiveContest?.title || "৪৭তম বিসিএস স্ট্যান্ডার্ড অল সাবজেক্টস কম্বাইনড প্রিলিমিনারি পরীক্ষা (২০০ এমসিকিউ)"}
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200">
                    মোট প্রশ্ন: {currentActiveContest?.questions?.length || 200}টি · প্রতি প্রশ্নে ৩৬ সেকেন্ড · পাস মার্ক: ৬০% · নেগেটিভ মার্কিং: ০.৫০
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center shrink-0 w-full lg:w-auto">
                  <div className="text-[11px] font-extrabold text-amber-300 uppercase mb-2">
                    ⏳ {countdownParts.label} — সময় বাকি:
                  </div>
                  <div className="grid grid-cols-4 gap-2.5 text-center">
                    <div className="bg-slate-950/80 px-3 py-2 rounded-xl">
                      <div className="text-xl font-black text-amber-400">{countdownParts.days}</div>
                      <div className="text-[10px] font-bold text-purple-200">দিন</div>
                    </div>
                    <div className="bg-slate-950/80 px-3 py-2 rounded-xl">
                      <div className="text-xl font-black text-amber-400">{countdownParts.hours}</div>
                      <div className="text-[10px] font-bold text-purple-200">ঘণ্টা</div>
                    </div>
                    <div className="bg-slate-950/80 px-3 py-2 rounded-xl">
                      <div className="text-xl font-black text-amber-400">{countdownParts.minutes}</div>
                      <div className="text-[10px] font-bold text-purple-200">মিনিট</div>
                    </div>
                    <div className="bg-slate-950/80 px-3 py-2 rounded-xl">
                      <div className="text-xl font-black text-emerald-400">{countdownParts.seconds}</div>
                      <div className="text-[10px] font-bold text-purple-200">সেকেন্ড</div>
                    </div>
                  </div>
                </div>
              </div>

              {!isContestRoomActive && (
                <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm font-bold text-emerald-300">
                    {isRegisteredForContest
                      ? `✓ রেজিস্টার্ড পরীক্ষার্থী: ${profile.name} (${profile.institution})`
                      : "পরীক্ষায় অংশ নিতে প্রথমে নাম, ফোন নম্বর ও প্রতিষ্ঠান দিয়ে রেজিস্টার করুন"}
                  </div>
                  {!myContestSubmission && (
                    <button
                      onClick={handleOpenOrStart10DayContest}
                      className="premium-btn px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl text-xs sm:text-sm font-black shadow-xl cursor-pointer"
                    >
                      🚀 রেজিস্টার করে পরীক্ষা শুরু করুন →
                    </button>
                  )}
                </div>
              )}
            </div>

            {isContestRoomActive && currentActiveContest ? (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 sticky top-16 z-30 flex flex-wrap items-center justify-between gap-4 shadow-md">
                  <div className="font-extrabold text-base text-slate-900">
                    উত্তর দিয়েছেন: {Object.keys(contestAnswers).length} / {currentActiveContest.questions.length}টি
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2.5 bg-rose-50 text-rose-700 rounded-xl font-black text-base">
                      ⏱ {formatTime(contestTimeLeft)}
                    </div>
                    <button
                      onClick={submitBiWeeklyContestExam}
                      disabled={contestSubmitting}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black cursor-pointer"
                    >
                      খাতা জমা দিন
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentActiveContest.questions.map((q, idx) => {
                    const qKey = q.qNo || idx + 1;
                    const selectedOpt = contestAnswers[qKey];
                    return (
                      <div key={qKey} className="bg-white p-6 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <h3 className="font-extrabold text-base sm:text-lg">
                            {qKey}. {q.question}
                          </h3>
                          <span className="px-2.5 py-1 rounded-md bg-purple-50 text-[#2e1065] text-xs font-extrabold shrink-0">
                            {q.subjectTitle || "সাধারণ বিষয়"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => setContestAnswers({ ...contestAnswers, [qKey]: optIdx })}
                              className={`p-3.5 rounded-xl border text-left text-sm font-semibold cursor-pointer ${
                                selectedOpt === optIdx
                                  ? "bg-slate-900 text-white border-slate-900 font-extrabold"
                                  : "bg-white border-slate-300"
                              }`}
                            >
                              {String.fromCharCode(2453 + optIdx)}. {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" /> জাতীয় মেধা তালিকা (Live Leaderboard)
                </h3>
                {sortedLeaderboard.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed text-slate-600 font-bold">
                    এখনো কেউ খাতা জমা দেয়নি। রেজিস্টার করে প্রথম স্থান অর্জন করুন!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedLeaderboard.map((sub, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border bg-slate-50/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="font-extrabold text-sm text-slate-900">{sub.name}</div>
                              <div className="text-xs text-slate-500">{sub.institution}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-base text-[#2e1065]">{sub.totalScore} নম্বর</div>
                            <div className="text-[10px] text-slate-500">Eng: {sub.englishScore || 0} · Math: {sub.mathScore || 0}</div>
                          </div>
                        </div>
                        {sub.weakSubjects?.length > 0 && (
                          <div className="text-[11px] font-extrabold text-rose-700">
                            ⚠️ দুর্বল বিষয়: {sub.weakSubjects.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= 6. ACTIVE CHAPTER EXAM ROOM ================= */}
        {activeTab === "active_exam_room" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-4 sticky top-16 z-30">
              <h2 className="text-xl font-extrabold text-slate-900">{examTitle}</h2>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2.5 bg-rose-50 text-rose-700 rounded-xl font-extrabold">
                  ⏱ {formatTime(timeLeft)}
                </div>
                {!examSubmitted && (
                  <button onClick={handleFinishExam} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-extrabold cursor-pointer">
                    খাতা জমা দিন
                  </button>
                )}
              </div>
            </div>

            {examSubmitted && (
              <div className="bg-white border-2 border-slate-900 p-6 rounded-2xl">
                {(() => {
                  const res = calculateExamResult();
                  return (
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <h3 className="text-xl font-black">
                        📊 প্রাপ্ত নম্বর: {res.finalScore} / {res.totalQ} ({res.scorePercentage}%) — {res.isPassed ? "🎉 উত্তীর্ণ" : "⚠️ অনুত্তীর্ণ"}
                      </h3>
                      <button
                        onClick={() => {
                          setExamAnswers({});
                          setExamSubmitted(false);
                          setTimeLeft(examQuestions.length * 36);
                        }}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                      >
                        আবার পরীক্ষা দিন
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="space-y-4">
              {examQuestions.map((q, idx) => {
                const qKey = q._id || q.qNo || idx;
                const selectedOpt = examAnswers[qKey];
                const isWrong = examSubmitted && selectedOpt !== undefined && Number(selectedOpt) !== Number(q.correctAnswer);

                return (
                  <div key={qKey} className={`bg-white p-6 rounded-2xl border ${isWrong ? "border-2 border-rose-500" : "border-slate-200"}`}>
                    <h3 className="font-extrabold text-base mb-4">{idx + 1}. {q.question}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          disabled={examSubmitted}
                          onClick={() => setExamAnswers({ ...examAnswers, [qKey]: optIdx })}
                          className={`p-3.5 rounded-xl border text-left text-sm font-semibold cursor-pointer ${
                            !examSubmitted && selectedOpt === optIdx
                              ? "bg-slate-900 text-white"
                              : examSubmitted && Number(optIdx) === Number(q.correctAnswer)
                              ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-extrabold"
                              : "bg-white border-slate-300"
                          }`}
                        >
                          {String.fromCharCode(2453 + optIdx)}. {opt}
                        </button>
                      ))}
                    </div>
                    {examSubmitted && q.explanation && (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border text-xs">
                        <strong>ব্যাখ্যা:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 7. SYLLABUS TAB ================= */}
        {activeTab === "syllabus" && (
          <div className="space-y-6">
            {currentCourseSubjects.map((sub, idx) => (
              <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
                  <h3 className="font-extrabold text-lg">{idx + 1}. {sub.title}</h3>
                  <button onClick={() => handleSelectSubject(sub.id)} className="px-4 py-2 bg-[#2e1065] text-white rounded-xl text-xs font-extrabold cursor-pointer">
                    লেকচার দেখুন →
                  </button>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sub.syllabusBreakdown.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border bg-slate-50/60">
                      <div className="flex justify-between font-extrabold text-sm mb-1">
                        <span>{item.topic}</span>
                        <span className="text-emerald-700">{item.marks} নম্বর</span>
                      </div>
                      <p className="text-xs text-slate-600">{item.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 8. CENTRAL ADMIN PANEL (STRICTLY HIDES 200-MCQ CONTEST IN DEFENSE TRACK!) ================= */}
        {activeTab === "admin" && (
          <div>
            {!isAdminUnlocked ? (
              <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border shadow-sm text-center my-12">
                <KeyRound className="w-10 h-10 text-[#2e1065] mx-auto mb-3" />
                <h2 className="text-xl font-extrabold mb-1">BCS Path — Admin Panel</h2>
                <p className="text-sm text-slate-600 mb-5">পিন দিয়ে আনলক করুন (`bcs2026`)</p>
                <input
                  type="password"
                  placeholder="অ্যাডমিন পিন লিখুন (bcs2026)"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full p-3.5 border rounded-xl text-sm mb-4 text-center"
                />
                <button
                  onClick={() => {
                    if (adminPinInput === "bcs2026") setIsAdminUnlocked(true);
                    else alert("❌ ভুল পিন! সঠিক পিন: bcs2026");
                  }}
                  className="w-full py-3.5 bg-[#1e1b4b] text-white rounded-xl text-sm font-extrabold cursor-pointer"
                >
                  অ্যাডমিন প্যানেল আনলক করুন
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => handleAdminCourseSwitch("bcs")}
                      className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center justify-between ${
                        adminCourseTrack === "bcs" ? "bg-purple-50 border-[#4c1d95]" : "bg-slate-50 border-transparent"
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-lg text-[#2e1065]">📚 Course 01: BCS Preparation</div>
                        <p className="text-xs text-slate-600">১২টি বিষয় · ভোকাবুলারি স্টোরি · ১০ দিনের ২০০ MCQ জাতীয় পরীক্ষা · Test 1 & 2</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-200 text-[#2e1065] text-xs font-extrabold">Course 01</span>
                    </div>

                    <div
                      onClick={() => handleAdminCourseSwitch("defense")}
                      className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center justify-between ${
                        adminCourseTrack === "defense" ? "bg-amber-50 border-amber-500" : "bg-slate-50 border-transparent"
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-lg text-amber-950">🛡️ Course 02: Defense & Police</div>
                        <p className="text-xs text-amber-900">Unlisted Video · Lecture PDF + Text · অধ্যায়ভিত্তিক Test 1 & Test 2 · প্রশ্ন ব্যাংক</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-950 text-xs font-extrabold">Course 02</span>
                    </div>
                  </div>

                  {/* Admin Module Tabs (Notice: 10-Day 200-MCQ & Vocab Stories ONLY show when adminCourseTrack === "bcs"!) */}
                  <div className="flex flex-wrap gap-2.5 pt-2 border-t">
                    <button
                      onClick={() => setAdminSection("lectures")}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer ${
                        adminSection === "lectures" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      ১. লেকচার আপলোড (PDF + শর্ট-টোকেন ইমেজ টেক্সট)
                    </button>

                    {adminCourseTrack === "bcs" && (
                      <button
                        onClick={() => setAdminSection("vocab_stories")}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer ${
                          adminSection === "vocab_stories"
                            ? "bg-violet-700 text-white"
                            : "bg-violet-50 text-violet-900 border border-violet-200"
                        }`}
                      >
                        ২. 📖 গল্পে গল্পে ভোকাবুলারি স্টোরি (২টি ইমেজসহ)
                      </button>
                    )}

                    <button
                      onClick={() => setAdminSection("exam_builder")}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer ${
                        adminSection === "exam_builder"
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      }`}
                    >
                      🎯 অধ্যায়ভিত্তিক Test 1 ও Test 2 (বাল্ক প্রশ্ন আপলোড)
                    </button>

                    {adminCourseTrack === "bcs" && (
                      <button
                        onClick={() => setAdminSection("biweekly_200")}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer ${
                          adminSection === "biweekly_200"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-amber-50 text-amber-950 border border-amber-300"
                        }`}
                      >
                        🏆 ১০ দিনের জাতীয় বিসিএস পরীক্ষা (২০০ MCQ + বাল্ক ডক আপলোড)
                      </button>
                    )}

                    <button
                      onClick={() => setAdminSection("qbank")}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer ${
                        adminSection === "qbank" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      প্রশ্ন ব্যাংক আপলোড
                    </button>
                  </div>
                </div>

                {/* ADMIN SECTION 1: LECTURE UPLOADER */}
                {adminSection === "lectures" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
                      <h3 className="text-xl font-extrabold">
                        {editingId ? "✏️ লেকচার আপডেট করুন" : "➕ নতুন লেকচার আপলোড করুন"}
                      </h3>
                      <form onSubmit={handleSaveLecture} className="space-y-5 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border">
                          <div>
                            <label className="font-extrabold block mb-1">বিষয় (Subject) নির্বাচন করুন *</label>
                            <select
                              value={formData.subjectId}
                              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                              className="w-full p-3 border rounded-xl bg-white font-bold"
                            >
                              {(adminCourseTrack === "bcs" ? bcsSubjects : defenseSubjects).map((s) => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="font-extrabold block mb-1">লেকচার নম্বর (1, 2, 3...) *</label>
                            <input
                              type="number"
                              value={formData.lectureNo}
                              onChange={(e) => setFormData({ ...formData, lectureNo: e.target.value })}
                              className="w-full p-3 border rounded-xl bg-white font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-extrabold block mb-1">লেকচারের শিরোনাম (Title) *</label>
                          <input
                            type="text"
                            placeholder="যেমন: লেকচার ১: ধ্বনি ও বর্ণ প্রকরণ"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 border rounded-xl font-semibold"
                          />
                        </div>

                        {adminCourseTrack === "defense" && (
                          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                            <label className="font-extrabold text-[#2e1065] block">🎬 YouTube Unlisted লেকচার ভিডিও লিংক</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="https://youtu.be/xxxx"
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                className="sm:col-span-2 p-2.5 border rounded-xl bg-white"
                              />
                              <input
                                type="text"
                                placeholder="১৫ মিনিট"
                                value={formData.videoDuration}
                                onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                                className="p-2.5 border rounded-xl bg-white"
                              />
                            </div>
                          </div>
                        )}

                        {/* 1. Main Lecture */}
                        <div className="p-5 rounded-2xl bg-blue-50/50 border-2 border-blue-200 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-extrabold text-base text-blue-950">📘 ১. মূল লেকচার নোট (PDF + Text View)</h4>
                            <label className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-900 bg-white px-3 py-1.5 rounded-lg border border-blue-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.lectureTwoColumn}
                                onChange={(e) => setFormData({ ...formData, lectureTwoColumn: e.target.checked })}
                              />
                              <span>Text View ২-কলামে দেখান</span>
                            </label>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              placeholder="লেকচার PDF লিংক অথবা ফাইল আপলোড করুন..."
                              value={formData.lecturePdfUrl}
                              onChange={(e) => setFormData({ ...formData, lecturePdfUrl: e.target.value })}
                              className="flex-1 p-2.5 border rounded-xl bg-white"
                            />
                            <label className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-extrabold cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                              <Upload className="w-4 h-4" /> মূল লেকচার PDF আপলোড
                              <input type="file" accept="application/pdf" onChange={(e) => handleAdminPdfFileSelect(e, "lecturePdfUrl")} className="hidden" />
                            </label>
                          </div>
                          <RichTextColorEditor
                            label="📝 মূল লেকচার নোট — Text View (ইমেজ যুক্ত করলে শুধু ছোট {{IMG_1:right}} ট্যাগ বসবে)"
                            value={formData.mainContent}
                            onChange={(val) => setFormData({ ...formData, mainContent: val })}
                            embeddedImages={formData.embeddedImages}
                            onUpdateImages={(imgs) => setFormData({ ...formData, embeddedImages: imgs })}
                            placeholder="মূল লেকচার নোটের টেক্সট এখানে লিখুন..."
                            rows={5}
                          />
                        </div>

                        {/* 2. Chapter All MCQs */}
                        <div className="p-5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-extrabold text-base text-emerald-950">📗 ২. “এই Chapter-এর সকল MCQ” (PDF + ২-কলাম Text View)</h4>
                            <label className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.mcqTwoColumn}
                                onChange={(e) => setFormData({ ...formData, mcqTwoColumn: e.target.checked })}
                              />
                              <span>✓ ২-কলামে MCQ দেখান</span>
                            </label>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              placeholder="সকল MCQ PDF লিংক অথবা ফাইল আপলোড করুন..."
                              value={formData.mcqPdfUrl}
                              onChange={(e) => setFormData({ ...formData, mcqPdfUrl: e.target.value })}
                              className="flex-1 p-2.5 border rounded-xl bg-white"
                            />
                            <label className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-extrabold cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                              <Upload className="w-4 h-4" /> সকল MCQ PDF আপলোড
                              <input type="file" accept="application/pdf" onChange={(e) => handleAdminPdfFileSelect(e, "mcqPdfUrl")} className="hidden" />
                            </label>
                          </div>
                          <RichTextColorEditor
                            label="📝 এই Chapter-এর সকল MCQ — Text View"
                            value={formData.mcqTextContent}
                            onChange={(val) => setFormData({ ...formData, mcqTextContent: val })}
                            embeddedImages={formData.embeddedImages}
                            onUpdateImages={(imgs) => setFormData({ ...formData, embeddedImages: imgs })}
                            placeholder="অধ্যায়ভিত্তিক সকল MCQ এখানে পেস্ট করুন..."
                            rows={5}
                          />
                        </div>

                        {/* 3. Written Q&A (Shown in BCS Track) */}
                        {adminCourseTrack === "bcs" && (
                          <div className="p-5 rounded-2xl bg-purple-50/50 border-2 border-purple-200 space-y-4">
                            <h4 className="font-extrabold text-base text-purple-950">📙 ৩. “লিখিত প্রশ্ন ও উত্তর” (PDF + Text View)</h4>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                placeholder="লিখিত PDF লিংক অথবা ফাইল আপলোড করুন..."
                                value={formData.writtenPdfUrl}
                                onChange={(e) => setFormData({ ...formData, writtenPdfUrl: e.target.value })}
                                className="flex-1 p-2.5 border rounded-xl bg-white"
                              />
                              <label className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-extrabold cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                                <Upload className="w-4 h-4" /> লিখিত PDF আপলোড
                                <input type="file" accept="application/pdf" onChange={(e) => handleAdminPdfFileSelect(e, "writtenPdfUrl")} className="hidden" />
                              </label>
                            </div>
                            <RichTextColorEditor
                              label="📝 লিখিত প্রশ্ন ও উত্তর — Text View"
                              value={formData.writtenTextContent}
                              onChange={(val) => setFormData({ ...formData, writtenTextContent: val })}
                              embeddedImages={formData.embeddedImages}
                              onUpdateImages={(imgs) => setFormData({ ...formData, embeddedImages: imgs })}
                              placeholder="লিখিত প্রশ্নোত্তর এখানে পেস্ট করুন..."
                              rows={4}
                            />
                          </div>
                        )}

                        <button type="submit" className="premium-btn w-full py-4 bg-slate-900 text-white rounded-2xl text-base font-black hover:bg-black cursor-pointer shadow-lg">
                          {editingId ? "✓ আপডেট সেভ করুন" : "🚀 লেকচার পাবলিশ করুন"}
                        </button>
                      </form>
                    </div>

                    {/* RIGHT SIDEBAR: SUBJECT-FILTERED UPLOADED LECTURES LIST */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                          <Filter className="w-4 h-4 text-purple-700" /> সাবজেক্ট অনুযায়ী আপলোডকৃত লেকচার দেখুন
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          সাবজেক্ট সিলেক্ট করলেই সেই সাবজেক্টের অধীনে কয়টি লেকচার আছে তা দেখাবে
                        </p>
                      </div>

                      <select
                        value={adminLectureFilterSubject}
                        onChange={(e) => setAdminLectureFilterSubject(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-extrabold text-sm text-slate-900"
                      >
                        <option value="ALL">
                          সকল সাবজেক্ট ({lectures.filter((l) => (l.courseType || "bcs") === adminCourseTrack).length}টি লেকচার)
                        </option>
                        {(adminCourseTrack === "bcs" ? bcsSubjects : defenseSubjects).map((s) => {
                          const cnt = lectures.filter((l) => l.subjectId === s.id).length;
                          return (
                            <option key={s.id} value={s.id}>
                              {s.title} ({cnt}টি লেকচার)
                            </option>
                          );
                        })}
                      </select>

                      {(() => {
                        const filteredAdminLecs = lectures.filter(
                          (l) =>
                            (l.courseType || "bcs") === adminCourseTrack &&
                            (adminLectureFilterSubject === "ALL" || l.subjectId === adminLectureFilterSubject)
                        );

                        return (
                          <>
                            <div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-xs font-extrabold text-[#2e1065] flex justify-between">
                              <span>নির্বাচিত সাবজেক্টের লেকচার সংখ্যা:</span>
                              <span>{filteredAdminLecs.length}টি</span>
                            </div>

                            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                              {filteredAdminLecs.map((lec) => {
                                const lKey = lec._id || lec.id;
                                const subObj = [...bcsSubjects, ...defenseSubjects].find(
                                  (s) => s.id === lec.subjectId
                                );
                                return (
                                  <div key={lKey} className="p-4 rounded-2xl border bg-slate-50 space-y-2.5">
                                    <div className="text-xs font-extrabold text-purple-800">
                                      {subObj?.title || lec.subjectId} · Lec {lec.lectureNo}
                                    </div>
                                    <div className="font-extrabold text-sm text-slate-900">{lec.title}</div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditLectureClick(lec)}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-blue-700"
                                      >
                                        এডিট
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLecture(lKey)}
                                        className="p-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl cursor-pointer hover:bg-rose-100"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* ================= ADMIN SECTION 2: STORY VOCABULARY BUILDER (BCS ONLY) ================= */}
                {adminCourseTrack === "bcs" && adminSection === "vocab_stories" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-violet-200 space-y-5">
                      <div>
                        <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-900 text-xs font-extrabold">
                          English Grammar Special Feature
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                          📖 গল্পে গল্পে বিসিএস স্ট্যান্ডার্ড ভোকাবুলারি স্টোরি আপলোড করুন (২টি ভিজ্যুয়াল ইমেজসহ)
                        </h3>
                      </div>

                      <form onSubmit={handleSaveVocabStory} className="space-y-5 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="font-extrabold block mb-1">স্টোরি নম্বর *</label>
                            <input
                              type="number"
                              value={vocabFormData.storyNo}
                              onChange={(e) => setVocabFormData({ ...vocabFormData, storyNo: e.target.value })}
                              className="w-full p-3 border rounded-xl font-bold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="font-extrabold block mb-1">গল্পের শিরোনাম (Story Title) *</label>
                            <input
                              type="text"
                              placeholder="যেমন: Story 01: দ্য লস্ট কিংডম ও ৫০টি হাই-ফ্রিকোয়েন্সি বিসিএস ভোকাবুলারি"
                              value={vocabFormData.title}
                              onChange={(e) => setVocabFormData({ ...vocabFormData, title: e.target.value })}
                              className="w-full p-3 border rounded-xl font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-violet-50/60 border border-violet-200">
                          <div className="p-3.5 bg-white rounded-xl border space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-xs text-violet-950">🖼️ স্টোরি ইমেজ ১</span>
                              <select
                                value={vocabFormData.image1Position}
                                onChange={(e) => setVocabFormData({ ...vocabFormData, image1Position: e.target.value })}
                                className="text-xs font-bold border rounded px-2 py-1 bg-slate-50"
                              >
                                <option value="right">ডান পাশে (Right)</option>
                                <option value="left">বাম পাশে (Left)</option>
                                <option value="top">উপরে বড় (Top)</option>
                              </select>
                            </div>
                            <label className="w-full py-2 bg-violet-700 text-white rounded-lg text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" /> ইমেজ ১ আপলোড করুন
                              <input type="file" accept="image/*" onChange={(e) => handleVocabStoryImageUpload(e, "image1Url")} className="hidden" />
                            </label>
                            {vocabFormData.image1Url && (
                              <div className="text-[11px] font-bold text-emerald-700">✓ ইমেজ ১ যুক্ত হয়েছে</div>
                            )}
                          </div>

                          <div className="p-3.5 bg-white rounded-xl border space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-xs text-violet-950">🖼️ স্টোরি ইমেজ ২</span>
                              <select
                                value={vocabFormData.image2Position}
                                onChange={(e) => setVocabFormData({ ...vocabFormData, image2Position: e.target.value })}
                                className="text-xs font-bold border rounded px-2 py-1 bg-slate-50"
                              >
                                <option value="left">বাম পাশে (Left)</option>
                                <option value="right">ডান পাশে (Right)</option>
                                <option value="bottom">নিচে বড় (Bottom)</option>
                              </select>
                            </div>
                            <label className="w-full py-2 bg-violet-700 text-white rounded-lg text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" /> ইমেজ ২ আপলোড করুন
                              <input type="file" accept="image/*" onChange={(e) => handleVocabStoryImageUpload(e, "image2Url")} className="hidden" />
                            </label>
                            {vocabFormData.image2Url && (
                              <div className="text-[11px] font-bold text-emerald-700">✓ ইমেজ ২ যুক্ত হয়েছে</div>
                            )}
                          </div>
                        </div>

                        <RichTextColorEditor
                          label="📖 মূল গল্পের টেক্সট (কালার গ্রেডিং, বোল্ড ও ফন্ট +/- করুন)"
                          value={vocabFormData.storyContent}
                          onChange={(val) => setVocabFormData({ ...vocabFormData, storyContent: val })}
                          embeddedImages={vocabFormData.embeddedImages}
                          onUpdateImages={(imgs) => setVocabFormData({ ...vocabFormData, embeddedImages: imgs })}
                          placeholder="এখানে গল্পটি লিখুন..."
                          rows={7}
                        />

                        <RichTextColorEditor
                          label="📝 শব্দের অর্থ ও Synonym/Antonym বক্স (গল্পের নিচে ২-কলামে দেখাবে)"
                          value={vocabFormData.wordMeaningBox}
                          onChange={(val) => setVocabFormData({ ...vocabFormData, wordMeaningBox: val })}
                          embeddedImages={vocabFormData.embeddedImages}
                          onUpdateImages={(imgs) => setVocabFormData({ ...vocabFormData, embeddedImages: imgs })}
                          placeholder="গল্পে ব্যবহৃত ভোকাবুলারিগুলোর বাংলা অর্থ ও সিনোনিম এখানে দিন..."
                          rows={4}
                        />

                        <button type="submit" className="premium-btn w-full py-4 bg-violet-800 text-white rounded-2xl text-base font-black hover:bg-violet-950 cursor-pointer shadow-lg">
                          {editingVocabId ? "✓ স্টোরি আপডেট করুন" : "🚀 ভোকাবুলারি স্টোরি পাবলিশ করুন"}
                        </button>
                      </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-extrabold text-base">আপলোডকৃত ভোকাবুলারি স্টোরি ({vocabStories.length}টি)</h4>
                      {vocabStories.map((st) => {
                        const sId = st._id || st.id;
                        return (
                          <div key={sId} className="p-3.5 rounded-xl border bg-slate-50 space-y-2">
                            <div className="text-xs font-extrabold text-violet-700">Story #{st.storyNo}</div>
                            <div className="font-extrabold text-sm">{st.title}</div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingVocabId(sId);
                                  setVocabFormData({
                                    storyNo: st.storyNo,
                                    title: st.title,
                                    subtitle: st.subtitle || "",
                                    storyContent: st.storyContent || "",
                                    image1Url: st.image1Url || "",
                                    image1Position: st.image1Position || "right",
                                    image2Url: st.image2Url || "",
                                    image2Position: st.image2Position || "left",
                                    wordMeaningBox: st.wordMeaningBox || "",
                                    embeddedImages: st.embeddedImages || {},
                                  });
                                }}
                                className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                এডিট
                              </button>
                              <button onClick={() => handleDeleteVocabStory(sId)} className="p-1.5 bg-rose-50 text-rose-600 border rounded-lg cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ================= ADMIN SECTION 3: CHAPTER TEST 1 & TEST 2 (50 QUESTIONS + BULK IMPORTER) ================= */}
                {adminSection === "exam_builder" && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
                    <h3 className="text-xl font-extrabold">
                      🎯 অধ্যায়ভিত্তিক MCQ পরীক্ষা সেট করুন (Test 1 ও Test 2)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm">
                      <div>
                        <label className="font-extrabold block mb-1">১. Subject *</label>
                        <select
                          value={examBuilderMeta.subjectId}
                          onChange={(e) => setExamBuilderMeta({ ...examBuilderMeta, subjectId: e.target.value })}
                          className="w-full p-3 border rounded-xl bg-white font-extrabold"
                        >
                          {(adminCourseTrack === "bcs" ? bcsSubjects : defenseSubjects).map((s) => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-extrabold block mb-1">২. লেকচার নম্বর *</label>
                        <input
                          type="number"
                          min={1}
                          value={examBuilderMeta.lectureNo}
                          onChange={(e) => setExamBuilderMeta({ ...examBuilderMeta, lectureNo: Number(e.target.value) })}
                          className="w-full p-3 border rounded-xl bg-white font-extrabold"
                        />
                      </div>
                      <div>
                        <label className="font-extrabold block mb-1">৩. Chapter / Lecture Name *</label>
                        <input
                          type="text"
                          value={examBuilderMeta.chapterName}
                          onChange={(e) => setExamBuilderMeta({ ...examBuilderMeta, chapterName: e.target.value })}
                          className="w-full p-3 border rounded-xl bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-extrabold block mb-1">৪. টেস্ট নম্বর *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setExamBuilderMeta({ ...examBuilderMeta, testNumber: 1 })}
                            className={`py-3 rounded-xl font-black text-xs cursor-pointer ${
                              examBuilderMeta.testNumber === 1 ? "bg-slate-900 text-white" : "bg-white border"
                            }`}
                          >
                            Test 1
                          </button>
                          <button
                            type="button"
                            onClick={() => setExamBuilderMeta({ ...examBuilderMeta, testNumber: 2 })}
                            className={`py-3 rounded-xl font-black text-xs cursor-pointer ${
                              examBuilderMeta.testNumber === 2 ? "bg-slate-900 text-white" : "bg-white border"
                            }`}
                          >
                            Test 2
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                          ⚡ ১-ক্লিকে বাল্ক ফাইল (.txt / .json) বা ডক টেক্সট থেকে প্রশ্ন অটো-ফিলআপ করুন:
                        </span>
                        <label className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-4 h-4" /> প্রশ্ন ফাইল (.txt / .json) আপলোড করুন
                          <input
                            type="file"
                            accept=".txt,.json"
                            onChange={(e) => handleBulkFileUploadForQuestions(e, "50_SET")}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <textarea
                        rows={3}
                        value={bulk50TextInput}
                        onChange={(e) => setBulk50TextInput(e.target.value)}
                        placeholder={`অথবা ডক ফাইল থেকে কপি করে এখানে পেস্ট করুন:\nQ: বাংলাদেশের প্রাচীনতম জনপদ কোনটি?\nA: পুণ্ড্র\nB: হরিকেল\nC: সমতট\nD: বঙ্গ\nAns: A\nExp: পুণ্ড্র হলো প্রাচীনতম জনপদ।`}
                        className="w-full p-3 border rounded-xl bg-white text-xs font-mono"
                      />
                      {bulk50TextInput.trim() && (
                        <button
                          type="button"
                          onClick={() => handleBulkFill50Slots(bulk50TextInput)}
                          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                        >
                          ✓ টেক্সট থেকে ১-৫০ স্লটে প্রশ্নগুলো বসিয়ে দিন
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 bg-slate-100 p-3 rounded-xl">
                      {["1-10", "11-20", "21-30", "31-40", "41-50", "ALL"].map((rng) => (
                        <button
                          key={rng}
                          type="button"
                          onClick={() => setActiveSlotRange(rng)}
                          className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer ${
                            activeSlotRange === rng ? "bg-slate-900 text-white" : "bg-white border"
                          }`}
                        >
                          প্রশ্ন {rng}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handlePublishExamSet} className="space-y-4">
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                        {template50Questions
                          .filter((item) => {
                            if (activeSlotRange === "ALL") return true;
                            const [min, max] = activeSlotRange.split("-").map(Number);
                            return item.qNo >= min && item.qNo <= max;
                          })
                          .map((slot) => (
                            <div key={slot.qNo} className="p-4 rounded-2xl border bg-slate-50 space-y-2.5">
                              <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-black">
                                প্রশ্ন #{slot.qNo}
                              </span>
                              <input
                                type="text"
                                placeholder={`প্রশ্ন #${slot.qNo} লিখুন...`}
                                value={slot.question}
                                onChange={(e) => updateTemplateSlot(slot.qNo, "question", e.target.value)}
                                className="w-full p-2.5 border rounded-xl bg-white text-sm font-bold"
                              />
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {["ক", "খ", "গ", "ঘ"].map((lbl, idx) => (
                                  <input
                                    key={idx}
                                    type="text"
                                    placeholder={`অপশন ${lbl}`}
                                    value={slot.options[idx]}
                                    onChange={(e) => updateTemplateSlot(slot.qNo, "options", e.target.value, idx)}
                                    className="p-2 border rounded-xl bg-white text-xs font-semibold"
                                  />
                                ))}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <select
                                  value={slot.correctAnswer}
                                  onChange={(e) => updateTemplateSlot(slot.qNo, "correctAnswer", Number(e.target.value))}
                                  className="p-2 border rounded-xl bg-white text-xs font-extrabold"
                                >
                                  <option value={0}>সঠিক: ক</option>
                                  <option value={1}>সঠিক: খ</option>
                                  <option value={2}>সঠিক: গ</option>
                                  <option value={3}>সঠিক: ঘ</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="ভুল উত্তরের ব্যাখ্যা..."
                                  value={slot.explanation}
                                  onChange={(e) => updateTemplateSlot(slot.qNo, "explanation", e.target.value)}
                                  className="sm:col-span-2 p-2 border rounded-xl bg-white text-xs"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                      <button type="submit" className="premium-btn w-full py-4 bg-emerald-600 text-white rounded-2xl text-base font-black cursor-pointer">
                        🚀 Publish Test {examBuilderMeta.testNumber}
                      </button>
                    </form>
                  </div>
                )}

                {/* ================= ADMIN SECTION 4: 10-DAY 200-MCQ NATIONAL CONTEST BUILDER (STRICTLY BCS ONLY!) ================= */}
                {adminCourseTrack === "bcs" && adminSection === "biweekly_200" && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-amber-400 space-y-6">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black">
                        প্রতি ১০ দিনে ১টি জাতীয় পরীক্ষা (১০, ২০ এবং মাসের শেষ তারিখ ২৮/২৯/৩০) · ২০০টি MCQ প্রশ্ন
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                        🏆 বিসিএস স্ট্যান্ডার্ড অল সাবজেক্টস কম্বাইনড পরীক্ষা সেটআপ (১ - ২০০ নম্বর প্রশ্ন)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        বাল্ক ফাইল বা ডক টেক্সট আপলোড করলেই ১–২৫, ২৬–৫০... ২০০ পর্যন্ত স্বয়ংক্রিয়ভাবে বসে যাবে এবং প্রতি ২৫টি প্রশ্নের জন্য সাবজেক্ট নির্ধারণ করে দিতে পারবেন।
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm">
                      <div className="sm:col-span-2">
                        <label className="font-extrabold block mb-1">পরীক্ষার শিরোনাম *</label>
                        <input
                          type="text"
                          value={contestBuilderMeta.title}
                          onChange={(e) => setContestBuilderMeta({ ...contestBuilderMeta, title: e.target.value })}
                          className="w-full p-3 border rounded-xl bg-white font-bold"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 p-3 rounded-xl bg-white border w-full cursor-pointer font-extrabold text-xs text-rose-700">
                          <input
                            type="checkbox"
                            checked={contestBuilderMeta.resetSubmissions}
                            onChange={(e) =>
                              setContestBuilderMeta({ ...contestBuilderMeta, resetSubmissions: e.target.checked })
                            }
                          />
                          <span>নতুন ১০ দিনের পর্ব শুরু করুন (আগের লিডারবোর্ড রিসেট)</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-amber-300 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5" />
                            ⚡ বাল্ক প্রশ্ন আপলোডার (১–২০০টি প্রশ্ন অথবা বর্তমান ২৫টি প্রশ্নের ব্লক এক ক্লিকে বসান)
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            ডক বা নোটপ্যাড ফাইল (.txt / .json) আপলোড করুন অথবা নিচে কপি-পেস্ট করুন—প্রশ্ন, অপশন, সঠিক উত্তর ও ব্যাখ্যা সঠিক পজিশনে বসে যাবে!
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <label className="px-4 py-2.5 bg-amber-400 text-slate-950 rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5">
                            <Upload className="w-4 h-4" /> ২০০ প্রশ্নের ফাইল আপলোড
                            <input
                              type="file"
                              accept=".txt,.json"
                              onChange={(e) => handleBulkFileUploadForQuestions(e, "200_ALL")}
                              className="hidden"
                            />
                          </label>
                          <label className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5">
                            <Upload className="w-4 h-4" /> শুধু "{active200Range}" ব্লকে ফাইল আপলোড
                            <input
                              type="file"
                              accept=".txt,.json"
                              onChange={(e) => handleBulkFileUploadForQuestions(e, "200_BLOCK")}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        value={bulk200TextInput}
                        onChange={(e) => setBulk200TextInput(e.target.value)}
                        placeholder={`ডক ফাইল থেকে প্রশ্ন কপি করে এখানে পেস্ট করুন (প্রতিটি প্রশ্নের মাঝে ১ লাইন ফাঁকা রাখুন):\n\nQ: চর্যাপদ কোন ছন্দে রচিত?\nA: মাত্রাবৃত্ত\nB: অক্ষরবৃত্ত\nC: স্বরবৃত্ত\nD: গদ্যছন্দ\nAns: A\nExp: আধুনিক ছন্দের বিচারে চর্যাপদ মাত্রাবৃত্ত ছন্দে রচিত।`}
                        className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-mono outline-none"
                      />

                      {bulk200TextInput.trim() && (
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleBulkFill200Slots(bulk200TextInput, "CURRENT_25_BLOCK")}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer"
                          >
                            ✓ বর্তমান "{active200Range}" ব্লকের ২৫টি স্লটে বসান
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBulkFill200Slots(bulk200TextInput, "ALL")}
                            className="px-4 py-2 bg-amber-400 text-slate-950 rounded-xl text-xs font-black cursor-pointer"
                          >
                            ✓ ১ থেকে ২০০ নম্বর স্লটে ধারাবাহিকভাবে বসান
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "1-25",
                            "26-50",
                            "51-75",
                            "76-100",
                            "101-125",
                            "126-150",
                            "151-175",
                            "176-200",
                          ].map((rng) => (
                            <button
                              key={rng}
                              type="button"
                              onClick={() => setActive200Range(rng)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                                active200Range === rng
                                  ? "bg-slate-900 text-amber-300 shadow-xs"
                                  : "bg-white text-slate-800 border"
                              }`}
                            >
                              প্রশ্ন {rng}
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-950">
                          পূরণকৃত প্রশ্ন: {template200Questions.filter((q) => q.question.trim() !== "").length} / ২০০টি
                        </span>
                      </div>

                      {(() => {
                        const [minQ] = active200Range.split("-").map(Number);
                        const currentBlockSample = template200Questions.find((q) => q.qNo === minQ);
                        return (
                          <div className="p-3.5 rounded-xl bg-white border-2 border-purple-300 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-black text-[#2e1065] uppercase">
                                📌 প্রশ্ন {active200Range} (এই ২৫টি প্রশ্নের সাবজেক্ট নির্ধারণ করুন):
                              </span>
                            </div>
                            <select
                              value={currentBlockSample?.subjectId || "bangla"}
                              onChange={(e) => assignSubjectTo25Block(active200Range, e.target.value)}
                              className="px-4 py-2.5 rounded-xl border-2 border-[#2e1065] bg-purple-50 text-[#2e1065] font-black text-xs sm:text-sm"
                            >
                              {bcsSubjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title} (প্রশ্ন {active200Range})
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })()}
                    </div>

                    <form onSubmit={handlePublish200Contest} className="space-y-4">
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                        {template200Questions
                          .filter((item) => {
                            const [min, max] = active200Range.split("-").map(Number);
                            return item.qNo >= min && item.qNo <= max;
                          })
                          .map((slot) => (
                            <div key={slot.qNo} className="p-4 rounded-2xl border bg-slate-50 space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="px-3 py-1 rounded-lg bg-slate-900 text-amber-300 text-xs font-black">
                                  জাতীয় পরীক্ষা · প্রশ্ন #{slot.qNo}
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-purple-100 text-[#2e1065] text-xs font-extrabold">
                                  সাবজেক্ট: {slot.subjectTitle}
                                </span>
                              </div>

                              <input
                                type="text"
                                placeholder={`প্রশ্ন #${slot.qNo} এখানে লিখুন...`}
                                value={slot.question}
                                onChange={(e) => update200TemplateSlot(slot.qNo, "question", e.target.value)}
                                className="w-full p-2.5 border rounded-xl bg-white text-sm font-bold"
                              />

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {["ক", "খ", "গ", "ঘ"].map((lbl, idx) => (
                                  <input
                                    key={idx}
                                    type="text"
                                    placeholder={`অপশন ${lbl}`}
                                    value={slot.options[idx]}
                                    onChange={(e) => update200TemplateSlot(slot.qNo, "options", e.target.value, idx)}
                                    className="p-2 border rounded-xl bg-white text-xs font-semibold"
                                  />
                                ))}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <select
                                  value={slot.correctAnswer}
                                  onChange={(e) => update200TemplateSlot(slot.qNo, "correctAnswer", Number(e.target.value))}
                                  className="p-2 border rounded-xl bg-white text-xs font-extrabold text-emerald-800"
                                >
                                  <option value={0}>সঠিক উত্তর: ক</option>
                                  <option value={1}>সঠিক উত্তর: খ</option>
                                  <option value={2}>সঠিক উত্তর: গ</option>
                                  <option value={3}>সঠিক উত্তর: ঘ</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="ভুল উত্তরের ব্যাখ্যা লিখুন..."
                                  value={slot.explanation}
                                  onChange={(e) => update200TemplateSlot(slot.qNo, "explanation", e.target.value)}
                                  className="sm:col-span-2 p-2 border rounded-xl bg-white text-xs"
                                />
                              </div>
                            </div>
                          ))}
                      </div>

                      <button type="submit" className="premium-btn w-full py-4 bg-amber-400 text-slate-950 rounded-2xl text-base font-black hover:bg-amber-300 cursor-pointer shadow-lg">
                        🚀 ১০ দিনের জাতীয় বিসিএস পরীক্ষা (২০০ MCQ) Publish করুন
                      </button>
                    </form>
                  </div>
                )}

                {/* ADMIN SECTION 5: QUESTION BANK */}
                {adminSection === "qbank" && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
                    <h3 className="text-xl font-extrabold">প্রশ্ন ব্যাংক আপলোড (PDF + Color Text View)</h3>
                    <form onSubmit={handleSaveQbankDoc} className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select
                          value={qbFormData.subjectId}
                          onChange={(e) => setQbFormData({ ...qbFormData, subjectId: e.target.value })}
                          className="p-3 border rounded-xl bg-slate-50 font-bold"
                        >
                          {(adminCourseTrack === "bcs" ? bcsSubjects : defenseSubjects).map((s) => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="ব্যাচ বা উপ-শিরোনাম (যেমন: প্রশ্ন ব্যাংক ও সমাধান)"
                          value={qbFormData.bcsBatch}
                          onChange={(e) => setQbFormData({ ...qbFormData, bcsBatch: e.target.value })}
                          className="p-3 border rounded-xl font-semibold"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="প্রশ্ন ব্যাংকের শিরোনাম *"
                        value={qbFormData.title}
                        onChange={(e) => setQbFormData({ ...qbFormData, title: e.target.value })}
                        className="w-full p-3 border rounded-xl font-bold"
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="PDF লিংক..."
                          value={qbFormData.pdfUrl}
                          onChange={(e) => setQbFormData({ ...qbFormData, pdfUrl: e.target.value })}
                          className="flex-1 p-2.5 border rounded-xl"
                        />
                        <label className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-extrabold cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-4 h-4" /> PDF ফাইল নিন
                          <input type="file" accept="application/pdf" onChange={(e) => handleAdminPdfFileSelect(e, "pdfUrl", true)} className="hidden" />
                        </label>
                      </div>
                      <RichTextColorEditor
                        label="📝 প্রশ্ন ব্যাংক — Text View"
                        value={qbFormData.textContent}
                        onChange={(val) => setQbFormData({ ...qbFormData, textContent: val })}
                        embeddedImages={qbFormData.embeddedImages}
                        onUpdateImages={(imgs) => setQbFormData({ ...qbFormData, embeddedImages: imgs })}
                        placeholder="প্রশ্ন ব্যাংকের টেক্সট এখানে লিখুন..."
                        rows={5}
                      />
                      <button type="submit" className="premium-btn w-full py-3.5 bg-slate-900 text-white rounded-xl font-extrabold cursor-pointer">
                        🚀 প্রশ্ন ব্যাংক পাবলিশ করুন
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= MOBILE STICKY BOTTOM NAVIGATION BAR (MATCHES IMAGE 2) ================= */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 h-16 px-6 flex md:hidden items-center justify-around z-40 shadow-lg">
        <button
          onClick={() => navigateTo("dashboard")}
          className={`flex flex-col items-center gap-1 text-xs font-extrabold cursor-pointer ${
            activeTab === "dashboard" ? "text-[#4c1d95]" : "text-slate-500"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>হোম</span>
          {activeTab === "dashboard" && <span className="w-1.5 h-1.5 rounded-full bg-[#4c1d95]" />}
        </button>

        <button
          onClick={() => navigateTo("subject_lectures")}
          className={`flex flex-col items-center gap-1 text-xs font-extrabold cursor-pointer ${
            activeTab === "subject_lectures" ? "text-[#4c1d95]" : "text-slate-500"
          }`}
        >
          <PlayCircle className="w-5 h-5" />
          <span>লেকচার</span>
          {activeTab === "subject_lectures" && <span className="w-1.5 h-1.5 rounded-full bg-[#4c1d95]" />}
        </button>

        <button
          onClick={() => navigateTo("mock_test_hub")}
          className={`flex flex-col items-center gap-1 text-xs font-extrabold cursor-pointer ${
            activeTab === "mock_test_hub" || activeTab === "active_exam_room" ? "text-[#4c1d95]" : "text-slate-500"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>পরীক্ষা</span>
          {(activeTab === "mock_test_hub" || activeTab === "active_exam_room") && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4c1d95]" />
          )}
        </button>

        <button
          onClick={() => setShowProfileEditModal(true)}
          className="flex flex-col items-center gap-1 text-xs font-extrabold text-slate-500 cursor-pointer"
        >
          <User className="w-5 h-5" />
          <span>প্রোফাইল</span>
        </button>
      </nav>

      {/* ================= 10-DAY NATIONAL EXAM REGISTRATION MODAL ================= */}
      {showContestRegModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 border-2 border-[#2e1065]">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black">
                ১০ দিনের জাতীয় বিসিএস প্রিলি পরীক্ষা (২০০ নম্বর)
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                📝 পরীক্ষার রেজিস্ট্রেশন সম্পন্ন করুন
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                রেজিস্টার করলেই আপনার সামনে ২০০ প্রশ্নের এক্সাম পেপার ওপেন হবে এবং লিডারবোর্ডে আপনার নাম ও প্রতিষ্ঠান যুক্ত হবে।
              </p>
            </div>

            <form onSubmit={handleContestRegistrationSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="font-extrabold block mb-1 text-slate-800">১. আপনার পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Amir Hamza"
                  value={contestRegForm.name}
                  onChange={(e) => setContestRegForm({ ...contestRegForm, name: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-extrabold block mb-1 text-slate-800">২. মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  placeholder="যেমন: 017XXXXXXXX"
                  value={contestRegForm.phone}
                  onChange={(e) => setContestRegForm({ ...contestRegForm, phone: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-extrabold block mb-1 text-slate-800">৩. শিক্ষাপ্রতিষ্ঠান (বিশ্ববিদ্যালয় / কলেজ) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Metropolitan University, Sylhet"
                  value={contestRegForm.institution}
                  onChange={(e) => setContestRegForm({ ...contestRegForm, institution: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContestRegModal(false)}
                  className="flex-1 py-3 border border-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="premium-btn flex-1 py-3 bg-[#2e1065] text-amber-300 rounded-xl font-black cursor-pointer shadow-lg"
                >
                  ✓ রেজিস্টার ও পরীক্ষা শুরু
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN PDF VIEWER MODAL */}
      {isPdfFullscreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="h-14 px-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="font-extrabold text-sm truncate">
              📄 {activeTab === "qbank" ? activeQbankDoc?.title : activeLecture?.title} — ফুলস্ক্রিন ভিউ
            </div>
            <button onClick={() => setIsPdfFullscreen(false)} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold cursor-pointer">
              <Minimize2 className="w-4 h-4 inline mr-1" /> বন্ধ করুন
            </button>
          </div>
          <div className="flex-1 bg-white">
            <iframe
              src={formatSecurePdfUrl(
                activeTab === "qbank"
                  ? activeQbankDoc?.pdfUrl
                  : activePdfStep === "mcq_pdf"
                  ? activeLecture?.mcqPdfUrl
                  : activePdfStep === "written_pdf"
                  ? activeLecture?.writtenPdfUrl
                  : activeLecture?.lecturePdfUrl
              )}
              className="w-full h-full border-0"
              title="Fullscreen PDF"
            />
          </div>
        </div>
      )}

      {/* STUDENT PROFILE MODAL */}
      {showProfileEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-extrabold">শিক্ষার্থী প্রোফাইল আপডেট</h3>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="আপনার নাম"
              className="w-full p-3 border rounded-xl font-bold"
            />
            <input
              type="tel"
              value={profile.phone || ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="মোবাইল নম্বর"
              className="w-full p-3 border rounded-xl font-bold"
            />
            <input
              type="text"
              value={profile.institution}
              onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
              placeholder="শিক্ষাপ্রতিষ্ঠানের নাম"
              className="w-full p-3 border rounded-xl"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowProfileEditModal(false)} className="flex-1 py-3 border rounded-xl font-bold cursor-pointer">বাতিল</button>
              <button
                onClick={() => {
                  updateProfile(profile);
                  setShowProfileEditModal(false);
                }}
                className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-extrabold cursor-pointer"
              >
                সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}