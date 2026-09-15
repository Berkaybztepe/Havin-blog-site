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
  { id: 'y2k', name: '2000ler pembe', c1: '#ffc6e0', c2: '#cfe6ff' },
  { id: 'toile', name: 'koyu toile', c1: '#2b241f', c2: '#c9a06a' },
  { id: 'tuscan', name: 'toskana', c1: '#eed9ba', c2: '#b5622f' },
  { id: 'cherry', name: 'kiraz', c1: '#ffe3e3', c2: '#c8213c' },
  { id: 'lace', name: 'krem dantel', c1: '#f5eee2', c2: '#a8574e' },
  { id: 'midnight', name: 'gece', c1: '#1a2238', c2: '#8ba8e8' },
];

const FONTS = ['Quicksand', 'Nunito', 'Caveat', 'Dancing Script', 'Shadows Into Light',
  'Indie Flower', 'Gloria Hallelujah', 'Playfair Display', 'Cormorant Garamond'];

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
        el('span', { class: 'theme-card__swatch', style: { background: `linear-gradient(135deg, ${t.c1}, ${t.c2})` } }),
        el('span', { class: 'theme-card__name' }, t.name))));

    const fontBody = el('select', { class: 'select' },
      FONTS.map((f) => el('option', { value: f, selected: f === s.fontBody }, f)));
    const fontHead = el('select', { class: 'select' },
      FONTS.map((f) => el('option', { value: f, selected: f === s.fontHeading }, f)));
    const fontScale = el('input', { class: 'input', type: 'range', min: '0.85', max: '1.4', step: '0.05', value: String(s.fontScale) });
    const inkColor = el('input', { class: 'input', type: 'color', value: s.textColor || '#4a2338' });
    const useInk = el('input', { type: 'checkbox', checked: !!s.textColor });
    const accentColor = el('input', { class: 'input', type: 'color', value: s.accent || '#e04f92' });
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
      toast('Kaydedildi.');
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
              class: 'btn btn--sm btn--ghost', title: 'yukarı', disabled: active.indexOf(id) === 0,
              onClick: async () => {
                const i = active.indexOf(id);
                if (i > 0) { active.splice(i - 1, 0, active.splice(i, 1)[0]); await save({ widgets: active }); drawWidgets(); renderSidebar(document.getElementById('sidebar')); }
              },
            }, '↑'),
            el('button', {
              class: 'btn btn--sm btn--ghost', title: 'aşağı', disabled: active.indexOf(id) === active.length - 1,
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
      toast('Anahtar kaydedildi (şifreli olarak).');
    };
    const checkKey = async (e) => {
      const btn = e.currentTarget;
      if (!apiKey.value.trim()) { toast('Önce anahtarı yapıştır.', 'warn'); return; }
      btn.disabled = true;
      keyStatus.textContent = 'deneniyor…';
      try {
        await testKey(apiKey.value.trim());
        keyStatus.textContent = '✓ anahtar çalışıyor';
        keyStatus.style.color = '#4f9d5c';
        await save({ apiKey: apiKey.value.trim() });
      } catch (err) {
        keyStatus.textContent = '× ' + (err.message || 'olmadı');
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
      const oldPw = el('input', { class: 'input', type: 'password', placeholder: 'mevcut şifre' });
      const newPw = el('input', { class: 'input', type: 'password', placeholder: 'yeni şifre' });
      const newPw2 = el('input', { class: 'input', type: 'password', placeholder: 'yeni şifre tekrar' });
      const hint = el('input', { class: 'input', placeholder: 'yeni ipucu (isteğe bağlı)' });
      modal({
        title: 'şifre değiştir',
        body: el('div', {}, oldPw, el('div', { style: { height: '9px' } }), newPw,
          el('div', { style: { height: '9px' } }), newPw2, el('div', { style: { height: '9px' } }), hint),
        actions: [{ label: 'vazgeç' }, {
          label: 'değiştir', kind: 'primary',
          onClick: async () => {
            if (newPw.value.length < 10) { toast('Yeni şifre en az 10 karakter olmalı.', 'err'); return false; }
            if (newPw.value !== newPw2.value) { toast('Şifreler aynı değil.', 'err'); return false; }
            try {
              await session.changePassword(oldPw.value, newPw.value, hint.value);
              toast('Şifre değiştirildi.');
            } catch (e) { toast(e.message, 'err'); return false; }
          },
        }],
      });
    };

    // ---------- yedekleme ----------
    const storageBox = el('div', { class: 'muted' });
    (async () => {
      const [est, sum] = await Promise.all([storageEstimate(), vaultSummary()]);
      const parts = [`${sum.docs} kayıt`, `${sum.blobs} fotoğraf`];
      if (est) parts.push(`${fmtBytes(est.usage)} kullanılıyor`);
      storageBox.textContent = parts.join(' · ');
    })();

    const importInput = el('input', { type: 'file', accept: '.json,application/json', class: 'hidden' });
    importInput.addEventListener('change', async () => {
      const f = importInput.files && importInput.files[0];
      if (!f) return;
      if (!await confirmDialog('Geri yükle',
        'Bu cihazdaki her şeyin üzerine yazılacak. Devam edilsin mi?', 'geri yükle')) { importInput.value = ''; return; }
      try {
        await importFromFile(f);
        toast('Yüklendi. Şimdi o yedeğin şifresiyle girmen gerekiyor.');
        setTimeout(() => session.lock(), 900);
      } catch (e) { toast(e.message, 'err'); }
      importInput.value = '';
    });

    const lastBackup = s.lastBackup
      ? `son yedek: ${new Date(s.lastBackup).toLocaleDateString('tr-TR')}`
      : 'henüz hiç yedek almadın';

    clear(host).append(
      // gorunum
      el('div', { class: 'card' },
        el('h3', {}, '🎨 görünüm'),
        el('label', { class: 'field__label' }, 'tema'),
        themeGrid,
        el('div', { class: 'row', style: { marginTop: '16px' } },
          el('div', {}, el('label', { class: 'field__label' }, 'gövde yazı tipi'), fontBody),
          el('div', {}, el('label', { class: 'field__label' }, 'başlık yazı tipi'), fontHead)),
        el('div', { class: 'field', style: { marginTop: '12px' } },
          el('label', { class: 'field__label' }, 'yazı boyutu'), fontScale),
        el('div', { class: 'row' },
          el('div', {}, el('label', { class: 'field__label' }, 'yazı rengi'),
            el('div', { class: 'row row--tight' },
              el('label', { class: 'switch' }, useInk, el('span', { class: 'switch__track' })), inkColor)),
          el('div', {}, el('label', { class: 'field__label' }, 'vurgu rengi'),
            el('div', { class: 'row row--tight' },
              el('label', { class: 'switch' }, useAccent, el('span', { class: 'switch__track' })), accentColor)))),

      // baslik
      el('div', { class: 'card' },
        el('h3', {}, '✎ günlüğümün başlığı'),
        el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'başlık'), blogTitle),
        el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'alt yazı'), blogTagline),
        el('div', { class: 'btn-row btn-row--end' },
          el('button', { class: 'btn btn--primary', onClick: saveHeader }, 'kaydet'))),

      // widgetlar
      el('div', { class: 'card' },
        el('h3', {}, '🧩 kenar bölümü'),
        el('p', { class: 'muted' }, 'hangi kutucuklar görünsün ve hangi sırada.'),
        widgetBox),

      // yapay zeka
      el('div', { class: 'card' },
        el('h3', {}, '✨ yapay zeka'),
        el('p', { class: 'muted' },
          'Anahtar eklersen: yemek fotoğrafından kalori/makro tahmini, duygusal destek ve gün planı açılır. ' +
          'Anahtar olmadan da her şey çalışır — sadece bunlar hazır kütüphaneden gelir.'),
        el('div', { class: 'field' },
          el('label', { class: 'field__label' }, 'Claude API anahtarı'), apiKey, keyStatus,
          el('p', { class: 'field__hint' },
            'console.anthropic.com adresinden alınır. Anahtar şifreli olarak bu cihazda saklanır, ' +
            'başka hiçbir yere gönderilmez. Kullanım sana faturalanır — düşük bir aylık limit koymanı öneririm.')),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn--primary', onClick: saveKey }, 'kaydet'),
          el('button', { class: 'btn', onClick: checkKey }, 'anahtarı dene'),
          el('button', {
            class: 'btn btn--ghost',
            onClick: async () => { apiKey.value = ''; await save({ apiKey: '' }); toast('Anahtar silindi.'); },
          }, 'sil'))),

      // guvenlik
      el('div', { class: 'card' },
        el('h3', {}, '🔒 güvenlik'),
        el('div', { class: 'field' },
          el('label', { class: 'field__label' }, 'şu kadar hareketsizlikten sonra kilitle'), autoLock),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn', onClick: changePw }, 'şifreyi değiştir'),
          el('button', { class: 'btn btn--ghost', onClick: () => session.lock() }, 'şimdi kilitle')),
        el('div', { class: 'note', style: { marginTop: '14px' } },
          el('p', { style: { margin: '0 0 6px' } }, el('strong', {}, 'Bu şifreleme neyi korur?')),
          el('p', { style: { margin: '0 0 6px' } },
            'Verin bu cihazdan hiç çıkmıyor ve şifrelenmiş olarak duruyor. Cihazını ele geçiren biri ' +
            'şifreni bilmeden günlüğünü okuyamaz.'),
          el('p', { style: { margin: 0 } }, el('strong', {}, 'Neyi korumaz: '),
            'günlük açıkken cihazını eline alan biri her şeyi okur — bu yüzden otomatik kilit önemli. ' +
            'Ayrıca yapay zeka özelliklerini kullandığında, gönderdiğin yazı ve fotoğraf o an şifresiz olarak ' +
            'Anthropic sunucusuna gider.'))),

      // yedekleme
      el('div', { class: 'card' },
        el('h3', {}, '💾 yedekleme'),
        el('div', { class: 'note note--warn' },
          'Verin yalnızca bu cihazda. Telefonunu değiştirirsen, uygulamayı silersen ya da tarayıcı ' +
          'verileri temizlenirse günlüğün gider. Düzenli yedek al — başka cihaza taşımanın da yolu bu.'),
        el('p', { class: 'muted', style: { marginTop: '12px' } }, lastBackup),
        storageBox,
        el('div', { class: 'btn-row', style: { marginTop: '12px' } },
          el('button', {
            class: 'btn btn--primary',
            onClick: async () => {
              try {
                const r = await exportToFile();
                if (r) { await save({ lastBackup: Date.now() }); toast(`Yedek alındı (${fmtBytes(r.bytes)}).`); }
              } catch (e) { toast(e.message, 'err'); }
            },
          }, '↓ yedek al'),
          el('button', { class: 'btn', onClick: () => importInput.click() }, '↑ yedekten geri yükle'),
          el('button', {
            class: 'btn btn--ghost',
            onClick: async () => {
              const ok = await requestPersistence();
              toast(ok ? 'Depolama kalıcı olarak işaretlendi.' :
                'Tarayıcı bunu onaylamadı. Uygulamayı ana ekrana eklemek en güvenlisi.', ok ? 'ok' : 'warn');
            },
          }, 'depolamayı koru'),
          importInput)),

      // tehlikeli bolge
      el('div', { class: 'card' },
        el('h3', {}, 'her şeyi sil'),
        el('p', { class: 'muted' }, 'bu cihazdaki günlüğü tamamen siler. geri alınamaz.'),
        el('button', {
          class: 'btn btn--danger',
          onClick: async () => {
            if (!await confirmDialog('Her şeyi sil',
              'Tüm yazıların, fotoğrafların ve kayıtların silinecek. Bu geri alınamaz. Emin misin?', 'sil')) return;
            if (!await confirmDialog('Son kez soruyorum',
              'Yedek aldıysan sorun yok. Almadıysan her şey kaybolacak. Devam?', 'evet, sil')) return;
            await session.destroyEverything();
            location.reload();
          },
        }, 'her şeyi sil')));
  },

  async unmount() {},
};
