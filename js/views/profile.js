// Profilim: kim olduğum, gelişim alanlarım, öneriler ve pinlediklerim.

import { el, clear, toast, modal, confirmDialog, todayISO } from '../core/dom.js';
import * as repo from '../core/repo.js';
import { prepareForStorage, makeObjectURLScope } from '../lib/image.js';
import { CATEGORIES, SUGGESTIONS, dailySuggestion, pickSuggestions, categoryOf } from '../data/improve.js';
import { personalSuggestions } from '../ai/features.js';
import { uuid } from '../core/crypto.js';

const PROMPTS = [
  { key: 'now', label: 'şu an', ph: 'şu sıralar neyin içindesin?' },
  { key: 'about', label: 'kendimi tanıtırsam', ph: 'kendini nasıl anlatırsın? kesin cümleler kurmak zorunda değilsin.' },
  { key: 'discovering', label: 'kendimde keşfettiğim şeyler', ph: 'son zamanlarda kendinle ilgili ne fark ettin?' },
  { key: 'values', label: 'benim için önemli olan', ph: 'neye değer veriyorsun? neyi taşımak istiyorsun?' },
];

let scope = null;

const view = {
  async mount(host) {
    scope = makeObjectURLScope();
    const profile = await repo.getProfile();
    const settings = await repo.getSettings();
    let pins = await repo.listPins();

    // --- fotograf ---
    // Fotograf dugumu, DOM'a eklenmeden ONCE secilmeli: heniz ebeveyni olmayan
    // bir dugumde replaceWith() sessizce hicbir sey yapmiyor.
    let photo = el('div', { class: 'profile-photo' }, '🎀');
    if (profile.photoId) {
      try {
        const blob = await repo.loadImage(profile.photoId);
        if (blob) photo = el('img', { class: 'profile-photo', src: scope.create(blob), alt: 'profil fotoğrafı' });
      } catch {}
    }
    const photoInput = el('input', { type: 'file', accept: 'image/*', class: 'hidden' });
    photoInput.addEventListener('change', async () => {
      const f = photoInput.files && photoInput.files[0];
      if (!f) return;
      try {
        const { bytes, mime } = await prepareForStorage(f, 600, 0.85);
        if (profile.photoId) await repo.deleteImage(profile.photoId);
        const id = await repo.saveImage(bytes, mime);
        await repo.saveProfile({ photoId: id });
        toast('Fotoğraf güncellendi.');
        await view.mount(host);
      } catch (e) { toast('Yüklenemedi: ' + e.message, 'err'); }
    });

    const nameInput = el('input', { class: 'input', placeholder: 'adın', value: profile.name });

    // --- serbest metin alanlari ---
    const fields = {};
    const fieldCards = PROMPTS.map((p) => {
      const ta = el('textarea', { class: 'textarea', placeholder: p.ph }, profile[p.key] || '');
      ta.value = profile[p.key] || '';
      fields[p.key] = ta;
      return el('div', { class: 'field' }, el('label', { class: 'field__label' }, p.label), ta);
    });

    const saveProfile = async () => {
      const patch = { name: nameInput.value.trim() };
      for (const p of PROMPTS) patch[p.key] = fields[p.key].value;
      await repo.saveProfile(patch);
      toast('Kaydedildi.');
    };

    // --- gelisim alanlari ---
    let growth = [...(profile.growth || [])];
    const growthBox = el('div', {});
    const drawGrowth = () => {
      clear(growthBox);
      if (!growth.length) {
        growthBox.append(el('p', { class: 'muted' }, 'Henüz bir alan eklemedin.'));
        return;
      }
      for (const g of growth) {
        const note = el('textarea', { class: 'textarea', style: { minHeight: '64px' }, placeholder: 'bu konuda ne yapıyorum, ne yapabilirim?' });
        note.value = g.note || '';
        note.addEventListener('change', async () => {
          g.note = note.value;
          await repo.saveProfile({ growth });
        });
        growthBox.append(el('div', { class: 'card card--tight card--flat', style: { marginBottom: '9px' } },
          el('div', { class: 'card__head' },
            el('strong', {}, g.title),
            el('button', {
              class: 'btn btn--sm btn--ghost',
              onClick: async () => {
                if (!await confirmDialog('Kaldır', `"${g.title}" kaldırılsın mı?`, 'kaldır')) return;
                growth = growth.filter((x) => x.id !== g.id);
                await repo.saveProfile({ growth });
                drawGrowth();
              },
            }, 'kaldır')),
          note));
      }
    };
    drawGrowth();

    const addGrowth = () => {
      const inp = el('input', { class: 'input', placeholder: 'örn. daha düzenli okumak' });
      modal({
        title: 'gelişim alanı ekle',
        body: inp,
        actions: [{ label: 'vazgeç' }, {
          label: 'ekle', kind: 'primary',
          onClick: async () => {
            const t = inp.value.trim();
            if (!t) return false;
            growth.push({ id: uuid(), title: t, note: '' });
            await repo.saveProfile({ growth });
            drawGrowth();
          },
        }],
      });
    };

    // --- oneriler ---
    const suggBox = el('div', {});
    let shownCat = '';
    const drawSuggestions = (list) => {
      clear(suggBox);
      for (const s of list) {
        const c = categoryOf(s.c);
        suggBox.append(el('div', { class: 'suggestion' },
          el('div', { class: 'suggestion__cat' }, `${c.emoji} ${c.label}`),
          el('div', { class: 'suggestion__title' }, s.t),
          el('p', { class: 'suggestion__desc' }, s.d),
          el('button', {
            class: 'btn btn--sm',
            onClick: async () => {
              if (pins.some((p) => p.title === s.t)) { toast('Zaten panonda.'); return; }
              await repo.savePin({ id: uuid(), title: s.t, desc: s.d, cat: s.c, date: todayISO() });
              pins = await repo.listPins();
              drawPins();
              toast('Panona eklendi.');
            },
          }, '📌 panoma ekle')));
      }
    };
    drawSuggestions(pickSuggestions(3));

    const catFilter = el('div', { class: 'tag-list', style: { marginBottom: '12px' } },
      el('button', { class: 'chip-btn is-on', dataset: { c: '' } }, 'karışık'),
      CATEGORIES.map((c) => el('button', { class: 'chip-btn', dataset: { c: c.id } }, `${c.emoji} ${c.label}`)));
    catFilter.addEventListener('click', (e) => {
      const b = e.target.closest('.chip-btn');
      if (!b) return;
      shownCat = b.dataset.c;
      for (const x of catFilter.children) x.classList.toggle('is-on', x === b);
      drawSuggestions(pickSuggestions(3, shownCat || null));
    });

    // --- pano (pinlediklerim) ---
    const pinBox = el('div', {});
    const STATUSES = [['yapacagim', 'yapacağım'], ['yapiyorum', 'yapıyorum'], ['yaptim', 'yaptım']];
    const drawPins = () => {
      clear(pinBox);
      if (!pins.length) {
        pinBox.append(el('p', { class: 'muted' }, 'Henüz bir şey pinlemedin. Yukarıdaki önerilerden beğendiğini ekle.'));
        return;
      }
      for (const p of pins) {
        const note = el('textarea', { class: 'textarea', style: { minHeight: '60px' }, placeholder: 'ne yaptım, ne yapabilirim?' });
        note.value = p.note || '';
        note.addEventListener('change', async () => { await repo.savePin({ ...p, note: note.value }); });

        const statusRow = el('div', { class: 'tag-list', style: { margin: '8px 0' } },
          STATUSES.map(([id, label]) => el('button', {
            class: 'chip-btn' + (p.status === id ? ' is-on' : ''),
            onClick: async () => {
              await repo.savePin({ ...p, status: id, note: note.value });
              pins = await repo.listPins();
              drawPins();
            },
          }, label)));

        pinBox.append(el('div', { class: `card card--tight card--flat pin pin--${p.status}`, style: { marginBottom: '10px' } },
          el('div', { class: 'card__head' },
            el('strong', {}, p.title),
            el('button', {
              class: 'btn btn--sm btn--ghost',
              onClick: async () => {
                if (!await confirmDialog('Panodan kaldır', `"${p.title}" kaldırılsın mı?`, 'kaldır')) return;
                await repo.deletePin(p.id);
                pins = await repo.listPins();
                drawPins();
              },
            }, '×')),
          p.desc ? el('p', { class: 'muted', style: { margin: '0 0 4px' } }, p.desc) : null,
          statusRow, note));
      }
    };
    drawPins();

    // --- gunun onerisi + yapay zeka ---
    const daily = dailySuggestion(todayISO());
    const aiBox = el('div', {});
    const aiBtn = el('button', {
      class: 'btn btn--sm',
      onClick: async () => {
        if (!settings.apiKey) { toast('Bunun için Ayarlar\'dan API anahtarı eklemen gerek.', 'warn'); return; }
        aiBtn.disabled = true;
        clear(aiBox).append(el('div', { class: 'loading-row' }, el('span', { class: 'spinner' }), 'düşünüyor…'));
        try {
          const text = await personalSuggestions(settings.apiKey, {
            growth: growth.map((g) => g.title).join(', '),
            about: fields.about.value,
          });
          clear(aiBox).append(el('div', { class: 'support-reply' }, text || '(yanıt boş geldi)'));
        } catch (e) {
          clear(aiBox).append(el('div', { class: 'note note--warn' }, e.message || 'Alınamadı.'));
        } finally { aiBtn.disabled = false; }
      },
    }, '✨ bana özel öneri iste');

    clear(host).append(
      el('div', { class: 'card' },
        el('div', { class: 'profile-head' },
          photo,
          el('div', { style: { flex: '1 1 220px' } },
            el('label', { class: 'field__label' }, 'adım'), nameInput,
            el('button', { class: 'btn btn--sm btn--ghost', style: { marginTop: '8px' }, onClick: () => photoInput.click() },
              '📷 fotoğraf seç'))),
        photoInput,
        el('div', { style: { marginTop: '18px' } }, fieldCards),
        el('div', { class: 'btn-row btn-row--end' },
          el('button', { class: 'btn btn--primary', onClick: saveProfile }, '💾 kaydet'))),

      el('div', { class: 'card' },
        el('div', { class: 'card__head' },
          el('h3', {}, 'gelişim alanlarım'),
          el('button', { class: 'btn btn--sm btn--primary', onClick: addGrowth }, '+ alan ekle')),
        el('p', { class: 'muted' }, 'geliştirmek istediğin başlıkları yaz; altına ne yaptığını not et.'),
        growthBox,
        el('div', { style: { marginTop: '14px' } }, aiBtn, aiBox)),

      el('div', { class: 'card' },
        el('h3', {}, 'bugünün önerisi'),
        el('div', { class: 'suggestion' },
          el('div', { class: 'suggestion__cat' }, `${categoryOf(daily.c).emoji} ${categoryOf(daily.c).label}`),
          el('div', { class: 'suggestion__title' }, daily.t),
          el('p', { class: 'suggestion__desc' }, daily.d),
          el('button', {
            class: 'btn btn--sm',
            onClick: async () => {
              if (pins.some((p) => p.title === daily.t)) { toast('Zaten panonda.'); return; }
              await repo.savePin({ id: uuid(), title: daily.t, desc: daily.d, cat: daily.c, date: todayISO() });
              pins = await repo.listPins();
              drawPins();
              toast('Panona eklendi.');
            },
          }, '📌 panoma ekle'))),

      el('div', { class: 'card' },
        el('div', { class: 'card__head' },
          el('h3', {}, 'kültürlenme önerileri'),
          el('button', {
            class: 'btn btn--sm',
            onClick: () => drawSuggestions(pickSuggestions(3, shownCat || null)),
          }, '🔀 başka göster')),
        el('p', { class: 'muted' }, `${SUGGESTIONS.length} öneri arasından seçiyorum. bir kategori seçebilirsin.`),
        catFilter,
        suggBox),

      el('div', { class: 'card' },
        el('h3', {}, '📌 panom'),
        el('p', { class: 'muted' }, 'yapmak istediklerin ve haklarında yazdıkların.'),
        pinBox));
  },

  async unmount() { if (scope) { scope.revokeAll(); scope = null; } },
};

export default view;
