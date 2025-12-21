'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ChevronRight, Flame, Loader2, XCircle } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  topic: string
  difficulty: string
  explanation?: string
}

const HERO_CARD_CLASS =
  'relative overflow-hidden rounded-[32px] border border-[#f5c16c]/25 bg-linear-to-br from-[#1c0906]/95 via-[#120605]/98 to-[#040101]'
const SECTION_CARD_CLASS =
  'relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-[#120806]/75'
const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
}

const getDigits = (val?: string) => {
  if (!val) return ''
  const m = val.match(/\d+/g)
  return m ? m.join('') : ''
}

function ReviewQuizContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const topicsParam = searchParams.get('topics') || ''
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>('')

  useEffect(() => {
    async function loadQuestions() {
      const matchId = searchParams.get('matchId')
      const topics = topicsParam.split(',').filter(t => t.trim())

      if (!matchId || topics.length === 0) {
        setQuestions([])
        setLoadError('Missing match ID or topics to review.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/quests/game/sessions/unity-matches?limit=50`)

        if (!response.ok) {
          throw new Error('Failed to fetch match data')
        }

        const data = await response.json()
        const matches = data.matches || []
        const match = matches.find((m: any) => m.matchId === matchId)

        if (!match) {
          throw new Error('Match not found')
        }

        let questionPack = null
        try {
          const supabase = createClient()
          const { data: matchRow, error } = await supabase
            .from('match_results')
            .select('match_data, match_id, id')
            .or(`match_id.eq.${matchId},id.eq.${matchId}`)
            .maybeSingle()

          if (error) {
            setLoadError(error.message || 'Failed to load match data from storage.')
          }

          if (matchRow?.match_data) {
            const parsedData = typeof matchRow.match_data === 'string'
              ? JSON.parse(matchRow.match_data)
              : matchRow.match_data

            questionPack = parsedData?.questionPack || { questions: parsedData?.questions }
          }
        } catch (err) {
          setLoadError(err instanceof Error ? err.message : String(err))
        }

        const supabase = createClient()
        const { data: auth } = await supabase.auth.getUser()
        const authedUserId = auth?.user?.id || ''

        const selectedTopics = topics.map(t => t.toLowerCase())
        const topicSelected = (topic?: string) => {
          if (selectedTopics.length === 0) return true
          const lower = (topic || '').toLowerCase()
          return selectedTopics.some(t => lower.includes(t) || t.includes(lower))
        }

        const matchQuestionResults = match.questions || []

        const attemptsByPrompt = new Map<string, { attempts: number, correct: number, topic?: string, difficulty?: string }>()
        for (const m of matches) {
          const summaries = m.playerSummaries || []
          const summary = summaries.find((s: any) =>
            authedUserId && s.userId && String(s.userId).toLowerCase() === authedUserId.toLowerCase()
          ) || summaries[0]
          const pid = summary?.playerId
          if (pid == null) continue

          const qs = m.questions || []
          for (const qr of qs) {
            if (!qr?.prompt) continue
            const pa = qr.playerAnswers?.find((a: any) => a.playerId === pid)
            if (!pa) continue

            const key = String(qr.prompt)
            const existing = attemptsByPrompt.get(key) || { attempts: 0, correct: 0, topic: qr.topic, difficulty: qr.difficulty }
            existing.attempts += 1
            if (pa.correct) existing.correct += 1
            attemptsByPrompt.set(key, existing)
          }
        }

        const packQuestions = match.questionPack?.questions || questionPack?.questions || []
        const findPackQuestion = (qr: any) => {
          const byPrompt = packQuestions.find((pq: any) => pq?.prompt && qr?.prompt && pq.prompt === qr.prompt)
          if (byPrompt) return byPrompt
          const byId = packQuestions.find((pq: any) => {
            const digits = getDigits(pq?.id)
            return digits && qr?.questionId != null && digits === String(qr.questionId)
          })
          return byId
        }

        const quizQuestions = (packQuestions || [])
          .map((pq: any, idx: number) => {
            const prompt = pq?.prompt
            if (!prompt) return null

            const stats = attemptsByPrompt.get(String(prompt))
            if (!stats || stats.attempts <= 0) return null
            if (stats.correct >= stats.attempts) return null

            const topic = pq?.topic || stats.topic || 'mixed'
            if (!topicSelected(topic)) return null

            const options = Array.isArray(pq?.options) ? pq.options : []
            const hasRealOptions = options.length > 1 && options.some((opt: any) => String(opt || '').trim().length > 1)
            if (!hasRealOptions) return null

            const matchQr = matchQuestionResults.find((qr: any) => qr?.prompt && String(qr.prompt) === String(prompt))
            const answerIndex = (typeof pq?.answerIndex === 'number')
              ? pq.answerIndex
              : (matchQr?.correctAnswerIndex ?? 0)

            return {
              id: String(getDigits(pq?.id) || idx),
              prompt: String(prompt),
              options,
              answerIndex,
              topic,
              difficulty: pq?.difficulty || stats.difficulty || 'mixed',
              explanation: pq?.explanation
            } as QuizQuestion
          })
          .filter(Boolean) as QuizQuestion[]

        setQuestions(quizQuestions)
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : String(error))
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [topicsParam, searchParams])

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const isCorrect = answerIndex === questions[currentIndex].answerIndex
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      router.push(`/stats?quizCompleted=true&score=${score.correct}&total=${score.total}`)
    }
  }

  const matchId = searchParams.get('matchId') || ''
  const selectedTopics = topicsParam.split(',').map(t => t.trim()).filter(Boolean)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center gap-3 py-24">
          <Loader2 className="h-7 w-7 animate-spin text-[#f5c16c]" />
          <span className="text-white/70">Loading your review quiz...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-4xl space-y-6 pb-24">
          <Card className={HERO_CARD_CLASS}>
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.2),transparent_55%)]" />
            <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

            <CardHeader className="relative z-10 gap-4 border-b border-[#f5c16c]/15 pb-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]/70">Review Quiz</p>
                  <CardTitle className="text-3xl text-white">No Questions to Review</CardTitle>
                  <p className="text-sm leading-relaxed text-white/70">
                    {loadError || 'Great job! You either got all questions correct, or there are no questions available for review in the selected topics.'}
                  </p>
                </div>
                <Button asChild variant="ghost" className="text-white/60 hover:bg-white/5 hover:text-[#f5c16c]">
                  <Link href="/stats">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Stats
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-6">
              {selectedTopics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTopics.slice(0, 8).map((t) => (
                    <Badge key={t} className="border-[#f5c16c]/25 bg-[#f5c16c]/10 text-[#f5c16c]">
                      {t}
                    </Badge>
                  ))}
                  {selectedTopics.length > 8 && (
                    <Badge className="border-white/10 bg-white/5 text-white/70">+{selectedTopics.length - 8} more</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6 pb-24">
        <Card className={HERO_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.2),transparent_55%)]" />
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

          <CardHeader className="relative z-10 gap-4 border-b border-[#f5c16c]/15 pb-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]/70">Review Quiz</p>
                <CardTitle className="text-3xl text-white">Practice Your Weak Topics</CardTitle>
                <p className="text-sm leading-relaxed text-white/70">
                  Question {currentIndex + 1} of {questions.length}
                  {matchId ? ` · Match ${matchId.slice(0, 6)}` : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {selectedTopics.length > 0 && (
                  <Badge className="border-[#f5c16c]/25 bg-[#f5c16c]/10 text-[#f5c16c]">
                    {selectedTopics.length} topics
                  </Badge>
                )}
                <Button asChild variant="ghost" className="text-white/60 hover:bg-white/5 hover:text-[#f5c16c]">
                  <Link href="/stats">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Stats
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-6 pt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Progress</p>
              <p className="text-xs font-semibold text-white/70">{Math.round(progress)}%</p>
            </div>
            <Progress value={progress} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#f5c16c] [&>div]:to-[#d4a855]" />
          </CardContent>
        </Card>

        <Card className={SECTION_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
          <CardHeader className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-white/10 bg-white/5 text-white/70">{currentQuestion.topic}</Badge>
                <Badge className="border-white/10 bg-white/5 text-white/70">{currentQuestion.difficulty}</Badge>
              </div>
              {showResult && (
                <Badge
                  className={cn(
                    'border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                    selectedAnswer === currentQuestion.answerIndex
                      ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                      : 'border-red-400/25 bg-red-400/10 text-red-300'
                  )}
                >
                  {selectedAnswer === currentQuestion.answerIndex ? 'Correct' : 'Incorrect'}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-6">
            <p className="text-lg font-semibold leading-relaxed text-white">{currentQuestion.prompt}</p>

            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.answerIndex
                const showCorrect = showResult && isCorrect
                const showWrong = showResult && isSelected && !isCorrect

                return (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                    className={cn(
                      'h-auto w-full justify-between rounded-3xl border px-5 py-4 text-left text-sm leading-relaxed transition-all duration-300 whitespace-normal',
                      'hover:-translate-y-0.5',
                      showCorrect && 'border-emerald-400/35 bg-emerald-400/10 text-white hover:bg-emerald-400/10',
                      showWrong && 'border-red-400/35 bg-red-400/10 text-white hover:bg-red-400/10',
                      !showResult && isSelected && 'border-[#f5c16c]/45 bg-[#f5c16c]/10 text-white',
                      !showCorrect && !showWrong && !(isSelected && !showResult) && 'border-white/10 bg-black/20 text-white/80 hover:border-[#d23187]/40 hover:bg-black/30'
                    )}
                  >
                    <span className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xs font-semibold text-white/70">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </span>

                    {showCorrect && (
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />
                        Correct
                      </span>
                    )}
                    {showWrong && (
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-red-200">
                        <XCircle className="h-4 w-4" />
                        Wrong
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>

            {showResult && currentQuestion.explanation && (
              <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/25">
                <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                <CardContent className="relative z-10 space-y-2 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#f5c16c]/70">Explanation</p>
                  <p className="text-sm leading-relaxed text-white/75">{currentQuestion.explanation}</p>
                </CardContent>
              </Card>
            )}

            {showResult ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-white">
                  Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
                </div>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#f5c16c] text-[#1f120c] hover:bg-[#f5c16c]/90"
                >
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Finish Quiz
                      <Flame className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-white/60">Select an answer to reveal the correct choice and explanation.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function ReviewQuizPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center gap-3 py-24">
          <Loader2 className="h-7 w-7 animate-spin text-[#f5c16c]" />
          <span className="text-white/70">Loading...</span>
        </div>
      </DashboardLayout>
    }>
      <ReviewQuizContent />
    </Suspense>
  )
}
