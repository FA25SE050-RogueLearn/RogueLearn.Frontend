export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import PracticeButton from './PracticeButton'

interface PlayerSummary {
  userId?: string
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
  questionPack?: {
    questions?: Array<{
      id?: string
      prompt?: string
      options?: string[]
      answerIndex?: number
      topic?: string
      difficulty?: string
      explanation?: string
    }>
  }
  xpRewards?: Array<{
    skillId: string
    skillName: string
    pointsAwarded: number
  }>
  xpTotal?: number
}

const theme = {
  bg: '#1f120c',
  panel: '#2b1a12',
  card: '#332018',
  accent: '#ffb347',
  accentSoft: '#ffd9a1',
  text: '#f7f0e9',
  muted: '#cbbfb3',
  success: '#4ade80',
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  const authHeaders: Record<string, string> = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {}

  const params = await searchParams
  const quizCompleted = params.quizCompleted === 'true'
  const quizScore = params.score ? parseInt(params.score as string) : 0
  const quizTotal = params.total ? parseInt(params.total as string) : 0

  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'localhost:3000'
  const defaultProto = host.includes('localhost') ? 'http' : 'https'
  const proto = hdrs.get('x-forwarded-proto') || defaultProto
  const origin = `${proto}://${host}`

  // Prefer explicit API base if provided; otherwise use the current origin (Next.js)
  const apiBase =
    process.env.NEXT_PUBLIC_USER_API_URL ||
    process.env.USER_API_BASE ||
    origin
  console.log(`[StatsPage] Using API base: ${apiBase}`)

  const buildStatsUrl = (base: string, pathPrefix: string = '') => {
    // Ensure base doesn't end with slash and path doesn't start with slash to avoid double slashes if we were concatenating strings,
    // but URL constructor handles this well. 
    // However, if we want to inject /user-service, we need to be careful.

    const url = new URL(`${pathPrefix}/api/quests/game/sessions/unity-matches`.replace('//', '/'), base)
    url.searchParams.set('limit', '10')
    if (user) url.searchParams.set('userId', user.id)
    return url
  }

  let statsUrl = buildStatsUrl(apiBase)
  console.log(`[StatsPage] Fetching stats from: ${statsUrl.toString()}`)

  let ok = false
  let data: { matches: UnityMatch[] } = { matches: [] }
  let errorMessage = ''

  try {
    let res = await fetch(statsUrl.toString(), { cache: 'no-store', headers: authHeaders })
    console.log(`[StatsPage] Fetch status: ${res.status}`)

    // Fallback: If 404 and we haven't tried user-service prefix yet, try it.
    if (res.status === 404 && !statsUrl.toString().includes('/user-service')) {
      console.log('[StatsPage] 404 received. Retrying with /user-service prefix...')
      statsUrl = buildStatsUrl(apiBase, '/user-service')
      console.log(`[StatsPage] Retry URL: ${statsUrl.toString()}`)
      res = await fetch(statsUrl.toString(), { cache: 'no-store', headers: authHeaders })
      console.log(`[StatsPage] Retry status: ${res.status}`)
    }

    ok = res.ok
    if (ok) {
      data = await res.json()
      console.log(`[StatsPage] Fetched ${data.matches?.length || 0} matches`)
    } else {
      const text = await res.text()
      errorMessage = `Status: ${res.status} - ${text.slice(0, 500)}`
      console.error(`[StatsPage] Fetch failed: ${errorMessage}`)
    }
  } catch (e: any) {
    errorMessage = e?.message || String(e)
    console.error('[StatsPage] Exception fetching stats:', e)
  }

  if (!ok || !data.matches || data.matches.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.bg,
        color: theme.text,
        padding: '40px 20px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ marginBottom: 16, fontSize: 32, fontWeight: 800 }}>Your Game Stats</h1>
          <div style={{
            padding: 16,
            borderRadius: 12,
            background: theme.card,
            border: '1px solid rgba(255,255,255,0.08)',
            color: theme.muted
          }}>
            {!ok ? (
              <div>
                <p>Failed to load match data. Make sure the backend is running and RESULTS_LOG_ROOT is configured.</p>
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, fontFamily: 'monospace', fontSize: 13, color: '#f87171' }}>
                  <strong>Debug Info:</strong><br />
                  URL: {statsUrl.toString()}<br />
                  Error: {errorMessage}
                </div>
              </div>
            ) : (
              <p>No matches found yet. Play a game to see your stats here!</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const mostRecentMatch = data.matches[0]
  const currentSummary = (mostRecentMatch.playerSummaries || []).find(s =>
    user?.id && s.userId && s.userId.toLowerCase() === user.id.toLowerCase()
  ) || mostRecentMatch.playerSummaries?.[0]
  const topics = currentSummary?.topicBreakdown || []
  const weakTopics = topics.filter(t => t.correct < t.total)
  const questionsCount = (mostRecentMatch.questions && mostRecentMatch.questions.length > 0)
    ? mostRecentMatch.questions.length
    : topics.length
  const xpTotal = mostRecentMatch.xpTotal ?? mostRecentMatch.xpRewards?.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0) ?? 0

  const getDigits = (val?: string) => {
    if (!val) return ''
    const m = val.match(/\d+/g)
    return m ? m.join('') : ''
  }

  const findPackQuestion = (q: QuestionResult) => {
    const packQuestions = mostRecentMatch.questionPack?.questions || []
    const byPrompt = packQuestions.find(pq => pq?.prompt && q.prompt && pq.prompt === q.prompt)
    if (byPrompt) return byPrompt
    const byId = packQuestions.find(pq => {
      const digits = getDigits(pq?.id)
      return digits && q.questionId != null && digits === String(q.questionId)
    })
    return byId
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 13, color: theme.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Overview</div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>Your Game Stats</h1>
          </div>
          <div style={{
            padding: '10px 14px',
            background: theme.card,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            color: theme.muted,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span>Last updated: {new Date(mostRecentMatch.endUtc).toLocaleString()}</span>
            {xpTotal > 0 && (
              <span style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: '#14351d',
                color: '#7ef29d',
                border: '1px solid rgba(126,242,157,0.25)',
                fontWeight: 700
              }}>
                +{xpTotal} XP
              </span>
            )}
          </div>
        </header>

        {quizCompleted && (
          <div style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(120deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fdfdfd'
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                {quizScore / quizTotal >= 0.7 ? 'Great work on the review quiz!' : 'Keep sharpening those skills!'}
              </div>
              <div style={{ fontSize: 14 }}>
                Score: {quizScore}/{quizTotal} ({Math.round((quizScore / quizTotal) * 100)}%)
              </div>
            </div>
            <a
              href="/stats"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.14)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              Dismiss
            </a>
          </div>
        )}

        <section style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
          marginBottom: 20,
          alignItems: 'stretch'
        }}>
          <div style={{
            borderRadius: 14,
            padding: 20,
            background: theme.card,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Latest Match</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Match {mostRecentMatch.matchId.slice(0, 6)}</div>
              </div>
              <div style={{
                padding: '6px 12px',
                borderRadius: 999,
                background: mostRecentMatch.result === 'win' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                color: mostRecentMatch.result === 'win' ? '#4ade80' : '#f87171',
                fontWeight: 700,
                fontSize: 13,
                border: `1px solid ${mostRecentMatch.result === 'win' ? 'rgba(74, 222, 128, 0.35)' : 'rgba(248, 113, 113, 0.35)'}`
              }}>
                {mostRecentMatch.result === 'win' ? 'Victory' : 'Defeat'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
              {[
                { label: 'Players', value: mostRecentMatch.totalPlayers },
                { label: 'Questions', value: questionsCount },
                { label: 'Date', value: new Date(mostRecentMatch.endUtc).toLocaleDateString() },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: 12,
                  borderRadius: 10,
                  background: theme.panel,
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: theme.muted
                }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>{item.value}</div>
                </div>
              ))}
            </div>

            {mostRecentMatch.xpRewards && mostRecentMatch.xpRewards.length > 0 && (
              <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: 'rgba(20,53,29,0.55)', border: '1px solid rgba(126,242,157,0.25)' }}>
                <div style={{ color: '#7ef29d', fontWeight: 700, marginBottom: 6 }}>XP Earned</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {mostRecentMatch.xpRewards.map((r, idx) => (
                    <div key={`${r.skillId}-${idx}`} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e6fff0', fontSize: 12 }}>
                      {r.skillName}: +{r.pointsAwarded} XP
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{
            borderRadius: 14,
            padding: 18,
            background: 'linear-gradient(160deg, rgba(255,179,71,0.18), rgba(255,255,255,0.05))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: 13, color: theme.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Weak Topics</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 10 }}>
              Practice the topics you missed
            </div>
            <p style={{ fontSize: 14, color: theme.muted, marginBottom: 14 }}>
              Jump back into a focused review quiz based on your misses from the latest match.
            </p>
            <a
              href={`/review-quiz?matchId=${mostRecentMatch.matchId}&topics=${weakTopics.map(t => encodeURIComponent(t.topic)).join(',')}`}
              style={{
                display: 'inline-block',
                padding: '12px 14px',
                borderRadius: 10,
                background: theme.accent,
                color: '#1f120c',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
              }}
            >
              Practice Weak Topics
            </a>
          </div>
        </section>

        {mostRecentMatch.playerSummaries && mostRecentMatch.playerSummaries.length > 0 && (
          <section style={{
            marginBottom: 20,
            borderRadius: 14,
            padding: 20,
            background: theme.card,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 10px 26px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Player Performance</h2>
              <div style={{ fontSize: 13, color: theme.muted }}>Match breakdown by player and topic</div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {mostRecentMatch.playerSummaries.map((player) => {
                const accuracy = player.totalQuestions > 0
                  ? Math.round((player.correctAnswers / player.totalQuestions) * 100)
                  : 0

                return (
                  <div key={player.playerId} style={{
                    borderRadius: 10,
                    padding: 16,
                    background: theme.panel,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: 'rgba(255,255,255,0.06)',
                          display: 'grid', placeItems: 'center',
                          fontWeight: 700
                        }}>
                          P{player.playerId}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>Player {player.playerId}</div>
                          <div style={{ fontSize: 12, color: theme.muted }}>Accuracy {accuracy}% · Score {player.correctAnswers}/{player.totalQuestions} · Avg Time {player.averageTime.toFixed(1)}s</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 10 }}>
                      {player.topicBreakdown.map((topic, i) => {
                        const topicAccuracy = topic.total > 0
                          ? Math.round((topic.correct / topic.total) * 100)
                          : 0
                        return (
                          <div key={`${player.playerId}-${topic.topic}-${i}`} style={{ display: 'grid', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 600, color: theme.text }}>{topic.topic}</div>
                              <div style={{ fontSize: 12, color: theme.muted }}>{topic.correct}/{topic.total} ({topicAccuracy}%)</div>
                            </div>
                            <div style={{
                              width: '100%',
                              height: 8,
                              borderRadius: 999,
                              background: 'rgba(255,255,255,0.08)',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${topicAccuracy}%`,
                                height: '100%',
                                background: theme.accent
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
          </section>
        )}

        <section style={{
          borderRadius: 14,
          padding: 20,
          background: theme.card,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 24px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Questions Review</h2>
              <p style={{ margin: 0, fontSize: 13, color: theme.muted }}>Replay the questions from this match and focus on your gaps.</p>
            </div>
            {currentSummary && weakTopics.length > 0 && (
              <PracticeButton
                matchId={mostRecentMatch.matchId}
                topics={weakTopics.map(t => t.topic)}
              />
            )}
          </div>

          {mostRecentMatch.questions && mostRecentMatch.questions.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {mostRecentMatch.questions.map((q, i) => {
                const playerAnswer = q.playerAnswers?.find(pa => pa.playerId === currentSummary?.playerId)
                const gotRight = playerAnswer?.correct
                const packQ = findPackQuestion(q)
                const options = Array.isArray(packQ?.options) ? packQ?.options : null
                const correctIndex = (typeof packQ?.answerIndex === 'number') ? packQ.answerIndex : (q.correctAnswerIndex || 0)
                const correctText = options && options[correctIndex] ? options[correctIndex] : null
                const chosenText = options && playerAnswer && options[playerAnswer.chosenAnswer] ? options[playerAnswer.chosenAnswer] : null
                return (
                  <div
                    key={q.questionId || i}
                    style={{
                      borderRadius: 10,
                      padding: 14,
                      background: gotRight ? 'rgba(74, 222, 128, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${gotRight ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`
                    }}
                  >
                    <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>
                      Question {i + 1} • {q.topic || 'Mixed'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: theme.text }}>
                      {q.prompt}
                    </div>
                    <div style={{ fontSize: 13, color: theme.muted, marginBottom: 10 }}>
                      Correct answer: {String.fromCharCode(65 + correctIndex)}{correctText ? ` - ${correctText}` : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        background: gotRight ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
                        color: gotRight ? '#4ade80' : '#ef4444',
                        fontWeight: 700,
                        fontSize: 12
                      }}>
                        {gotRight ? 'Correct' : 'Review'}
                      </span>
                      {playerAnswer && (
                        <span style={{ fontSize: 12, color: theme.muted }}>
                          Your answer: {String.fromCharCode(65 + (playerAnswer.chosenAnswer || 0))}{chosenText ? ` - ${chosenText}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{
              padding: 16,
              borderRadius: 10,
              border: '1px dashed rgba(255,255,255,0.15)',
              color: theme.muted,
              background: 'rgba(255,255,255,0.03)'
            }}>
              No detailed questions were captured for this match.
            </div>
          )}
        </section>

        {data.matches.length > 1 && (
          <section style={{ marginTop: 20 }}>
            <h2 style={{ marginBottom: 12, fontSize: 20, fontWeight: 800, color: theme.text }}>Recent Matches</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.matches.slice(1).map((match) => (
                <div
                  key={match.matchId}
                  style={{
                    padding: 14,
                    background: theme.card,
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 8px 18px rgba(0,0,0,0.18)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: theme.text }}>
                      {match.result === 'win' ? 'Victory' : 'Defeat'}
                    </div>
                    <div style={{ fontSize: 12, color: theme.muted }}>
                      {new Date(match.endUtc).toLocaleString()} • {match.totalPlayers} players
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: theme.text }}>
                    {(match.questions && match.questions.length > 0)
                      ? match.questions.length
                      : ((match.playerSummaries && match.playerSummaries[0] && match.playerSummaries[0].topicBreakdown)
                        ? match.playerSummaries[0].topicBreakdown.length
                        : 0)} questions
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
