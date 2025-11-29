export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import PracticeButton from './PracticeButton'

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

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get query params for quiz completion
  const params = await searchParams
  const quizCompleted = params.quizCompleted === 'true'
  const quizScore = params.score ? parseInt(params.score as string) : 0
  const quizTotal = params.total ? parseInt(params.total as string) : 0

  // Build an absolute same-origin URL to satisfy Node fetch
  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'localhost:3000'
  const defaultProto = host.includes('localhost') ? 'http' : 'https'
  const proto = hdrs.get('x-forwarded-proto') || defaultProto
  const origin = `${proto}://${host}`

  const statsUrl = new URL('/api/quests/game/sessions/unity-matches', origin)
  statsUrl.searchParams.set('limit', '10')
  if (user) statsUrl.searchParams.set('userId', user.id)

  let ok = false
  let data: { matches: UnityMatch[] } = { matches: [] }

  try {
    const res = await fetch(statsUrl.toString(), { cache: 'no-store' })
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
  const firstSummary = mostRecentMatch.playerSummaries?.[0]
  const topics = firstSummary?.topicBreakdown || []
  const questionsCount = (mostRecentMatch.questions && mostRecentMatch.questions.length > 0)
    ? mostRecentMatch.questions.length
    : topics.length

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700 }}>Your Game Stats</h1>

      {/* Quiz Completion Banner */}
      {quizCompleted && (
        <div style={{
          marginBottom: 24,
          padding: 20,
          background: quizScore / quizTotal >= 0.7 ? '#4caf50' : '#ff9800',
          color: 'white',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              {quizScore / quizTotal >= 0.7 ? '🎉 Great Job!' : '💪 Keep Practicing!'}
            </div>
            <div style={{ fontSize: 16 }}>
              You scored {quizScore}/{quizTotal} ({Math.round((quizScore / quizTotal) * 100)}%) on the review quiz
            </div>
          </div>
          <a
            href="/stats"
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Dismiss
          </a>
        </div>
      )}

      {/* Most Recent Match - Highlighted */}
      <div style={{
        marginBottom: 32,
        padding: 24,
        background: 'white',
        borderRadius: 12,
        color: '#111',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px rgba(0,0,0,0.06)'
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
            <div style={{ fontSize: 20, fontWeight: 600 }}>{questionsCount}</div>
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
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>Questions Review</h2>
          {firstSummary && firstSummary.correctAnswers < firstSummary.totalQuestions && (
            <PracticeButton
              matchId={mostRecentMatch.matchId}
              topics={topics.filter(t => t.correct < t.total).map(t => t.topic)}
            />
          )}
        </div>
        <div style={{
          marginBottom: 12,
          padding: 12,
          background: '#fef3c7',
          borderRadius: 8,
          fontSize: 14,
          color: '#1f2937',
          border: '1px solid #f59e0b'
        }}>
          <span style={{ fontWeight: 600, color: '#92400e' }}>Tip:</span> Review the questions you got wrong to prepare better for your exam.
        </div>

        {topics.flatMap((t, topicIdx) =>
          Array.from({ length: t.total }).map((_, qIdx) => {
            // Always use topicBreakdown data as it's accurate
            // First t.correct questions were answered correctly, rest were wrong
            const isCorrect = qIdx < t.correct

            return {
              questionId: topicIdx * 100 + qIdx + 1,
              topic: t.topic,
              difficulty: '',
              prompt: `${t.topic} - Question ${qIdx + 1}`,
              correctAnswerIndex: 0,
              playerAnswers: [{
                playerId: 1,
                chosenAnswer: isCorrect ? 0 : 1,
                correct: isCorrect,
                timeToAnswer: 0
              }]
            }
          })
        ).map((q, idx) => {
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
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#111' }}>
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
                  <div style={{ fontSize: 12, color: '#374151' }}>
                    {new Date(match.endUtc).toLocaleString()} • {match.totalPlayers} players
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#374151' }}>
                  {(match.questions && match.questions.length > 0)
                    ? match.questions.length
                    : ((match.playerSummaries && match.playerSummaries[0] && match.playerSummaries[0].topicBreakdown)
                      ? match.playerSummaries[0].topicBreakdown.length
                      : 0)} questions
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
