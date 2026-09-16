// Gunluk: yazi listesi, okuma ve yazma.

import { el, clear, toast, modal, confirmDialog, todayISO, formatDate, escapeHTML, moodTag } from '../core/dom.js';
import * as repo from '../core/repo.js';
import { sanitizeHTML } from '../lib/sanitize.js';
import { prepareForStorage } from '../lib/image.js';
import { navigate } from '../core/router.js';
import { MOODS } from '../data/affirmations.js';
import { hydrate, parseYouTube, stickerPicker, youtubeFrame } from './media.js';

const CATEGORIES = [
  { id: 'personal',  label: 'personal' },
  { id: 'academic', label: 'academic' },
  { id: 'deep',    label: 'deep' },
  { id: 'scribbles', label: 'scribbles' },
];

const FONTS = [
  { id: 'Inter', label: 'Inter (plain)' },
  { id: 'Newsreader', label: 'Newsreader (serif)' },
  { id: 'Caveat', label: 'Caveat (handwriting)' },
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
        el('p', {}, posts.length ? 'No entries match that search.' : 'You have not written anything yet.'),
        !posts.length ? el('button', {
          class: 'btn btn--primary', onClick: () => openEditor(host, null),
        }, 'write your first entry') : null));
      return;
    }
    for (const p of shown) listBox.append(postCard(host, p));
  };

  const search = el('input', { class: 'input', type: 'search', placeholder: 'search entries…', style: { flex: '1 1 180px' } });
  search.addEventListener('input', () => { query = search.value; draw(); });

  const catChips = el('div', { class: 'tag-list' },
    el('button', { class: 'chip-btn is-on', dataset: { cat: '' } }, 'all'),
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
        el('button', { class: 'btn btn--primary', onClick: () => openEditor(host, null) }, 'new entry')),
      catChips),
    listBox);

  draw();
}

function postCard(host, p) {
  const mood = moodOf(p.mood);
  const card = el('article', { class: 'card post-card' },
    el('div', { class: 'post-card__meta' },
      el('span', {}, formatDate(p.date)),
      el('span', { class: 'chip' }, catLabel(p.category)),
      moodTag(mood)),
    el('h2', {
      class: 'post-card__title', role: 'button', tabindex: '0',
      onClick: () => openReader(host, p.id),
      onKeydown: (e) => { if (e.key === 'Enter') openReader(host, p.id); },
    }, p.title),
    p.coverBlobId ? el('img', { class: 'post-card__cover', dataset: { blob: p.coverBlobId }, alt: '' }) : null,
    el('p', { class: 'post-card__excerpt' }, p.excerpt + (p.excerpt.length >= 160 ? '…' : '')),
    p.song && p.song.url
      ? el('div', { class: 'post-card__song' }, '\u266a ', p.song.title || 'a song')
      : null,
    (p.tags || []).length ? el('div', { class: 'tag-list', style: { marginBottom: '10px' } },
      p.tags.map((t) => el('span', { class: 'chip' }, '#' + t))) : null,
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn btn--sm', onClick: () => openReader(host, p.id) }, 'read'),
      el('button', { class: 'btn btn--sm btn--ghost', onClick: () => openEditor(host, p.id) }, 'edit'),
      el('button', {
        class: 'btn btn--sm btn--ghost',
        onClick: async () => {
          if (await confirmDialog('Delete entry', `Delete "${p.title}"? This cannot be undone.`, 'delete')) {
            await repo.deletePost(p.id);
            toast('Entry deleted.');
            renderList(host);
          }
        },
      }, 'delete')));

  if (p.coverBlobId) hydrate(card).then((c) => { /* kart yenilenince zaten atiliyor */ });
  return card;
}

// Yaziya ilistirilen sarki. Kapali baslar: tiklayinca oynatici aciliyor,
// boylece her yaziyi acmak bir YouTube istegi tetiklemiyor.
function songPlayer(song) {
  if (!song || !song.url) return null;
  const ref = parseYouTube(song.url);
  if (!ref) return null;

  const slot = el('div', { class: 'song__slot' });
  const card = el('div', { class: 'song' },
    el('button', {
      class: 'song__button', type: 'button',
      'aria-label': 'play ' + (song.title || 'the song for this entry'),
      onClick: () => {
        if (slot.firstChild) { slot.replaceChildren(); card.classList.remove('is-open'); return; }
        slot.replaceChildren(youtubeFrame(ref, { autoplay: true }));
        card.classList.add('is-open');
      },
    },
      el('span', { class: 'song__note' }, '\u266a'),
      el('span', { class: 'song__text' },
        el('span', { class: 'song__label' }, ref.type === 'list' ? 'playlist for this entry' : 'song for this entry'),
        el('span', { class: 'song__title' }, song.title || 'listen')),
      el('span', { class: 'song__play' }, '\u25b6')),
    slot);
  return card;
}

// --- okuma -----------------------------------------------------------------
async function openReader(host, id) {
  const post = await repo.getPost(id);
  if (!post) { toast('Entry not found.', 'err'); return; }
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
      el('button', { class: 'btn btn--sm btn--ghost', onClick: () => renderList(host) }, '← all entries'),
      el('div', { class: 'post-card__meta', style: { marginTop: '12px' } },
        el('span', {}, formatDate(post.date)),
        el('span', { class: 'chip' }, catLabel(post.category)),
        moodTag(mood)),
      el('h1', { style: { marginTop: '4px' } }, post.title || '(untitled)'),
      songPlayer(post.song),
      bodyEl,
      (post.tags || []).length ? el('div', { class: 'tag-list', style: { marginTop: '16px' } },
        post.tags.map((t) => el('span', { class: 'chip' }, '#' + t))) : null,
      el('div', { class: 'btn-row', style: { marginTop: '18px' } },
        el('button', { class: 'btn', onClick: () => openEditor(host, id) }, 'edit'))));

  if (cleanup) cleanup();
  cleanup = await hydrate(bodyEl);
}

// --- yazma -----------------------------------------------------------------
async function openEditor(host, id) {
  const existing = id ? await repo.getPost(id) : null;
  const post = existing || {
    title: '', html: '', date: todayISO(), category: 'personal', mood: '', tags: [],
    style: { font: '', size: 1, color: '', align: 'start' }, blobIds: [],
  };
  const blobIds = new Set(post.blobIds || []);

  const title = el('input', { class: 'input', type: 'text', placeholder: 'title', 'aria-label': 'title', value: post.title });
  const date = el('input', { class: 'input', type: 'date', 'aria-label': 'date', value: post.date });
  const cat = el('select', { class: 'select', 'aria-label': 'category' },
    CATEGORIES.map((c) => el('option', { value: c.id, selected: c.id === post.category }, c.label)));
  const moodSel = el('select', { class: 'select', 'aria-label': 'mood' },
    el('option', { value: '' }, 'no mood'),
    MOODS.map((m) => el('option', { value: m.id, selected: m.id === post.mood }, m.label)));
  const tags = el('input', { class: 'input', type: 'text', placeholder: 'tags (comma separated)', value: (post.tags || []).join(', ') });

  // yazi basina gorunum
  const fontSel = el('select', { class: 'select', 'aria-label': 'font' },
    el('option', { value: '' }, 'default font'),
    FONTS.map((f) => el('option', { value: f.id, selected: f.id === (post.style && post.style.font) }, f.label)));
  const sizeInput = el('input', { class: 'input', type: 'range', 'aria-label': 'text size', min: '0.8', max: '2', step: '0.05', value: String((post.style && post.style.size) || 1) });
  const colorInput = el('input', { class: 'input', type: 'color', value: (post.style && post.style.color) || '#4a2338' });
  const useColor = el('input', { type: 'checkbox', checked: !!(post.style && post.style.color) });
  const alignSel = el('select', { class: 'select', 'aria-label': 'alignment' },
    [['start', 'left'], ['center', 'centre'], ['justify', 'justified']].map(([v, l]) =>
      el('option', { value: v, selected: v === ((post.style && post.style.align) || 'start') }, l)));

  // Yaziya ilistirilecek sarki
  let song = post.song ? { ...post.song } : null;
  const songRow = el('div', { class: 'song-pick' });
  const drawSong = () => {
    clear(songRow);
    if (song && song.url) {
      songRow.append(
        el('span', { class: 'song__note' }, '\u266a'),
        el('span', { class: 'song-pick__title' }, song.title || song.url),
        el('button', {
          class: 'btn btn--sm btn--ghost', type: 'button',
          onClick: () => { song = null; drawSong(); },
        }, 'remove'));
    } else {
      songRow.append(el('button', {
        class: 'btn btn--sm', type: 'button', onClick: pickSong,
      }, '\u266a  add a song for this entry'));
    }
  };

  function pickSong() {
    const url = el('input', { class: 'input', placeholder: 'paste a YouTube link' });
    const name = el('input', { class: 'input', placeholder: 'what is it? (optional)' });
    modal({
      title: 'a song for this entry',
      body: el('div', {},
        el('p', { class: 'muted' },
          'Paste a song or a playlist from YouTube. It appears at the top of the entry and plays when you tap it.'),
        url, el('div', { style: { height: '10px' } }), name),
      actions: [{ label: 'cancel' }, {
        label: 'add', kind: 'primary',
        onClick: () => {
          const ref = parseYouTube(url.value);
          if (!ref) { toast('That link was not recognised.', 'err'); return false; }
          song = { url: url.value.trim(), title: name.value.trim() };
          drawSong();
        },
      }],
    });
  }
  drawSong();

  const editor = el('div', {
    class: 'editor styled', contenteditable: 'true', role: 'textbox',
    'aria-multiline': 'true', 'data-placeholder': 'what happened today? how did it feel? nobody else will read this.',
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
    const cd = e.clipboardData;
    if (!cd) return;

    // Panoda gorsel varsa once onu al (ekran goruntusu yapistirma).
    const imgFiles = Array.from(cd.files || []).filter((f) => f.type && f.type.startsWith('image/'));
    if (imgFiles.length) {
      e.preventDefault();
      insertImages(imgFiles);
      return;
    }

    e.preventDefault();
    const html = cd.getData('text/html');
    const text = cd.getData('text/plain');

    // Sadece bir YouTube baglantisi yapistirildiysa, sarki olarak ilistirmeyi oner.
    const ytRef = !html && parseYouTube(text.trim());
    if (ytRef && /^https?:\/\/\S+$/.test(text.trim())) {
      modal({
        title: 'a YouTube link',
        body: el('p', { class: 'muted' },
          'Do you want this as the song for this entry, or dropped into the text?'),
        actions: [
          { label: 'into the text', onClick: () => {
              document.execCommand('insertHTML', false,
                `<div data-yt="${ytRef.type === 'list' ? 'list:' + ytRef.id : ytRef.id}">song</div>`);
            } },
          { label: 'song for the entry', kind: 'primary', onClick: () => {
              song = { url: text.trim(), title: '' };
              drawSong();
              toast('Added as the song for this entry.');
            } },
        ],
      });
      return;
    }

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

  // Fotograf ekleme tek bir yerden gecsin: dugme, surukle-birak ve yapistirma
  // hepsi bunu cagiriyor.
  async function insertImages(files) {
    const list = Array.from(files || []).filter((f) => f && f.type && f.type.startsWith('image/'));
    if (!list.length) return 0;
    let added = 0;
    for (const f of list) {
      try {
        const { bytes, mime } = await prepareForStorage(f);
        const bid = await repo.saveImage(bytes, mime);
        blobIds.add(bid);
        const blob = await repo.loadImage(bid);
        insertNode(el('img', { dataset: { blob: bid }, alt: '', src: URL.createObjectURL(blob) }));
        added++;
      } catch (e) {
        toast('Could not add the photo: ' + (e.message || e), 'err');
      }
    }
    if (added) toast(added === 1 ? 'Photo added.' : `${added} photos added.`);
    return added;
  }

  const fileInput = el('input', { type: 'file', accept: 'image/*', multiple: true, class: 'hidden' });
  fileInput.addEventListener('change', async () => {
    await insertImages(fileInput.files);
    fileInput.value = '';
  });

  // Surukle-birak
  editor.addEventListener('dragover', (e) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) {
      e.preventDefault();
      editor.classList.add('is-dropping');
    }
  });
  editor.addEventListener('dragleave', () => editor.classList.remove('is-dropping'));
  editor.addEventListener('drop', async (e) => {
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault();
    editor.classList.remove('is-dropping');
    await insertImages(e.dataTransfer.files);
  });

  const toolbar = el('div', { class: 'toolbar' },
    tb('B', 'bold', 'bold'), tb('I', 'italic', 'italic'), tb('U', 'underline', 'underline'),
    tb('S', 'strikeThrough', 'strikethrough'),
    el('span', { class: 'toolbar__sep' }),
    tb('• list', 'insertUnorderedList'), tb('1. list', 'insertOrderedList'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'quote',
      onMousedown: (e) => e.preventDefault(),
      onClick: () => exec('formatBlock', 'blockquote'),
    }, '❝'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'divider',
      onMousedown: (e) => e.preventDefault(), onClick: () => exec('insertHorizontalRule'),
    }, '―'),
    el('span', { class: 'toolbar__sep' }),
    el('button', { class: 'toolbar__btn', type: 'button', title: 'add a photo', onClick: () => fileInput.click() }, 'photo'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'add a sticker',
      onClick: () => {
        const m = modal({
          title: 'pick a sticker', wide: true,
          body: stickerPicker((s) => {
            const box = el('div', { dataset: { sticker: s.id }, style: { width: '90px', display: 'inline-block' }, html: s.svg });
            insertNode(box);
            m.close();
          }),
        });
      },
    }, 'sticker'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'add a song',
      onClick: () => {
        const inp = el('input', { class: 'input', placeholder: 'paste a YouTube link' });
        modal({
          title: 'add a song',
          body: el('div', {}, el('p', { class: 'muted' }, 'A video or playlist link.'), inp),
          actions: [{ label: 'cancel' }, {
            label: 'add', kind: 'primary',
            onClick: () => {
              const ref = parseYouTube(inp.value);
              if (!ref) { toast('That link was not recognised.', 'err'); return false; }
              insertNode(el('div', { dataset: { yt: ref.type === 'list' ? 'list:' + ref.id : ref.id } }, 'song'));
              toast('Song added. The player appears once you save.');
            },
          }],
        });
      },
    }, 'song'),
    el('button', {
      class: 'toolbar__btn', type: 'button', title: 'add a link',
      onMousedown: (e) => e.preventDefault(),
      onClick: () => {
        const u = prompt('Link address:');
        if (u) exec('createLink', u);
      },
    }, 'link'),
    fileInput);

  const save = async () => {
    const saved = await repo.savePost({
      ...post, id,
      title: title.value.trim() || '(untitled)',
      html: sanitizeHTML(editor.innerHTML),
      date: date.value || todayISO(),
      category: cat.value,
      mood: moodSel.value,
      tags: tags.value.split(',').map((t) => t.trim()).filter(Boolean),
      song,
      style: {
        font: fontSel.value, size: Number(sizeInput.value),
        color: useColor.checked ? colorInput.value : '', align: alignSel.value,
      },
      blobIds: Array.from(blobIds),
    });
    toast('Saved.');
    openReader(host, saved.id);
  };

  clear(host).append(
    el('div', { class: 'card' },
      el('div', { class: 'btn-row', style: { marginBottom: '14px' } },
        el('button', { class: 'btn btn--sm btn--ghost', onClick: () => renderList(host) }, '← cancel')),
      el('div', { class: 'field' }, title),
      el('div', { class: 'row' },
        el('div', {}, el('label', { class: 'field__label' }, 'date'), date),
        el('div', {}, el('label', { class: 'field__label' }, 'category'), cat),
        el('div', {}, el('label', { class: 'field__label' }, 'mood'), moodSel)),
      songRow,
      el('details', { style: { margin: '12px 0' } },
        el('summary', { style: { cursor: 'pointer', fontWeight: '700', minHeight: '38px' } }, 'how this entry looks'),
        el('div', { class: 'row', style: { marginTop: '10px' } },
          el('div', {}, el('label', { class: 'field__label' }, 'font'), fontSel),
          el('div', {}, el('label', { class: 'field__label' }, 'size'), sizeInput),
          el('div', {}, el('label', { class: 'field__label' }, 'alignment'), alignSel),
          el('div', {}, el('label', { class: 'field__label' }, 'colour'),
            el('label', { class: 'switch' }, useColor, el('span', { class: 'switch__track' })),
            colorInput))),
      toolbar,
      editor,
      el('div', { class: 'field', style: { marginTop: '12px' } }, tags),
      el('div', { class: 'btn-row btn-row--end' },
        el('button', { class: 'btn btn--primary', onClick: save }, 'save'))));

  hydrate(editor);
  title.focus();
}

export default {
  async mount(host, { rest }) {
    if (rest && rest[0] === 'new') return openEditor(host, null);
    if (rest && rest[0]) return openReader(host, rest[0]);
    return renderList(host);
  },
  async unmount() { if (cleanup) { cleanup(); cleanup = null; } },
};
