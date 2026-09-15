// Izin listesine dayali HTML temizleyici.
// Icerik kullanicinin kendisine ait olsa da, baska bir siteden yapistirilan
// metin script/onerror/javascript: tasiyabilir. innerHTML kullandigimiz her
// yerde bundan geciyoruz.

const ALLOWED = {
  p: [], br: [], div: ['style', 'data-yt', 'data-sticker'], span: ['style'], b: [], strong: [], i: [], em: [],
  u: [], s: [], strike: [], mark: [], small: [], sub: [], sup: [],
  h1: [], h2: [], h3: [], h4: [], blockquote: ['style'],
  ul: [], ol: [], li: [], hr: [], pre: [], code: [],
  a: ['href', 'title'],
  // data-blob: sifreli depodaki fotograf kimligi. blob: URL'leri yeniden
  // yuklemede olur, bu yuzden kaynagi degil kimligi sakliyoruz.
  img: ['src', 'alt', 'style', 'data-blob'],
  // data-yt: YouTube video kimligi; goruntulerken iframe'e cevriliyor.
  // data-sticker: gomulu cikartma kimligi.

  font: ['color', 'face', 'size'],
  table: [], thead: [], tbody: [], tr: [], td: ['style'], th: ['style'],
};

const SAFE_STYLE = /^(color|background-color|font-family|font-size|font-style|font-weight|text-align|text-decoration|line-height|letter-spacing|font-variant)$/;

function cleanStyle(value) {
  return (value || '').split(';').map((d) => {
    const i = d.indexOf(':');
    if (i < 0) return '';
    const prop = d.slice(0, i).trim().toLowerCase();
    const val = d.slice(i + 1).trim();
    if (!SAFE_STYLE.test(prop)) return '';
    if (/url\s*\(|expression|javascript:/i.test(val)) return '';
    return `${prop}: ${val}`;
  }).filter(Boolean).join('; ');
}

function safeUrl(url, allowData) {
  const u = (url || '').trim();
  if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u)) return u;
  if (allowData && /^(data:image\/(png|jpe?g|gif|webp);base64,|blob:)/i.test(u)) return u;
  return null;
}

export function sanitizeHTML(dirty) {
  const doc = new DOMParser().parseFromString(`<div id="r">${dirty || ''}</div>`, 'text/html');
  const root = doc.getElementById('r');
  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) continue;                     // metin
      if (child.nodeType !== 1) { child.remove(); continue; } // yorum vb.
      const tag = child.tagName.toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(ALLOWED, tag)) {
        // etiketi at, icerigini koru
        const parent = child.parentNode;
        while (child.firstChild) parent.insertBefore(child.firstChild, child);
        child.remove();
        continue;
      }
      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase();
        if (!ALLOWED[tag].includes(name)) { child.removeAttribute(attr.name); continue; }
        if (name === 'style') {
          const s = cleanStyle(attr.value);
          if (s) child.setAttribute('style', s); else child.removeAttribute('style');
        } else if (name === 'href' || name === 'src') {
          const u = safeUrl(attr.value, name === 'src');
          if (u) child.setAttribute(name, u); else child.removeAttribute(attr.name);
        }
      }
      if (tag === 'a') { child.setAttribute('rel', 'noopener noreferrer'); child.setAttribute('target', '_blank'); }
      walk(child);
    }
  };
  walk(root);
  return root.innerHTML;
}

/** Duz metni HTML'e gomerken kullan. */
export function escapeHTML(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
