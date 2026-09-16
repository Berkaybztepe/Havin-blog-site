// Pano: serbest yerlesimli gorseller, cikartmalar ve not kagitlari.
//
// Dokunmatik notlari (tablet birincil cihaz):
//  - Her tasinabilir ogede touch-action:none; yoksa tarayici hareketi kaydirma
//    sanip pointercancel firlatiyor ve surukleme yarida kaliyor.
//  - setPointerCapture: parmak ogenin disina cikinca olaylar kesilmesin diye.
//  - Ilk pointer'a kilitleniyoruz; ikinci parmak surukleneni degistirmesin.
//  - pointercancel ve lostpointercapture de pointerup ile ayni temizligi yapar.
//  - Konum reflow ile degil transform ile yaziliyor, guncelleme rAF icinde.

import { el, clear, toast, modal, confirmDialog } from '../core/dom.js';
import * as repo from '../core/repo.js';
import { prepareForStorage, makeObjectURLScope } from '../lib/image.js';
import { uuid } from '../core/crypto.js';
import { stickerPicker } from './media.js';
import { stickerById } from '../data/stickers.js';

const DOC = 'board:main';
const CANVAS_W = 1240;
const CANVAS_H = 900;

let scope = null;
let saveTimer = null;

export default {
  async mount(host) {
    scope = makeObjectURLScope();
    const board = await repo.getDocOr(DOC, { items: [] });
    const items = board.items || [];
    let activeId = null;

    const canvas = el('div', { class: 'board-canvas', style: { width: CANVAS_W + 'px', height: CANVAS_H + 'px' } });
    const wrap = el('div', { class: 'board-wrap' }, canvas);

    // Pano sabit olcude cizilir, kapsayiciya sigacak sekilde olceklenir.
    let scale = 1;
    const fit = () => {
      const avail = wrap.clientWidth || wrap.getBoundingClientRect().width;
      if (!avail) return;
      scale = avail / CANVAS_W;
      canvas.style.transform = `scale(${scale})`;
      wrap.style.height = (CANVAS_H * scale) + 'px';
    };

    const queueSave = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => repo.setDoc(DOC, { items }).catch(() => {}), 500);
    };

    const nextZ = () => items.reduce((m, i) => Math.max(m, i.z || 0), 0) + 1;

    // --- tek bir ogeyi ciz ---
    const nodes = new Map();

    function paint(item) {
      const node = nodes.get(item.id);
      if (!node) return;
      node.style.width = item.w + 'px';
      node.style.height = item.h + 'px';
      node.style.transform =
        `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rot || 0}deg)`;
      node.style.zIndex = String(item.z || 1);
    }

    function setActive(id) {
      activeId = id;
      for (const [iid, n] of nodes) n.classList.toggle('is-active', iid === id);
    }

    async function buildNode(item) {
      let inner;
      if (item.type === 'image') {
        const img = el('img', { alt: '' });
        try {
          const blob = await repo.loadImage(item.blobId);
          if (blob) img.src = scope.create(blob);
        } catch {}
        img.draggable = false;
        inner = img;
      } else if (item.type === 'sticker') {
        const st = stickerById(item.stickerId);
        inner = el('div', { style: { width: '100%', height: '100%' }, html: st ? st.svg : '' });
      } else {
        inner = el('div', { class: 'board-item__note' }, item.text || '');
        inner.addEventListener('dblclick', () => editNote(item));
      }

      const node = el('div', { class: 'board-item', dataset: { id: item.id } },
        inner,
        el('div', { class: 'board-item__frame' }),
        el('div', { class: 'board-handle board-handle--resize', dataset: { act: 'resize' } }),
        el('div', { class: 'board-handle board-handle--rotate', dataset: { act: 'rotate' } }),
        el('div', { class: 'board-handle board-handle--delete', dataset: { act: 'delete' } }));

      nodes.set(item.id, node);
      canvas.append(node);
      paint(item);
      attachPointer(node, item);
      return node;
    }

    // --- surukle / boyutlandir / dondur ---
    function attachPointer(node, item) {
      let drag = null;   // {pointerId, mode, startX, startY, ox, oy, ow, oh, orot, cx, cy, startAng}

      const onDown = (e) => {
        if (drag) return;                         // ilk parmaga kilitlen
        const act = e.target.dataset && e.target.dataset.act;

        if (act === 'delete') {
          e.preventDefault(); e.stopPropagation();
          removeItem(item);
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        setActive(item.id);
        item.z = nextZ();
        paint(item);

        const rect = canvas.getBoundingClientRect();
        const cx = rect.left + (item.x + item.w / 2) * scale;
        const cy = rect.top + (item.y + item.h / 2) * scale;

        drag = {
          pointerId: e.pointerId,
          mode: act === 'resize' ? 'resize' : act === 'rotate' ? 'rotate' : 'move',
          startX: e.clientX, startY: e.clientY,
          ox: item.x, oy: item.y, ow: item.w, oh: item.h, orot: item.rot || 0,
          cx, cy,
          startAng: Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI,
        };

        try { node.setPointerCapture(e.pointerId); } catch {}
        node.classList.add('is-dragging');
      };

      let frame = null;
      const onMove = (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        e.preventDefault();
        const dx = (e.clientX - drag.startX) / scale;
        const dy = (e.clientY - drag.startY) / scale;

        if (drag.mode === 'move') {
          item.x = Math.round(drag.ox + dx);
          item.y = Math.round(drag.oy + dy);
        } else if (drag.mode === 'resize') {
          const ratio = drag.oh / drag.ow;
          const w = Math.max(40, Math.round(drag.ow + dx));
          item.w = w;
          item.h = Math.max(40, Math.round(w * ratio));
        } else {
          const ang = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI;
          let rot = drag.orot + (ang - drag.startAng);
          if (e.shiftKey) rot = Math.round(rot / 15) * 15;
          item.rot = Math.round(rot);
        }

        if (!frame) frame = requestAnimationFrame(() => { frame = null; paint(item); });
      };

      const finish = (e) => {
        if (!drag || (e && e.pointerId !== drag.pointerId)) return;
        try { node.releasePointerCapture(drag.pointerId); } catch {}
        drag = null;
        node.classList.remove('is-dragging');
        if (frame) { cancelAnimationFrame(frame); frame = null; }
        paint(item);
        queueSave();
      };

      node.addEventListener('pointerdown', onDown);
      node.addEventListener('pointermove', onMove);
      node.addEventListener('pointerup', finish);
      node.addEventListener('pointercancel', finish);      // iOS bunu cok firlatiyor
      node.addEventListener('lostpointercapture', finish);
    }

    function removeItem(item) {
      confirmDialog('Kaldır', 'Bu öğe panodan kaldırılsın mı?', 'kaldır').then(async (ok) => {
        if (!ok) return;
        const i = items.indexOf(item);
        if (i >= 0) items.splice(i, 1);
        const n = nodes.get(item.id);
        if (n) n.remove();
        nodes.delete(item.id);
        if (item.type === 'image' && item.blobId) await repo.deleteImage(item.blobId);
        await repo.setDoc(DOC, { items });
      });
    }

    function editNote(item) {
      const ta = el('textarea', { class: 'textarea' });
      ta.value = item.text || '';
      modal({
        title: 'not', body: ta,
        actions: [{ label: 'vazgeç' }, {
          label: 'kaydet', kind: 'primary',
          onClick: async () => {
            item.text = ta.value;
            const n = nodes.get(item.id);
            if (n) n.querySelector('.board-item__note').textContent = item.text;
            await repo.setDoc(DOC, { items });
          },
        }],
      });
    }

    // --- ekleme ---
    // Yeni ogeler ust uste binmesin diye panoya yayarak yerlestiriyoruz:
    // kaba bir izgara + kucuk rastgele kayma.
    const spawnSpot = (w, h) => {
      const cols = Math.max(1, Math.floor(CANVAS_W / (w + 40)));
      const rows = Math.max(1, Math.floor(CANVAS_H / (h + 40)));
      const i = items.length % (cols * rows);
      const jitter = () => (Math.random() - 0.5) * 40;
      return {
        x: Math.round(Math.min(CANVAS_W - w - 20, 30 + (i % cols) * (w + 40) + jitter())),
        y: Math.round(Math.min(CANVAS_H - h - 20, 30 + Math.floor(i / cols) * (h + 40) + jitter())),
      };
    };

    const addItem = async (partial) => {
      const w = partial.w || 200;
      const h = partial.h || 200;
      const spot = spawnSpot(w, h);
      const item = {
        id: uuid(), x: spot.x, y: spot.y,
        w, h, rot: Math.round((Math.random() - .5) * 16), z: nextZ(), ...partial,
      };
      items.push(item);
      await buildNode(item);
      setActive(item.id);
      await repo.setDoc(DOC, { items });
      return item;
    };

    const fileInput = el('input', { type: 'file', accept: 'image/*', multiple: true, class: 'hidden' });
    fileInput.addEventListener('change', async () => {
      for (const f of Array.from(fileInput.files || [])) {
        try {
          const { bytes, mime, width, height } = await prepareForStorage(f);
          const bid = await repo.saveImage(bytes, mime);
          const w = 260;
          await addItem({ type: 'image', blobId: bid, w, h: Math.round(w * (height / width)) });
        } catch (e) { toast('Eklenemedi: ' + e.message, 'err'); }
      }
      fileInput.value = '';
    });

    const addFromURL = () => {
      const inp = el('input', { class: 'input', placeholder: 'https://i.pinimg.com/…' });
      modal({
        title: 'bağlantıdan görsel ekle',
        body: el('div', {},
          el('p', { class: 'muted' },
            'Pinterest\'te görsele uzun basıp "görseli kopyala/aç" ile doğrudan resim bağlantısını al ve buraya yapıştır.'),
          inp,
          el('p', { class: 'field__hint' },
            'Görsel indirilip cihazına şifreli olarak kaydedilir; sonradan çevrimdışı da görünür.')),
        actions: [{ label: 'vazgeç' }, {
          label: 'ekle', kind: 'primary',
          onClick: async () => {
            const url = inp.value.trim();
            if (!/^https?:\/\//i.test(url)) { toast('Geçerli bir bağlantı gir.', 'err'); return false; }
            try {
              const res = await fetch(url, { mode: 'cors' });
              if (!res.ok) throw new Error('indirilemedi');
              const blob = await res.blob();
              const { bytes, mime, width, height } = await prepareForStorage(blob);
              const bid = await repo.saveImage(bytes, mime);
              const w = 260;
              await addItem({ type: 'image', blobId: bid, w, h: Math.round(w * (height / width)) });
              toast('Eklendi.');
            } catch {
              toast('Bu görsel indirilemedi. Kaydedip "fotoğraf ekle" ile yükleyebilirsin.', 'err');
              return false;
            }
          },
        }],
      });
    };

    // --- ilk cizim ---
    for (const item of items) await buildNode(item);

    wrap.addEventListener('pointerdown', (e) => { if (e.target === wrap || e.target === canvas) setActive(null); });

    clear(host).append(
      el('div', { class: 'card card--tight' },
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn--sm btn--primary', onClick: () => fileInput.click() }, 'fotoğraf'),
          el('button', {
            class: 'btn btn--sm',
            onClick: () => {
              const m = modal({
                title: 'çıkartma seç', wide: true,
                body: stickerPicker(async (s) => { await addItem({ type: 'sticker', stickerId: s.id, w: 130, h: 130 }); m.close(); }),
              });
            },
          }, 'çıkartma'),
          el('button', {
            class: 'btn btn--sm',
            onClick: () => addItem({ type: 'note', text: 'buraya yaz…', w: 220, h: 200 }),
          }, 'not'),
          el('button', { class: 'btn btn--sm', onClick: addFromURL }, 'bağlantıdan'),
          fileInput),
        el('p', { class: 'field__hint', style: { marginTop: '8px' } },
          'Öğeye dokun: köşelerde boyutlandırma, döndürme ve silme düğmeleri çıkar. Nota çift dokunarak yazısını değiştir.')),
      wrap);

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    this._ro = ro;
  },

  async unmount() {
    clearTimeout(saveTimer);
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (scope) { scope.revokeAll(); scope = null; }
  },
};
