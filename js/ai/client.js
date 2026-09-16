// Claude API'ye tarayicidan dogrudan cagri.
//
// Anahtar kullanicinin kendi anahtari ve sifreli kasada duruyor. Tarayicidan
// dogrudan cagri icin Anthropic'in ozel basligi gerekiyor; bu baslik tam olarak
// "kendi anahtarini getir" senaryosu icin var.

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';
export const MODEL = 'claude-opus-5';

export class AIError extends Error {
  constructor(message, kind) { super(message); this.name = 'AIError'; this.kind = kind; }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Tek bir istek gonderir. Gecici hatalarda (429, 5xx) sinirli sayida tekrar dener.
 * Donen deger ham API yanitidir.
 */
export async function callClaude(apiKey, body, { retries = 2, signal } = {}) {
  if (!apiKey) throw new AIError('No API key has been entered.', 'no-key');

  let attempt = 0;
  for (;;) {
    let res;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': API_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: MODEL, ...body }),
        signal,
      });
    } catch (e) {
      if (e && e.name === 'AbortError') throw e;
      throw new AIError('Could not reach the internet. Check your connection.', 'network');
    }

    if (res.ok) return res.json();

    // gecici hatalar
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const ra = Number(res.headers.get('retry-after'));
      const wait = Number.isFinite(ra) && ra > 0 ? ra * 1000 : 1200 * Math.pow(2, attempt);
      attempt++;
      await sleep(Math.min(wait, 8000));
      continue;
    }

    let detail = '';
    try { const j = await res.json(); detail = (j.error && j.error.message) || ''; } catch {}

    if (res.status === 401) throw new AIError('The API key is not valid. Check it in Settings.', 'auth');
    if (res.status === 400) throw new AIError('The request was rejected' + (detail ? ': ' + detail : '.'), 'bad-request');
    if (res.status === 429) throw new AIError('Too many requests. Wait a moment and try again.', 'rate');
    if (res.status === 529 || res.status >= 500) throw new AIError('The service is busy right now. Try again shortly.', 'overloaded');
    throw new AIError('Something unexpected went wrong' + (detail ? ': ' + detail : ` (${res.status}).`), 'unknown');
  }
}

/** Yanittaki metin bloklarini birlestirir; reddedilme durumunu ayrica bildirir. */
export function textOf(response) {
  if (!response) return '';
  // stop_reason kontrolu icerige bakmadan ONCE yapilmali
  if (response.stop_reason === 'refusal') {
    throw new AIError('No reply could be produced for this. You could try writing it a different way.', 'refusal');
  }
  return (response.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

/** Yapilandirilmis cikti icin: metni JSON olarak cozer. */
export function jsonOf(response) {
  const text = textOf(response);
  if (!text) throw new AIError('The reply came back empty.', 'empty');
  try {
    return JSON.parse(text);
  } catch {
    // nadiren metin icine gomulu gelebilir
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch {} }
    throw new AIError('The reply is not in the expected format.', 'parse');
  }
}

/** Anahtarin gecerli olup olmadigini ucuz bir istekle sinar. */
export async function testKey(apiKey) {
  const r = await callClaude(apiKey, {
    max_tokens: 16,
    output_config: { effort: 'low' },
    messages: [{ role: 'user', content: 'Sadece "tamam" yaz.' }],
  });
  return textOf(r);
}
