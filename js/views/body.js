// Beden & Mutfak: hareket, ogunler ve duygu/destek.
//
// Tasarim karari: rakamlar varsayilan gorunur ama "nazik mod" tek dokunusla
// hepsini gizler. Hicbir yerde hedef, limit ya da "asildi" uyarisi yok.

import { el, clear, toast, modal, confirmDialog, todayISO, formatDateTR } from '../core/dom.js';
import * as repo from '../core/repo.js';
import { prepareForStorage, makeObjectURLScope } from '../lib/image.js';
import { uuid } from '../core/crypto.js';
import { SPLITS, COMMON_EXERCISES } from '../data/workouts.js';
import { searchFoods, scale } from '../data/foods.js';
import { ENTRY_KINDS, GROUNDING, randomBodyNeutral, randomFoodReminder } from '../data/support.js';
import { analyzeMealPhoto, analyzeMealText } from '../ai/features.js';
import { supportResponse } from '../ai/features.js';

const SLOTS = ['kahvaltı', 'öğle', 'akşam', 'ara öğün'];
let scope = null;

export default {
  async mount(host, { params }) {
    scope = makeObjectURLScope();
    const settings = await repo.getSettings();
    let tab = (params && params.t) || 'mutfak';

    const content = el('div', {});
    const tabs = el('div', { class: 'tabs' });

    const gentleSwitch = el('input', { type: 'checkbox', checked: settings.gentleMode });
    gentleSwitch.addEventListener('change', async () => {
      await repo.saveSettings({ gentleMode: gentleSwitch.checked });
      settings.gentleMode = gentleSwitch.checked;
      applyGentle();
      toast(gentleSwitch.checked ? 'Nazik mod açık: sayılar gizlendi.' : 'Sayılar tekrar görünüyor.');
    });
    const applyGentle = () => host.classList.toggle('gentle', gentleSwitch.checked);

    const setTab = (t) => {
      tab = t;
      for (const b of tabs.children) b.classList.toggle('is-on', b.dataset.t === t);
      if (t === 'mutfak') drawKitchen();
      else if (t === 'hareket') drawMovement();
      else drawFeelings();
    };

    for (const [id, label] of [['mutfak', '🍓 mutfak'], ['hareket', '🏃 hareket'], ['duygu', '🤍 duygu & destek']]) {
      tabs.append(el('button', { class: 'tab', dataset: { t: id }, onClick: () => setTab(id) }, label));
    }

    // ===================== MUTFAK =====================
    async function drawKitchen() {
      const date = el('input', { class: 'input', type: 'date', value: todayISO(), style: { maxWidth: '190px' } });
      const listBox = el('div', {});
      const totalsBox = el('div', {});

      const refresh = async () => {
        const meals = await repo.listMeals(date.value);
        const sum = meals.reduce((a, m) => ({
          kcal: a.kcal + (m.kcal || 0), protein: a.protein + (m.protein || 0),
          carbs: a.carbs + (m.carbs || 0), fat: a.fat + (m.fat || 0),
        }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

        clear(totalsBox).append(el('div', { class: 'totals' },
          [['kcal', Math.round(sum.kcal), 'kalori'], ['p', Math.round(sum.protein) + 'g', 'protein'],
           ['c', Math.round(sum.carbs) + 'g', 'karbonhidrat'], ['f', Math.round(sum.fat) + 'g', 'yağ']]
            .map(([, v, l]) => el('div', { class: 'totals__cell' },
              el('div', { class: 'totals__num' }, String(v)),
              el('div', { class: 'totals__lab' }, l)))));

        clear(listBox);
        if (!meals.length) {
          listBox.append(el('p', { class: 'muted' }, 'Bu gün için bir şey eklemedin.'));
          return;
        }
        for (const m of meals) {
          const thumb = el('div', { class: 'meal__thumb', style: { display: 'grid', placeItems: 'center', fontSize: '1.6rem' } }, '🍽');
          const row = el('div', { class: 'meal' },
            thumb,
            el('div', { class: 'meal__main' },
              el('div', { style: { fontWeight: '700' } }, m.name),
              m.slot ? el('div', { class: 'muted', style: { fontSize: '.82rem' } }, m.slot) : null,
              el('div', { class: 'meal__macros' },
                el('span', { class: 'macro macro--kcal' }, Math.round(m.kcal) + ' kcal'),
                el('span', { class: 'macro' }, 'P ' + Math.round(m.protein) + 'g'),
                el('span', { class: 'macro' }, 'K ' + Math.round(m.carbs) + 'g'),
                el('span', { class: 'macro' }, 'Y ' + Math.round(m.fat) + 'g')),
              m.feeling ? el('p', { class: 'muted', style: { margin: '6px 0 0', fontSize: '.88rem' } }, '“' + m.feeling + '”') : null),
            el('button', {
              class: 'btn btn--sm btn--ghost',
              onClick: async () => {
                if (!await confirmDialog('Sil', `"${m.name}" silinsin mi?`, 'sil')) return;
                await repo.deleteMeal(m.id);
                refresh();
              },
            }, '×'));

          if (m.blobId) {
            repo.loadImage(m.blobId).then((b) => {
              if (b) thumb.replaceWith(el('img', { class: 'meal__thumb', src: scope.create(b), alt: '' }));
            }).catch(() => {});
          }
          listBox.append(row);
        }
      };

      date.addEventListener('change', refresh);

      clear(content).append(
        el('div', { class: 'card' },
          el('div', { class: 'card__head' },
            el('h3', {}, 'mutfak'),
            el('div', { class: 'btn-row' },
              el('button', { class: 'btn btn--sm btn--primary', onClick: () => addMeal(date.value, refresh) }, '+ öğün ekle'))),
          el('div', { class: 'row', style: { marginBottom: '12px' } },
            el('div', { style: { flex: '0 1 200px' } }, el('label', { class: 'field__label' }, 'gün'), date),
            el('label', { class: 'switch', style: { flex: '1 1 auto' } },
              gentleSwitch, el('span', { class: 'switch__track' }),
              el('span', {}, 'nazik mod — sayıları gizle'))),
          totalsBox,
          listBox),
        el('div', { class: 'card card--tight' },
          el('p', { class: 'muted', style: { margin: 0 } }, randomFoodReminder())));

      applyGentle();
      await refresh();
    }

    // --- ogun ekleme penceresi ---
    function addMeal(dateISO, onDone) {
      const name = el('input', { class: 'input', placeholder: 'ne yedin?' });
      const slot = el('select', { class: 'select' }, SLOTS.map((s) => el('option', { value: s }, s)));
      const feeling = el('textarea', { class: 'textarea', style: { minHeight: '64px' }, placeholder: 'nasıl hissettin? (isteğe bağlı)' });
      const kcal = el('input', { class: 'input', type: 'number', min: '0', placeholder: 'kcal' });
      const prot = el('input', { class: 'input', type: 'number', min: '0', step: '0.1', placeholder: 'protein g' });
      const carb = el('input', { class: 'input', type: 'number', min: '0', step: '0.1', placeholder: 'karb. g' });
      const fat = el('input', { class: 'input', type: 'number', min: '0', step: '0.1', placeholder: 'yağ g' });
      const photoInput = el('input', { class: 'input', type: 'file', accept: 'image/*' });
      const preview = el('div', {});
      const aiBox = el('div', {});
      let pendingFile = null;

      photoInput.addEventListener('change', () => {
        pendingFile = photoInput.files && photoInput.files[0];
        clear(preview);
        if (pendingFile) {
          preview.append(el('img', {
            src: scope.create(pendingFile), alt: '',
            style: { maxHeight: '160px', borderRadius: '10px', border: '2px solid var(--line)', marginTop: '8px' },
          }));
        }
      });

      // yerel besin tablosundan arama
      const foodSearch = el('input', { class: 'input', placeholder: 'besin tablosunda ara (örn. yumurta)' });
      const foodResults = el('div', { class: 'tag-list', style: { marginTop: '8px' } });
      foodSearch.addEventListener('input', () => {
        clear(foodResults);
        for (const f of searchFoods(foodSearch.value, 6)) {
          foodResults.append(el('button', {
            class: 'chip-btn',
            onClick: () => {
              const g = Number(prompt(`${f.n} — kaç gram? (1 ${f.unit} ≈ ${f.g} g)`, String(f.g)));
              if (!g) return;
              const v = scale(f, g);
              if (!name.value) name.value = f.n;
              kcal.value = String((Number(kcal.value) || 0) + v.kcal);
              prot.value = String(Math.round(((Number(prot.value) || 0) + v.protein) * 10) / 10);
              carb.value = String(Math.round(((Number(carb.value) || 0) + v.carbs) * 10) / 10);
              fat.value = String(Math.round(((Number(fat.value) || 0) + v.fat) * 10) / 10);
              toast(`${f.n} eklendi.`);
            },
          }, f.n));
        }
      });

      const analyze = async (e) => {
        const btn = e.currentTarget;
        if (!settings.apiKey) { toast('Bunun için Ayarlar\'dan API anahtarı eklemen gerek.', 'warn'); return; }
        if (!pendingFile && !name.value.trim()) { toast('Fotoğraf ekle ya da ne yediğini yaz.', 'warn'); return; }
        btn.disabled = true;
        clear(aiBox).append(el('div', { class: 'loading-row' }, el('span', { class: 'spinner' }), 'fotoğrafa bakıyorum…'));
        try {
          const r = pendingFile
            ? await analyzeMealPhoto(settings.apiKey, pendingFile, name.value.trim())
            : await analyzeMealText(settings.apiKey, name.value.trim());
          if (!name.value.trim()) name.value = r.yemek;
          kcal.value = String(r.kcal); prot.value = String(r.protein);
          carb.value = String(r.carbs); fat.value = String(r.fat);
          clear(aiBox).append(el('div', { class: 'note' },
            el('p', { style: { margin: '0 0 6px' } }, el('strong', {}, r.yemek)),
            r.porsiyon ? el('p', { class: 'muted', style: { margin: '0 0 6px' } }, 'porsiyon: ' + r.porsiyon) : null,
            r.ogeler.length ? el('p', { class: 'muted', style: { margin: '0 0 6px' } }, r.ogeler.join(', ')) : null,
            r.micros.length ? el('p', { class: 'muted', style: { margin: '0 0 6px' } }, 'öne çıkanlar: ' + r.micros.join(', ')) : null,
            el('p', { style: { margin: '0 0 6px' } }, r.note),
            el('p', { class: 'muted', style: { margin: 0, fontSize: '.8rem' } },
              `bu bir tahmin (güven: ${r.confidence}). rakamları elle düzeltebilirsin.`)));
        } catch (err) {
          clear(aiBox).append(el('div', { class: 'note note--warn' }, (err.message || 'Olmadı.') + ' Değerleri elle girebilirsin.'));
        } finally { btn.disabled = false; }
      };

      modal({
        title: 'öğün ekle', wide: true,
        body: el('div', {},
          el('div', { class: 'row' },
            el('div', { style: { flex: '2 1 200px' } }, el('label', { class: 'field__label' }, 'ne yedin?'), name),
            el('div', { style: { flex: '1 1 120px' } }, el('label', { class: 'field__label' }, 'öğün'), slot)),
          el('div', { class: 'field', style: { marginTop: '12px' } },
            el('label', { class: 'field__label' }, 'fotoğraf'), photoInput, preview),
          el('button', { class: 'btn btn--primary btn--block', style: { marginTop: '10px' }, onClick: analyze },
            '✨ fotoğraftan hesapla'),
          !settings.apiKey ? el('p', { class: 'field__hint' },
            'API anahtarı eklersen fotoğraftan otomatik hesaplayabilirim. Anahtarsız da aşağıdan elle girebilirsin.') : null,
          aiBox,
          el('div', { class: 'field', style: { marginTop: '14px' } },
            el('label', { class: 'field__label' }, 'hazır besin tablosundan ekle'), foodSearch, foodResults),
          el('div', { class: 'row', style: { marginTop: '12px' } }, kcal, prot, carb, fat),
          el('div', { class: 'field', style: { marginTop: '12px' } },
            el('label', { class: 'field__label' }, 'nasıl hissettin?'), feeling)),
        actions: [{ label: 'vazgeç' }, {
          label: 'kaydet', kind: 'primary',
          onClick: async () => {
            if (!name.value.trim()) { toast('Ne yediğini yaz.', 'warn'); return false; }
            let blobId = null;
            if (pendingFile) {
              try {
                const { bytes, mime } = await prepareForStorage(pendingFile);
                blobId = await repo.saveImage(bytes, mime);
              } catch { toast('Fotoğraf kaydedilemedi ama öğün eklendi.', 'warn'); }
            }
            await repo.saveMeal({
              date: dateISO, name: name.value.trim(), slot: slot.value, blobId,
              kcal: Number(kcal.value) || 0, protein: Number(prot.value) || 0,
              carbs: Number(carb.value) || 0, fat: Number(fat.value) || 0,
              feeling: feeling.value.trim(),
            });
            toast('Eklendi.');
            onDone();
          },
        }],
      });
    }

    // ===================== HAREKET =====================
    async function drawMovement() {
      const workouts = await repo.listWorkouts();
      const program = await repo.getDocOr('program:main', null);

      const listBox = el('div', {});
      const drawList = async () => {
        const ws = await repo.listWorkouts();
        clear(listBox);
        if (!ws.length) { listBox.append(el('p', { class: 'muted' }, 'Henüz antrenman kaydetmedin.')); return; }
        for (const w of ws.slice(0, 30)) {
          listBox.append(el('div', { class: 'card card--tight card--flat', style: { marginBottom: '8px' } },
            el('div', { class: 'card__head' },
              el('div', {},
                el('strong', {}, w.name),
                el('div', { class: 'muted', style: { fontSize: '.82rem' } },
                  `${formatDateTR(w.date)} · ${w.exercises} hareket${w.minutes ? ' · ' + w.minutes + ' dk' : ''}`)),
              el('div', { class: 'btn-row' },
                el('button', { class: 'btn btn--sm btn--ghost', onClick: () => logWorkout(w.id, drawList) }, 'aç'),
                el('button', {
                  class: 'btn btn--sm btn--ghost',
                  onClick: async () => {
                    if (!await confirmDialog('Sil', 'Bu kayıt silinsin mi?', 'sil')) return;
                    await repo.deleteWorkout(w.id); drawList();
                  },
                }, '×')))));
        }
      };
      await drawList();

      const programBox = el('div', {});
      const drawProgram = async () => {
        const p = await repo.getDocOr('program:main', null);
        clear(programBox);
        if (!p) {
          programBox.append(el('p', { class: 'muted' }, 'Henüz program seçmedin.'));
          return;
        }
        programBox.append(el('h4', {}, p.name), el('p', { class: 'muted' }, p.note));
        for (const d of p.days) {
          programBox.append(el('div', { class: 'card card--tight card--flat', style: { marginBottom: '8px' } },
            el('div', { class: 'card__head' },
              el('strong', {}, d.name),
              el('button', {
                class: 'btn btn--sm', onClick: () => logWorkout(null, drawList, d),
              }, 'bugün bunu yap')),
            el('p', { class: 'muted', style: { margin: 0, fontSize: '.88rem' } }, d.exercises.join(' · '))));
        }
      };
      await drawProgram();

      clear(content).append(
        el('div', { class: 'card' },
          el('div', { class: 'card__head' },
            el('h3', {}, 'programım'),
            el('button', {
              class: 'btn btn--sm',
              onClick: () => {
                const m = modal({
                  title: 'program seç', wide: true,
                  body: el('div', { class: 'grid grid--2' },
                    SPLITS.map((s) => el('button', {
                      class: 'card card--tight',
                      style: { textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' },
                      onClick: async () => {
                        await repo.setDoc('program:main', s);
                        m.close(); drawProgram();
                        toast('Program kaydedildi.');
                      },
                    }, el('strong', {}, s.name),
                       el('p', { class: 'muted', style: { margin: '4px 0 0', fontSize: '.85rem' } }, s.note)))),
                });
              },
            }, program ? 'değiştir' : '+ program seç')),
          programBox),
        el('div', { class: 'card' },
          el('div', { class: 'card__head' },
            el('h3', {}, 'antrenman geçmişim'),
            el('button', { class: 'btn btn--sm btn--primary', onClick: () => logWorkout(null, drawList) }, '+ kaydet')),
          listBox));
    }

    async function logWorkout(id, onDone, fromDay) {
      const existing = id ? await repo.getWorkout(id) : null;
      const w = existing || {
        date: todayISO(), name: fromDay ? fromDay.name : '', minutes: '',
        exercises: (fromDay ? fromDay.exercises : []).map((n) => ({ name: n, sets: '', reps: '', kg: '' })),
        note: '',
      };

      const name = el('input', { class: 'input', placeholder: 'antrenman adı', value: w.name });
      const date = el('input', { class: 'input', type: 'date', value: w.date });
      const minutes = el('input', { class: 'input', type: 'number', min: '0', placeholder: 'dakika', value: w.minutes || '' });
      const note = el('textarea', { class: 'textarea', style: { minHeight: '60px' }, placeholder: 'nasıl geçti?' });
      note.value = w.note || '';

      const rows = [...w.exercises];
      const rowsBox = el('div', {});
      const drawRows = () => {
        clear(rowsBox);
        rows.forEach((ex, i) => {
          const n = el('input', { class: 'input', placeholder: 'hareket', value: ex.name, list: 'ex-list' });
          const s = el('input', { class: 'input', type: 'number', min: '0', placeholder: 'set', value: ex.sets });
          const r = el('input', { class: 'input', type: 'number', min: '0', placeholder: 'tekrar', value: ex.reps });
          const k = el('input', { class: 'input', type: 'number', min: '0', step: '0.5', placeholder: 'kg', value: ex.kg });
          [n, s, r, k].forEach((inp, j) => inp.addEventListener('input', () => {
            ex[['name', 'sets', 'reps', 'kg'][j]] = inp.value;
          }));
          rowsBox.append(el('div', { class: 'exercise-row' }, n, s, r, k,
            el('button', {
              class: 'btn btn--sm btn--ghost',
              onClick: () => { rows.splice(i, 1); drawRows(); },
            }, '×')));
        });
      };
      drawRows();

      modal({
        title: id ? 'antrenmanı düzenle' : 'antrenman kaydet', wide: true,
        body: el('div', {},
          el('datalist', { id: 'ex-list' }, COMMON_EXERCISES.map((e) => el('option', { value: e }))),
          el('div', { class: 'row' },
            el('div', { style: { flex: '2 1 180px' } }, el('label', { class: 'field__label' }, 'ad'), name),
            el('div', { style: { flex: '1 1 140px' } }, el('label', { class: 'field__label' }, 'tarih'), date),
            el('div', { style: { flex: '0 1 110px' } }, el('label', { class: 'field__label' }, 'dakika'), minutes)),
          el('div', { style: { marginTop: '14px' } },
            el('label', { class: 'field__label' }, 'hareketler'),
            rowsBox,
            el('button', {
              class: 'btn btn--sm', onClick: () => { rows.push({ name: '', sets: '', reps: '', kg: '' }); drawRows(); },
            }, '+ hareket')),
          el('div', { class: 'field', style: { marginTop: '14px' } },
            el('label', { class: 'field__label' }, 'not'), note)),
        actions: [{ label: 'vazgeç' }, {
          label: 'kaydet', kind: 'primary',
          onClick: async () => {
            await repo.saveWorkout({
              ...w, id, name: name.value.trim() || 'antrenman', date: date.value,
              minutes: Number(minutes.value) || 0,
              exercises: rows.filter((r) => r.name.trim()), note: note.value,
            });
            toast('Kaydedildi.');
            onDone();
          },
        }],
      });
    }

    // ===================== DUYGU & DESTEK =====================
    async function drawFeelings() {
      const kind = el('select', { class: 'select' },
        ENTRY_KINDS.map((k) => el('option', { value: k.id }, `${k.emoji} ${k.label}`)));
      const text = el('textarea', { class: 'textarea', style: { minHeight: '130px' }, placeholder: 'ne oldu? ne hissediyorsun? burada kimse okumuyor.' });
      const replyBox = el('div', {});
      const listBox = el('div', {});

      const drawList = async () => {
        const items = await repo.listFeelings();
        clear(listBox);
        if (!items.length) { listBox.append(el('p', { class: 'muted' }, 'Henüz bir şey yazmadın.')); return; }
        for (const f of items.slice(0, 40)) {
          const k = ENTRY_KINDS.find((x) => x.id === f.kind);
          listBox.append(el('div', { class: 'card card--tight card--flat', style: { marginBottom: '8px' } },
            el('div', { class: 'card__head' },
              el('div', { class: 'muted', style: { fontSize: '.82rem' } },
                `${k ? k.emoji + ' ' + k.label : ''} · ${formatDateTR(f.date)}`),
              el('div', { class: 'btn-row' },
                el('button', {
                  class: 'btn btn--sm btn--ghost',
                  onClick: async () => {
                    const full = await repo.getFeeling(f.id);
                    modal({
                      title: formatDateTR(f.date),
                      body: el('div', {},
                        el('p', { style: { whiteSpace: 'pre-wrap' } }, full.text),
                        full.reply ? el('div', { class: 'support-reply', style: { marginTop: '12px' } }, full.reply) : null),
                    });
                  },
                }, 'aç'),
                el('button', {
                  class: 'btn btn--sm btn--ghost',
                  onClick: async () => {
                    if (!await confirmDialog('Sil', 'Bu kayıt silinsin mi?', 'sil')) return;
                    await repo.deleteFeeling(f.id); drawList();
                  },
                }, '×'))),
            el('p', { style: { margin: 0 } }, f.excerpt + (f.excerpt.length >= 120 ? '…' : ''))));
        }
      };
      await drawList();

      const send = async (e) => {
        const btn = e.currentTarget;
        if (!text.value.trim()) { toast('Önce bir şeyler yaz.', 'warn'); return; }
        btn.disabled = true;
        clear(replyBox).append(el('div', { class: 'loading-row' }, el('span', { class: 'spinner' }), 'okuyorum…'));
        const { text: reply, source, warning } = await supportResponse(settings.apiKey, kind.value, text.value.trim());
        clear(replyBox).append(
          el('div', { class: 'support-reply' }, reply),
          source === 'yerel' ? el('p', { class: 'field__hint' },
            warning ? warning : 'Bu, uygulamanın kendi destek kütüphanesinden geldi.') : null);
        await repo.saveFeeling({ date: todayISO(), kind: kind.value, text: text.value.trim(), reply });
        text.value = '';
        btn.disabled = false;
        drawList();
      };

      const grounding = GROUNDING[Math.floor(Math.random() * GROUNDING.length)];

      clear(content).append(
        el('div', { class: 'card' },
          el('h3', {}, 'içini dök'),
          el('p', { class: 'muted' }, 'yazdıkların burada kalır. bir karşılık istersen aşağıdaki düğmeye bas.'),
          el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'ne hakkında?'), kind),
          text,
          el('div', { class: 'btn-row btn-row--end' },
            el('button', { class: 'btn btn--primary', onClick: send }, '🤍 kaydet ve karşılık al')),
          replyBox),

        el('div', { class: 'card' },
          el('h3', {}, 'şu an işe yarayabilir'),
          el('div', { class: 'note' },
            el('strong', {}, grounding.t),
            el('p', { style: { margin: '6px 0 0' } }, grounding.d),
            el('p', { class: 'muted', style: { margin: '6px 0 0', fontSize: '.82rem' } }, `≈ ${grounding.min} dakika`)),
          el('p', { class: 'muted', style: { marginTop: '14px' } }, randomBodyNeutral())),

        el('div', { class: 'card' },
          el('h3', {}, 'geçmiş'),
          listBox),

        el('p', { class: 'muted', style: { fontSize: '.82rem', textAlign: 'center' } },
          'burası bir doktor ya da terapist değil. zorlandığın bir şey uzun sürüyorsa, ' +
          'bunu güvendiğin birine ya da bir uzmana anlatmak iyi gelebilir.'));

      applyGentle();
    }

    clear(host).append(tabs, content);
    setTab(tab);
  },

  async unmount() {
    document.getElementById('view')?.classList.remove('gentle');
    if (scope) { scope.revokeAll(); scope = null; }
  },
};
