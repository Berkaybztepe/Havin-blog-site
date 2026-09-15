// Planlayici: hafta gorunumu, gun detayi, gun plani onerileri.

import { el, clear, toast, modal, todayISO, formatDateTR, TR_DAY_SHORT, mondayIndex, confirmDialog } from '../core/dom.js';
import * as repo from '../core/repo.js';
import { TASK_CATEGORIES, DAY_TEMPLATES, categoryColor, randomNudge } from '../data/planner.js';
import { suggestDayPlan } from '../ai/features.js';
import { uuid } from '../core/crypto.js';

function mondayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - mondayIndex(date.getDay()));
  return date;
}

const isoOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default {
  async mount(host) {
    let selected = todayISO();
    let weekStart = mondayOf(selected);
    const settings = await repo.getSettings();

    const weekBox = el('div', { class: 'week' });
    const dayBox = el('div', {});
    const weekLabel = el('h3', { style: { margin: 0 } });

    // --- hafta seridi ---
    async function drawWeek() {
      clear(weekBox);
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        days.push(isoOf(d));
      }
      weekLabel.textContent = `${formatDateTR(days[0], false)} – ${formatDateTR(days[6], false)}`;

      const loaded = await Promise.all(days.map((iso) => repo.getDay(iso)));
      days.forEach((iso, i) => {
        const day = loaded[i];
        const undone = (day.tasks || []).filter((t) => !t.done);
        weekBox.append(el('button', {
          class: 'week__day' + (iso === todayISO() ? ' is-today' : '') + (iso === selected ? ' is-selected' : ''),
          onClick: () => { selected = iso; drawWeek(); drawDay(); },
        },
          el('div', { class: 'week__dow' }, TR_DAY_SHORT[i]),
          el('div', { class: 'week__num' }, iso.slice(8)),
          el('div', { class: 'week__dots' },
            (day.tasks || []).slice(0, 6).map((t) => el('span', {
              class: 'week__dot',
              style: { background: categoryColor(t.cat), opacity: t.done ? '.35' : '1' },
            }))),
          undone.length ? el('div', { class: 'muted', style: { fontSize: '.7rem', marginTop: '2px' } },
            `${undone.length} iş`) : null));
      });
    }

    // --- gun detayi ---
    async function drawDay() {
      const day = await repo.getDay(selected);
      const tasks = day.tasks || [];

      const listBox = el('div', {});
      const drawTasks = () => {
        clear(listBox);
        if (!tasks.length) {
          listBox.append(el('p', { class: 'muted' }, 'Bu gün için bir şey yazmamışsın.'));
          return;
        }
        const sorted = [...tasks].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
        for (const t of sorted) {
          listBox.append(el('div', {
            class: 'task' + (t.done ? ' is-done' : ''),
            style: { borderLeftColor: categoryColor(t.cat) },
          },
            el('button', {
              class: 'task__check' + (t.done ? ' is-on' : ''),
              'aria-label': t.done ? 'yapılmadı olarak işaretle' : 'yapıldı olarak işaretle',
              onClick: async () => { t.done = !t.done; await repo.saveDay({ ...day, tasks }); drawTasks(); drawWeek(); },
            }, t.done ? '✓' : ''),
            el('div', { class: 'task__main' },
              t.time ? el('div', { class: 'task__time' }, t.time) : null,
              el('div', { class: 'task__title' }, t.title)),
            el('button', {
              class: 'btn btn--sm btn--ghost',
              onClick: async () => {
                const i = tasks.indexOf(t);
                if (i >= 0) tasks.splice(i, 1);
                await repo.saveDay({ ...day, tasks });
                drawTasks(); drawWeek();
              },
            }, '×')));
        }
      };
      drawTasks();

      // hizli ekleme
      const titleInput = el('input', { class: 'input', placeholder: 'ne yapacaksın?', style: { flex: '2 1 160px' } });
      const timeInput = el('input', { class: 'input', type: 'time', style: { flex: '0 1 120px' } });
      const catInput = el('select', { class: 'select', style: { flex: '0 1 130px' } },
        TASK_CATEGORIES.map((c) => el('option', { value: c.id }, c.label)));

      const addTask = async () => {
        const title = titleInput.value.trim();
        if (!title) return;
        tasks.push({ id: uuid(), title, time: timeInput.value, cat: catInput.value, done: false });
        await repo.saveDay({ ...day, tasks });
        titleInput.value = ''; timeInput.value = '';
        drawTasks(); drawWeek();
        titleInput.focus();
      };
      titleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

      // gun notu
      const note = el('textarea', { class: 'textarea', placeholder: 'bu güne dair notlar…' });
      note.value = day.note || '';
      note.addEventListener('change', async () => { await repo.saveDay({ ...day, tasks, note: note.value }); });

      // sablondan plan
      const applyTemplate = (tpl) => {
        modal({
          title: tpl.name,
          body: el('div', {},
            el('p', { class: 'muted' }, tpl.note),
            el('div', {}, tpl.blocks.map((b) =>
              el('div', { class: 'task', style: { borderLeftColor: categoryColor(b.cat) } },
                el('div', { class: 'task__main' },
                  el('div', { class: 'task__time' }, b.time),
                  el('div', { class: 'task__title' }, b.title)))))),
          actions: [{ label: 'vazgeç' }, {
            label: 'bu güne ekle', kind: 'primary',
            onClick: async () => {
              for (const b of tpl.blocks) tasks.push({ id: uuid(), title: b.title, time: b.time, cat: b.cat, done: false });
              await repo.saveDay({ ...day, tasks });
              drawTasks(); drawWeek();
              toast('Plan eklendi.');
            },
          }],
        });
      };

      // yapay zeka plani
      const aiPlan = () => {
        const energy = el('select', { class: 'select' },
          ['düşük', 'orta', 'yüksek'].map((v) => el('option', { value: v, selected: v === 'orta' }, v)));
        const must = el('textarea', { class: 'textarea', style: { minHeight: '70px' }, placeholder: 'bugün mutlaka yapılması gerekenler' });
        const out = el('div', {});
        modal({
          title: 'bana bir gün planı çıkar',
          wide: true,
          body: el('div', {},
            !settings.apiKey ? el('div', { class: 'note note--warn' },
              'API anahtarı yok, bu yüzden hazır şablonlardan gidiyorum. Ayarlar\'dan anahtar eklersen sana özel plan çıkarabilirim.') : null,
            el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'bugünkü enerjin'), energy),
            el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'mutlaka yapılacaklar'), must),
            el('button', {
              class: 'btn btn--primary btn--block',
              onClick: async (e) => {
                const btn = e.currentTarget;
                btn.disabled = true;
                clear(out).append(el('div', { class: 'loading-row' }, el('span', { class: 'spinner' }), 'plan çıkarılıyor…'));
                try {
                  const plan = await suggestDayPlan(settings.apiKey, {
                    energy: energy.value, mustDo: must.value, note: day.note,
                  });
                  clear(out);
                  if (plan.ozet) out.append(el('div', { class: 'note' }, plan.ozet));
                  if (plan.bloklar.length) {
                    out.append(el('div', { style: { marginTop: '12px' } }, plan.bloklar.map((b) =>
                      el('div', { class: 'task', style: { borderLeftColor: categoryColor(b.kategori) } },
                        el('div', { class: 'task__main' },
                          el('div', { class: 'task__time' }, b.saat),
                          el('div', { class: 'task__title' }, b.baslik))))));
                    out.append(el('button', {
                      class: 'btn btn--primary', style: { marginTop: '12px' },
                      onClick: async () => {
                        for (const b of plan.bloklar) {
                          tasks.push({ id: uuid(), title: b.baslik, time: b.saat, cat: b.kategori, done: false });
                        }
                        await repo.saveDay({ ...day, tasks });
                        drawTasks(); drawWeek();
                        toast('Plan güne eklendi.');
                      },
                    }, '↓ bu güne ekle'));
                  } else {
                    out.append(el('p', { class: 'muted', style: { marginTop: '10px' } },
                      'Aşağıdaki hazır şablonlardan birini kullanabilirsin.'));
                  }
                } catch (err) {
                  clear(out).append(el('div', { class: 'note note--danger' }, err.message || 'Olmadı.'));
                } finally { btn.disabled = false; }
              },
            }, '✨ plan çıkar'),
            out),
        });
      };

      clear(dayBox).append(
        el('div', { class: 'card' },
          el('div', { class: 'card__head' },
            el('h3', {}, formatDateTR(selected)),
            el('div', { class: 'btn-row' },
              el('button', { class: 'btn btn--sm', onClick: aiPlan }, '✨ gün planı'),
              el('button', {
                class: 'btn btn--sm btn--ghost',
                onClick: () => {
                  const m = modal({
                    title: 'hazır plan şablonları', wide: true,
                    body: el('div', { class: 'grid grid--2' },
                      DAY_TEMPLATES.map((t) => el('button', {
                        class: 'card card--tight', style: { textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' },
                        onClick: () => { m.close(); applyTemplate(t); },
                      },
                        el('strong', {}, t.name),
                        el('p', { class: 'muted', style: { margin: '4px 0 0', fontSize: '.85rem' } }, t.note)))),
                  });
                },
              }, '📋 şablonlar'))),
          el('div', { class: 'note', style: { marginBottom: '14px' } }, randomNudge()),
          el('div', { class: 'row', style: { marginBottom: '14px' } },
            titleInput, timeInput, catInput,
            el('button', { class: 'btn btn--primary', style: { flex: '0 0 auto' }, onClick: addTask }, '+ ekle')),
          listBox,
          el('div', { class: 'field', style: { marginTop: '16px' } },
            el('label', { class: 'field__label' }, 'günün notu'), note)));
    }

    clear(host).append(
      el('div', { class: 'card card--tight' },
        el('div', { class: 'card__head' },
          el('button', {
            class: 'btn btn--sm',
            onClick: () => { weekStart.setDate(weekStart.getDate() - 7); drawWeek(); },
          }, '←'),
          weekLabel,
          el('div', { class: 'btn-row' },
            el('button', {
              class: 'btn btn--sm btn--ghost',
              onClick: () => { selected = todayISO(); weekStart = mondayOf(selected); drawWeek(); drawDay(); },
            }, 'bugün'),
            el('button', {
              class: 'btn btn--sm',
              onClick: () => { weekStart.setDate(weekStart.getDate() + 7); drawWeek(); },
            }, '→'))),
        weekBox),
      dayBox);

    await drawWeek();
    await drawDay();
  },

  async unmount() {},
};
