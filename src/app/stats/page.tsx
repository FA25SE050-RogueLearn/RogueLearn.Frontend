export const dynamic = 'force-dynamic'

interface PlayerSummary {
  playerId: number
  totalQuestions: number
  correctAnswers: number
  averageTime: number
  topicBreakdown: Array<{
    topic: string
    correct: number
    total: number
  }>
}

interface PlayerAnswer {
  playerId: number
  chosenAnswer: number
  correct: boolean
  timeToAnswer: number
}

interface QuestionResult {
  questionId: number
  topic: string
  difficulty: string
  prompt: string
  correctAnswerIndex: number
  playerAnswers: PlayerAnswer[]
}

interface UnityMatch {
  matchId: string
  startUtc: string
  endUtc: string
  result: string
  scene: string
  totalPlayers: number
  questions: QuestionResult[]
  playerSummaries: PlayerSummary[]
}

export default async function StatsPage() {
  const origin = process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:3000'
  const url = `${origin}/api/quests/game/sessions/unity-matches?limit=10`

  let ok = false
  let data: { matches: UnityMatch[] } = { matches: [] }

  try {
    const res = await fetch(url, { cache: 'no-store' })
    ok = res.ok
    data = await res.json()
  } catch (e: any) {
    console.error('Failed to fetch stats:', e)
  }

  if (!ok || !data.matches || data.matches.length === 0) {
    return (
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700 }}>Your Game Stats</h1>
        <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          {!ok ? (
            <p>Failed to load match data. Make sure the backend is running and RESULTS_LOG_ROOT is configured.</p>
          ) : (
            <p>No matches found yet. Play a game to see your stats here!</p>
          )}
        </div>
      </div>
    )
  }

  const mostRecentMatch = data.matches[0]

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700 }}>Your Game Stats</h1>

      {/* Most Recent Match - Highlighted */}
      <div style={{
        marginBottom: 32,
        padding: 24,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: 16, fontSize: 24, fontWeight: 600 }}>Latest Match</h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Result</div>
            <div style={{ fontSize: 20, fontWeight: 600, textTransform: 'capitalize' }}>
              {mostRecentMatch.result === 'win' ? '🏆 Victory' : '💀 Defeat'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Players</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{mostRecentMatch.totalPlayers}</div>
          </div>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Questions</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{mostRecentMatch.questions.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Date</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {new Date(mostRecentMatch.endUtc).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Player Performance */}
      {mostRecentMatch.playerSummaries && mostRecentMatch.playerSummaries.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 16, fontSize: 24, fontWeight: 600 }}>Player Performance</h2>
          {mostRecentMatch.playerSummaries.map((player, idx) => {
            const accuracy = player.totalQuestions > 0
              ? Math.round((player.correctAnswers / player.totalQuestions) * 100)
              : 0

            return (
              <div
                key={player.playerId}
                style={{
                  marginBottom: 16,
                  padding: 20,
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600 }}>Player {player.playerId}</h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                    <span>Accuracy: <strong>{accuracy}%</strong></span>
                    <span>Score: <strong>{player.correctAnswers}/{player.totalQuestions}</strong></span>
                    <span>Avg Time: <strong>{player.averageTime.toFixed(1)}s</strong></span>
                  </div>
                </div>

                {/* Topic Breakdown */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#666' }}>
                    Topic Performance
                  </div>
                  {player.topicBreakdown.map((topic, i) => {
                    const topicAccuracy = topic.total > 0
                      ? Math.round((topic.correct / topic.total) * 100)
                      : 0

                    return (
                      <div key={`${player.playerId}-${topic.topic}-${i}`} style={{ marginBottom: 12 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                          fontSize: 14
                        }}>
                          <span style={{ fontWeight: 500 }}>{topic.topic}</span>
                          <span style={{ color: '#666' }}>
                            {topic.correct}/{topic.total} ({topicAccuracy}%)
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: 8,
                          background: '#f0f0f0',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${topicAccuracy}%`,
                            height: '100%',
                            background: topicAccuracy >= 70 ? '#4caf50' : topicAccuracy >= 50 ? '#ff9800' : '#f44336',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Questions Review - Focus on Wrong Answers for Exam Prep */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16, fontSize: 24, fontWeight: 600 }}>Questions Review</h2>
        <div style={{ marginBottom: 12, padding: 12, background: '#fff3cd', borderRadius: 6, fontSize: 14 }}>
          💡 Review the questions you got wrong to prepare better for your exam!
        </div>

        {mostRecentMatch.questions.map((q, idx) => {
          const playerAnswers = q.playerAnswers || []
          const anyWrong = playerAnswers.some(pa => !pa.correct)

          return (
            <div
              key={q.questionId}
              style={{
                marginBottom: 12,
                padding: 16,
                background: anyWrong ? '#ffebee' : '#e8f5e9',
                border: `2px solid ${anyWrong ? '#ef5350' : '#66bb6a'}`,
                borderRadius: 8
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    Question {idx + 1} • {q.topic} • {q.difficulty}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                    {q.prompt}
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: anyWrong ? '#f44336' : '#4caf50',
                  color: 'white'
                }}>
                  {anyWrong ? '❌ Wrong' : '✅ Correct'}
                </div>
              </div>

              {anyWrong && (
                <div style={{
                  marginTop: 8,
                  padding: 12,
                  background: 'white',
                  borderRadius: 6,
                  fontSize: 14
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    ✓ Correct Answer: Option {q.correctAnswerIndex + 1}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                    {playerAnswers.map((pa, i) => (
                      <div key={i}>
                        Player {pa.playerId}: Selected option {pa.chosenAnswer + 1}
                        {!pa.correct && ' (Incorrect)'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Match History */}
      {data.matches.length > 1 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 16, fontSize: 24, fontWeight: 600 }}>Recent Matches</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {data.matches.slice(1).map((match) => (
              <div
                key={match.matchId}
                style={{
                  padding: 16,
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                    {match.result === 'win' ? '🏆 Victory' : '💀 Defeat'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {new Date(match.endUtc).toLocaleString()} • {match.totalPlayers} players
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>
                  {match.questions.length} questions
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Tip */}
      <div style={{
        marginTop: 32,
        padding: 16,
        background: '#e3f2fd',
        borderRadius: 8,
        fontSize: 14,
        color: '#1976d2'
      }}>
        💡 <strong>Exam Prep Tip:</strong> Focus on reviewing the questions you got wrong and
        practice more on topics where your accuracy is below 70%.
      </div>
    </div>
  )
}
