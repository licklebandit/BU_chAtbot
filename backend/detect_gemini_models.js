// detect_gemini_models.js
// Tries a list of common Gemini model ids using @google/generative-ai and your GEMINI_API_KEY
// Usage: node detect_gemini_models.js

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('No GEMINI_API_KEY found in backend/.env. Please add it and rerun.');
  process.exit(1);
}

const ai = new GoogleGenerativeAI(key);

const candidates = [
  'gemini-2.5-flash',
  'gemini-2.5',
  'gemini-1.5-flash',
  'gemini-1.5',
  'gemini-pro',
  'chat-bison-001',
  'text-bison-001'
];

async function tryModel(m) {
  // Try both the bare model id (e.g. 'gemini-1.5') and the full resource name ('models/gemini-1.5')
  const variants = m.startsWith('models/') ? [m] : [m, `models/${m}`];
  for (const attempt of variants) {
    try {
      console.log('Trying', attempt);
      const model = ai.getGenerativeModel({ model: attempt });
      const r = await model.generateContent({
        contents: [
          // Use 'model' role for instruction (SDK indicates valid roles are 'user' and 'model')
          { role: 'model', parts: [{ text: 'You are a short-response assistant.' }] },
          { role: 'user', parts: [{ text: 'Say hello in one short sentence.' }] }
        ]
      });
      const text = r?.text || JSON.stringify(r).slice(0,200);
      console.log('✅ Success for', attempt, '\n   ->', text.replace(/\n/g, ' '));
      return { model: attempt, ok: true, text };
    } catch (err) {
      const msg = err?.message || String(err);
      console.warn('❌ Failed for', attempt, '\n   ->', msg.replace(/\n/g, ' '));
      // continue to next variant
    }
  }
  return { model: m, ok: false, err: 'All variants failed' };
}

(async () => {
  const results = [];
  for (const m of candidates) {
    // small delay to avoid any rate-limit burst
    // eslint-disable-next-line no-await-in-loop
    const res = await tryModel(m);
    results.push(res);
  }
  console.log('\nSummary:');
  for (const r of results) {
    console.log(`${r.ok ? 'OK ' : 'NO '}  ${r.model}`);
  }
  console.log('\nPick a model that shows OK and set GEMINI_MODEL to that exact id in backend/.env');
})();
