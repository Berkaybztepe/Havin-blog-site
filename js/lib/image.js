// Fotograf hazirlama: EXIF yonunu duzelt, kucult, JPEG'e cevir.
// createImageBitmap kullaniyoruz: yonu kendisi cozer, olcekleme ana is
// parcacigi disinda yapilir ve WebKit'in buyuk gorsellerde siyah canvas
// veren eski hatasindan kacinir.

const MAX_EDGE = 1400;      // saklama icin
const AI_MAX_EDGE = 1100;   // API'ye gonderirken (1568 ustu zaten kuculuyor)

async function decode(file, maxEdge) {
  if (typeof createImageBitmap === 'function') {
    try {
      const probe = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const scale = Math.min(1, maxEdge / Math.max(probe.width, probe.height));
      if (scale === 1) return probe;
      const w = Math.round(probe.width * scale), h = Math.round(probe.height * scale);
      const out = await createImageBitmap(file, {
        imageOrientation: 'from-image', resizeWidth: w, resizeHeight: h, resizeQuality: 'high',
      });
      probe.close && probe.close();
      return out;
    } catch { /* canvas yoluna dus */ }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gorsel okunamadi')); };
    img.src = url;
  });
}

function toCanvas(bitmap, maxEdge) {
  const iw = bitmap.width, ih = bitmap.height;
  const scale = Math.min(1, maxEdge / Math.max(iw, ih));
  const w = Math.max(1, Math.round(iw * scale)), h = Math.max(1, Math.round(ih * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  return c;
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', quality));
}

/** Dosyayi sifrelenip saklanmaya hazir JPEG baytlarina cevirir. */
export async function prepareForStorage(file, maxEdge = MAX_EDGE, quality = 0.82) {
  const bmp = await decode(file, maxEdge);
  const canvas = toCanvas(bmp, maxEdge);
  bmp.close && bmp.close();
  const blob = await canvasToBlob(canvas, quality);
  return { bytes: new Uint8Array(await blob.arrayBuffer()), mime: 'image/jpeg', width: canvas.width, height: canvas.height };
}

/** API'ye gondermek icin ham base64 (data: onneki YOK). */
export async function prepareForAI(fileOrBlob) {
  const bmp = await decode(fileOrBlob, AI_MAX_EDGE);
  const canvas = toCanvas(bmp, AI_MAX_EDGE);
  bmp.close && bmp.close();
  const blob = await canvasToBlob(canvas, 0.8);
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) s += String.fromCharCode.apply(null, buf.subarray(i, i + chunk));
  return { base64: btoa(s), mediaType: 'image/jpeg' };
}

// --- nesne URL defteri ----------------------------------------------------
// Gorunum kapanirken URL'leri geri vermezsek bellek sekme olene kadar sisiyor.
export function makeObjectURLScope() {
  const urls = new Set();
  return {
    create(blob) { const u = URL.createObjectURL(blob); urls.add(u); return u; },
    revokeAll() { for (const u of urls) URL.revokeObjectURL(u); urls.clear(); },
  };
}
