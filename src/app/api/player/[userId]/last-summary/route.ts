import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    if (!userId) return NextResponse.json({ ok: false, error: 'Missing userId' }, { status: 400 })
    const rawBase = process.env.USER_API_BASE || process.env.NEXT_PUBLIC_USER_API_URL || ''
    const base = String(rawBase).replace(/\/+$/, '')
    if (!base) return NextResponse.json({ ok: false, error: 'USER_API_BASE not configured' }, { status: 500 })
    if (process.env.INSECURE_TLS === '1') { try { (process.env as any).NODE_TLS_REJECT_UNAUTHORIZED = '0' } catch {} }
    const url = `${base}/api/player/${userId}/last-summary`
    const res = await fetch(url, { cache: 'no-store' })
    const txt = await res.text()
    const ct = res.headers.get('content-type') || ''
    if (!res.ok) return NextResponse.json({ ok: false, status: res.status, error: txt }, { status: res.status })
    if (ct.includes('application/json')) return new NextResponse(txt, { status: 200, headers: { 'content-type': 'application/json' } })
    return new NextResponse(txt, { status: 200, headers: { 'content-type': ct || 'text/plain' } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
