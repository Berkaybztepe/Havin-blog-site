// Gorunum (tema, yazi tipi, renk) uygulama.
//
// Ayri bir modul: hem main.js hem ayarlar gorunumu buna ihtiyac duyuyor;
// ikisi birbirini import ederse dairesel bagimlilik olusuyor.

// Tema gizli bir bilgi degil. Kilit acilmadan once de uygulanabilsin diye
// sifreli kasanin disinda, ayrica tutuluyor.
const LOOK_KEY = 'havin.look';

export function applyLook(look) {
  const doc = document.documentElement;
  if (look.theme) doc.dataset.theme = look.theme;
  doc.style.setProperty('--scale', look.fontScale || 1);
  if (look.fontBody) doc.style.setProperty('--font-body', `'${look.fontBody}', sans-serif`);
  else doc.style.removeProperty('--font-body');
  if (look.fontHead) doc.style.setProperty('--font-head', `'${look.fontHead}', cursive`);
  else doc.style.removeProperty('--font-head');
  if (look.textColor) doc.style.setProperty('--user-ink', look.textColor);
  else doc.style.removeProperty('--user-ink');
  if (look.accent) doc.style.setProperty('--accent', look.accent);
  else doc.style.removeProperty('--accent');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const bg = getComputedStyle(doc).getPropertyValue('--bg').trim();
    if (bg) meta.setAttribute('content', bg);
  }
  try { localStorage.setItem(LOOK_KEY, JSON.stringify(look)); } catch {}
}

export function readStoredLook() {
  try { return JSON.parse(localStorage.getItem(LOOK_KEY) || '{}'); } catch { return {}; }
}

export function lookFromSettings(s) {
  return {
    theme: s.theme, fontScale: s.fontScale, fontBody: s.fontBody,
    fontHead: s.fontHeading, textColor: s.textColor, accent: s.accent,
  };
}
