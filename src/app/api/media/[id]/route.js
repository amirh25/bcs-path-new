/**
 * FILE: src/app/api/media/[id]/route.js
 * PURPOSE: সংরক্ষিত ছবি দেখানো (ব্রাউজার ক্যাশসহ)
 */
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { MediaAsset } from "@/models/PlatformModels";

// export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return new Response("Not found", { status: 404 });
    await connectDB();
    const doc = await MediaAsset.findById(id);
    if (!doc) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(doc.data), {
      headers: {
        "Content-Type": doc.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Error", { status: 500 });
  }
}
