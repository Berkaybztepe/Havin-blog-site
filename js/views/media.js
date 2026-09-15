// Yazi ve pano icinde kullanilan ortak medya yardimcilari.

import { el } from '../core/dom.js';
import * as repo from '../core/repo.js';
import { stickerById, STICKERS } from '../data/stickers.js';

/** YouTube baglantisindan video/oynatma listesi kimligi cikarir. */
export function parseYouTube(url) {
  const s = (url || '').trim();
  if (!s) return null;
  let m;
  if ((m = s.match(/[?&]list=([A-Za-z0-9_-]{12,})/))) return { type: 'list', id: m[1] };
  if ((m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/))) return { type: 'video', id: m[1] };
  if ((m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/))) return { type: 'video', id: m[1] };
  if ((m = s.match(/youtube\.com\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/))) return { type: 'video', id: m[1] };
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return { type: 'video', id: s };
  return null;
}

export function youtubeEmbedURL(ref) {
  if (!ref) return null;
  return ref.type === 'list'
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${ref.id}`
    : `https://www.youtube-nocookie.com/embed/${ref.id}`;
}

export function youtubeFrame(ref) {
  const url = youtubeEmbedURL(ref);
  if (!url) return null;
  return el('div', { class: 'video-frame' }, el('iframe', {
    src: url, loading: 'lazy', allowfullscreen: '',
    allow: 'accelerometer; clipboard-write; encrypted-media; picture-in-picture',
    referrerpolicy: 'strict-origin-when-cross-origin',
    title: 'YouTube',
  }));
}

/**
 * Kaydedilmis HTML'i ekrana hazirlar:
 *  - data-blob tasiyan gorselleri sifreli depodan cozer
 *  - data-yt tasiyan kutulari oynaticiya cevirir
 *  - data-sticker kutularina cikartmayi cizer
 * Donen temizleyici, nesne URL'lerini geri verir.
 */
export async function hydrate(container) {
  const urls = [];

  for (const img of container.querySelectorAll('img[data-blob]')) {
    const id = img.dataset.blob;
    try {
      const blob = await repo.loadImage(id);
      if (blob) { const u = URL.createObjectURL(blob); urls.push(u); img.src = u; }
      else img.replaceWith(el('div', { class: 'muted' }, '(fotoğraf bulunamadı)'));
    } catch {
      img.replaceWith(el('div', { class: 'muted' }, '(fotoğraf açılamadı)'));
    }
  }

  for (const box of container.querySelectorAll('div[data-yt]')) {
    const raw = box.dataset.yt;
    const ref = raw.startsWith('list:') ? { type: 'list', id: raw.slice(5) } : { type: 'video', id: raw };
    const frame = youtubeFrame(ref);
    if (frame) box.replaceChildren(frame);
  }

  for (const box of container.querySelectorAll('div[data-sticker]')) {
    const st = stickerById(box.dataset.sticker);
    if (st) { box.innerHTML = st.svg; box.style.width = box.style.width || '90px'; box.style.display = 'inline-block'; }
  }

  return () => urls.forEach((u) => URL.revokeObjectURL(u));
}

/** Cikartma secici penceresi icerigi. */
export function stickerPicker(onPick) {
  return el('div', { class: 'sticker-pick' },
    STICKERS.map((s) => el('button', {
      type: 'button', title: s.label, 'aria-label': s.label,
      html: s.svg, onClick: () => onPick(s),
    })));
}

export { STICKERS };
