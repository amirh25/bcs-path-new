/**
 * ============================================================================
 * FILE: src/lib/questionParser.js
 * PURPOSE: Word(.docx) / .txt / .csv / .json ফাইল বা পেস্ট করা টেক্সট থেকে
 *          প্রশ্ন + ৪টি অপশন + সঠিক উত্তর + ব্যাখ্যা স্বয়ংক্রিয়ভাবে আলাদা করা।
 * ============================================================================
 */
import { normalizeDigits } from "@/lib/examSchedule";

const LETTER_IDX = { ক: 0, খ: 1, গ: 2, ঘ: 3, a: 0, b: 1, c: 2, d: 3 };
const idxOfLetter = (ch) => {
  const s = normalizeDigits(String(ch ?? "").trim());
  if (/^[1-4]$/.test(s)) return Number(s) - 1;
  return LETTER_IDX[s] ?? LETTER_IDX[s.toLowerCase()] ?? null;
};

const ANS_RE =
  /^(?:সঠিক\s*উত্তর|উত্তর|Correct\s*Answer|Answer|Ans|Correct)\s*[:：ঃ\-–=.]?\s*\(?\s*([কখগঘA-Da-d1-4])\s*\)?(?![A-Za-z\u0980-\u09FF])(.*)$/i;
const EXP_RE = /^(?:ব্যাখ্যা|Explanation|Exp)\s*[:：ঃ\-–]\s*(.*)$/i;
const QSTART_RE = /^(?:প্রশ্ন\s*)?(?:Q\.?\s*)?(\d{1,3})\s*[.)।:]\s*(.+)$/i;
const OPT_RE = /^\(?([কখগঘA-Da-d])\s*[).।:]\s*(.*)$/;

function inlineOptions(line) {
  const re = /(?:^|\s)\(?([কখগঘA-Da-d])\)\s*/g;
  const marks = [];
  let m;
  while ((m = re.exec(line))) marks.push({ letter: m[1], start: m.index, end: re.lastIndex });
  if (marks.length < 2) return null;
  const items = marks.map((mk, i) => ({
    letter: mk.letter,
    text: line.slice(mk.end, marks[i + 1] ? marks[i + 1].start : line.length).trim(),
  }));
  return { prefix: line.slice(0, marks[0].start).trim(), items };
}

function finalize(list) {
  const warnings = [];
  const questions = list.map((q, i) => {
    const warn = [];
    if (!q.question) warn.push("প্রশ্ন নেই");
    const filled = q.options.filter(Boolean).length;
    if (filled < 4) warn.push(`অপশন ${filled}/৪`);
    if (q.correctAnswer == null) warn.push("সঠিক উত্তর পাওয়া যায়নি (ডিফল্ট: ক)");
    if (warn.length) warnings.push({ index: i + 1, text: warn.join(", ") });
    return {
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctAnswer: q.correctAnswer ?? 0,
      explanation: (q.explanation || "").trim(),
    };
  });
  return { questions, warnings };
}

/** টেক্সট ফরম্যাট:  ১. প্রশ্ন  /  ক) ...  খ) ...  /  উত্তর: খ  /  ব্যাখ্যা: ... */
export function parseQuestionsText(raw) {
  const lines = String(raw || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const out = [];
  let cur = null;
  let mode = "q";
  let lastOpt = -1;
  const mk = () => ({ question: "", options: ["", "", "", ""], correctAnswer: null, explanation: "" });
  const flush = () => {
    if (cur && (cur.question || cur.options.some(Boolean))) out.push(cur);
    cur = null;
  };
  const setOpt = (letter, text) => {
    const i = idxOfLetter(letter);
    if (i == null) return false;
    cur.options[i] = text.trim();
    lastOpt = i;
    mode = "opt";
    return true;
  };

  for (const line of lines) {
    const n = normalizeDigits(line); // একই দৈর্ঘ্য — তাই ইনডেক্স মিলে যায়
    let m;

    if (cur && (m = ANS_RE.exec(n))) {
      cur.correctAnswer = idxOfLetter(m[1]);
      mode = "ans";
      const rest = line.slice(n.length - (m[2] || "").length).trim();
      const e = /(?:ব্যাখ্যা|Explanation|Exp)\s*[:：ঃ\-–]\s*(.*)$/i.exec(rest);
      if (e) {
        cur.explanation = e[1];
        mode = "exp";
      }
      continue;
    }
    if (cur && (m = EXP_RE.exec(line))) {
      cur.explanation = m[1];
      mode = "exp";
      continue;
    }
    if ((m = QSTART_RE.exec(n)) && (!cur || cur.options.some(Boolean) || cur.correctAnswer !== null)) {
      flush();
      cur = mk();
      cur.question = line.slice(n.length - m[2].length).trim();
      mode = "q";
      lastOpt = -1;
      continue;
    }
    const inl = inlineOptions(line);
    if (inl) {
      if (!cur) cur = mk();
      if (inl.prefix && mode === "q") cur.question += (cur.question ? " " : "") + inl.prefix;
      inl.items.forEach((it) => setOpt(it.letter, it.text));
      continue;
    }
    if ((m = OPT_RE.exec(line))) {
      if (!cur) cur = mk();
      if (setOpt(m[1], m[2])) continue;
    }
    if (!cur) cur = mk();
    if (mode === "exp" || mode === "ans") cur.explanation += (cur.explanation ? " " : "") + line;
    else if (mode === "opt" && lastOpt >= 0) cur.options[lastOpt] += " " + line;
    else cur.question += (cur.question ? " " : "") + line;
  }
  flush();
  return finalize(out);
}

function parseCsvRows(text) {
  const first = text.split("\n", 1)[0] || "";
  const delim = (first.match(/\t/g) || []).length > (first.match(/,/g) || []).length ? "\t" : ",";
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

function answerFromCell(cell, options) {
  const t = String(cell ?? "").trim();
  const byLetter = idxOfLetter(t.replace(/[).]/g, ""));
  if (byLetter != null) return byLetter;
  const byText = options.findIndex((o) => o.trim() && o.trim() === t);
  return byText >= 0 ? byText : null;
}

/** CSV/Excel-এ Save As CSV করা ফাইল: প্রশ্ন, ক, খ, গ, ঘ, উত্তর, ব্যাখ্যা */
export function parseCsv(text) {
  const rows = parseCsvRows(String(text || "").replace(/^\ufeff/, ""));
  let cols = { q: 0, o: [1, 2, 3, 4], a: 5, e: 6 };
  if (rows.length && /প্রশ্ন|question/i.test(rows[0].join(" "))) {
    const h = rows.shift().map((x) => x.trim());
    const find = (re) => h.findIndex((x) => re.test(x));
    const o = ["ক", "খ", "গ", "ঘ"].map((bn, i) => find(new RegExp(`^(?:অপশন\\s*|option\\s*)?(?:${bn}|${"abcd"[i]})\\)?$`, "i")));
    cols = {
      q: Math.max(0, find(/প্রশ্ন|question/i)),
      o: o.every((x) => x >= 0) ? o : cols.o,
      a: find(/উত্তর|answer/i) >= 0 ? find(/উত্তর|answer/i) : 5,
      e: find(/ব্যাখ্যা|explanation/i) >= 0 ? find(/ব্যাখ্যা|explanation/i) : 6,
    };
  }
  const list = rows.map((r) => {
    const options = cols.o.map((i) => (r[i] || "").trim());
    return {
      question: (r[cols.q] || "").trim(),
      options,
      correctAnswer: answerFromCell(r[cols.a], options),
      explanation: (r[cols.e] || "").trim(),
    };
  });
  return finalize(list.filter((q) => q.question));
}

/** JSON: [{ "question": "...", "options": ["..","..","..",".."], "answer": "খ" | 2, "explanation": "..." }] */
export function parseJson(text) {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.questions || [];
  return finalize(
    arr.map((x) => {
      const options = (x.options || x["অপশন"] || []).map(String).concat(["", "", "", ""]).slice(0, 4);
      return {
        question: String(x.question || x["প্রশ্ন"] || ""),
        options,
        correctAnswer: answerFromCell(x.answer ?? x.correctAnswer ?? x["উত্তর"], options),
        explanation: String(x.explanation || x["ব্যাখ্যা"] || ""),
      };
    })
  );
}

export async function parseQuestionFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) {
    const mod = await import("mammoth/mammoth.browser");
    const mammoth = mod.default || mod;
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return parseQuestionsText(value);
  }
  const text = await file.text();
  if (name.endsWith(".csv") || name.endsWith(".tsv")) return parseCsv(text);
  if (name.endsWith(".json")) return parseJson(text);
  if (name.endsWith(".txt") || name.endsWith(".md")) return parseQuestionsText(text);
  throw new Error("সাপোর্টেড ফাইল: .docx, .txt, .csv, .json — PDF হলে টেক্সট কপি করে নিচের বক্সে পেস্ট করুন।");
}

export const SAMPLE_TXT = `১. বাংলাদেশের জাতীয় ফুল কোনটি?
ক) গোলাপ
খ) শাপলা
গ) জবা
ঘ) বেলি
উত্তর: খ
ব্যাখ্যা: শাপলা বাংলাদেশের জাতীয় ফুল।

২. Choose the synonym of "Abundant":
A) Scarce
B) Plentiful
C) Rare
D) Tiny
Answer: B
Explanation: Abundant means plentiful.
`;

export const SAMPLE_CSV =
  "\ufeffপ্রশ্ন,ক,খ,গ,ঘ,উত্তর,ব্যাখ্যা\n" +
  "বাংলাদেশের জাতীয় ফুল কোনটি?,গোলাপ,শাপলা,জবা,বেলি,খ,শাপলা বাংলাদেশের জাতীয় ফুল।\n" +
  '"Synonym of ""Abundant""?",Scarce,Plentiful,Rare,Tiny,খ,Abundant means plentiful.\n';
