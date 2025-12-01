// Orchestrates a solo practice session by starting a headless host, generating a personalized pack,
// and creating a session bound to the Relay join code.
import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, subjectCode, topic, difficulty, count } = body || {}

    const origin = new URL(req.url).origin

    // 1) Generate personalized pack
    const genRes = await fetch(`${origin}/api/ai/question-packs/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subjectCode, topic, difficulty, count })
    })
    let gen: any = null
    try { gen = await genRes.json() } catch { }
    if (!genRes.ok || !gen?.ok) {
      const text = gen && gen.error ? gen.error : await genRes.text()
      return NextResponse.json({ ok: false, step: 'generate', status: genRes.status, error: text }, { status: 500 })
    }

    // 2) Start headless host and get a join code
    const hostRes = await fetch(`${origin}/api/game/host`, { method: 'POST' })
    let host: any = null
    try { host = await hostRes.json() } catch { }
    if (!hostRes.ok || !host?.ok || !host?.joinCode) {
      const text = host && host.error ? host.error : await hostRes.text()
      return NextResponse.json({ ok: false, step: 'host', status: hostRes.status, error: text }, { status: 500 })
    }

    const joinCode = host.joinCode

    // 3) Create a session with the personalized pack
    const rawBase = process.env.USER_API_BASE || process.env.NEXT_PUBLIC_API_URL || ''
    const base = (rawBase || '').replace(/\/+$/, '')
    const url = `${base}/api/quests/game/sessions/create`
    const payload = {
      relay_join_code: String(joinCode),
      pack_spec: { subject: subjectCode, topic, difficulty, count }
    }
    const createRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    let create: any = null
    try { create = await createRes.json() } catch { }
    if (!createRes.ok) {
      const text = create ? JSON.stringify(create) : await createRes.text()
      return NextResponse.json({ ok: false, step: 'create', status: createRes.status, error: text, url }, { status: 500 })
    }

    return NextResponse.json({ ok: true, joinCode, match_id: create?.match_id ?? null })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
