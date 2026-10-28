/**
 * scripts/apply-page-patch.mjs
 * চালানো: node scripts/apply-page-patch.mjs
 * কাজ: src/app/page.js-এ প্রয়োজনীয় অংশগুলো নিরাপদে বদলায় (আগে ব্যাকআপ নেয়; কোনো অংশ না মিললে কিছুই বদলায় না)
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pageFile = path.join(root, "src", "app", "page.js");
const cssFile = path.join(root, "src", "app", "globals.css");
const update = fs.readFileSync(path.join(root, "scripts", "bcs-update.css"), "utf8");

let src = fs.readFileSync(pageFile, "utf8");
const problems = [];
const done = [];

if (src.includes("@/components/ContestTab")) {
  console.log("ℹ️ page.js আগেই প্যাচ করা হয়েছে — নতুন করে কিছু করার দরকার নেই।");
  process.exit(0);
}

const spliceRange = (s, from, to, text) => s.slice(0, from) + text + s.slice(to);
const find = (re, from = 0) => {
  const m = re.exec(src.slice(from));
  return m ? from + m.index : -1;
};

// 1) ইম্পোর্ট
{
  const anchor = 'import { initialSubjects } from "../data/bcsData";';
  const i = src.indexOf(anchor);
  if (i < 0) problems.push("১) bcsData ইম্পোর্ট লাইন পাওয়া যায়নি");
  else {
    const add =
      '\nimport ContestTab from "@/components/ContestTab";\nimport AdminContestBuilder from "@/components/AdminContestBuilder";\nimport AdminLectureManager from "@/components/AdminLectureManager";\nimport RichTextColorEditor from "@/components/RichTextColorEditor";';
    src = spliceRange(src, i + anchor.length, i + anchor.length, add);
    done.push("নতুন কম্পোনেন্ট ইম্পোর্ট");
  }
}

// 2) পুরনো RichTextColorEditor ফাংশন মুছে নতুনটি ব্যবহার + adminPin পাস
{
  const fn = src.indexOf("function RichTextColorEditor(");
  const mini = src.indexOf("function MiniExecutive2DAvatar(");
  if (fn < 0 || mini < fn) problems.push("২) RichTextColorEditor/MiniExecutive2DAvatar ফাংশন পাওয়া যায়নি");
  else {
    const start = src.lastIndexOf("/**", fn);
    const end = src.lastIndexOf("/**", mini);
    const removed = src.slice(start, end);
    if (start < 0 || end <= start || removed.length < 300 || removed.includes("function MiniExecutive2DAvatar")) {
      problems.push("২) পুরনো এডিটর ব্লকের সীমা নির্ণয় করা যায়নি");
    } else {
      src = spliceRange(src, start, end, "");
      src = src.split("<RichTextColorEditor").join("<RichTextColorEditor adminPin={adminPinInput}");
      done.push("এডিটর (ড্র্যাগ-ড্রপ, ছোট ছবির লিংক, স্ক্রল ফিক্স)");
    }
  }
}

// 3) মোবাইল নেভিগেশনে সিলেবাস
{
  const a = '<button onClick={() => navigateTo("dashboard")} className={activeTab === "dashboard" ? "text-slate-900 underline" : ""}>ড্যাশবোর্ড</button>';
  const i = src.indexOf(a);
  if (i < 0) problems.push("৩) মোবাইল নেভ বার-এর ড্যাশবোর্ড বাটন পাওয়া যায়নি");
  else {
    const add =
      '\n          <button onClick={() => navigateTo("syllabus")} className={activeTab === "syllabus" ? "text-slate-900 underline" : ""}>সিলেবাস</button>';
    src = spliceRange(src, i + a.length, i + a.length, add);
    done.push("মোবাইল নেভে সিলেবাস");
  }
}

// 4) জাতীয় পরীক্ষা ট্যাব
{
  const s = find(/\{\/\*\s*=+\s*3\.\s*15-DAY NATIONAL[^\n]*\*\/\}/);
  const e = find(/\{\/\*\s*=+\s*4\.\s*MOCK TEST HUB[^\n]*\*\/\}/);
  if (s < 0 || e < s) problems.push("৪) জাতীয় পরীক্ষা ট্যাবের মার্কার (3. / 4.) পাওয়া যায়নি");
  else {
    src = spliceRange(
      src,
      s,
      e,
      '{/* ================= 3. জাতীয় বিসিএস পরীক্ষা (১০ দিন অন্তর · ২০০ MCQ) ================= */}\n        {activeTab === "biweekly_contest" && <ContestTab profile={profile} onProfileChange={updateProfile} />}\n\n        '
    );
    done.push("জাতীয় পরীক্ষা ট্যাব (কাউন্টডাউন, রেজিস্ট্রেশন, লিডারবোর্ড)");
  }
}

// 5) অ্যাডমিন সেকশন ৪
{
  const s = find(/\{\/\*\s*=+\s*ADMIN SECTION 4:[^\n]*\*\/\}/);
  const e = find(/\{\/\*\s*ADMIN SECTION 5:[^\n]*\*\/\}/);
  if (s < 0 || e < s) problems.push("৫) অ্যাডমিন সেকশন ৪/৫ মার্কার পাওয়া যায়নি");
  else {
    src = spliceRange(
      src,
      s,
      e,
      '{/* ================= ADMIN SECTION 4: জাতীয় ২০০-MCQ পরীক্ষা (১০ দিন অন্তর) ================= */}\n                {adminSection === "biweekly_200" && <AdminContestBuilder adminPin={adminPinInput} />}\n\n                '
    );
    done.push("অ্যাডমিন ২০০-MCQ বিল্ডার (বাল্ক আপলোড, বিষয় নির্বাচন)");
  }
}

// 6) বিষয়ভিত্তিক লেকচার ম্যানেজার
{
  const h = src.indexOf("আপলোডকৃত লেকচার ({lectures.length}টি)");
  const sec2 = find(/\{\/\*\s*=+\s*ADMIN SECTION 2:/);
  const divOpen = '<div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">';
  const start = h > 0 ? src.lastIndexOf(divOpen, h) : -1;
  if (h < 0 || sec2 < 0 || start < 0) problems.push("৬) আপলোডকৃত লেকচার প্যানেল পাওয়া যায়নি");
  else {
    const before = src.slice(0, sec2);
    const m = /<\/div>(?=\s*<\/div>\s*\)\}\s*$)/.exec(before);
    if (!m || m.index < start) problems.push("৬) লেকচার প্যানেলের শেষ নির্ণয় করা যায়নি");
    else {
      src = spliceRange(
        src,
        start,
        m.index + "</div>".length,
        '<AdminLectureManager lectures={lectures} subjects={adminCourseTrack === "bcs" ? bcsSubjects : defenseSubjects} courseTrack={adminCourseTrack} onEdit={handleEditLectureClick} onDelete={handleDeleteLecture} />'
      );
      done.push("বিষয়ভিত্তিক লেকচার ম্যানেজার");
    }
  }
}

// 7) ১৫ → ১০ দিন লেখা
src = src.split("১৫ দিনের").join("১০ দিনের").split("১৫ দিনে").join("১০ দিনে");

if (problems.length) {
  console.log("❌ কিছু অংশ মেলেনি, তাই page.js বদলানো হয়নি:\n - " + problems.join("\n - "));
  console.log("\nএই বার্তাটি Claude-কে পাঠান, সে ম্যানুয়াল ধাপ বলে দেবে।");
  process.exit(1);
}

fs.writeFileSync(path.join(root, "scripts", "page.js.backup"), fs.readFileSync(pageFile, "utf8"));
fs.writeFileSync(pageFile, src);

let css = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, "utf8") : "";
if (!css.includes("BCS-PATH-UPDATE-2")) {
  fs.writeFileSync(cssFile, css + "\n" + update);
  done.push("globals.css-এ হোভার অ্যানিমেশন ও ছবির ক্লাস");
}

console.log("✅ সফল! যা যা হলো:\n - " + done.join("\n - "));
console.log("ব্যাকআপ: scripts/page.js.backup");
