// PBKDF2'yi ana is parcacigindan uzak tutar; kilit ekrani donmaz.
self.onmessage = async (e) => {
  const { password, salt, iterations } = e.data;
  try {
    const base = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, base, 256);
    self.postMessage({ ok: true, bits }, [bits]);
  } catch (err) {
    self.postMessage({ ok: false, error: String(err && err.message || err) });
  }
};
