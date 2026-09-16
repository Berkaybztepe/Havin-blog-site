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
  const user = el('input', { class: 'input', type: 'text', autocomplete: 'username', placeholder: 'your name' });
  const pw = el('input', { class: 'input', type: 'password', autocomplete: 'new-password', placeholder: 'password' });
  const pw2 = el('input', { class: 'input', type: 'password', autocomplete: 'new-password', placeholder: 'repeat password' });
  const hint = el('input', { class: 'input', type: 'text', placeholder: 'password hint (optional)' });
  const meterFill = el('div', { class: 'bar__fill', style: { width: '0%' } });
  const meterText = el('div', { class: 'field__hint' }, 'use at least 10 characters');
  const btn = el('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'create my diary');

  pw.addEventListener('input', () => {
    const s = strengthBar(pw.value);
    meterFill.style.width = Math.min(100, (s.bits / 90) * 100) + '%';
    meterFill.style.background = s.color;
    meterText.textContent = pw.value ? `password strength: ${s.label}` : 'use at least 10 characters';
  });

  const form = el('form', {
    onSubmit: async (e) => {
      e.preventDefault();
      if (pw.value.length < 10) { toast('Password must be at least 10 characters.', 'err'); return; }
      if (pw.value !== pw2.value) { toast('The passwords do not match.', 'err'); return; }
      btn.disabled = true;
      btn.replaceChildren(el('span', { class: 'spinner' }), ' setting up…');
      try {
        const { recoveryCode } = await session.createVault(user.value.trim(), pw.value, hint.value.trim());
        showRecoveryCode(recoveryCode, onUnlocked);
      } catch (err) {
        toast(err.message || 'Could not create.', 'err');
        btn.disabled = false;
        btn.textContent = 'create my diary';
      }
    },
  },
    el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'username'), user),
    el('div', { class: 'field' },
      el('label', { class: 'field__label' }, 'password'), pw,
      el('div', { class: 'bar', style: { marginTop: '7px' } }, meterFill), meterText),
    el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'repeat password'), pw2),
    el('div', { class: 'field' }, el('label', { class: 'field__label' }, 'ipucu'), hint),
    btn);

  clear(host).append(
    el('h1', { class: 'lock__title' }, 'merhaba'),
    el('p', { class: 'muted' }, 'this will be only yours. choose a password; ' +
      'everything you write stays on this device, encrypted.'),
    form,
    el('div', { class: 'note note--warn', style: { marginTop: '16px', textAlign: 'left' } },
      el('strong', {}, 'Start knowing this: '),
      'if you forget your password nobody can open your diary — not even me. ' +
      'I will give you a recovery code in a moment. Write it down somewhere.'),
    // Yeni bir cihaza gecerken ilk karsilasilan ekran burasi; yedegi
    // buradan yukleyebilmek cihaz degistirmenin tek yolu.
    el('div', { class: 'btn-row', style: { marginTop: '14px', justifyContent: 'center' } },
      el('button', {
        class: 'btn btn--ghost btn--sm', type: 'button',
        onClick: () => restoreDialog(host, onUnlocked),
      }, 'I already have a backup')),
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
    title: 'your recovery code',
    body: el('div', {},
      el('p', {}, 'If you forget your password, this code is the only way back in. ' +
        'Write it on paper or save it somewhere you trust.'),
      box,
      el('p', { class: 'muted', style: { marginTop: '12px' } },
        'You will not see this code again.'),
      el('div', { class: 'btn-row', style: { marginTop: '10px' } },
        el('button', {
          class: 'btn btn--sm', type: 'button',
          onClick: async () => {
            try { await navigator.clipboard.writeText(code); toast('Code copied.'); }
            catch { toast('Could not copy — write it down by hand.', 'warn'); }
          },
        }, 'copy')),
      el('label', { class: 'switch', style: { marginTop: '14px' } },
        check, el('span', { class: 'switch__track' }),
        el('span', {}, 'I wrote the code down')),
    ),
    actions: [{
      label: 'continue', kind: 'primary',
      onClick: () => {
        if (!confirmed) { toast('Write the code down first, then tick the box.', 'warn'); return false; }
        onUnlocked();
      },
    }],
  });
}

// --- giris -----------------------------------------------------------------
async function unlockForm(host, onUnlocked) {
  const username = await session.getUsername();
  const hint = await session.getHint();

  const pw = el('input', { class: 'input', type: 'password', autocomplete: 'current-password', placeholder: 'your password' });
  const btn = el('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'enter');
  const err = el('div', { class: 'field__hint', style: { color: '#d9435c', minHeight: '1.2em' } });

  const form = el('form', {
    onSubmit: async (e) => {
      e.preventDefault();
      err.textContent = '';
      btn.disabled = true;
      btn.replaceChildren(el('span', { class: 'spinner' }), ' opening…');
      try {
        await session.unlock(pw.value);
        onUnlocked();
      } catch (ex) {
        err.textContent = ex.message || 'Could not open.';
        pw.value = '';
        pw.focus();
      } finally {
        btn.disabled = false;
        btn.textContent = 'enter';
      }
    },
  },
    el('div', { class: 'field' }, pw, err),
    btn);

  clear(host).append(
    el('h1', { class: 'lock__title' }, username ? `merhaba ${username}` : 'merhaba'),
    el('p', { class: 'muted' }, 'your diary is locked.'),
    form,
    hint ? el('p', { class: 'muted', style: { marginTop: '12px' } }, `ipucu: ${hint}`) : null,
    el('div', { class: 'btn-row', style: { marginTop: '14px', justifyContent: 'center' } },
      el('button', {
        class: 'btn btn--ghost btn--sm', type: 'button',
        onClick: () => recoveryDialog(onUnlocked),
      }, 'I forgot my password'),
      el('button', {
        class: 'btn btn--ghost btn--sm', type: 'button',
        onClick: () => restoreDialog(host, onUnlocked),
      }, 'restore from backup')),
  );
}

function recoveryDialog(onUnlocked) {
  const input = el('input', {
    class: 'input', type: 'text', placeholder: 'ABCDE-FGHJK-LMNPQ-RSTUV',
    style: { fontFamily: "'Courier New', monospace", letterSpacing: '.06em' },
  });
  const err = el('div', { class: 'field__hint', style: { color: '#d9435c' } });
  modal({
    title: 'recovery code',
    body: el('div', {},
      el('p', { class: 'muted' }, 'Enter the code I gave you during setup.'),
      input, err),
    actions: [
      { label: 'cancel' },
      {
        label: 'open', kind: 'primary',
        onClick: async () => {
          try {
            await session.unlockWithRecovery(input.value);
            toast('You are in. Remember to set a new password in Settings.');
            onUnlocked();
          } catch (e) {
            err.textContent = e.message || 'Could not open.';
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
    title: 'restore from backup',
    body: el('div', {},
      el('div', { class: 'note note--warn' },
        'This overwrites the diary currently on this device.'),
      el('p', { class: 'muted', style: { marginTop: '12px' } },
        'Pick the .havin.json file you saved earlier. You will open it with that backup’s password.'),
      file),
    actions: [
      { label: 'cancel' },
      {
        label: 'restore', kind: 'danger',
        onClick: async () => {
          if (!file.files || !file.files[0]) { toast('Choose a file.', 'warn'); return false; }
          try {
            await importFromFile(file.files[0]);
            toast('Backup restored. Now sign in with that backup’s password.');
            mountLock(host, { onUnlocked });
          } catch (e) {
            toast(e.message || 'Could not load.', 'err');
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
