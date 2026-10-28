"use client";
/**
 * ============================================================================
 * FILE: src/components/RichTextColorEditor.js
 * FIXES:
 *  1) ছবি Drag & Drop এখন সত্যিই কাজ করে (+ Ctrl+V পেস্ট, + একাধিক ছবি)
 *  2) ছবি সার্ভারে সংরক্ষিত হয়; টেক্সটে বসে শুধু ছোট লিংক: <img src="/api/media/ID" class="bp-img bp-img-right">
 *  3) টেক্সট সিলেক্ট করে রং/ফন্ট বদলালে আর স্ক্রল নিচে চলে যায় না (সিলেকশন ও স্ক্রল পজিশন ধরে রাখা হয়)
 * ============================================================================
 */
import React, { useState, useRef, useLayoutEffect } from "react";
import { Upload, Type, Plus, Minus, Image as ImageIcon } from "lucide-react";
import { compressImageToDataUrl } from "@/lib/clientImage";

const COLOR_BTNS = [
  ["🔴 লাল টেক্সট", "#dc2626", "bg-red-50 text-red-700 border-red-200"],
  ["🔵 নীল টেক্সট", "#2563eb", "bg-blue-50 text-blue-700 border-blue-200"],
  ["🟢 সবুজ টেক্সট", "#059669", "bg-emerald-50 text-emerald-700 border-emerald-200"],
];
const BOX_BTNS = [
  ["🟨 হলুদ বক্স", "#fef3c7", "#f59e0b", "#78350f", "bg-amber-100 text-amber-900 border-amber-300"],
  ["🟩 সবুজ বক্স", "#dcfce7", "#10b981", "#064e3b", "bg-emerald-100 text-emerald-900 border-emerald-300"],
  ["🟦 নীল বক্স", "#dbeafe", "#3b82f6", "#1e3a8a", "bg-blue-100 text-blue-900 border-blue-300"],
];

export default function RichTextColorEditor({ label, value, onChange, placeholder, rows = 6, adminPin = "" }) {
  const taRef = useRef(null);
  const valueRef = useRef(value);
  const pendingRef = useRef(null);
  const [fontSizePx, setFontSizePx] = useState(18);
  const [imgAlign, setImgAlign] = useState("right");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  valueRef.current = value;

  // টেক্সট বদলের পর সিলেকশন + স্ক্রল পজিশন ফিরিয়ে দেওয়া (এটাই স্ক্রল-জাম্প ঠিক করে)
  useLayoutEffect(() => {
    const p = pendingRef.current;
    const el = taRef.current;
    if (!p || !el) return;
    pendingRef.current = null;
    el.focus({ preventScroll: true });
    el.setSelectionRange(p.start, p.end);
    el.scrollTop = p.scrollTop;
    window.scrollTo(p.winX, p.winY);
  }, [value]);

  const snap = (start, end) => ({
    start,
    end,
    scrollTop: taRef.current ? taRef.current.scrollTop : 0,
    winX: window.scrollX,
    winY: window.scrollY,
  });

  // বাটনে ক্লিক করলে টেক্সটবক্স থেকে ফোকাস/সিলেকশন হারাবে না
  const keepFocus = { onMouseDown: (e) => e.preventDefault() };

  const applyFormatting = (openTag, closeTag) => {
    const el = taRef.current;
    if (!el) return;
    const v = valueRef.current;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const sel = v.slice(s, e) || "এখানে লিখুন";
    pendingRef.current = snap(s + openTag.length, s + openTag.length + sel.length);
    onChange(v.slice(0, s) + openTag + sel + closeTag + v.slice(e));
  };

  const handleFontSizeStep = (delta) => {
    const next = Math.min(34, Math.max(13, fontSizePx + delta));
    setFontSizePx(next);
    applyFormatting(`<span style="font-size:${next}px;line-height:1.6;font-weight:700;">`, `</span>`);
  };

  const insertImageTag = (url) => {
    const tag = `\n<img src="${url}" class="bp-img bp-img-${imgAlign}" alt="" />\n`;
    const v = valueRef.current;
    const el = taRef.current;
    let next;
    let caret;
    if (imgAlign === "top") {
      next = tag + v;
      caret = tag.length;
    } else if (imgAlign === "bottom") {
      next = v + tag;
      caret = next.length;
    } else {
      const pos = el ? el.selectionStart : v.length;
      next = v.slice(0, pos) + tag + v.slice(pos);
      caret = pos + tag.length;
    }
    pendingRef.current = snap(caret, caret);
    onChange(next);
  };

  const handleFiles = async (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    if (!adminPin) {
      alert("⚠️ অ্যাডমিন পিন পাওয়া যায়নি। প্যানেল আনলক করে আবার চেষ্টা করুন।");
      return;
    }
    for (const file of list) {
      setUploading((n) => n + 1);
      try {
        const dataUrl = await compressImageToDataUrl(file);
        const res = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminPin, dataUrl, name: file.name }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "আপলোড ব্যর্থ");
        insertImageTag(data.url);
      } catch (err) {
        alert("⚠️ ছবি যোগ করা যায়নি: " + err.message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes("Files");
  const onDragOver = (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault(); // এটা ছাড়া ব্রাউজার Drop ইভেন্টই দেয় না
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
  };
  const onDrop = (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };
  const onPaste = (e) => {
    const imgs = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith("image/"));
    if (imgs.length) {
      e.preventDefault();
      handleFiles(imgs);
    }
  };

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-2xs">
      <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-200 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-extrabold text-xs sm:text-sm text-slate-900">{label}</span>

          <div className="flex flex-wrap items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-300">
            <ImageIcon className="w-4 h-4 text-purple-700" />
            <span className="text-[11px] font-extrabold text-slate-700">ভিজ্যুয়াল ইমেজ পজিশন:</span>
            <select
              value={imgAlign}
              onChange={(e) => setImgAlign(e.target.value)}
              className="text-xs font-extrabold text-purple-900 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200 outline-none"
            >
              <option value="right">তথ্যের ডানে (Side Right)</option>
              <option value="left">তথ্যের বামে (Side Left)</option>
              <option value="top">তথ্যের উপরে (Top)</option>
              <option value="bottom">তথ্যের নিচে (Bottom)</option>
            </select>
            <label className="px-2.5 py-1 bg-purple-700 text-white rounded-lg text-xs font-extrabold cursor-pointer hover:bg-purple-800 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> {uploading > 0 ? "আপলোড হচ্ছে..." : "ইমেজ যোগ করুন"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            {...keepFocus}
            onClick={() => applyFormatting("<b>", "</b>")}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-black hover:bg-slate-200 cursor-pointer"
          >
            B (বোল্ড)
          </button>

          <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
            <button
              type="button"
              {...keepFocus}
              onClick={() => handleFontSizeStep(-2)}
              title="ফন্ট ছোট করুন (-)"
              className="px-2.5 py-1 hover:bg-slate-200 text-slate-900 font-black text-xs flex items-center gap-0.5 border-r border-slate-200 cursor-pointer"
            >
              <Type className="w-3.5 h-3.5" /> <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 text-[11px] font-extrabold text-blue-700 bg-blue-50/50">{fontSizePx}px</span>
            <button
              type="button"
              {...keepFocus}
              onClick={() => handleFontSizeStep(2)}
              title="ফন্ট বড় করুন (+)"
              className="px-2.5 py-1 hover:bg-slate-200 text-slate-900 font-black text-xs flex items-center gap-0.5 border-l border-slate-200 cursor-pointer"
            >
              <Type className="w-3.5 h-3.5" /> <Plus className="w-3 h-3" />
            </button>
          </div>

          {COLOR_BTNS.map(([text, color, cls]) => (
            <button
              key={text}
              type="button"
              {...keepFocus}
              onClick={() => applyFormatting(`<span style="color:${color};font-weight:700;">`, "</span>")}
              className={`px-2 py-1 border rounded-lg text-xs font-extrabold cursor-pointer ${cls}`}
            >
              {text}
            </button>
          ))}

          {BOX_BTNS.map(([text, bg, border, color, cls]) => (
            <button
              key={text}
              type="button"
              {...keepFocus}
              onClick={() =>
                applyFormatting(
                  `<div style="background:${bg};border-left:4px solid ${border};padding:10px 14px;border-radius:8px;margin:8px 0;color:${color};font-weight:600;clear:both;">`,
                  "</div>"
                )
              }
              className={`px-2.5 py-1 border rounded-lg text-xs font-extrabold cursor-pointer ${cls}`}
            >
              {text}
            </button>
          ))}
        </div>

        <p className="text-[11px] font-bold text-slate-500">
          📎 ছবি এই বক্সে <span className="text-purple-700">টেনে এনে ছাড়ুন (Drag & Drop)</span>, অথবা{" "}
          <span className="text-purple-700">Ctrl+V</span> দিয়ে পেস্ট করুন, অথবা “ইমেজ যোগ করুন” চাপুন। ছবি সার্ভারে
          সংরক্ষিত হয়, টেক্সটে শুধু ছোট লিংক বসে।
        </p>
      </div>

      <div className="relative" onDragEnter={onDragOver} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        <textarea
          ref={taRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={onPaste}
          placeholder={placeholder}
          className="w-full p-3.5 text-sm text-slate-900 outline-none leading-relaxed font-medium"
        />
        {(dragOver || uploading > 0) && (
          <div className="absolute inset-0 pointer-events-none bg-purple-50/90 border-2 border-dashed border-purple-500 flex items-center justify-center text-sm font-black text-purple-800">
            {uploading > 0 ? "⏳ ছবি আপলোড হচ্ছে..." : "🖼️ ছবিটি এখানে ছেড়ে দিন"}
          </div>
        )}
      </div>
    </div>
  );
}
