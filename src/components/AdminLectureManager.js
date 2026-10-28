"use client";
/**
 * FILE: src/components/AdminLectureManager.js
 * PURPOSE: বিষয় (Subject) নির্বাচন করলেই সেই বিষয়ের লেকচার সংখ্যা ও তালিকা দেখায়;
 *          আগের মতোই এডিট ও ডিলিট করা যায়। সার্চ বক্সও আছে।
 */
import React, { useMemo, useState } from "react";
import { Trash2, Search } from "lucide-react";

export default function AdminLectureManager({ lectures, subjects, courseTrack, onEdit, onDelete }) {
  const [subjectId, setSubjectId] = useState("ALL");
  const [query, setQuery] = useState("");

  const trackLectures = useMemo(
    () => lectures.filter((l) => (l.courseType || "bcs") === courseTrack),
    [lectures, courseTrack]
  );

  const counts = useMemo(() => {
    const map = {};
    trackLectures.forEach((l) => {
      map[l.subjectId] = (map[l.subjectId] || 0) + 1;
    });
    return map;
  }, [trackLectures]);

  const titleOf = (id) => subjects.find((s) => s.id === id)?.title || id;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trackLectures
      .filter((l) => (subjectId === "ALL" || l.subjectId === subjectId) && (!q || (l.title || "").toLowerCase().includes(q)))
      .sort((a, b) => (a.subjectId === b.subjectId ? a.lectureNo - b.lectureNo : a.subjectId.localeCompare(b.subjectId)));
  }, [trackLectures, subjectId, query]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
      <h4 className="font-extrabold text-base">আপলোডকৃত লেকচার ({trackLectures.length}টি)</h4>

      <select
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm font-extrabold"
      >
        <option value="ALL">সকল বিষয় ({trackLectures.length}টি)</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title} — {counts[s.id] || 0}টি
          </option>
        ))}
      </select>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="লেকচারের নাম দিয়ে খুঁজুন..."
          className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm"
        />
      </div>

      {subjectId !== "ALL" && (
        <div className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-xs font-extrabold text-purple-900">
          {titleOf(subjectId)} বিষয়ে মোট {counts[subjectId] || 0}টি লেকচার আপলোড করা হয়েছে
        </div>
      )}

      <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
        {visible.length === 0 && (
          <div className="p-6 text-center text-sm font-bold text-slate-500 bg-slate-50 rounded-xl border border-dashed">
            কোনো লেকচার পাওয়া যায়নি।
          </div>
        )}
        {visible.map((lec) => {
          const lKey = lec._id || lec.id;
          return (
            <div key={lKey} className="p-3.5 rounded-xl border bg-slate-50 space-y-2">
              <div className="text-xs font-extrabold text-purple-800">
                {titleOf(lec.subjectId)} · Lec {lec.lectureNo}
              </div>
              <div className="font-bold text-sm">{lec.title}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(lec)}
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  এডিট
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(lKey)}
                  className="p-1.5 bg-rose-50 text-rose-600 border rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
