'use client'

import Link from 'next/link'
import { Flame, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface PracticeButtonProps {
  matchId: string
  topics: string[]
}

export default function PracticeButton({ matchId, topics }: PracticeButtonProps) {
  const encodedTopics = topics.map(t => encodeURIComponent(t)).join(',')

  return (
    <Button
      asChild
      className="border-[#f5c16c]/30 bg-[#f5c16c] text-[#1f120c] shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:bg-[#f5c16c]/90"
    >
      <Link href={`/review-quiz?matchId=${matchId}&topics=${encodedTopics}`}
        className="group"
      >
        <Target className="h-4 w-4" />
        Practice Weak Topics
        <Flame className="h-4 w-4 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </Button>
  )
}
