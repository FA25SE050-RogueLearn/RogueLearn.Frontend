'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  topic: string
  difficulty: string
  explanation?: string
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

  useEffect(() => {
    async function loadQuestions() {
      const matchId = searchParams.get('matchId')
      const topics = topicsParam.split(',').filter(t => t.trim())

      if (!matchId || topics.length === 0) {
        setLoading(false)
        return
      }

      try {
        console.log('[ReviewQuiz] Loading questions from matchId:', matchId)
        console.log('[ReviewQuiz] Filtering for topics:', topics)

        // Fetch the actual match data to get the real questions
        const response = await fetch(`/api/quests/game/sessions/unity-matches?limit=50`)

        if (!response.ok) {
          throw new Error('Failed to fetch match data')
        }

        const data = await response.json()
        console.log('[ReviewQuiz] Match data:', data)

        // Find the specific match
        const matches = data.matches || []
        console.log('[ReviewQuiz] Matches array:', matches)
        const match = matches.find((m: any) => m.matchId === matchId)

        if (!match) {
          throw new Error('Match not found')
        }

        console.log('[ReviewQuiz] Found match:', match)
        console.log('[ReviewQuiz] Match questions:', match.questions)
        console.log('[ReviewQuiz] Player summaries:', match.playerSummaries)

        // Fetch the match data from Supabase to get the complete question pack
        let questionPack = null
        try {
          const supabase = createClient()
          const { data: matchRow, error } = await supabase
            .from('match_results')
            .select('match_data, match_id, id')
            .or(`match_id.eq.${matchId},id.eq.${matchId}`)
            .maybeSingle()

          if (error) {
            console.log('[ReviewQuiz] Could not fetch match data from match_results:', error)
          }

          if (matchRow?.match_data) {
            const parsedData = typeof matchRow.match_data === 'string'
              ? JSON.parse(matchRow.match_data)
              : matchRow.match_data

            // The question pack might be in match_data.questionPack or match_data.questions
            questionPack = parsedData?.questionPack || { questions: parsedData?.questions }
            console.log('[ReviewQuiz] Question pack from match_results:', questionPack)
          }
        } catch (err) {
          console.log('[ReviewQuiz] Error fetching match data from Supabase:', err)
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

        console.log('[ReviewQuiz] Generated quiz questions:', quizQuestions)
        console.log('[ReviewQuiz] Total questions to review:', quizQuestions.length)

        setQuestions(quizQuestions)
        console.log('[ReviewQuiz] Set questions:', quizQuestions)
      } catch (error) {
        console.error('[ReviewQuiz] Failed to load questions:', error)
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
      // Quiz completed, show final results
      router.push(`/stats?quizCompleted=true&score=${score.correct}&total=${score.total}`)
    }
  }

  console.log('[ReviewQuiz] Render - loading:', loading, 'questions.length:', questions.length)

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700 }}>Loading Review Quiz...</h1>
        <div>Loading the questions you got wrong so you can review your mistakes...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    console.log('[ReviewQuiz] No questions to display!')
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700 }}>No Questions to Review</h1>
        <p>Great job! You either got all questions correct, or there are no questions available for review in the selected topics.</p>
        <button
          onClick={() => router.push('/stats')}
          style={{
            marginTop: 20,
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Back to Stats
        </button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Review Quiz</h1>
          <div style={{ fontSize: 14, color: '#666' }}>
            Question {currentIndex + 1} / {questions.length}
          </div>
        </div>
        <div style={{
          width: '100%',
          height: 8,
          background: '#e0e0e0',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: '#3b82f6',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{
        padding: 24,
        background: 'white',
        borderRadius: 12,
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 6px rgba(0,0,0,0.06)',
        marginBottom: 24
      }}>
        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
          Topic: {currentQuestion.topic} • Difficulty: {currentQuestion.difficulty}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#111' }}>
          {currentQuestion.prompt}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion.answerIndex
            const showCorrect = showResult && isCorrect
            const showWrong = showResult && isSelected && !isCorrect

            return (
              <button
                key={index}
                onClick={() => !showResult && handleAnswer(index)}
                disabled={showResult}
                style={{
                  padding: 16,
                  background: showCorrect ? '#4caf50' : showWrong ? '#f44336' : isSelected ? '#e3f2fd' : 'white',
                  border: `2px solid ${showCorrect ? '#4caf50' : showWrong ? '#f44336' : isSelected ? '#3b82f6' : '#e0e0e0'}`,
                  borderRadius: 8,
                  textAlign: 'left',
                  cursor: showResult ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                  color: showCorrect || showWrong ? 'white' : '#111',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{String.fromCharCode(65 + index)}) {option}</span>
                  {showCorrect && <span>Correct</span>}
                  {showWrong && <span>Wrong</span>}
                </div>
              </button>
            )
          })}
        </div>

        {showResult && currentQuestion.explanation && (
          <div style={{
            marginTop: 20,
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 8,
            fontSize: 14
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Explanation:</div>
            <div>{currentQuestion.explanation}</div>
          </div>
        )}
      </div>

      {showResult && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
          </div>
          <button
            onClick={handleNext}
            style={{
              padding: '12px 32px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#2563eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#3b82f6')}
          >
            {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ReviewQuizPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700 }}>Loading...</h1>
      </div>
    }>
      <ReviewQuizContent />
    </Suspense>
  )
}
