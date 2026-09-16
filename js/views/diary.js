// Gunluk: yazi listesi, okuma ve yazma.

import { el, clear, toast, modal, confirmDialog, todayISO, formatDateTR, escapeHTML } from '../core/dom.js';
import * as repo from '../core/repo.js';
import { sanitizeHTML } from '../lib/sanitize.js';
import { prepareForStorage } from '../lib/image.js';
import { navigate } from '../core/router.js';
import { MOODS } from '../data/affirmations.js';
import { hydrate, parseYouTube, stickerPicker } from './media.js';

const CATEGORIES = [
  { id: 'kisisel',  label: 'kişisel' },
  { id: 'akademik', label: 'akademik' },
  { id: 'derin',    label: 'derin' },
  { id: 'karalama', label: 'karalama' },
];

const FONTS = [
  { id: 'Inter', label: 'Inter (sade)' },
  { id: 'Newsreader', label: 'Newsreader (serif)' },
  { id: 'Caveat', label: 'Caveat (el yazısı)' },
  { id: 'Dancing Script', label: 'Dancing Script' },
  { id: 'Shadows Into Light', label: 'Shadows Into Light' },
  { id: 'Indie Flower', label: 'Indie Flower' },
  { id: 'Gloria Hallelujah', label: 'Gloria Hallelujah' },
  { id: 'Playfair Display', label: 'Playfair Display' },
  { id: 'Cormorant Garamond', label: 'Cormorant Garamond' },
  { id: 'Quicksand', label: 'Quicksand' },
  { id: 'Nunito', label: 'Nunito' },
];

const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]).label;
const moodOf = (id) => MOODS.find((m) => m.id === id);

let cleanup = null;

// --- liste -----------------------------------------------------------------
async function renderList(host) {
  const posts = await repo.listPosts();
  let filterCat = '';
  let query = '';

  const listBox = el('div', {});

  const draw = () => {
    const q = query.toLocaleLowerCase('tr-TR');
    const shown = posts.filter((p) =>
      (!filterCat || p.category === filterCat) &&
      (!q || (p.title + ' ' + p.excerpt + ' ' + (p.tags || []).join(' ')).toLocaleLowerCase('tr-TR').includes(q)));

    clear(listBox);
    if (!shown.length) {
      listBox.append(el('div', { class: 'card empty' },
        el('p', {}, posts.length ? 'Bu aramaya uyan yazı yok.' : 'Henüz hiç yazmadın.'),
        !posts.length ? el('button', {
          class: 'btn btn--primary', onClick: () => openEditor(host, null),
        }, 'ilk yazını yaz') : null));
      return;
    }
    for (const p of shown) listBox.append(postCard(host, p));
  };

  const search = el('input', { class: 'input', type: 'search', placeholder: 'yazılarda ara…', style: { flex: '1 1 180px' } });
  search.addEventListener('input', () => { query = search.value; draw(); });

  const catChips = el('div', { class: 'tag-list' },
    el('button', { class: 'chip-btn is-on', dataset: { cat: '' } }, 'hepsi'),
    CATEGORIES.map((c) => el('button', { class: 'chip-btn', dataset: { cat: c.id } }, c.label)));
  catChips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip-btn');
    if (!b) return;
    filterCat = b.dataset.cat;
    for (const x of catChips.children) x.classList.toggle('is-on', x === b);
    draw();
  });

  clear(host).append(
    el('div', { class: 'card card--tight' },
      el('div', { class: 'filter-bar', style: { marginBottom: '10px' } },
        search,
        el('button', { class: 'btn btn--primary', onClick: () => openEditor(host, null) }, 'yeni yazı')),
      catChips),
    listBox);

  draw();
}

function postCard(host, p) {
  const mood = moodOf(p.mood);
  const card = el('article', { class: 'card post-card' },
    el('div', { class: 'post-card__meta' },
      el('span', {}, formatDateTR(p.date)),
      el('span', { class: 'chip' }, catLabel(p.category)),
      mood ? el('span', { class: 'chip' }, mood.emoji + ' ' + mood.label) : null),
    el('h2', {
      class: 'post-card__title', role: 'button', tabindex: '0',
      onClick: () => openReader(host, p.id),
      onKeydown: (e) => { if (e.key === 'Enter') openReader(host, p.id); },
    }, p.title),
    p.coverBlobId ? el('img', { class: 'post-card__cover', dataset: { blob: p.coverBlobId }, alt: '' }) : null,
    el('p', { class: 'post-card__excerpt' }, p.excerpt + (p.excerpt.length >= 160 ? '…' : '')),
    (p.tags || []).length ? el('div', { class: 'tag-list', style: { marginBottom: '10px' } },
      p.tags.map((t) => el('span', { class: 'chip' }, '#' + t))) : null,
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn btn--sm', onClick: () => openReader(host, p.id) }, 'oku'),
      el('button', { class: 'btn btn--sm btn--ghost', onClick: () => openEditor(host, p.id) }, 'düzenle'),
      el('button', {
        class: 'btn btn--sm btn--ghost',
        onClick: async () => {
          if (await confirmDialog('Yazıyı sil', `"${p.title}" silinsin mi? Bu geri alınamaz.`, 'sil')) {
            await repo.deletePost(p.id);
            toast('Yazı silindi.');
            renderList(host);
          }
        },
      }, 'sil')));

  if (p.coverBlobId) hydrate(card).then((c) => { /* kart yenilenince zaten atiliyor */ });
  return card;
}

// --- okuma -----------------------------------------------------------------
async function openReader(host, id) {
  const post = await repo.getPost(id);
  if (!post) { toast('Yazı bulunamadı.', 'err'); return; }
  const mood = moodOf(post.mood);

  const bodyEl = el('div', {
    class: 'post-body styled',
    style: {
      '--post-font': post.style && post.style.font ? `'${post.style.font}'` : '',
      '--post-size': post.style && post.style.size ? post.style.size + 'rem' : '',
      '--post-color': (post.style && post.style.color) || '',
      '--post-align': (post.style && post.style.align) || '',
    },
    html: sanitizeHTML(post.html),
  });

  clear(host).append(
    el('div', { class: 'card' },
      el('button', { class: 'btn btn--sm btn--ghost', onClick: () => renderList(host) }, '← tüm yazılar'),
      el('div', { class: 'post-card__meta', style: { marginTop: '12px' } },
        el('span', {}, formatDateTR(post.date)),
        el('span', { class: 'chip' }, catLabel(post.category)),
        mood ? el('span', { class: 'chip' }, mood.emoji + ' ' + mood.label) : null),
      el('h1', { style: { marginTop: '4px' } }, post.title || '(başlıksız)'),
      bodyEl,
      (post.tags || []).length ? el('div', { class: 'tag-list', style: { marginTop: '16px' } },
        post.tags.map((t) => el('span', { class: 'chip' }, '#' + t))) : null,
      el('div', { class: 'btn-row', style: { marginTop: '18px' } },
        el('button', { class: 'btn', onClick: () => openEditor(host, id) }, 'düzenle'))));

  if (cleanup) cleanup();
  cleanup = await hydrate(bodyEl);
}

// --- yazma -----------------------------------------------------------------
async function openEditor(host, id) {
  const existing = id ? await repo.getPost(id) : null;
  const post = existing || {
    title: '', html: '', date: todayISO(), category: 'kisisel', mood: '', tags: [],
    style: { font: '', size: 1, color: '', align: 'start' }, blobIds: [],
  };
  const blobIds = new Set(post.blobIds || []);

  const title = el('input', { class: 'input', type: 'text', placeholder: 'başlık', 'aria-label': 'başlık', value: post.title });
  const date = el('input', { class: 'input', type: 'date', 'aria-label': 'tarih', value: post.date });
  const cat = el('select', { class: 'select', 'aria-label': 'kategori' },
    CATEGORIES.map((c) => el('option', { value: c.id, selected: c.id === post.category }, c.label)));
  const moodSel = el('select', { class: 'select', 'aria-label': 'ruh hâli' },
    el('option', { value: '' }, 'ruh hâli yok'),
    MOODS.map((m) => el('option', { value: m.id, selected: m.id === post.mood }, `${m.emoji} ${m.label}`)));
  const tags = el('input', { class: 'input', type: 'text', placeholder: 'etiketler (virgülle)', value: (post.tags || []).join(', ') });

  // yazi basina gorunum
  const fontSel = el('select', { class: 'select', 'aria-label': 'yazı tipi' },
    el('option', { value: '' }, 'varsayılan yazı tipi'),
    FONTS.map((f) => el('option', { value: f.id, selected: f.id === (post.style && post.style.font) }, f.label)));
  const sizeInput = el('input', { class: 'input', type: 'range', 'aria-label': 'yazı boyutu', min: '0.8', max: '2', step: '0.05', value: String((post.style && post.style.size) || 1) });
  const colorInput = el('input', { class: 'input', type: 'color', value: (post.style && post.style.color) || '#4a2338' });
  const useColor = el('input', { type: 'checkbox', checked: !!(post.style && post.style.color) });
  const alignSel = el('select', { class: 'select', 'aria-label': 'hizalama' },
    [['start', 'sola'], ['center', 'ortaya'], ['justify', 'iki yana']].map(([v, l]) =>
      el('option', { value: v, selected: v === ((post.style && post.style.align) || 'start') }, l)));

  const editor = el('div', {
    class: 'editor styled', contenteditable: 'true', role: 'textbox',
    'aria-multiline': 'true', 'data-placeholder': 'bugün ne oldu? ne hissettin? kimse okumayacak.',
    html: sanitizeHTML(post.html),
  });

  const applyStyle = () => {
    editor.style.setProperty('--post-font', fontSel.value ? `'${fontSel.value}'` : '');
    editor.style.setProperty('--post-size', sizeInput.value + 'rem');
    editor.style.setProperty('--post-color', useColor.checked ? colorInput.value : '');
    editor.style.setProperty('--post-align', alignSel.value);
  };
  [fontSel, sizeInput, colorInput, useColor, alignSel].forEach((c) => c.addEventListener('input', applyStyle));
  applyStyle();

  // Yapistirmayi temizle: baska sitelerden gelen bicimlendirme tasarimi bozuyor.
  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, html ? sanitizeHTML(html) : escapeHTML(text).replace(/\n/g, '<br>'));
  });

  const exec = (cmd, val = null) => { editor.focus(); document.execCommand(cmd, false, val); };
  const tb = (label, cmd, title) => el('button', {
    class: 'toolbar__btn', type: 'button', title: title || label,
    onMousedown: (e) => e.preventDefault(),
    onClick: () => exec(cmd),
  }, label);

  const insertNode = (node) => {
    editor.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editor.contains(sel.anchorNode)) {
      const r = sel.getRangeAt(0);
      r.deleteContents();
      r.insertNode(node);
      r.setStartAfter(node);
      sel.removeAllRanges();
      sel.addRange(r);
    } else {
      editor.append(node);
    }
    editor.append(document.createElement('br'));
  };

  const fileInput = el('input', { type: 'file', accept: 'image/*', multiple: true, class: 'hidden' });
  fileInput.addEventListener('change', async () => {
    for (const f of Array.from(fileInput.files || [])) {
      try {
        const { bytes, mime } = await prepareForStorage(f);
        const bid = await repo.saveImage(bytes, mime);
        blobIds.add(bid);
        const blob = await repo.loadImage(bid);
        const img = el('img', { dataset: { blob: bid }, alt: '', src: URL.createObjectURL(blob) });
        insertNode(img);
      } catch (e) {
        toast('Fotoğraf eklenemedi: ' + (e.message || e), 'err');
      }
    }
    fileInput.value = '';
    toast('Fotoğraf eklendi.');
  });

  const toolbar = el('div', { class: 'toolbar' },
    tb('B', 'bold', 'kalın'), tb('I', 'italic', 'italik'), tb('U', 'underline', 'altı çizili'),
    tb('S', 'strikeThrough', 'üstü çizili'),
    el('span', { class: 'toolbar__sep' }),
    tb('• liste', 'insertUnorderedList'), tb('1. liste', 'insertOrderedList'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'alıntı',
      onMousedown: (e) => e.preventDefault(),
      onClick: () => exec('formatBlock', 'blockquote'),
    }, '❝'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'ara çizgi',
      onMousedown: (e) => e.preventDefault(), onClick: () => exec('insertHorizontalRule'),
    }, '―'),
    el('span', { class: 'toolbar__sep' }),
    el('button', { class: 'toolbar__btn', type: 'button', title: 'fotoğraf ekle', onClick: () => fileInput.click() }, 'fotoğraf'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'çıkartma ekle',
      onClick: () => {
        const m = modal({
          title: 'çıkartma seç', wide: true,
          body: stickerPicker((s) => {
            const box = el('div', { dataset: { sticker: s.id }, style: { width: '90px', display: 'inline-block' }, html: s.svg });
            insertNode(box);
            m.close();
          }),
        });
      },
    }, 'çıkartma'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'YouTube ekle',
      onClick: () => {
        const inp = el('input', { class: 'input', placeholder: 'YouTube bağlantısı yapıştır' });
        modal({
          title: 'video ekle',
          body: el('div', {}, el('p', { class: 'muted' }, 'Video ya da çalma listesi bağlantısı.'), inp),
          actions: [{ label: 'vazgeç' }, {
            label: 'ekle', kind: 'primary',
            onClick: () => {
              const ref = parseYouTube(inp.value);
              if (!ref) { toast('Bağlantı tanınmadı.', 'err'); return false; }
              insertNode(el('div', { dataset: { yt: ref.type === 'list' ? 'list:' + ref.id : ref.id } }, '▶ video'));
              toast('Video eklendi. Kaydedince oynatıcı görünecek.');
            },
          }],
        });
      },
    }, 'video'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'bağlantı ekle',
      onMousedown: (e) => e.preventDefault(),
      onClick: () => {
        const u = prompt('Bağlantı adresi:');
        if (u) exec('createLink', u);
      },
    }, 'bağlantı'),
    fileInput);

  const save = async () => {
    const saved = await repo.savePost({
      ...post, id,
      title: title.value.trim() || '(başlıksız)',
      html: sanitizeHTML(editor.innerHTML),
      date: date.value || todayISO(),
      category: cat.value,
      mood: moodSel.value,
      tags: tags.value.split(',').map((t) => t.trim()).filter(Boolean),
      style: {
        font: fontSel.value, size: Number(sizeInput.value),
        color: useColor.checked ? colorInput.value : '', align: alignSel.value,
      },
      blobIds: Array.from(blobIds),
    });
    toast('Kaydedildi.');
    openReader(host, saved.id);
  };

  clear(host).append(
    el('div', { class: 'card' },
      el('div', { class: 'btn-row', style: { marginBottom: '14px' } },
        el('button', { class: 'btn btn--sm btn--ghost', onClick: () => renderList(host) }, '← vazgeç')),
      el('div', { class: 'field' }, title),
      el('div', { class: 'row' },
        el('div', {}, el('label', { class: 'field__label' }, 'tarih'), date),
        el('div', {}, el('label', { class: 'field__label' }, 'kategori'), cat),
        el('div', {}, el('label', { class: 'field__label' }, 'ruh hâli'), moodSel)),
      el('details', { style: { margin: '12px 0' } },
        el('summary', { style: { cursor: 'pointer', fontWeight: '700', minHeight: '38px' } }, 'bu yazının görünümü'),
        el('div', { class: 'row', style: { marginTop: '10px' } },
          el('div', {}, el('label', { class: 'field__label' }, 'yazı tipi'), fontSel),
          el('div', {}, el('label', { class: 'field__label' }, 'boyut'), sizeInput),
          el('div', {}, el('label', { class: 'field__label' }, 'hizalama'), alignSel),
          el('div', {}, el('label', { class: 'field__label' }, 'renk'),
            el('label', { class: 'switch' }, useColor, el('span', { class: 'switch__track' })),
            colorInput))),
      toolbar,
      editor,
      el('div', { class: 'field', style: { marginTop: '12px' } }, tags),
      el('div', { class: 'btn-row btn-row--end' },
        el('button', { class: 'btn btn--primary', onClick: save }, 'kaydet'))));

  hydrate(editor);
  title.focus();
}

export default {
  async mount(host, { rest }) {
    if (rest && rest[0] === 'yeni') return openEditor(host, null);
    if (rest && rest[0]) return openReader(host, rest[0]);
    return renderList(host);
  },
  async unmount() { if (cleanup) { cleanup(); cleanup = null; } },
};
