/**
 * FILE: src/lib/clientImage.js — ব্রাউজারে ছবি কম্প্রেস/রিসাইজ (ছোট সাইজে সার্ভারে পাঠানোর জন্য)
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("ফাইল পড়া যায়নি"));
    r.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("ছবি পড়া যায়নি"));
    img.src = src;
  });
}

export async function compressImageToDataUrl(file, { maxSize = 1200, quality = 0.82 } = {}) {
  if (!file.type.startsWith("image/")) throw new Error("শুধু ছবির ফাইল দিন");
  const raw = await fileToDataUrl(file);
  if (file.type === "image/gif" || file.type === "image/svg+xml") return raw;
  const img = await loadImage(raw);
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

// প্রোফাইল ছবিকে ছোট বর্গাকার থাম্বনেইলে রূপান্তর (লিডারবোর্ডের জন্য)
export async function makeAvatarThumb(dataUrl, size = 96) {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return "";
  const img = await loadImage(dataUrl);
  const side = Math.min(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas
    .getContext("2d")
    .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.8);
}
