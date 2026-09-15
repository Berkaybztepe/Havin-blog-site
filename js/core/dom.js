// Kucuk DOM yardimcilari. Cerceve yok; ihtiyacimiz bu kadar.
import { escapeHTML } from '../lib/sanitize.js';

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') {
      // Object.assign CSS ozel degiskenlerini (--foo) sessizce yok sayar;
      // onlari setProperty ile yazmak gerekiyor.
      for (const [prop, val] of Object.entries(v)) {
        if (val == null || val === '') continue;
        if (prop.startsWith('--')) node.style.setProperty(prop, String(val));
        else node.style[prop] = val;
      }
    }
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in node && k !== 'list') { try { node[k] = v; } catch { node.setAttribute(k, v); } }
    else node.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); return node; };
export { escapeHTML };

// --- bildirim serigi -------------------------------------------------------
let toastHost = null;
export function toast(message, kind = 'ok', ms = 3200) {
  if (!toastHost) {
    toastHost = el('div', { class: 'toast-host', role: 'status', 'aria-live': 'polite' });
    document.body.append(toastHost);
  }
  const t = el('div', { class: `toast toast--${kind}` }, message);
  toastHost.append(t);
  requestAnimationFrame(() => t.classList.add('is-in'));
  setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 300); }, ms);
}

// --- kalici pencere --------------------------------------------------------
export function modal({ title, body, actions = [], wide = false, onClose }) {
  const close = () => { wrap.remove(); document.body.classList.remove('modal-open'); onClose && onClose(); };
  const btns = actions.map((a) => el('button', {
    class: `btn ${a.kind ? 'btn--' + a.kind : ''}`,
    type: 'button',
    onClick: async () => { const r = a.onClick ? await a.onClick() : true; if (r !== false) close(); },
  }, a.label));

  const card = el('div', { class: `modal-card ${wide ? 'modal-card--wide' : ''}`, role: 'dialog', 'aria-modal': 'true' },
    el('div', { class: 'modal-head' },
      el('h2', {}, title || ''),
      el('button', { class: 'modal-x', type: 'button', 'aria-label': 'Kapat', onClick: close }, '×')),
    el('div', { class: 'modal-body' }, body),
    btns.length ? el('div', { class: 'modal-foot' }, btns) : null);

  const wrap = el('div', { class: 'modal-wrap', onClick: (e) => { if (e.target === wrap) close(); } }, card);
  document.body.append(wrap);
  document.body.classList.add('modal-open');
  const esc = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
  document.addEventListener('keydown', esc);
  setTimeout(() => { const f = card.querySelector('input,textarea,select,button'); f && f.focus(); }, 40);
  return { close, card };
}

export function confirmDialog(title, message, confirmLabel = 'Evet') {
  return new Promise((resolve) => {
    modal({
      title,
      body: el('p', { class: 'muted' }, message),
      actions: [
        { label: 'Vazgeç', onClick: () => { resolve(false); } },
        { label: confirmLabel, kind: 'danger', onClick: () => { resolve(true); } },
      ],
      onClose: () => resolve(false),
    });
  });
}

// --- tarih -----------------------------------------------------------------
const TR_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function formatDateTR(iso, withDay = true) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = withDay ? `${TR_DAYS[date.getDay()]}, ` : '';
  return `${day}${d} ${TR_MONTHS[m - 1]} ${y}`;
}

export function monthNameTR(monthIndex) { return TR_MONTHS[monthIndex]; }
export const TR_DAY_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

/** Haftanin pazartesiden basladigi dizin (0=Pzt). */
export const mondayIndex = (jsDay) => (jsDay + 6) % 7;

/** Turkce'ye dogru buyuk/kucuk harf: i -> İ, I -> ı */
export const upperTR = (s) => String(s || '').toLocaleUpperCase('tr-TR');
export const lowerTR = (s) => String(s || '').toLocaleLowerCase('tr-TR');
