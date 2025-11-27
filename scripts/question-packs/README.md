# Question Pack Generator (CLI Skeleton)

This folder contains a TypeScript CLI skeleton to generate syllabus-based question packs with an LLM and validate them against our JSON schemas.

Location
- Project: RogueLearn.Frontend
- Path: scripts/question-packs/

Prerequisites
- Node.js 18+
- PNPM or NPM
- Install dependencies:
  - pnpm add ajv ajv-formats axios

Usage (run from the Frontend project directory)
```
pnpm ts-node scripts/question-packs/generate.ts --subject PRF192 --syllabus ../BMAD_Rogue_Learn/extracted-data/syllabus/PRF192.json --out ../BMAD_Rogue_Learn/extracted-data/question-packs/PRF192_pack.json --provider OpenAI --model gpt-4o-mini --templateId prf_mcq_v1
```

Notes
- By default, the CLI expects JSON schemas to be under `../BMAD_Rogue_Learn/docs/schemas`. Override with `--schemaDir <path>` if needed.
- The LLM call is stubbed; wire to your provider of choice.
- Consider adding a GitHub Action to validate packs on PR.