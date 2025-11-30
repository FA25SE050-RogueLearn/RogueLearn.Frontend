/*
  CLI skeleton: Generate a question pack from a syllabus JSON using an LLM and validate against schemas.
*/
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
// import axios from 'axios'; // Uncomment when wiring an LLM provider

type Args = {
  subject: string;
  syllabus: string;
  out: string;
  provider?: string;
  model?: string;
  templateId?: string;
  schemaDir?: string;
  total?: number;
  distribution?: string; // e.g., "EASY=6,MEDIUM=6,HARD=4"
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: any = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    const val = argv[i + 1];
    if (!key) continue;
    // Convert numeric flags
    if (key.toLowerCase() === 'total') {
      args[key] = parseInt(val, 10);
    } else {
      args[key] = val;
    }
  }
  if (!args.subject || !args.syllabus || !args.out) {
    console.error('Usage: ts-node scripts/question-packs/generate.ts --subject <PRF192> --syllabus <path> --out <path> [--provider OpenAI] [--model gpt-4o-mini] [--templateId prf_mcq_v1] [--schemaDir ../BMAD_Rogue_Learn/docs/schemas] [--total 16] [--distribution "EASY=6,MEDIUM=6,HARD=4"]');
    process.exit(1);
  }
  return args as Args;
}

function loadJson<T = any>(p: string): T {
  const data = fs.readFileSync(p, 'utf-8');
  return JSON.parse(data);
}

type Dist = { EASY: number; MEDIUM: number; HARD: number };

function computeDefaultDist(total: number): Dist {
  // Default ratio ~ 3/8 easy, 3/8 medium, 2/8 hard
  const easy = Math.floor(total * 0.375);
  const med = Math.floor(total * 0.375);
  const hard = total - easy - med;
  return { EASY: easy, MEDIUM: med, HARD: hard };
}

function parseDistribution(distStr: string | undefined, total: number | undefined): Dist | undefined {
  if (!distStr) return undefined;
  const parts = distStr.split(',').map(s => s.trim());
  const acc: any = {};
  for (const p of parts) {
    const [kRaw, vRaw] = p.split('=');
    if (!kRaw || !vRaw) continue;
    const k = kRaw.trim().toUpperCase();
    const v = parseInt(vRaw.trim(), 10);
    const key = k.startsWith('E') ? 'EASY' : k.startsWith('M') ? 'MEDIUM' : 'HARD';
    acc[key] = v;
  }
  if (acc.EASY == null || acc.MEDIUM == null || acc.HARD == null) return undefined;
  const sum = (acc.EASY || 0) + (acc.MEDIUM || 0) + (acc.HARD || 0);
  if (typeof total === 'number' && sum !== total) {
    console.error(`Distribution sum (${sum}) does not match total (${total}). Please fix --distribution or --total.`);
    process.exit(1);
  }
  return acc as Dist;
}

function buildPrompt(subject: string, syllabusJson: any, templateId: string | undefined, total: number | undefined, dist: Dist | undefined) {
  const questionTotal = typeof total === 'number' ? total : 12;
  const d = dist ?? (typeof total === 'number' ? computeDefaultDist(total) : { EASY: 4, MEDIUM: 5, HARD: 3 });
  return `You are an expert lecturer and exam designer. Generate a multiple-choice question pack in strict JSON that validates against docs/schemas/question-pack.schema.json. Subject: ${subject}. Use the provided syllabus data to set topic, sessionNo, and CLO for each question. TemplateId: ${templateId ?? 'default'}. Constraints: ${questionTotal} questions, EASY=${d.EASY}, MEDIUM=${d.MEDIUM}, HARD=${d.HARD}. Emit only JSON.`;
}

async function callLLM(provider: string | undefined, model: string | undefined, prompt: string): Promise<string> {
  // Stub: return a minimal pack or read from a fixture. Wire to OpenAI/Claude/Gemini as needed.
  // Example OpenAI call:
  // const resp = await axios.post('https://api.openai.com/v1/chat/completions', { ... }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });
  // return resp.data.choices[0].message.content;
  return '{}';
}

function checksum(obj: any): string {
  const normalized = JSON.stringify(obj.items ?? obj);
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return `sha256:${hash}`;
}

// Dist type already declared above

function assignDifficulties(total: number, dist: Dist): Array<'EASY' | 'MEDIUM' | 'HARD'> {
  const arr: Array<'EASY' | 'MEDIUM' | 'HARD'> = [];
  for (let i = 0; i < dist.EASY; i++) arr.push('EASY');
  for (let i = 0; i < dist.MEDIUM; i++) arr.push('MEDIUM');
  for (let i = 0; i < dist.HARD; i++) arr.push('HARD');
  // Adjust length if necessary
  while (arr.length < total) arr.push('MEDIUM');
  if (arr.length > total) arr.length = total;
  return arr;
}

function bloomFor(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): string {
  switch (difficulty) {
    case 'EASY': return 'REMEMBER';
    case 'MEDIUM': return 'APPLY';
    case 'HARD': return 'ANALYZE';
  }
}

function buildMockPack(subject: string, syllabusJson: any, total: number, dist: Dist) {
  const subjectCode = syllabusJson.subjectCode || subject;
  const subjectName = syllabusJson.syllabusEnglish || syllabusJson.syllabusName || subject;
  const packId = `pack-${subjectCode}-demo${total}-${Date.now()}`;
  const version = `demo-${new Date().toISOString().slice(0, 7)}`;
  const difficulties = assignDifficulties(total, dist);
  const sessions: any[] = Array.isArray(syllabusJson.sessions) ? syllabusJson.sessions : [];

  const items = [] as any[];
  for (let i = 0; i < total; i++) {
    const qId = `q-${i + 1}`;
    const d = difficulties[i];
    const session = sessions[i % Math.max(1, sessions.length)];
    const sessionNo = session?.session ?? (i + 1);
    const topic = session?.topic ?? `Topic ${i + 1}`;
    const cloArr: string[] = Array.isArray(session?.los) ? session.los : [];
    const clo = cloArr.length > 0 ? cloArr[0] : 'CLO1';
    const prompt = `(${subjectCode}) [S${sessionNo}] ${topic}: Choose the best answer.`;
    const options = [
      { id: 'A', text: `Option A for ${topic}` },
      { id: 'B', text: `Option B for ${topic}` },
      { id: 'C', text: `Option C for ${topic}` },
      { id: 'D', text: `Option D for ${topic}` }
    ];
    const correctOptionId = 'A';
    const explanation = `The correct answer is ${correctOptionId}.`;
    const bloomLevel = bloomFor(d as any);
    items.push({
      id: qId,
      topic,
      clo,
      sessionNo,
      prompt,
      options,
      correctOptionId,
      explanation,
      difficulty: d,
      bloomLevel,
      tags: [subjectCode, `session-${sessionNo}`, 'demo'],
      locale: 'en',
      source: {
        type: 'syllabus',
        subjectCode,
        path: `extracted-data/syllabus/${subjectCode}.json`,
        reference: topic
      },
      metadata: { randomizeOptions: true }
    });
  }

  const pack: any = {
    packId,
    subjectCode,
    subjectName,
    version,
    locale: 'en',
    source: { type: 'syllabus', path: `extracted-data/syllabus/${subjectCode}.json` },
    generator: { provider: 'Other', model: 'mock', promptTemplateId: 'mock_v1' },
    settings: { totalQuestions: total, timeLimitSecondsPerQuestion: 40, shuffleQuestions: true, randomizeOptions: true },
    scoring: { difficultyPoints: { EASY: 1, MEDIUM: 2, HARD: 3 }, correctBonus: 0, wrongPenalty: 0 },
    difficultyDistribution: dist,
    items,
    createdAt: new Date().toISOString()
  };
  pack.checksum = checksum(pack);
  return pack;
}

function validatePack(pack: any, schemaDir: string): { valid: boolean; errors?: any } {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const questionSchema = loadJson(path.join(schemaDir, 'question.schema.json'));
  const packSchema = loadJson(path.join(schemaDir, 'question-pack.schema.json'));
  ajv.addSchema(questionSchema, questionSchema.$id || 'question.schema.json');
  const validate = ajv.compile(packSchema);
  const valid = validate(pack);
  return { valid: !!valid, errors: validate.errors };
}

async function main() {
  const args = parseArgs();
  const syllabus = loadJson(args.syllabus);
  const dist = parseDistribution(args.distribution, args.total);
  const prompt = buildPrompt(args.subject, syllabus, args.templateId, args.total, dist);
  let pack: any;
  const useMock = (args.provider && args.provider.toLowerCase() === 'mock') || (args.model && args.model.toLowerCase() === 'mock');
  if (useMock) {
    const total = typeof args.total === 'number' ? args.total : 12;
    const d = dist ?? (typeof args.total === 'number' ? computeDefaultDist(args.total) : { EASY: 4, MEDIUM: 5, HARD: 3 });
    pack = buildMockPack(args.subject, syllabus, total, d);
  } else {
    const raw = await callLLM(args.provider, args.model, prompt);
    try {
      pack = JSON.parse(raw);
    } catch (e) {
      console.error('LLM did not return valid JSON. Error:', e);
      process.exit(2);
    }
  }

  // Inject generator metadata (if missing)
  pack.generator = pack.generator || { provider: args.provider || 'Other', model: args.model || 'unknown', promptTemplateId: args.templateId };
  // Inject checksum
  pack.checksum = checksum(pack);

  const defaultSchemaDir = path.resolve(process.cwd(), '../BMAD_Rogue_Learn/docs/schemas');
  const schemaDir = args.schemaDir ? path.resolve(args.schemaDir) : defaultSchemaDir;
  const { valid, errors } = validatePack(pack, schemaDir);
  if (!valid) {
    console.error('Schema validation failed:', errors);
    process.exit(3);
  }

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(pack, null, 2));
  console.log('Pack written to', args.out);
}

main().catch(err => {
  console.error(err);
  process.exit(99);
});