// Uygulamanin yapay zeka ozellikleri. Her birinin anahtarsiz bir karsiligi var;
// hata olursa sessizce oraya dusuyoruz.

import { callClaude, textOf, jsonOf, AIError } from './client.js';
import { prepareForAI } from '../lib/image.js';
import { localSupport } from '../data/support.js';
import { randomNudge } from '../data/planner.js';

// --- 1) Fotograftan besin tahmini -----------------------------------------
const MEAL_SCHEMA = {
  type: 'object',
  properties: {
    yemek: { type: 'string' },
    ogeler: { type: 'array', items: { type: 'string' } },
    porsiyon_tahmini: { type: 'string' },
    kalori: { type: 'integer' },
    protein_g: { type: 'number' },
    karbonhidrat_g: { type: 'number' },
    yag_g: { type: 'number' },
    lif_g: { type: 'number' },
    one_cikan_mikrolar: { type: 'array', items: { type: 'string' } },
    guven: { type: 'string', enum: ['dusuk', 'orta', 'yuksek'] },
    not: { type: 'string' },
  },
  required: ['yemek', 'ogeler', 'porsiyon_tahmini', 'kalori', 'protein_g',
    'karbonhidrat_g', 'yag_g', 'lif_g', 'one_cikan_mikrolar', 'guven', 'not'],
  additionalProperties: false,
};

const MEAL_SYSTEM = `Sen bir yemek fotografini inceleyip yaklasik besin degerlerini tahmin eden bir yardimcisin.

Kurallar:
- Tahmin ettigini acikca belirt. Kesin konusma.
- Porsiyonu fotograftaki kaba/tabaga gore tahmin et.
- "not" alanina kisa, sicak ve YARGISIZ bir cumle yaz. Asla "az ye", "fazla kacmis",
  "telafi et", "saglikli/saglıksız" gibi ifadeler kullanma. Yemegi iyi ya da kotu olarak siniflandirma.
- Diyet onerisi verme, hedef koyma, kilo hakkinda konusma.
- Emin degilsen "guven" alanini "dusuk" yap.
- Turkce yaz.`;

export async function analyzeMealPhoto(apiKey, fileOrBlob, description, { signal } = {}) {
  const { base64, mediaType } = await prepareForAI(fileOrBlob);
  const userText = description
    ? `Bu yemegin fotografi. Kullanicinin notu: "${description}". Besin degerlerini tahmin et.`
    : 'Bu yemegin fotografi. Besin degerlerini tahmin et.';

  const res = await callClaude(apiKey, {
    max_tokens: 2000,
    system: MEAL_SYSTEM,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: MEAL_SCHEMA } },
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: userText },
      ],
    }],
  }, { signal });

  const data = jsonOf(res);
  // Makul olmayan degerleri kirp: sema sayisal sinir desteklemiyor.
  const clamp = (v, max) => Math.max(0, Math.min(Number(v) || 0, max));
  return {
    yemek: String(data.yemek || '').slice(0, 120),
    ogeler: (data.ogeler || []).slice(0, 15).map(String),
    porsiyon: String(data.porsiyon_tahmini || ''),
    kcal: clamp(data.kalori, 5000),
    protein: clamp(data.protein_g, 400),
    carbs: clamp(data.karbonhidrat_g, 800),
    fat: clamp(data.yag_g, 400),
    fiber: clamp(data.lif_g, 200),
    micros: (data.one_cikan_mikrolar || []).slice(0, 8).map(String),
    confidence: ['dusuk', 'orta', 'yuksek'].includes(data.guven) ? data.guven : 'dusuk',
    note: String(data.not || ''),
  };
}

/** Sadece metinden tahmin — fotograf yoksa. */
export async function analyzeMealText(apiKey, description, { signal } = {}) {
  const res = await callClaude(apiKey, {
    max_tokens: 2000,
    system: MEAL_SYSTEM,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: MEAL_SCHEMA } },
    messages: [{ role: 'user', content: `Su ogunun besin degerlerini tahmin et: "${description}"` }],
  }, { signal });
  const data = jsonOf(res);
  const clamp = (v, max) => Math.max(0, Math.min(Number(v) || 0, max));
  return {
    yemek: String(data.yemek || description).slice(0, 120),
    ogeler: (data.ogeler || []).slice(0, 15).map(String),
    porsiyon: String(data.porsiyon_tahmini || ''),
    kcal: clamp(data.kalori, 5000), protein: clamp(data.protein_g, 400),
    carbs: clamp(data.karbonhidrat_g, 800), fat: clamp(data.yag_g, 400),
    fiber: clamp(data.lif_g, 200),
    micros: (data.one_cikan_mikrolar || []).slice(0, 8).map(String),
    confidence: ['dusuk', 'orta', 'yuksek'].includes(data.guven) ? data.guven : 'dusuk',
    note: String(data.not || ''),
  };
}

// --- 2) Duygusal destek ----------------------------------------------------
const SUPPORT_SYSTEM = `Sen, gunlugune yazan bir kisiye sicak ve yargisiz karsilik veren bir yoldassin.
Doktor, diyetisyen ya da terapist DEGILSIN ve oyleymis gibi davranmazsin.

Nasil yazarsin:
- Turkce, sade, samimi. Kisa paragraflar. En fazla 150 kelime.
- Once duyguyu karsila. Cozume atlama.
- Merak et, sorgulama. Gerekirse tek bir nazik soru sor.
- Kisi kendine kizdiysa, ona katilma ama savunmaya da gecme; yumusat.

Asla yapmayacaklarin:
- Kalori, kilo, olcu, hedef, "telafi", "fazla kacirmissin", "yarin duzeltirsin" gibi ifadeler.
- Yiyecekleri iyi/kotu, saglikli/saglıksız diye ayirmak.
- Diyet, oruc, egzersizle telafi onermek.
- Tani koymak ya da tibbi tavsiye vermek.
- Vaaz vermek, ders vermek, "ama" ile baslayan duzeltmeler.

Eger kisi kendine zarar vermekten, kusmaktan, uzun sureli ac kalmaktan ya da yasamak
istememekten bahsediyorsa: panige kapilmadan, tek bir cumleyle guvendigi birine ya da
bir uzmana ulasmasinin iyi gelebilecegini soyle. Sonra yine yanindaymis gibi devam et.`;

const KIND_LABEL = {
  his: 'genel bir his', atak: 'bir yeme atagi', beden: 'bedeniyle ilgili bir zorlanma',
  yemek: 'yemekle ilgili bir zorlanma', iyi: 'iyi giden bir sey',
};

export async function supportResponse(apiKey, kind, text, { signal } = {}) {
  if (!apiKey) return { text: localSupport(kind, text), source: 'yerel' };
  try {
    const res = await callClaude(apiKey, {
      max_tokens: 1200,
      system: SUPPORT_SYSTEM,
      output_config: { effort: 'medium' },
      messages: [{
        role: 'user',
        content: `Kullanici ${KIND_LABEL[kind] || 'bir sey'} paylasti:\n\n"${text}"\n\nOna karsilik ver.`,
      }],
    }, { signal });
    return { text: textOf(res), source: 'claude' };
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    // Reddedilme dahil her hatada yerel kutuphaneye duseriz: kullanici bos kalmasin.
    return { text: localSupport(kind, text), source: 'yerel', warning: e instanceof AIError ? e.message : null };
  }
}

// --- 3) Gun plani onerisi --------------------------------------------------
const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    ozet: { type: 'string' },
    bloklar: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          saat: { type: 'string' },
          baslik: { type: 'string' },
          kategori: { type: 'string', enum: ['genel', 'okul', 'kendime', 'spor', 'ev', 'sosyal'] },
        },
        required: ['saat', 'baslik', 'kategori'],
        additionalProperties: false,
      },
    },
  },
  required: ['ozet', 'bloklar'],
  additionalProperties: false,
};

export async function suggestDayPlan(apiKey, { note, energy, mustDo }, { signal } = {}) {
  if (!apiKey) {
    return { ozet: randomNudge(), bloklar: [], source: 'yerel' };
  }
  const prompt = [
    'Bugun icin gercekci bir gun plani cikar.',
    energy ? `Enerji durumu: ${energy}.` : '',
    mustDo ? `Mutlaka yapilmasi gerekenler: ${mustDo}.` : '',
    note ? `Ek not: ${note}` : '',
    'Kurallar: 5-8 blok. Saatler "HH:MM" biciminde. Molalari da yaz.',
    'Enerji dusukse plani hafiflet, kendini zorlayan bir plan kurma. Turkce yaz.',
  ].filter(Boolean).join(' ');

  try {
    const res = await callClaude(apiKey, {
      max_tokens: 2000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: PLAN_SCHEMA } },
      messages: [{ role: 'user', content: prompt }],
    }, { signal });
    const data = jsonOf(res);
    return { ozet: data.ozet || '', bloklar: (data.bloklar || []).slice(0, 12), source: 'claude' };
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    return { ozet: randomNudge(), bloklar: [], source: 'yerel', warning: e instanceof AIError ? e.message : null };
  }
}

// --- 4) Kisiye ozel gelisim onerisi ---------------------------------------
export async function personalSuggestions(apiKey, { growth, about }, { signal } = {}) {
  if (!apiKey) return null;
  const res = await callClaude(apiKey, {
    max_tokens: 1500,
    output_config: { effort: 'low' },
    system: 'Turkce yaz. Kisa ve somut ol. Vaaz verme, motivasyon klisesi kullanma.',
    messages: [{
      role: 'user',
      content: `Bir kisi kendini su alanlarda gelistirmek istiyor: ${growth || '(belirtmemis)'}.
Kendisi hakkinda: ${about || '(belirtmemis)'}.
Ona bu hafta deneyebilecegi 3 somut, kucuk ve yapilabilir sey oner.
Her biri tek cumle olsun. Madde isareti kullan, baslik yazma.`,
    }],
  }, { signal });
  return textOf(res);
}
