import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') || '10')
    const userIdFilter = searchParams.get('userId')

    // Try Supabase first
    try {
      const supabase = await createClient()
      let query = supabase
        .from('match_results')
        .select('id, match_id, created_at, total_players, match_data, user_id')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (userIdFilter) {
        query = query.eq('user_id', userIdFilter)
      }
      const { data: rows, error } = await query
      if (!error && rows && rows.length > 0) {
        const matches = rows.map((r: any) => {
          let md: any = null
          try { md = typeof r.match_data === 'string' ? JSON.parse(r.match_data) : r.match_data } catch { md = null }
          const matchId = md?.matchId || r.match_id || r.id
          const result = md?.result || 'unknown'
          const endUtc = md?.timestamp || r.created_at || new Date().toISOString()
          const questionsFromData = Array.isArray(md?.questions) ? md.questions : []
          const topicsFromSummary = Array.isArray(md?.playerSummaries?.[0]?.topicBreakdown) ? md.playerSummaries[0].topicBreakdown : []
          const questionsCount = questionsFromData.length || topicsFromSummary.length
          return {
            matchId,
            endUtc,
            result,
            totalPlayers: r.total_players || 0,
            questions: questionsFromData.length > 0
              ? questionsFromData
              : Array.from({ length: questionsCount }).map((_, i) => ({ questionId: i + 1, topic: topicsFromSummary[i]?.topic || '', difficulty: '', prompt: topicsFromSummary[i]?.topic || '', correctAnswerIndex: 0, playerAnswers: [] })),
            playerSummaries: Array.isArray(md?.playerSummaries) ? md.playerSummaries : []
          }
        })
        return NextResponse.json({ matches })
      }
    } catch { }

    const overrideDir = process.env.RESULTS_DIR
    const baseDir = overrideDir
      ? path.join(overrideDir)
      : path.join(process.cwd(), 'tmp', 'match-results')

    const resultsDir = path.join(baseDir, 'results')
    const playersDir = path.join(baseDir, 'players')

    if (!fs.existsSync(resultsDir)) {
      return NextResponse.json({ matches: [] })
    }

    const files = fs.readdirSync(resultsDir)
      .filter(f => f.startsWith('result_') && f.endsWith('.json'))
      .sort((a, b) => {
        const at = fs.statSync(path.join(resultsDir, a)).mtimeMs
        const bt = fs.statSync(path.join(resultsDir, b)).mtimeMs
        return bt - at
      })
      .slice(0, limit)

    const matches: any[] = []

    for (const file of files) {
      const full = path.join(resultsDir, file)
      const raw = fs.readFileSync(full, 'utf-8')
      let json: any
      try { json = JSON.parse(raw) } catch { json = null }

      const sessionId = file.replace('result_', '').replace('.json', '')

      // Optional per-player files for this session
      let totalPlayers = 0
      if (fs.existsSync(playersDir)) {
        const playerFiles = fs.readdirSync(playersDir).filter(f => f.endsWith(`_${sessionId}.json`))
        totalPlayers = playerFiles.length

        // If userId filter present, skip sessions without that user summary
        if (userIdFilter) {
          const hasUser = playerFiles.some(f => f.includes(`player_${userIdFilter}_`))
          if (!hasUser) continue
        }
      }

      const result = json?.result ?? 'unknown'
      const endUtc = json?.timestamp ?? new Date().toISOString()
      const questionsCount = Array.isArray(json?.summary?.topics) ? json.summary.topics.length : 0

      matches.push({
        matchId: sessionId,
        endUtc,
        result,
        totalPlayers,
        questions: Array.from({ length: questionsCount }).map((_, i) => ({ questionId: i + 1, topic: '', difficulty: '', prompt: '', correctAnswerIndex: 0, playerAnswers: [] })),
        playerSummaries: []
      })
    }

    return NextResponse.json({ matches })
  } catch (e) {
    return NextResponse.json({ matches: [] })
  }
}
