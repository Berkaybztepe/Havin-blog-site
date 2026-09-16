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
    dish: { type: 'string' },
    items: { type: 'array', items: { type: 'string' } },
    portion_estimate: { type: 'string' },
    calories: { type: 'integer' },
    protein_g: { type: 'number' },
    carbs_g: { type: 'number' },
    fat_g: { type: 'number' },
    fibre_g: { type: 'number' },
    notable_micronutrients: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    note: { type: 'string' },
  },
  // Yapilandirilmis cikti her nesnede bunlarin ikisini de sart kosuyor.
  required: ['dish', 'items', 'portion_estimate', 'calories', 'protein_g',
    'carbs_g', 'fat_g', 'fibre_g', 'notable_micronutrients', 'confidence', 'note'],
  additionalProperties: false,
};

const MEAL_SYSTEM = `You look at a photo of a meal and estimate its approximate nutrition.

Rules:
- Say clearly that you are estimating. Never sound certain.
- Estimate the portion from the plate or bowl in the photo.
- Put a short, warm, NON-JUDGEMENTAL sentence in "note". Never write things like
  "eat less", "that's a lot", "make up for it", or "healthy/unhealthy". Do not sort food
  into good and bad.
- Do not give diet advice, do not set targets, do not talk about weight.
- If you are unsure, set "confidence" to "low".
- Write in English.`;

export async function analyzeMealPhoto(apiKey, fileOrBlob, description, { signal } = {}) {
  const { base64, mediaType } = await prepareForAI(fileOrBlob);
  const userText = description
    ? `A photo of this meal. The person's note: "${description}". Estimate the nutrition.`
    : 'A photo of this meal. Estimate the nutrition.';

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
    confidence: ['dusuk', 'medium', 'yuksek'].includes(data.guven) ? data.guven : 'dusuk',
    note: String(data.not || ''),
  };
}

/** Sadece metinden tahmin — fotograf yoksa. */
export async function analyzeMealText(apiKey, description, { signal } = {}) {
  const res = await callClaude(apiKey, {
    max_tokens: 2000,
    system: MEAL_SYSTEM,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: MEAL_SCHEMA } },
    messages: [{ role: 'user', content: `Estimate the nutrition of this meal: "${description}"` }],
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
    confidence: ['dusuk', 'medium', 'yuksek'].includes(data.guven) ? data.guven : 'dusuk',
    note: String(data.not || ''),
  };
}

// --- 2) Duygusal destek ----------------------------------------------------
const SUPPORT_SYSTEM = `You are a warm, non-judgemental companion replying to someone writing in their diary.
You are NOT a doctor, dietitian or therapist, and you never act like one.

How you write:
- English, plain, close. Short paragraphs. 150 words at most.
- Meet the feeling first. Do not jump to solutions.
- Be curious, not interrogating. Ask at most one gentle question.
- If they are angry at themselves, do not agree with them, but do not argue either — soften it.

Never:
- Calories, weight, measurements, targets, "making up for it", "you overdid it", "you'll fix it tomorrow".
- Sorting food into good/bad or healthy/unhealthy.
- Suggesting diets, fasting, or compensating with exercise.
- Diagnosing or giving medical advice.
- Preaching, lecturing, or corrections that start with "but".

If they mention self-harm, vomiting, long periods without eating, or not wanting to live:
without panicking, say in one sentence that reaching someone they trust or a professional
could help. Then carry on being alongside them.`;

const KIND_LABEL = {
  feeling: 'a general feeling', binge: 'a binge', body: 'something difficult about their body',
  food: 'something difficult about food', good: 'something that went well',
};

export async function supportResponse(apiKey, kind, text, { signal } = {}) {
  if (!apiKey) return { text: localSupport(kind, text), source: 'local' };
  try {
    const res = await callClaude(apiKey, {
      max_tokens: 1200,
      system: SUPPORT_SYSTEM,
      output_config: { effort: 'medium' },
      messages: [{
        role: 'user',
        content: `They shared ${KIND_LABEL[kind] || 'something'}:\n\n"${text}"\n\nReply to them.`,
      }],
    }, { signal });
    return { text: textOf(res), source: 'claude' };
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    // Reddedilme dahil her hatada yerel kutuphaneye duseriz: kullanici bos kalmasin.
    return { text: localSupport(kind, text), source: 'local', warning: e instanceof AIError ? e.message : null };
  }
}

// --- 3) Gun plani onerisi --------------------------------------------------
const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          time: { type: 'string' },
          title: { type: 'string' },
          category: { type: 'string', enum: ['general', 'work', 'me', 'move', 'home', 'people'] },
        },
        required: ['time', 'title', 'category'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'blocks'],
  additionalProperties: false,
};

export async function suggestDayPlan(apiKey, { note, energy, mustDo }, { signal } = {}) {
  if (!apiKey) {
    return { summary: randomNudge(), blocks: [], source: 'local' };
  }
  const prompt = [
    'Make a realistic plan for today.',
    energy ? `Energy level: ${energy}.` : '',
    mustDo ? `Must happen today: ${mustDo}.` : '',
    note ? `Extra note: ${note}` : '',
    'Rules: 5-8 blocks. Times in "HH:MM" format. Include the breaks.',
    'If energy is low, lighten the plan; do not build something punishing. Write in English.',
  ].filter(Boolean).join(' ');

  try {
    const res = await callClaude(apiKey, {
      max_tokens: 2000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: PLAN_SCHEMA } },
      messages: [{ role: 'user', content: prompt }],
    }, { signal });
    const data = jsonOf(res);
    return { summary: data.summary || '', blocks: (data.blocks || []).slice(0, 12), source: 'claude' };
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    return { summary: randomNudge(), blocks: [], source: 'local', warning: e instanceof AIError ? e.message : null };
  }
}

// --- 4) Kisiye ozel gelisim onerisi ---------------------------------------
export async function personalSuggestions(apiKey, { growth, about }, { signal } = {}) {
  if (!apiKey) return null;
  const res = await callClaude(apiKey, {
    max_tokens: 1500,
    output_config: { effort: 'low' },
    system: 'Write in English. Be short and concrete. No preaching, no motivational cliches.',
    messages: [{
      role: 'user',
      content: `Someone wants to grow in these areas: ${growth || '(not stated)'}.
About them: ${about || '(not stated)'}.
Suggest 3 concrete, small, doable things they could try this week.
One sentence each. Use bullet points, no heading.`,
    }],
  }, { signal });
  return textOf(res);
}
