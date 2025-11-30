import { NextRequest, NextResponse } from 'next/server'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import packSchema from '@/lib/schemas/question-pack.schema.json'
import questionSchema from '@/lib/schemas/question.schema.json'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

type GenerateBody = {
  syllabusJson?: any
  subjectCode?: string
  topic?: string
  difficulty?: string
  count?: number
  userId?: string
  priorSummary?: any
}

function simpleGenerate(body: GenerateBody) {
  const subject = (body.subjectCode || 'demo').toUpperCase()
  const topic = body.topic || 'basics'
  const difficulty = body.difficulty || 'easy'
  const count = Math.max(1, Math.min(20, body.count || 6))
  const packId = `${subject}-${topic}-${difficulty}-${Date.now()}`

  const questions = Array.from({ length: count }).map((_, i) => ({
    id: `${topic}-${i + 1}`,
    prompt: `(${subject}) ${topic} Q${i + 1}: Choose the correct answer`,
    options: ['A', 'B', 'C', 'D'],
    answerIndex: 0,
    timeLimitSec: 20,
    topic,
    difficulty,
    explanation: 'Review syllabus section for details.'
  }))

  return { packId, subject, topic, difficulty, questions }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody
    const ajv = new Ajv({ strict: false })
    addFormats(ajv)
    ajv.addSchema(questionSchema, 'question')
    const validate = ajv.compile(packSchema as any)

    const pack = simpleGenerate(body)
    const valid = validate(pack)
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Validation failed', details: validate.errors }, { status: 400 })
    }

    // Try to persist to Supabase table `question_packs`
    let packId = pack.packId
    let packUrl: string | null = null
    try {
      const haveEnv = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (haveEnv) {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('question_packs')
          .insert({ id: packId, subject: pack.subject, topic: pack.topic, difficulty: pack.difficulty, content: pack })
          .select('id')
          .single()
        if (error) throw error
        packId = data.id
        packUrl = `/api/question-packs/${encodeURIComponent(packId)}`
      }
    } catch {
      // No DB available; return inline only
    }

    return NextResponse.json({ ok: true, packId, packUrl, pack })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
