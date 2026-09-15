// Kilit ekrani: ilk kurulum, giris, kurtarma kodu.

import { el, clear, toast, modal } from '../core/dom.js';
import * as session from '../core/session.js';
import { passwordStrength } from '../core/crypto.js';
import { importFromFile } from '../core/backup.js';

function strengthBar(pw) {
  const s = passwordStrength(pw);
  const colors = ['#ccc', '#d9435c', '#d98f1a', '#9bb33f', '#4f9d5c'];
  return { ...s, color: colors[s.level] };
}

// --- ilk kurulum -----------------------------------------------------------
function setupForm(host, onUnlocked) {
  const user = el('input', { class: 'input', type: 'text', autocomplete: 'username', placeholder: 'adın' });
  const pw = el('input', { class: 'input', type: 'password', autocomplete: 'new-password', placeholder: 'şifre' });
  const pw2 = el('input', { class: 'input', type: 'password', autocomplete: 'new-password', placeholder: 'şifre tekrar' });
  const hint = el('input', { class: 'input', type: 'text', placeholder: 'şifre ipucu (isteğe bağlı)' });
  const meterFill = el('div', { class: 'bar__fill', style: { width: '0%' } });
  const meterText = el('div', { class: 'field__hint' }, 'en az 10 karakter kullan');
  const btn = el('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'günlüğümü oluştur');

  pw.addEventListener('input', () => {
    const s = strengthBar(pw.value);
    meterFill.style.width = Math.min(100, (s.bits / 90) * 100) + '%';
    meterFill.style.background = s.color;
    meterText.textContent = pw.value ? `şifre gücü: ${s.label}` : 'en az 10 karakter kullan';
  });

  const form = el('form', {
    onSubmit: async (e) => {
      e.preventDefault();
      if (pw.value.length < 10) { toast('Şifre en az 10 karakter olmalı.', 'err'); return; }
      if (pw.value !== pw2.value) { toast('Şifreler aynı değil.', 'err'); return; }
      btn.disabled = true;
      btn.replaceChildren(el('span', { class: 'spinner' }), ' hazırlanıyor…');
      try {
        const { recoveryCode } = await session.createVault(user.value.trim(), pw.value, hint.value.trim());
        showRecoveryCode(recoveryCode, onUnlocked);
      } catch (err) {
        toast(err.message || 'Oluşturulamadı.', 'err');
        btn.disabled = false;
        btn.textContent = 'günlüğümü oluştur';
      }
    },
  },
    el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'kullanıcı adı'), user),
    el('div', { class: 'field' },
      el('label', { class: 'field__label' }, 'şifre'), pw,
      el('div', { class: 'bar', style: { marginTop: '7px' } }, meterFill), meterText),
    el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'şifre tekrar'), pw2),
    el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'ipucu'), hint),
    btn);

  clear(host).append(
    el('div', { style: { fontSize: '2.6rem' } }, '🎀'),
    el('h1', { class: 'lock__title' }, 'merhaba'),
    el('p', { class: 'muted' }, 'burası sadece senin olacak. bir şifre belirle; ' +
      'yazdığın her şey bu cihazda, şifreli olarak duracak.'),
    form,
    el('div', { class: 'note note--warn', style: { marginTop: '16px', textAlign: 'left' } },
      el('strong', {}, 'Bunu bilerek başla: '),
      'şifreni unutursan günlüğünü kimse açamaz — ben de açamam. ' +
      'Kurtarma kodunu birazdan vereceğim, onu bir yere yaz.'),
    // Yeni bir cihaza gecerken ilk karsilasilan ekran burasi; yedegi
    // buradan yukleyebilmek cihaz degistirmenin tek yolu.
    el('div', { class: 'btn-row', style: { marginTop: '14px', justifyContent: 'center' } },
      el('button', {
        class: 'btn btn--ghost btn--sm', type: 'button',
        onClick: () => restoreDialog(host, onUnlocked),
      }, 'zaten bir yedeğim var')),
  );
}

function showRecoveryCode(code, onUnlocked) {
  let confirmed = false;
  const box = el('div', {
    style: {
      fontFamily: "'Courier New', monospace", fontSize: '1.4rem', fontWeight: '700',
      letterSpacing: '.08em', textAlign: 'center', padding: '18px',
      background: 'var(--chip)', borderRadius: '12px', border: '2px dashed var(--accent)',
      userSelect: 'all', wordBreak: 'break-all',
    },
  }, code);

  const check = el('input', { type: 'checkbox' });
  check.addEventListener('change', () => { confirmed = check.checked; });

  modal({
    title: 'kurtarma kodun',
    body: el('div', {},
      el('p', {}, 'Şifreni unutursan günlüğünü açabilmenin tek yolu bu kod. ' +
        'Bir kağıda yaz ya da güvendiğin bir yere kaydet.'),
      box,
      el('p', { class: 'muted', style: { marginTop: '12px' } },
        'Bu kodu bir daha göremeyeceksin.'),
      el('div', { class: 'btn-row', style: { marginTop: '10px' } },
        el('button', {
          class: 'btn btn--sm', type: 'button',
          onClick: async () => {
            try { await navigator.clipboard.writeText(code); toast('Kod kopyalandı.'); }
            catch { toast('Kopyalanamadı, elle yaz.', 'warn'); }
          },
        }, '📋 kopyala')),
      el('label', { class: 'switch', style: { marginTop: '14px' } },
        check, el('span', { class: 'switch__track' }),
        el('span', {}, 'kodu bir yere yazdım')),
    ),
    actions: [{
      label: 'devam et', kind: 'primary',
      onClick: () => {
        if (!confirmed) { toast('Önce kodu bir yere yaz ve kutucuğu işaretle.', 'warn'); return false; }
        onUnlocked();
      },
    }],
  });
}

// --- giris -----------------------------------------------------------------
async function unlockForm(host, onUnlocked) {
  const username = await session.getUsername();
  const hint = await session.getHint();

  const pw = el('input', { class: 'input', type: 'password', autocomplete: 'current-password', placeholder: 'şifren' });
  const btn = el('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'gir');
  const err = el('div', { class: 'field__hint', style: { color: '#d9435c', minHeight: '1.2em' } });

  const form = el('form', {
    onSubmit: async (e) => {
      e.preventDefault();
      err.textContent = '';
      btn.disabled = true;
      btn.replaceChildren(el('span', { class: 'spinner' }), ' açılıyor…');
      try {
        await session.unlock(pw.value);
        onUnlocked();
      } catch (ex) {
        err.textContent = ex.message || 'Açılamadı.';
        pw.value = '';
        pw.focus();
      } finally {
        btn.disabled = false;
        btn.textContent = 'gir';
      }
    },
  },
    el('div', { class: 'field' }, pw, err),
    btn);

  clear(host).append(
    el('div', { style: { fontSize: '2.4rem' } }, '🔒'),
    el('h1', { class: 'lock__title' }, username ? `merhaba ${username}` : 'merhaba'),
    el('p', { class: 'muted' }, 'günlüğün kilitli.'),
    form,
    hint ? el('p', { class: 'muted', style: { marginTop: '12px' } }, `ipucu: ${hint}`) : null,
    el('div', { class: 'btn-row', style: { marginTop: '14px', justifyContent: 'center' } },
      el('button', {
        class: 'btn btn--ghost btn--sm', type: 'button',
        onClick: () => recoveryDialog(onUnlocked),
      }, 'şifremi unuttum'),
      el('button', {
        class: 'btn btn--ghost btn--sm', type: 'button',
        onClick: () => restoreDialog(host, onUnlocked),
      }, 'yedekten geri yükle')),
  );
}

function recoveryDialog(onUnlocked) {
  const input = el('input', {
    class: 'input', type: 'text', placeholder: 'ABCDE-FGHJK-LMNPQ-RSTUV',
    style: { fontFamily: "'Courier New', monospace", letterSpacing: '.06em' },
  });
  const err = el('div', { class: 'field__hint', style: { color: '#d9435c' } });
  modal({
    title: 'kurtarma kodu',
    body: el('div', {},
      el('p', { class: 'muted' }, 'Kurulum sırasında verdiğim kodu gir.'),
      input, err),
    actions: [
      { label: 'vazgeç' },
      {
        label: 'aç', kind: 'primary',
        onClick: async () => {
          try {
            await session.unlockWithRecovery(input.value);
            toast('Girildi. Ayarlardan yeni bir şifre belirlemeyi unutma.');
            onUnlocked();
          } catch (e) {
            err.textContent = e.message || 'Açılamadı.';
            return false;
          }
        },
      },
    ],
  });
}

function restoreDialog(host, onUnlocked) {
  const file = el('input', { class: 'input', type: 'file', accept: '.json,application/json' });
  modal({
    title: 'yedekten geri yükle',
    body: el('div', {},
      el('div', { class: 'note note--warn' },
        'Bu işlem bu cihazdaki mevcut günlüğün üzerine yazar.'),
      el('p', { class: 'muted', style: { marginTop: '12px' } },
        'Daha önce aldığın .havin.json dosyasını seç. Açmak için o yedeğin şifresini kullanacaksın.'),
      file),
    actions: [
      { label: 'vazgeç' },
      {
        label: 'geri yükle', kind: 'danger',
        onClick: async () => {
          if (!file.files || !file.files[0]) { toast('Bir dosya seç.', 'warn'); return false; }
          try {
            await importFromFile(file.files[0]);
            toast('Yedek yüklendi. Şimdi o yedeğin şifresiyle gir.');
            mountLock(host, { onUnlocked });
          } catch (e) {
            toast(e.message || 'Yüklenemedi.', 'err');
            return false;
          }
        },
      },
    ],
  });
}

// --- giris noktasi ---------------------------------------------------------
export async function mountLock(host, { onUnlocked }) {
  const exists = await session.vaultExists();
  if (exists) await unlockForm(host, onUnlocked);
  else setupForm(host, onUnlocked);
}
