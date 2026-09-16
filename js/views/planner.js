// Planlayici: hafta gorunumu, gun detayi, gun plani onerileri.

import { el, clear, toast, modal, todayISO, formatDate, DAY_SHORT, mondayIndex, confirmDialog } from '../core/dom.js';
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
      weekLabel.textContent = `${formatDate(days[0], false)} – ${formatDate(days[6], false)}`;

      const loaded = await Promise.all(days.map((iso) => repo.getDay(iso)));
      days.forEach((iso, i) => {
        const day = loaded[i];
        const undone = (day.tasks || []).filter((t) => !t.done);
        weekBox.append(el('button', {
          class: 'week__day' + (iso === todayISO() ? ' is-today' : '') + (iso === selected ? ' is-selected' : ''),
          onClick: () => { selected = iso; drawWeek(); drawDay(); },
        },
          el('div', { class: 'week__dow' }, DAY_SHORT[i]),
          el('div', { class: 'week__num' }, iso.slice(8)),
          el('div', { class: 'week__dots' },
            (day.tasks || []).slice(0, 6).map((t) => el('span', {
              class: 'week__dot',
              style: { background: categoryColor(t.cat), opacity: t.done ? '.35' : '1' },
            }))),
          undone.length ? el('div', { class: 'muted', style: { fontSize: '.7rem', marginTop: '2px' } },
            `${undone.length} left`) : null));
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
          listBox.append(el('p', { class: 'muted' }, 'You have not written anything for this day.'));
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
              'aria-label': t.done ? 'mark as not done' : 'mark as done',
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
      const titleInput = el('input', { class: 'input', placeholder: 'what will you do?', style: { flex: '2 1 160px' } });
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
      const note = el('textarea', { class: 'textarea', placeholder: 'notes about this day…' });
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
          actions: [{ label: 'cancel' }, {
            label: 'add to this day', kind: 'primary',
            onClick: async () => {
              for (const b of tpl.blocks) tasks.push({ id: uuid(), title: b.title, time: b.time, cat: b.cat, done: false });
              await repo.saveDay({ ...day, tasks });
              drawTasks(); drawWeek();
              toast('Plan added.');
            },
          }],
        });
      };

      // yapay zeka plani
      const aiPlan = () => {
        const energy = el('select', { class: 'select' },
          ['low', 'medium', 'high'].map((v) => el('option', { value: v, selected: v === 'medium' }, v)));
        const must = el('textarea', { class: 'textarea', style: { minHeight: '70px' }, placeholder: 'what must happen today' });
        const out = el('div', {});
        modal({
          title: 'make me a day plan',
          wide: true,
          body: el('div', {},
            !settings.apiKey ? el('div', { class: 'note note--warn' },
              'No API key, so I am working from the ready-made templates. Add a key in Settings and I can make one just for you.') : null,
            el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'your energy today'), energy),
            el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'must happen today'), must),
            el('button', {
              class: 'btn btn--primary btn--block',
              onClick: async (e) => {
                const btn = e.currentTarget;
                btn.disabled = true;
                clear(out).append(el('div', { class: 'loading-row' }, el('span', { class: 'spinner' }), 'making a plan…'));
                try {
                  const plan = await suggestDayPlan(settings.apiKey, {
                    energy: energy.value, mustDo: must.value, note: day.note,
                  });
                  clear(out);
                  if (plan.summary) out.append(el('div', { class: 'note' }, plan.summary));
                  if (plan.blocks.length) {
                    out.append(el('div', { style: { marginTop: '12px' } }, plan.blocks.map((b) =>
                      el('div', { class: 'task', style: { borderLeftColor: categoryColor(b.category) } },
                        el('div', { class: 'task__main' },
                          el('div', { class: 'task__time' }, b.time),
                          el('div', { class: 'task__title' }, b.title))))));
                    out.append(el('button', {
                      class: 'btn btn--primary', style: { marginTop: '12px' },
                      onClick: async () => {
                        for (const b of plan.blocks) {
                          tasks.push({ id: uuid(), title: b.title, time: b.time, cat: b.category, done: false });
                        }
                        await repo.saveDay({ ...day, tasks });
                        drawTasks(); drawWeek();
                        toast('Plan added to the day.');
                      },
                    }, '↓ add to this day'));
                  } else {
                    out.append(el('p', { class: 'muted', style: { marginTop: '10px' } },
                      'You can use one of the ready-made templates below.'));
                  }
                } catch (err) {
                  clear(out).append(el('div', { class: 'note note--danger' }, err.message || 'That did not work.'));
                } finally { btn.disabled = false; }
              },
            }, 'make a plan'),
            out),
        });
      };

      clear(dayBox).append(
        el('div', { class: 'card' },
          el('div', { class: 'card__head' },
            el('h3', {}, formatDate(selected)),
            el('div', { class: 'btn-row' },
              el('button', { class: 'btn btn--sm', onClick: aiPlan }, 'day plan'),
              el('button', {
                class: 'btn btn--sm btn--ghost',
                onClick: () => {
                  const m = modal({
                    title: 'ready-made day templates', wide: true,
                    body: el('div', { class: 'grid grid--2' },
                      DAY_TEMPLATES.map((t) => el('button', {
                        class: 'card card--tight', style: { textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' },
                        onClick: () => { m.close(); applyTemplate(t); },
                      },
                        el('strong', {}, t.name),
                        el('p', { class: 'muted', style: { margin: '4px 0 0', fontSize: '.85rem' } }, t.note)))),
                  });
                },
              }, 'templates'))),
          el('div', { class: 'note', style: { marginBottom: '14px' } }, randomNudge()),
          el('div', { class: 'row', style: { marginBottom: '14px' } },
            titleInput, timeInput, catInput,
            el('button', { class: 'btn btn--primary', style: { flex: '0 0 auto' }, onClick: addTask }, '+ add')),
          listBox,
          el('div', { class: 'field', style: { marginTop: '16px' } },
            el('label', { class: 'field__label' }, 'notes for the day'), note)));
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
            }, 'today'),
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
