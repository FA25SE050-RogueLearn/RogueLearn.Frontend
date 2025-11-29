'use client'

interface PracticeButtonProps {
  matchId: string
  topics: string[]
}

export default function PracticeButton({ matchId, topics }: PracticeButtonProps) {
  return (
    <a
      href={`/review-quiz?matchId=${matchId}&topics=${encodeURIComponent(topics.join(','))}`}
      style={{
        padding: '10px 20px',
        background: '#3b82f6',
        color: 'white',
        borderRadius: 8,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: 14,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'background 0.2s'
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = '#2563eb')}
      onMouseOut={(e) => (e.currentTarget.style.background = '#3b82f6')}
    >
      🎯 Practice Weak Topics
    </a>
  )
}
