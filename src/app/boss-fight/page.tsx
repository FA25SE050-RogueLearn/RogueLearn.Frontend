'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Swords, Flame, Trophy, Settings, Play, Copy, Users, ArrowLeft } from 'lucide-react'
import UnityPlayer from '@/components/unity/UnityPlayer'
import partiesApi from '@/api/partiesApi'
import { PartyDto, PartyMemberDto } from '@/types/parties'

interface Subject {
  id: string
  subjectCode: string
  subjectName: string
}

type Mode = 'choice' | 'setup' | 'joining' | 'hosting' | 'playing'

export default function BossFightSetupPage() {
  const router = useRouter()
  const SUBJECTS_PER_PAGE = 6
  const [mode, setMode] = useState<Mode>('choice')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectPage, setSubjectPage] = useState(1)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [totalQuestions, setTotalQuestions] = useState(50)
  const [easyPercent, setEasyPercent] = useState(30)
  const [mediumPercent, setMediumPercent] = useState(50)
  const [hardPercent, setHardPercent] = useState(20)
  const [loading, setLoading] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState<string | null>(null)
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [myParties, setMyParties] = useState<PartyDto[]>([])
  const [partyMembers, setPartyMembers] = useState<Record<string, PartyMemberDto[]>>({})
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null)
  const [selectedInvitees, setSelectedInvitees] = useState<Record<string, boolean>>({})
  const [sendingPartyInvite, setSendingPartyInvite] = useState(false)

  useEffect(() => {
    const fetchUserAndSubjects = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      // Fetch user's subjects from their quests
      try {
        const origin = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:6968'
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        const response = await fetch(`${origin}/api/quests/me`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        })

        if (response.ok) {
          const quests = await response.json()

          // Extract unique subjects from quests
          const subjectMap = new Map<string, Subject>()
          quests.forEach((quest: any) => {
            // Subject properties are directly on the quest object
            if (quest.subjectId && quest.subjectCode && quest.subjectName) {
              subjectMap.set(quest.subjectId, {
                id: quest.subjectId,
                subjectCode: quest.subjectCode,
                subjectName: quest.subjectName
              })
            }
          })

          setSubjects(Array.from(subjectMap.values()))
          setSubjectPage(1)
        }
      } catch (error) {
        console.error('Failed to fetch subjects:', error)
        // Fall back to empty array
        setSubjects([])
      } finally {
        setLoadingSubjects(false)
      }
    }
    fetchUserAndSubjects()
  }, [])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(subjects.length / SUBJECTS_PER_PAGE))
    setSubjectPage((p) => Math.min(p, maxPage))
  }, [subjects])

  useEffect(() => {
    if (!userId) return
    let active = true
      ; (async () => {
        try {
          const res = await partiesApi.getMine()
          if (!active) return
          setMyParties(res.data ?? [])
          if ((res.data ?? []).length > 0) {
            const firstId = (res.data ?? [])[0].id
            setSelectedPartyId(firstId)
            const membersRes = await partiesApi.getMembers(firstId)
            if (active) {
              setPartyMembers({ [firstId]: membersRes.data ?? [] })
              const defaults: Record<string, boolean> = {}
                ; (membersRes.data ?? []).forEach(m => { defaults[m.authUserId] = true })
              setSelectedInvitees(defaults)
            }
          }
        } catch {
          if (active) {
            setMyParties([])
            setPartyMembers({})
          }
        }
      })()
    return () => { active = false }
  }, [userId])

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleDifficultyChange = (type: 'easy' | 'medium' | 'hard', value: number) => {
    const newValue = Math.max(0, Math.min(100, value))

    if (type === 'easy') {
      const remaining = 100 - newValue
      const mediumRatio = mediumPercent / (mediumPercent + hardPercent) || 0.5
      setEasyPercent(newValue)
      setMediumPercent(Math.round(remaining * mediumRatio))
      setHardPercent(Math.round(remaining * (1 - mediumRatio)))
    } else if (type === 'medium') {
      const remaining = 100 - newValue
      const easyRatio = easyPercent / (easyPercent + hardPercent) || 0.5
      setMediumPercent(newValue)
      setEasyPercent(Math.round(remaining * easyRatio))
      setHardPercent(Math.round(remaining * (1 - easyRatio)))
    } else {
      const remaining = 100 - newValue
      const easyRatio = easyPercent / (easyPercent + mediumPercent) || 0.5
      setHardPercent(newValue)
      setEasyPercent(Math.round(remaining * easyRatio))
      setMediumPercent(Math.round(remaining * (1 - easyRatio)))
    }
  }

  const handlePartyChange = async (partyId: string) => {
    setSelectedPartyId(partyId)
    if (partyMembers[partyId]) {
      const defaults: Record<string, boolean> = {}
      partyMembers[partyId].forEach(m => { defaults[m.authUserId] = true })
      setSelectedInvitees(defaults)
      return
    }
    try {
      const res = await partiesApi.getMembers(partyId)
      setPartyMembers((prev) => ({ ...prev, [partyId]: res.data ?? [] }))
      const defaults: Record<string, boolean> = {}
        ; (res.data ?? []).forEach(m => { defaults[m.authUserId] = true })
      setSelectedInvitees(defaults)
    } catch {
      // ignore
    }
  }

  const toggleInvitee = (authId: string) => {
    setSelectedInvitees((prev) => ({ ...prev, [authId]: !prev[authId] }))
  }

  const sendPartyGameInvite = async () => {
    if (!selectedPartyId || !inviteUrl || !sessionId || !joinCode) {
      alert('Missing join code or party')
      return
    }
    const targets = Object.entries(selectedInvitees).filter(([, v]) => v).map(([id]) => ({ userId: id }))
    if (targets.length === 0) {
      alert('Select at least one member')
      return
    }
    setSendingPartyInvite(true)
    try {
      await partiesApi.inviteToGame(selectedPartyId, {
        targets,
        message: 'Join my boss fight!',
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        joinLink: inviteUrl,
        gameSessionId: sessionId,
      })
      alert('Party game invite sent')
    } catch (err) {
      console.error(err)
      alert('Failed to send invite')
    } finally {
      setSendingPartyInvite(false)
    }
  }

  const handlePrepareForBattle = async () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject')
      return
    }

    setLoading(true)
    try {
      // Step 1: Get join code from host endpoint (with userId)
      const hostRes = await fetch('/api/game/host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (!hostRes.ok) {
        throw new Error('Failed to create host session')
      }
      const hostData = await hostRes.json()
      const code = String(hostData.joinCode)
      setJoinCode(code)

      // Step 2: Create game session with configured subjects
      const origin = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5051'
      const selectedSubjectCodes = subjects
        .filter(s => selectedSubjects.includes(s.id))
        .map(s => s.subjectCode)
        .join(',')

      const sessionRes = await fetch(`${origin}/api/quests/game/sessions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          relay_join_code: code,
          pack_spec: {
            subject: selectedSubjectCodes,
            difficulty: 'mixed',
            count: totalQuestions
          }
        })
      })

      if (!sessionRes.ok) {
        throw new Error('Failed to create game session')
      }

      const sessionData = await sessionRes.json()
      const sid = sessionData.match_id
      setSessionId(sid)

      // Step 3: Generate invite URL
      const inviteLink = `${window.location.origin}/play?code=${encodeURIComponent(code)}&match=${encodeURIComponent(sid)}`
      setInviteUrl(inviteLink)

      // Switch to hosting mode to show invite code
      setMode('hosting')
    } catch (error) {
      console.error('Failed to prepare boss fight:', error)
      alert('Failed to prepare boss fight. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartGame = () => {
    // Navigate to play page with join code so host auto-connects
    if (joinCode && sessionId) {
      router.push(`/play?code=${encodeURIComponent(joinCode)}&match=${encodeURIComponent(sessionId)}`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleJoinGame = async () => {
    if (!joinCodeInput || joinCodeInput.length !== 6) {
      alert('Please enter a valid 6-character join code')
      return
    }

    setLoading(true)
    try {
      // Call the join endpoint
      const joinRes = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCodeInput })
      })

      if (!joinRes.ok) {
        throw new Error('Failed to join game')
      }

      const joinData = await joinRes.json()

      // Get the match ID from the join response or from query params
      const matchId = joinData.matchId || new URLSearchParams(window.location.search).get('match')

      if (!matchId) {
        throw new Error('No match ID found')
      }

      setSessionId(matchId)
      setMode('playing')
    } catch (error) {
      console.error('Failed to join game:', error)
      alert('Failed to join game. Please check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show initial choice screen
  if (mode === 'choice') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0508 0%, #1a0b10 50%, #0a0508 100%)', padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            position: 'absolute',
            top: 32,
            left: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            background: 'rgba(245, 193, 108, 0.1)',
            border: '2px solid rgba(245, 193, 108, 0.3)',
            borderRadius: 12,
            color: '#f5c16c',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft style={{ width: 20, height: 20 }} />
          Back
        </button>

        <div style={{ maxWidth: 800, width: '100%' }}>
          <div style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #d23187 0%, #f061a6 50%, #f5c16c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 64
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              <Swords style={{ width: 56, height: 56, color: '#f5c16c' }} />
              <h1 style={{ fontSize: 56, fontWeight: 900, margin: 0 }}>Boss Fight</h1>
              <Flame style={{ width: 56, height: 56, color: '#d23187' }} />
            </div>
            <p style={{ fontSize: 20, color: '#f5c16c', opacity: 0.8 }}>
              Test your knowledge in an epic multiplayer showdown
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {/* Host Button */}
            <button
              onClick={() => setMode('setup')}
              style={{
                padding: 48,
                background: 'linear-gradient(135deg, rgba(210, 49, 135, 0.2) 0%, rgba(240, 97, 166, 0.2) 100%)',
                border: '3px solid #d23187',
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20
              }}
            >
              <Trophy style={{ width: 64, height: 64, color: '#f5c16c' }} />
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                  Host Game
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Configure settings and invite friends
                </div>
              </div>
            </button>

            {/* Join Button */}
            <button
              onClick={() => setMode('joining')}
              style={{
                padding: 48,
                background: 'linear-gradient(135deg, rgba(245, 193, 108, 0.2) 0%, rgba(240, 97, 166, 0.2) 100%)',
                border: '3px solid #f5c16c',
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20
              }}
            >
              <Users style={{ width: 64, height: 64, color: '#d23187' }} />
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                  Join Game
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Enter a code to join an existing match
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show join screen
  if (mode === 'joining') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0508 0%, #1a0b10 50%, #0a0508 100%)', padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <div style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #d23187 0%, #f061a6 50%, #f5c16c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 48
          }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>Join Boss Fight</h1>
            <p style={{ fontSize: 18, color: '#f5c16c', opacity: 0.8 }}>
              Enter the 6-character join code
            </p>
          </div>

          <div style={{
            background: 'rgba(210, 49, 135, 0.1)',
            border: '3px solid #f5c16c',
            borderRadius: 20,
            padding: 48
          }}>
            <input
              type="text"
              maxLength={6}
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="ABCDEF"
              style={{
                width: '100%',
                padding: 24,
                fontSize: 32,
                fontWeight: 900,
                textAlign: 'center',
                letterSpacing: 8,
                background: 'rgba(10, 5, 8, 0.8)',
                border: '2px solid rgba(245, 193, 108, 0.5)',
                borderRadius: 12,
                color: '#f5c16c',
                marginBottom: 24
              }}
            />

            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => setMode('choice')}
                style={{
                  flex: 1,
                  padding: 16,
                  fontSize: 18,
                  fontWeight: 700,
                  background: 'rgba(100, 100, 100, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 12,
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleJoinGame}
                disabled={loading || joinCodeInput.length !== 6}
                style={{
                  flex: 2,
                  padding: 16,
                  fontSize: 18,
                  fontWeight: 700,
                  background: joinCodeInput.length === 6
                    ? 'linear-gradient(135deg, #d23187 0%, #f061a6 50%, #f5c16c 100%)'
                    : 'rgba(100, 100, 100, 0.3)',
                  border: 'none',
                  borderRadius: 12,
                  color: 'white',
                  cursor: joinCodeInput.length === 6 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  opacity: loading ? 0.6 : 1
                }}
              >
                <Users style={{ width: 24, height: 24 }} />
                {loading ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show Unity player when in playing mode
  if (mode === 'playing' && sessionId) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0508 0%, #1a0b10 50%, #0a0508 100%)', padding: 32 }}>
        <UnityPlayer initialJoinCode={joinCodeInput || undefined} userId={userId || undefined} />
      </div>
    )
  }

  // Show invite code when in hosting mode
  if (mode === 'hosting') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0508 0%, #1a0b10 50%, #0a0508 100%)', padding: 32 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #d23187 0%, #f061a6 50%, #f5c16c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 48
          }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>Boss Fight Ready!</h1>
            <p style={{ fontSize: 18, color: '#f5c16c', opacity: 0.8 }}>
              Share the code below with other players
            </p>
          </div>

          {/* Join Code Display */}
          <div style={{
            background: 'rgba(210, 49, 135, 0.1)',
            border: '3px solid #f5c16c',
            borderRadius: 20,
            padding: 48,
            textAlign: 'center',
            marginBottom: 32
          }}>
            <div style={{ fontSize: 16, color: '#f5c16c', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
              Join Code
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, color: 'white', letterSpacing: 8, marginBottom: 24 }}>
              {joinCode}
            </div>
            <button
              onClick={() => copyToClipboard(joinCode || '')}
              style={{
                padding: '12px 32px',
                background: 'rgba(245, 193, 108, 0.2)',
                border: '2px solid #f5c16c',
                borderRadius: 12,
                color: '#f5c16c',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Copy style={{ width: 20, height: 20 }} />
              Copy Code
            </button>
          </div>

          {/* Invite Link */}
          {inviteUrl && (
            <div style={{
              background: 'rgba(210, 49, 135, 0.05)',
              border: '2px solid rgba(245, 193, 108, 0.3)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 32
            }}>
              <div style={{ fontSize: 14, color: '#f5c16c', marginBottom: 12 }}>
                Or share this invite link:
              </div>
              <div style={{
                padding: 12,
                background: 'rgba(10, 5, 8, 0.8)',
                borderRadius: 8,
                fontSize: 14,
                color: 'white',
                wordBreak: 'break-all',
                marginBottom: 12
              }}>
                {inviteUrl}
              </div>
              <button
                onClick={() => copyToClipboard(inviteUrl)}
                style={{
                  padding: '8px 24px',
                  background: 'rgba(245, 193, 108, 0.2)',
                  border: '2px solid rgba(245, 193, 108, 0.5)',
                  borderRadius: 8,
                  color: '#f5c16c',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Copy Link
              </button>
            </div>
          )}

          {/* Party game invite */}
          {inviteUrl && sessionId && (
            <div style={{
              background: 'rgba(15,10,10,0.7)',
              border: '2px solid rgba(245, 193, 108, 0.3)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 32
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ color: '#f5c16c', fontWeight: 700 }}>Invite your party</div>
                {sendingPartyInvite && <div style={{ color: 'white', fontSize: 12 }}>Sending...</div>}
              </div>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <div style={{ color: '#bbb', fontSize: 12, marginBottom: 6 }}>Party</div>
                  <select
                    value={selectedPartyId ?? ''}
                    onChange={(e) => handlePartyChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8
                    }}
                  >
                    {(myParties ?? []).length === 0 && <option value="">No parties</option>}
                    {myParties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 6 }}>Join link and session id will be sent.</div>
                </div>
                <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 8 }}>
                  {(partyMembers[selectedPartyId ?? ''] ?? []).length === 0 && (
                    <div style={{ color: '#888', fontSize: 12 }}>No members to invite.</div>
                  )}
                  {(partyMembers[selectedPartyId ?? ''] ?? []).map(m => (
                    <label key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px', color: 'white', fontSize: 13 }}>
                      <span>{m.username ?? m.email ?? 'Member'}</span>
                      <input type="checkbox" checked={!!selectedInvitees[m.authUserId]} onChange={() => toggleInvitee(m.authUserId)} />
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <button
                  onClick={sendPartyGameInvite}
                  disabled={sendingPartyInvite || !selectedPartyId}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #d23187 0%, #f061a6 50%, #f5c16c 100%)',
                    border: 'none',
                    borderRadius: 10,
                    color: 'white',
                    fontWeight: 700,
                    cursor: sendingPartyInvite ? 'not-allowed' : 'pointer',
                    opacity: sendingPartyInvite ? 0.7 : 1
                  }}
                >
                  Send invite to party
                </button>
              </div>
            </div>
          )}

          {/* Start Game Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleStartGame}
              style={{
                padding: '24px 64px',
                fontSize: 24,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #d23187 0%, #f061a6 50%, #f5c16c 100%)',
                border: 'none',
                borderRadius: 16,
                color: 'white',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: '0 8px 32px rgba(210, 49, 135, 0.5)'
              }}
            >
              <Users style={{ width: 28, height: 28 }} />
              Start Game
              <Play style={{ width: 28, height: 28 }} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Setup mode (default)
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0508 0%, #1a0b10 50%, #0a0508 100%)', padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Back Button */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setMode('choice')}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 600,
              background: 'rgba(100, 100, 100, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 12,
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            ← Back
          </button>
        </div>

        {/* Header */}
        <div style={{
          marginBottom: 48,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #d23187 0%, #f061a6 50%, #f5c16c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <Swords style={{ width: 48, height: 48, color: '#f5c16c' }} />
            <h1 style={{ fontSize: 48, fontWeight: 800, margin: 0 }}>Boss Fight Setup</h1>
            <Flame style={{ width: 48, height: 48, color: '#d23187' }} />
          </div>
          <p style={{ fontSize: 18, color: '#f5c16c', opacity: 0.8 }}>
            Configure your ultimate exam preparation challenge
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Left Column - Subject Selection */}
          <div style={{
            background: 'rgba(210, 49, 135, 0.05)',
            border: '2px solid rgba(245, 193, 108, 0.2)',
            borderRadius: 16,
            padding: 32
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f5c16c', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Trophy style={{ width: 24, height: 24 }} />
              Choose Your Subjects
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingSubjects ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#f5c16c', opacity: 0.7 }}>
                  Loading your subjects...
                </div>
              ) : subjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#f5c16c', opacity: 0.7 }}>
                  No subjects found. Start some quests to unlock subjects for boss fights!
                </div>
              ) : (
                <>
                  {subjects
                    .slice((subjectPage - 1) * SUBJECTS_PER_PAGE, subjectPage * SUBJECTS_PER_PAGE)
                    .map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => handleSubjectToggle(subject.id)}
                        style={{
                          padding: 16,
                          border: selectedSubjects.includes(subject.id)
                            ? '2px solid #f5c16c'
                            : '2px solid rgba(245, 193, 108, 0.3)',
                          borderRadius: 12,
                          background: selectedSubjects.includes(subject.id)
                            ? 'rgba(245, 193, 108, 0.15)'
                            : 'rgba(10, 5, 8, 0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: 14, color: '#f5c16c', fontWeight: 600, marginBottom: 4 }}>
                          {subject.subjectCode}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                          {subject.subjectName}
                        </div>
                      </button>
                    ))}
                  {subjects.length > SUBJECTS_PER_PAGE && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 12 }}>
                      <button
                        onClick={() => setSubjectPage((p) => Math.max(1, p - 1))}
                        disabled={subjectPage === 1}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(10, 5, 8, 0.6)',
                          border: '1px solid rgba(245, 193, 108, 0.3)',
                          borderRadius: 8,
                          color: subjectPage === 1 ? 'rgba(255,255,255,0.5)' : '#f5c16c',
                          cursor: subjectPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Prev
                      </button>
                      <div style={{ color: '#f5c16c', fontSize: 13 }}>
                        Page {subjectPage} of {Math.ceil(subjects.length / SUBJECTS_PER_PAGE)}
                      </div>
                      <button
                        onClick={() => setSubjectPage((p) => Math.min(Math.ceil(subjects.length / SUBJECTS_PER_PAGE), p + 1))}
                        disabled={subjectPage >= Math.ceil(subjects.length / SUBJECTS_PER_PAGE)}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(10, 5, 8, 0.6)',
                          border: '1px solid rgba(245, 193, 108, 0.3)',
                          borderRadius: 8,
                          color: subjectPage >= Math.ceil(subjects.length / SUBJECTS_PER_PAGE) ? 'rgba(255,255,255,0.5)' : '#f5c16c',
                          cursor: subjectPage >= Math.ceil(subjects.length / SUBJECTS_PER_PAGE) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Difficulty & Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Total Questions */}
            <div style={{
              background: 'rgba(210, 49, 135, 0.05)',
              border: '2px solid rgba(245, 193, 108, 0.2)',
              borderRadius: 16,
              padding: 32
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f5c16c', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Settings style={{ width: 24, height: 24 }} />
                Total Questions
              </h2>
              <input
                type="number"
                min={10}
                max={100}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 50)}
                style={{
                  width: '100%',
                  padding: 16,
                  fontSize: 24,
                  fontWeight: 700,
                  textAlign: 'center',
                  background: 'rgba(10, 5, 8, 0.8)',
                  border: '2px solid rgba(245, 193, 108, 0.3)',
                  borderRadius: 12,
                  color: '#f5c16c'
                }}
              />
            </div>

            {/* Difficulty Mix */}
            <div style={{
              background: 'rgba(210, 49, 135, 0.05)',
              border: '2px solid rgba(245, 193, 108, 0.2)',
              borderRadius: 16,
              padding: 32
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f5c16c', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Flame style={{ width: 24, height: 24 }} />
                Difficulty Mix
              </h2>

              {/* Easy */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>Easy</span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>{easyPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={easyPercent}
                  onChange={(e) => handleDifficultyChange('easy', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#4ade80' }}
                />
              </div>

              {/* Medium */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#fb923c', fontWeight: 600 }}>Medium</span>
                  <span style={{ color: '#fb923c', fontWeight: 700 }}>{mediumPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={mediumPercent}
                  onChange={(e) => handleDifficultyChange('medium', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#fb923c' }}
                />
              </div>

              {/* Hard */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>Hard</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{hardPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={hardPercent}
                  onChange={(e) => handleDifficultyChange('hard', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#ef4444' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <button
            onClick={handlePrepareForBattle}
            disabled={loading || selectedSubjects.length === 0}
            style={{
              padding: '24px 64px',
              fontSize: 24,
              fontWeight: 800,
              background: selectedSubjects.length === 0
                ? 'rgba(100, 100, 100, 0.3)'
                : 'linear-gradient(135deg, #d23187 0%, #f061a6 50%, #f5c16c 100%)',
              border: 'none',
              borderRadius: 16,
              color: 'white',
              cursor: selectedSubjects.length === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: selectedSubjects.length === 0
                ? 'none'
                : '0 8px 32px rgba(210, 49, 135, 0.5)',
              transition: 'all 0.3s',
              opacity: loading ? 0.6 : 1
            }}
          >
            <Trophy style={{ width: 28, height: 28 }} />
            {loading ? 'Preparing Battle...' : 'Prepare for Battle'}
            <Swords style={{ width: 28, height: 28 }} />
          </button>
        </div>
      </div>
    </div>
  )
}
