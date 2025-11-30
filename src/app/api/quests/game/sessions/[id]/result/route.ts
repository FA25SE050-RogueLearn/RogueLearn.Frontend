import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing session id' }, { status: 400 })
    }

    const rawBase = process.env.USER_API_BASE || process.env.NEXT_PUBLIC_USER_API_URL || ''
    const base = String(rawBase).replace(/\/+$/, '')
    if (!base) {
      return NextResponse.json({ ok: false, error: 'USER_API_BASE not configured' }, { status: 500 })
    }

    // Allow insecure TLS in dev if requested
    if (process.env.INSECURE_TLS === '1') {
      try { (process.env as any).NODE_TLS_REJECT_UNAUTHORIZED = '0' } catch { /* ignore */ }
    }

    const url = `${base}/api/quests/game/sessions/${id}/result`
    const res = await fetch(url, { cache: 'no-store' })
    const contentType = res.headers.get('content-type') || ''
    const text = await res.text()

    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, error: text }, { status: res.status })
    }

    if (contentType.includes('application/json')) {
      try {
        const json = JSON.parse(text)
        return NextResponse.json(json, { status: 200 })
      } catch {
        return NextResponse.json({ ok: false, error: 'Invalid JSON from backend', body: text }, { status: 502 })
      }
    }

    return new NextResponse(text, { status: 200, headers: { 'content-type': contentType || 'text/plain' } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
