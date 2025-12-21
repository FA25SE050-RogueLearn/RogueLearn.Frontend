export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Calendar, Swords, Users } from 'lucide-react'
import PracticeButton from './PracticeButton'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

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

const HERO_CARD_CLASS =
  'relative overflow-hidden rounded-[32px] border border-[#f5c16c]/25 bg-linear-to-br from-[#1c0906]/95 via-[#120605]/98 to-[#040101]'
const SECTION_CARD_CLASS =
  'relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-[#120806]/75'
const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?error=Please%20log%20in%20to%20view%20match%20stats.')
  }
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

  const apiBase =
    process.env.NEXT_PUBLIC_USER_API_URL ||
    process.env.USER_API_BASE ||
    origin

  const buildStatsUrl = (base: string, pathPrefix: string = '') => {
    const url = new URL(`${pathPrefix}/api/quests/game/sessions/unity-matches`.replace('//', '/'), base)
    url.searchParams.set('limit', '10')
    if (user) url.searchParams.set('userId', user.id)
    return url
  }

  let statsUrl = buildStatsUrl(apiBase)

  let ok = false
  let data: { matches: UnityMatch[] } = { matches: [] }
  let errorMessage = ''

  try {
    let res = await fetch(statsUrl.toString(), { cache: 'no-store', headers: authHeaders })

    if (res.status === 404 && !statsUrl.toString().includes('/user-service')) {
      statsUrl = buildStatsUrl(apiBase, '/user-service')
      res = await fetch(statsUrl.toString(), { cache: 'no-store', headers: authHeaders })
    }

    ok = res.ok
    if (ok) {
      data = await res.json()
    } else {
      const text = await res.text()
      errorMessage = `Status: ${res.status} - ${text.slice(0, 500)}`
    }
  } catch (e: any) {
    errorMessage = e?.message || String(e)
  }

  if (!ok || !data.matches || data.matches.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 pb-24">
          <Card className={HERO_CARD_CLASS}>
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.2),transparent_55%)]" />
            <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

            <CardHeader className="relative z-10 gap-4 border-b border-[#f5c16c]/15 pb-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d23187]/40 bg-[#d23187]/20">
                    <BarChart3 className="h-7 w-7 text-[#f5c16c]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]/70">Battle Records</p>
                    <CardTitle className="text-3xl text-white">Your Game Stats</CardTitle>
                    <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                      Review your latest match results, spot weak topics, and jump straight into focused practice.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button asChild variant="ghost" className="text-white/60 hover:bg-white/5 hover:text-[#f5c16c]">
                    <Link href="/dashboard">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-6">
              <Card className={cn(SECTION_CARD_CLASS, 'border-[#f5c16c]/15 bg-black/15')}>
                <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                <CardContent className="relative z-10 p-6">
                  {!ok ? (
                    <div className="space-y-4">
                      <p className="text-sm text-white/70">
                        Failed to load match data. Make sure the backend is running and `RESULTS_LOG_ROOT` is configured.
                      </p>
                      <details className="rounded-xl border border-white/10 bg-black/30 p-4">
                        <summary className="cursor-pointer text-sm font-semibold text-[#f5c16c]">Show debug details</summary>
                        <div className="mt-3 space-y-2 text-xs text-white/60">
                          <div>
                            <div className="font-semibold text-white/70">URL</div>
                            <div className="break-all font-mono">{statsUrl.toString()}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-white/70">Error</div>
                            <div className="break-words font-mono text-red-300">{errorMessage}</div>
                          </div>
                        </div>
                      </details>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-white/70">No matches found yet. Play a game to see your stats here.</p>
                      <Button asChild className="bg-[#f5c16c] text-[#1f120c] hover:bg-[#f5c16c]/90">
                        <Link href="/boss-fight">
                          <Swords className="h-4 w-4" />
                          Start a Boss Fight
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
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

  const endLocal = new Date(mostRecentMatch.endUtc)
  const lastUpdatedLabel = isNaN(endLocal.getTime()) ? 'Unknown' : endLocal.toLocaleString()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pb-24">
        <Card className={HERO_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.2),transparent_55%)]" />
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

          <CardHeader className="relative z-10 gap-4 border-b border-[#f5c16c]/15 pb-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d23187]/40 bg-[#d23187]/20">
                  <BarChart3 className="h-7 w-7 text-[#f5c16c]" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]/70">Battle Records</p>
                  <CardTitle className="text-3xl text-white">Your Game Stats</CardTitle>
                  <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                    Latest match summary, player performance, and question-level review.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                  <Calendar className="h-3.5 w-3.5 text-[#f5c16c]" />
                  {lastUpdatedLabel}
                </div>

                {xpTotal > 0 && (
                  <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    +{xpTotal} XP
                  </div>
                )}

                <Button asChild variant="ghost" className="text-white/60 hover:bg-white/5 hover:text-[#f5c16c]">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 pt-6">
            {quizCompleted && quizTotal > 0 && (
              <Card className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-r from-[#d23187]/35 via-[#4f46e5]/25 to-[#f5c16c]/25">
                <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                <CardContent className="relative z-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-white">
                      {quizScore / quizTotal >= 0.7 ? 'Great work on the review quiz!' : 'Keep sharpening those skills!'}
                    </p>
                    <p className="text-sm text-white/80">
                      Score: {quizScore}/{quizTotal} ({Math.round((quizScore / quizTotal) * 100)}%)
                    </p>
                  </div>
                  <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                    <Link href="/stats">Dismiss</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className={cn(SECTION_CARD_CLASS, 'lg:col-span-2')}>
                <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                <CardHeader className="relative z-10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/70">Latest match</p>
                      <CardTitle className="mt-2 text-2xl text-white">
                        Match {mostRecentMatch.matchId.slice(0, 6)}
                      </CardTitle>
                    </div>
                    <Badge
                      className={cn(
                        'border px-4 py-2 text-xs font-semibold uppercase tracking-wide',
                        mostRecentMatch.result === 'win'
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                          : 'border-red-400/30 bg-red-400/10 text-red-300'
                      )}
                    >
                      {mostRecentMatch.result === 'win' ? 'Victory' : 'Defeat'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#f5c16c]/70">
                        <Users className="h-3.5 w-3.5" />
                        Players
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-white">{mostRecentMatch.totalPlayers}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#f5c16c]/70">
                        <Swords className="h-3.5 w-3.5" />
                        Questions
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-white">{questionsCount}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-1 col-span-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#f5c16c]/70">
                        <Calendar className="h-3.5 w-3.5" />
                        Date
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-white">
                        {isNaN(endLocal.getTime()) ? 'Unknown' : endLocal.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {mostRecentMatch.xpRewards && mostRecentMatch.xpRewards.length > 0 && (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">XP Earned</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {mostRecentMatch.xpRewards.map((r, idx) => (
                          <div
                            key={`${r.skillId}-${idx}`}
                            className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-semibold text-white/80"
                          >
                            {r.skillName}: +{r.pointsAwarded} XP
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={cn(SECTION_CARD_CLASS, 'bg-linear-to-br from-[#2d1810]/70 via-[#120806]/80 to-black/85')}>
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,193,108,0.25),transparent_60%)]" />
                <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                <CardHeader className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/70">Weak topics</p>
                  <CardTitle className="mt-2 text-2xl text-white">Practice your misses</CardTitle>
                  <p className="mt-2 text-sm text-white/70">
                    Jump into a focused review quiz based on the topics you missed in the latest match.
                  </p>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  {weakTopics.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {weakTopics.slice(0, 6).map((t) => (
                          <Badge key={t.topic} className="border-[#f5c16c]/25 bg-[#f5c16c]/10 text-[#f5c16c]">
                            {t.topic}
                          </Badge>
                        ))}
                        {weakTopics.length > 6 && (
                          <Badge className="border-white/10 bg-white/5 text-white/70">+{weakTopics.length - 6} more</Badge>
                        )}
                      </div>
                      <Button asChild className="w-full bg-[#f5c16c] text-[#1f120c] hover:bg-[#f5c16c]/90">
                        <Link
                          href={`/review-quiz?matchId=${mostRecentMatch.matchId}&topics=${weakTopics.map(t => encodeURIComponent(t.topic)).join(',')}`}
                        >
                          Practice Weak Topics
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm text-white/70">
                      No weak topics detected in your latest match.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {mostRecentMatch.playerSummaries && mostRecentMatch.playerSummaries.length > 0 && (
              <Card className={cn(SECTION_CARD_CLASS, 'mt-6')}>
                <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                <CardHeader className="relative z-10">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <CardTitle className="text-2xl text-white">Player Performance</CardTitle>
                    <p className="text-sm text-white/60">Accuracy by player and topic</p>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  {mostRecentMatch.playerSummaries.map((player) => {
                    const accuracy = player.totalQuestions > 0
                      ? Math.round((player.correctAnswers / player.totalQuestions) * 100)
                      : 0

                    return (
                      <div key={player.playerId} className="rounded-3xl border border-white/10 bg-black/20 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f5c16c]/25 bg-[#f5c16c]/10 text-sm font-semibold text-[#f5c16c]">
                              P{player.playerId}
                            </div>
                            <div>
                              <p className="text-base font-semibold text-white">Player {player.playerId}</p>
                              <p className="text-sm text-white/60">
                                Accuracy {accuracy}% · Score {player.correctAnswers}/{player.totalQuestions} · Avg Time {player.averageTime.toFixed(1)}s
                              </p>
                            </div>
                          </div>

                          <Badge className="border-[#f5c16c]/25 bg-[#f5c16c]/10 text-[#f5c16c]">
                            {accuracy}%
                          </Badge>
                        </div>

                        <div className="mt-6 grid gap-4">
                          {player.topicBreakdown.map((topic, i) => {
                            const topicAccuracy = topic.total > 0
                              ? Math.round((topic.correct / topic.total) * 100)
                              : 0
                            return (
                              <div key={`${player.playerId}-${topic.topic}-${i}`} className="space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                  <p className="text-sm font-semibold text-white">{topic.topic}</p>
                                  <p className="text-xs text-white/60">
                                    {topic.correct}/{topic.total} ({topicAccuracy}%)
                                  </p>
                                </div>
                                <Progress
                                  value={topicAccuracy}
                                  className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#f5c16c] [&>div]:to-[#d4a855]"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            <Card className={cn(SECTION_CARD_CLASS, 'mt-6')}>
              <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white">Questions Review</CardTitle>
                    <p className="mt-2 text-sm text-white/60">
                      Replay the questions from this match and focus on your gaps.
                    </p>
                  </div>
                  {currentSummary && weakTopics.length > 0 && (
                    <PracticeButton matchId={mostRecentMatch.matchId} topics={weakTopics.map(t => t.topic)} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {mostRecentMatch.questions && mostRecentMatch.questions.length > 0 ? (
                  <div className="grid gap-4">
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
                          className={cn(
                            'rounded-3xl border p-6 transition-all duration-300',
                            gotRight
                              ? 'border-emerald-400/20 bg-emerald-400/5'
                              : 'border-red-400/20 bg-red-400/5'
                          )}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                              Question {i + 1} · {q.topic || 'Mixed'}
                            </p>
                            <Badge
                              className={cn(
                                'border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                                gotRight
                                  ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                                  : 'border-red-400/25 bg-red-400/10 text-red-300'
                              )}
                            >
                              {gotRight ? 'Correct' : 'Review'}
                            </Badge>
                          </div>

                          <p className="mt-4 text-base font-semibold text-white">{q.prompt}</p>
                          <p className="mt-3 text-sm text-white/60">
                            Correct answer: {String.fromCharCode(65 + correctIndex)}{correctText ? ` - ${correctText}` : ''}
                          </p>

                          {playerAnswer && (
                            <p className="mt-2 text-sm text-white/60">
                              Your answer: {String.fromCharCode(65 + (playerAnswer.chosenAnswer || 0))}{chosenText ? ` - ${chosenText}` : ''}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-sm text-white/60">
                    No detailed questions were captured for this match.
                  </div>
                )}
              </CardContent>
            </Card>

            {data.matches.length > 1 && (
              <Card className={cn(SECTION_CARD_CLASS, 'mt-6')}>
                <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl text-white">Recent Matches</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid gap-3">
                    {data.matches.slice(1).map((match) => {
                      const count = (match.questions && match.questions.length > 0)
                        ? match.questions.length
                        : ((match.playerSummaries && match.playerSummaries[0] && match.playerSummaries[0].topicBreakdown)
                          ? match.playerSummaries[0].topicBreakdown.length
                          : 0)
                      const end = new Date(match.endUtc)
                      return (
                        <div
                          key={match.matchId}
                          className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/20 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d23187]/40 hover:bg-black/30 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-white">
                              {match.result === 'win' ? 'Victory' : 'Defeat'}
                            </p>
                            <p className="text-sm text-white/60">
                              {isNaN(end.getTime()) ? 'Unknown date' : end.toLocaleString()} · {match.totalPlayers} players
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-white/80">{count} questions</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
