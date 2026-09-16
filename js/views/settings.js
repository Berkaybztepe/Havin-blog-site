// Ayarlar: gorunum, widget'lar, API anahtari, guvenlik ve yedekleme.

import { el, clear, toast, modal, confirmDialog } from '../core/dom.js';
import * as repo from '../core/repo.js';
import * as session from '../core/session.js';
import { exportToFile, importFromFile, vaultSummary } from '../core/backup.js';
import { storageEstimate, requestPersistence } from '../lib/idb.js';
import { applyLook, lookFromSettings } from '../core/look.js';
import { renderSidebar, WIDGET_LABELS } from '../widgets/sidebar.js';
import { testKey } from '../ai/client.js';
import { passwordStrength } from '../core/crypto.js';

const THEMES = [
  { id: 'sade',   name: 'sade',        c1: '#f7f5f1', c2: '#a2624a' },
  { id: 'lace',   name: 'krem dantel', c1: '#fbf8f2', c2: '#a8574e' },
  { id: 'tuscan', name: 'toskana',     c1: '#f4ece0', c2: '#b5622f' },
  { id: 'cherry', name: 'kiraz',       c1: '#fdf4f3', c2: '#b52a41' },
  { id: 'toile',  name: 'koyu toile',  c1: '#26201c', c2: '#c9a06a' },
  { id: 'gece',   name: 'gece',        c1: '#15181f', c2: '#8fa6c9' },
  { id: 'y2k',    name: "2000'ler",    c1: '#ffeaf3', c2: '#d4467f' },
];

const FONTS = ['Inter', 'Newsreader', 'Quicksand', 'Nunito',
  'Playfair Display', 'Cormorant Garamond',
  'Caveat', 'Dancing Script', 'Shadows Into Light', 'Indie Flower', 'Gloria Hallelujah'];

const fmtBytes = (n) => {
  if (!n) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
};

export default {
  async mount(host) {
    const s = await repo.getSettings();

    const save = async (patch) => {
      Object.assign(s, patch);
      await repo.saveSettings(patch);
    };

    // ---------- gorunum ----------
    const themeGrid = el('div', { class: 'theme-grid' },
      THEMES.map((t) => el('button', {
        class: 'theme-card' + (t.id === s.theme ? ' is-on' : ''),
        onClick: async (e) => {
          // currentTarget, await'ten sonra null olur; referansi simdi al.
          const btn = e.currentTarget;
          await save({ theme: t.id });
          applyLook(lookFromSettings(s));
          for (const c of themeGrid.children) c.classList.remove('is-on');
          btn.classList.add('is-on');
        },
      },
        el('span', { class: 'theme-card__swatch', style: { background: t.c1 } },
          el('span', { class: 'theme-card__dot', style: { background: t.c2 } })),
        el('span', { class: 'theme-card__name' }, t.name))));

    const fontBody = el('select', { class: 'select' },
      FONTS.map((f) => el('option', { value: f, selected: f === s.fontBody }, f)));
    const fontHead = el('select', { class: 'select' },
      FONTS.map((f) => el('option', { value: f, selected: f === s.fontHeading }, f)));
    const fontScale = el('input', { class: 'input', type: 'range', min: '0.85', max: '1.4', step: '0.05', value: String(s.fontScale) });
    const inkColor = el('input', { class: 'input', type: 'color', value: s.textColor || '#23201c' });
    const useInk = el('input', { type: 'checkbox', checked: !!s.textColor });
    const accentColor = el('input', { class: 'input', type: 'color', value: s.accent || '#a2624a' });
    const useAccent = el('input', { type: 'checkbox', checked: !!s.accent });

    const applyAppearance = async () => {
      await save({
        fontBody: fontBody.value, fontHeading: fontHead.value,
        fontScale: Number(fontScale.value),
        textColor: useInk.checked ? inkColor.value : '',
        accent: useAccent.checked ? accentColor.value : '',
      });
      applyLook(lookFromSettings(s));
    };
    [fontBody, fontHead, fontScale, inkColor, useInk, accentColor, useAccent]
      .forEach((c) => c.addEventListener('input', applyAppearance));

    const blogTitle = el('input', { class: 'input', value: s.blogTitle });
    const blogTagline = el('textarea', { class: 'textarea', style: { minHeight: '70px' } });
    blogTagline.value = s.blogTagline;
    const saveHeader = async () => {
      await save({ blogTitle: blogTitle.value, blogTagline: blogTagline.value });
      document.getElementById('blog-title').textContent = blogTitle.value;
      document.getElementById('blog-tagline').textContent = blogTagline.value;
      toast('Saved.');
    };

    // ---------- widget'lar ----------
    const widgetBox = el('div', {});
    const drawWidgets = () => {
      clear(widgetBox);
      const active = [...(s.widgets || [])];
      const all = Object.keys(WIDGET_LABELS);
      const ordered = [...active, ...all.filter((w) => !active.includes(w))];

      ordered.forEach((id, idx) => {
        const on = active.includes(id);
        const cb = el('input', { type: 'checkbox', checked: on });
        cb.addEventListener('change', async () => {
          const next = cb.checked ? [...active, id] : active.filter((x) => x !== id);
          await save({ widgets: next });
          drawWidgets();
          renderSidebar(document.getElementById('sidebar'));
        });
        widgetBox.append(el('div', { class: 'widget-toggle' },
          el('label', { class: 'switch' }, cb, el('span', { class: 'switch__track' })),
          el('span', { class: 'widget-toggle__name' }, WIDGET_LABELS[id]),
          on ? el('div', { class: 'btn-row' },
            el('button', {
              class: 'btn btn--sm btn--ghost', title: 'up', disabled: active.indexOf(id) === 0,
              onClick: async () => {
                const i = active.indexOf(id);
                if (i > 0) { active.splice(i - 1, 0, active.splice(i, 1)[0]); await save({ widgets: active }); drawWidgets(); renderSidebar(document.getElementById('sidebar')); }
              },
            }, '↑'),
            el('button', {
              class: 'btn btn--sm btn--ghost', title: 'down', disabled: active.indexOf(id) === active.length - 1,
              onClick: async () => {
                const i = active.indexOf(id);
                if (i < active.length - 1) { active.splice(i + 1, 0, active.splice(i, 1)[0]); await save({ widgets: active }); drawWidgets(); renderSidebar(document.getElementById('sidebar')); }
              },
            }, '↓')) : null));
      });
    };
    drawWidgets();

    // ---------- yapay zeka ----------
    const apiKey = el('input', { class: 'input', type: 'password', placeholder: 'sk-ant-…', value: s.apiKey || '' });
    const keyStatus = el('div', { class: 'field__hint' });

    const saveKey = async () => {
      await save({ apiKey: apiKey.value.trim() });
      toast('Key saved (encrypted).');
    };
    const checkKey = async (e) => {
      const btn = e.currentTarget;
      if (!apiKey.value.trim()) { toast('Paste the key first.', 'warn'); return; }
      btn.disabled = true;
      keyStatus.textContent = 'testing…';
      try {
        await testKey(apiKey.value.trim());
        keyStatus.textContent = '✓ the key works';
        keyStatus.style.color = '#4f9d5c';
        await save({ apiKey: apiKey.value.trim() });
      } catch (err) {
        keyStatus.textContent = '× ' + (err.message || 'did not work');
        keyStatus.style.color = '#d9435c';
      } finally { btn.disabled = false; }
    };

    // ---------- guvenlik ----------
    const autoLock = el('select', { class: 'select' },
      [1, 5, 15, 30, 60].map((m) => el('option', { value: String(m), selected: m === s.autoLockMinutes }, `${m} dakika`)));
    autoLock.addEventListener('change', async () => {
      await save({ autoLockMinutes: Number(autoLock.value) });
      session.setAutoLockMinutes(Number(autoLock.value));
    });

    const changePw = () => {
      const oldPw = el('input', { class: 'input', type: 'password', placeholder: 'current password' });
      const newPw = el('input', { class: 'input', type: 'password', placeholder: 'new password' });
      const newPw2 = el('input', { class: 'input', type: 'password', placeholder: 'repeat new password' });
      const hint = el('input', { class: 'input', placeholder: 'new hint (optional)' });
      modal({
        title: 'change password',
        body: el('div', {}, oldPw, el('div', { style: { height: '9px' } }), newPw,
          el('div', { style: { height: '9px' } }), newPw2, el('div', { style: { height: '9px' } }), hint),
        actions: [{ label: 'cancel' }, {
          label: 'change', kind: 'primary',
          onClick: async () => {
            if (newPw.value.length < 10) { toast('The new password must be at least 10 characters.', 'err'); return false; }
            if (newPw.value !== newPw2.value) { toast('The passwords do not match.', 'err'); return false; }
            try {
              await session.changePassword(oldPw.value, newPw.value, hint.value);
              toast('Password changed.');
            } catch (e) { toast(e.message, 'err'); return false; }
          },
        }],
      });
    };

    // ---------- yedekleme ----------
    const storageBox = el('div', { class: 'muted' });
    (async () => {
      const [est, sum] = await Promise.all([storageEstimate(), vaultSummary()]);
      const parts = [`${sum.docs} records`, `${sum.blobs} photos`];
      if (est) parts.push(`${fmtBytes(est.usage)} used`);
      storageBox.textContent = parts.join(' · ');
    })();

    const importInput = el('input', { type: 'file', accept: '.json,application/json', class: 'hidden' });
    importInput.addEventListener('change', async () => {
      const f = importInput.files && importInput.files[0];
      if (!f) return;
      if (!await confirmDialog('Restore',
        'Everything on this device will be overwritten. Continue?', 'restore')) { importInput.value = ''; return; }
      try {
        await importFromFile(f);
        toast('Restored. Now sign in with that backup’s password.');
        setTimeout(() => session.lock(), 900);
      } catch (e) { toast(e.message, 'err'); }
      importInput.value = '';
    });

    const lastBackup = s.lastBackup
      ? `son yedek: ${new Date(s.lastBackup).toLocaleDateString('tr-TR')}`
      : 'you have not backed up yet';

    clear(host).append(
      // gorunum
      el('div', { class: 'card' },
        el('h3', {}, 'appearance'),
        el('label', { class: 'field__label' }, 'theme'),
        themeGrid,
        el('div', { class: 'row', style: { marginTop: '16px' } },
          el('div', {}, el('label', { class: 'field__label' }, 'body font'), fontBody),
          el('div', {}, el('label', { class: 'field__label' }, 'heading font'), fontHead)),
        el('div', { class: 'field', style: { marginTop: '12px' } },
          el('label', { class: 'field__label' }, 'text size'), fontScale),
        el('div', { class: 'row' },
          el('div', {}, el('label', { class: 'field__label' }, 'text colour'),
            el('div', { class: 'row row--tight' },
              el('label', { class: 'switch' }, useInk, el('span', { class: 'switch__track' })), inkColor)),
          el('div', {}, el('label', { class: 'field__label' }, 'accent colour'),
            el('div', { class: 'row row--tight' },
              el('label', { class: 'switch' }, useAccent, el('span', { class: 'switch__track' })), accentColor)))),

      // baslik
      el('div', { class: 'card' },
        el('h3', {}, 'my diary title'),
        el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'title'), blogTitle),
        el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'subtitle'), blogTagline),
        el('div', { class: 'btn-row btn-row--end' },
          el('button', { class: 'btn btn--primary', onClick: saveHeader }, 'save'))),

      // widgetlar
      el('div', { class: 'card' },
        el('h3', {}, 'sidebar'),
        el('p', { class: 'muted' }, 'which boxes show, and in what order.'),
        widgetBox),

      // yapay zeka
      el('div', { class: 'card' },
        el('h3', {}, 'AI'),
        el('p', { class: 'muted' },
          'Add a key and you get: nutrition estimates from a meal photo, emotional support, and day plans. ' +
          'Everything works without a key too — those parts just come from the built-in library.'),
        el('div', { class: 'field' },
          el('label', { class: 'field__label' }, 'Claude API key'), apiKey, keyStatus,
          el('p', { class: 'field__hint' },
            'Get one at console.anthropic.com. The key is stored encrypted on this device, ' +
            'and sent nowhere else. Usage is billed to you — I would set a low monthly limit.')),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn--primary', onClick: saveKey }, 'save'),
          el('button', { class: 'btn', onClick: checkKey }, 'test the key'),
          el('button', {
            class: 'btn btn--ghost',
            onClick: async () => { apiKey.value = ''; await save({ apiKey: '' }); toast('Key removed.'); },
          }, 'delete'))),

      // guvenlik
      el('div', { class: 'card' },
        el('h3', {}, 'security'),
        el('div', { class: 'field' },
          el('label', { class: 'field__label' }, 'lock after this much inactivity'), autoLock),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn', onClick: changePw }, 'change password'),
          el('button', { class: 'btn btn--ghost', onClick: () => session.lock() }, 'lock now')),
        el('div', { class: 'note', style: { marginTop: '14px' } },
          el('p', { style: { margin: '0 0 6px' } }, el('strong', {}, 'What does this encryption protect?')),
          el('p', { style: { margin: '0 0 6px' } },
            'Your data never leaves this device and is stored encrypted. Someone who gets hold of your device ' +
            'cannot read your diary without your password.'),
          el('p', { style: { margin: 0 } }, el('strong', {}, 'What it does not protect: '),
            'anyone who picks up your device while the diary is open reads everything — which is why auto-lock matters. ' +
            'Also, when you use the AI features, the text and photo you send travel unencrypted at that moment ' +
            'to Anthropic’s servers.'))),

      // yedekleme
      el('div', { class: 'card' },
        el('h3', {}, 'backup'),
        el('div', { class: 'note note--warn' },
          'Your data is only on this device. If you change phone, delete the app, or the browser ' +
          'data is cleared, your diary is gone. Back up regularly — it is also how you move to another device.'),
        el('p', { class: 'muted', style: { marginTop: '12px' } }, lastBackup),
        storageBox,
        el('div', { class: 'btn-row', style: { marginTop: '12px' } },
          el('button', {
            class: 'btn btn--primary',
            onClick: async () => {
              try {
                const r = await exportToFile();
                if (r) { await save({ lastBackup: Date.now() }); toast(`Backed up (${fmtBytes(r.bytes)}).`); }
              } catch (e) { toast(e.message, 'err'); }
            },
          }, '↓ back up'),
          el('button', { class: 'btn', onClick: () => importInput.click() }, '↑ restore from backup'),
          el('button', {
            class: 'btn btn--ghost',
            onClick: async () => {
              const ok = await requestPersistence();
              toast(ok ? 'Storage marked as persistent.' :
                'The browser did not grant it. Adding the app to your home screen is the safest option.', ok ? 'ok' : 'warn');
            },
          }, 'protect storage'),
          importInput)),

      // tehlikeli bolge
      el('div', { class: 'card' },
        el('h3', {}, 'delete everything'),
        el('p', { class: 'muted' }, 'this deletes the diary on this device completely. it cannot be undone.'),
        el('button', {
          class: 'btn btn--danger',
          onClick: async () => {
            if (!await confirmDialog('Delete everything',
              'All your entries, photos and records will be deleted. This cannot be undone. Are you sure?', 'delete')) return;
            if (!await confirmDialog('Asking one last time',
              'If you have a backup, fine. If not, everything is lost. Continue?', 'yes, delete')) return;
            await session.destroyEverything();
            location.reload();
          },
        }, 'delete everything')));
  },

  async unmount() {},
};
