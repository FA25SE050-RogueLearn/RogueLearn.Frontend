const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function fileExists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function mask(value) {
  if (!value) return 'missing';
  const visible = Math.min(6, value.length);
  return `${value.slice(0, visible)}*** (len:${value.length})`;
}

const root = process.cwd();
const nodeEnv = process.env.NODE_ENV || 'development';
const candidates = [
  `.env`,
  `.env.${nodeEnv}`,
  `.env.${nodeEnv}.local`,
  `.env.local`,
];

const found = candidates.filter((f) => fileExists(path.join(root, f)));
found.forEach((f) => {
  dotenv.config({ path: path.join(root, f), override: true });
});
console.log('[env-check] searched:', candidates.join(', '));
console.log('[env-check] found:', found.length > 0 ? found.join(', ') : 'none');

const publicVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_CODE_BATTLE_API_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
];

const secretVars = [
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
];

console.log('[env-check] public vars:');
publicVars.forEach((k) => {
  console.log(`  ${k}: ${process.env[k] || 'undefined'}`);
});

console.log('[env-check] secret vars (masked):');
secretVars.forEach((k) => {
  console.log(`  ${k}: ${mask(process.env[k])}`);
});