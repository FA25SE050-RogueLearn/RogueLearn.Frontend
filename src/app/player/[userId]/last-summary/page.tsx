export const dynamic = 'force-dynamic'
export default async function PlayerLastSummaryPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${origin}/api/player/${userId}/last-summary`
  let ok = false
  let data: any = null
  try {
    const res = await fetch(url, { cache: 'no-store' })
    ok = res.ok
    data = await res.json()
  } catch (e: any) {
    data = { error: e?.message ?? String(e) }
  }
  if (!ok || !data) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Player Last Summary</h1>
        <div>Failed to load</div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{JSON.stringify(data)}</div>
      </div>
    )
  }
  const topics: Array<{ topic: string; total: number; correct: number }> = data?.topics ?? []
  return (
    <div style={{ padding: 16 }}>
      <h1>Player Last Summary</h1>
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
  )
}
