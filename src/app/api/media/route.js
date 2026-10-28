/**
 * FILE: src/app/api/media/route.js
 * PURPOSE: অ্যাডমিন এডিটরের ছবি আপলোড → ডাটাবেসে সংরক্ষণ → ছোট লিংক (/api/media/ID) ফেরত
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MediaAsset } from "@/models/PlatformModels";

// export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { adminPin, dataUrl, name } = await req.json();
    if (adminPin !== (process.env.ADMIN_SECRET_PIN || "bcs2026")) {
      return NextResponse.json({ success: false, error: "ভুল অ্যাডমিন পিন!" }, { status: 401 });
    }
    const m = /^data:(image\/(?:png|jpe?g|webp|gif|svg\+xml));base64,(.+)$/.exec(dataUrl || "");
    if (!m) return NextResponse.json({ success: false, error: "ছবির ফরম্যাট সঠিক নয়" }, { status: 400 });

    const buf = Buffer.from(m[2], "base64");
    if (buf.length > 3 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "ছবির সাইজ ৩ মেগাবাইটের বেশি" }, { status: 400 });
    }
    await connectDB();
    const doc = await MediaAsset.create({
      name: String(name || "").slice(0, 120),
      contentType: m[1],
      size: buf.length,
      data: buf,
    });
    return NextResponse.json({ success: true, url: `/api/media/${doc._id}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
