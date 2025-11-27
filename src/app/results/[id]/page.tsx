import React from 'react'

export const dynamic = 'force-dynamic'
export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${origin}/api/quests/game/sessions/${id}/result`
  const playersUrl = `${origin}/api/quests/game/sessions/${id}/players`

  let ok = false
  let data: any = null
  let players: Array<{ user_id: string; summary: { topics: Array<{ topic: string; total: number; correct: number }> } }> = []
  try {
    const res = await fetch(url, { cache: 'no-store' })
    ok = res.ok
    if (res.headers.get('content-type')?.includes('application/json')) {
      data = await res.json()
    } else {
      const t = await res.text()
      data = { error: t }
    }
  } catch (e: any) {
    data = { error: e?.message ?? String(e) }
  }

  try {
    const res2 = await fetch(playersUrl, { cache: 'no-store' })
    if (res2.ok) players = await res2.json()
  } catch {}

  if (!ok || !data) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Match Result</h1>
        <div>Failed to load result</div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{JSON.stringify(data)}</div>
      </div>
    )
  }

  const topics: Array<{ topic: string; total: number; correct: number }> = data?.summary?.topics ?? []

  return (
    <div style={{ padding: 16 }}>
      <h1>Match Result</h1>
      <div style={{ marginBottom: 8 }}>Result: {String(data?.result ?? '')}</div>
      <div style={{ marginBottom: 8 }}>Timestamp: {String(data?.timestamp ?? '')}</div>
      <div>
        <strong>Topic Summary</strong>
        <div style={{ marginTop: 8 }}>
          {topics.length === 0 && <div>No topics</div>}
          {topics.map((t, i) => (
            <div key={`${t.topic}-${i}`} style={{ display: 'flex', gap: 12, padding: '4px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ flex: 2 }}>{t.topic}</div>
              <div style={{ flex: 1 }}>Total: {t.total}</div>
              <div style={{ flex: 1 }}>Correct: {t.correct}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Per-Player Performance</strong>
        <div style={{ marginTop: 8 }}>
          {(!players || players.length === 0) && <div>No per-player summaries</div>}
          {players && players.map((p, idx) => (
            <div key={`${p.user_id}-${idx}`} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6, marginBottom: 12 }}>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Player: {p.user_id}</div>
              {p.summary?.topics?.map((t, i) => {
                const pct = (t.total > 0) ? Math.round((t.correct / t.total) * 100) : 0
                return (
                  <div key={`${p.user_id}-${t.topic}-${i}`} style={{ margin: '4px 0' }}>
                    <div style={{ fontSize: 12, marginBottom: 2 }}>{t.topic} ({t.correct}/{t.total})</div>
                    <div style={{ background: '#eee', height: 10, borderRadius: 4 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 70 ? '#4caf50' : pct >= 40 ? '#ff9800' : '#f44336', borderRadius: 4 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
