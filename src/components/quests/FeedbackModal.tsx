'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import questApi from '@/api/questApi'
import { toast } from 'sonner'

type QuestFeedbackCategory = 'ContentError' | 'TechnicalIssue' | 'TooDifficult' | 'TooEasy' | 'Other'

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questId: string
  stepId: string
  stepLabel?: string
}

export default function FeedbackModal({ open, onOpenChange, questId, stepId, stepLabel }: FeedbackModalProps) {
  const [rating, setRating] = useState<string>('3')
  const [category, setCategory] = useState<QuestFeedbackCategory | ''>('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const parsedRating = parseInt(rating, 10)
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      toast.error('Please select a rating from 1 to 5')
      return
    }
    if (!category) {
      toast.error('Please choose a feedback category')
      return
    }
    setSubmitting(true)
    const res = await questApi.submitStepFeedback(questId, stepId, { rating: parsedRating, category, comment: comment?.trim() || undefined })
    setSubmitting(false)
    if (res.isSuccess) {
      toast.success('Feedback submitted')
      onOpenChange(false)
      setComment('')
      setCategory('')
      setRating('3')
    } else {
      toast.error(res.message || 'Failed to submit feedback')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506] text-white">
        <DialogHeader>
          <DialogTitle>{stepLabel ? `Feedback for ${stepLabel}` : 'Report Issue'}</DialogTitle>
          <DialogDescription className="text-white/60">Help us improve this quest step</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/80">Category</label>
            <Select value={category} onValueChange={value => setCategory(value as QuestFeedbackCategory)}>
              <SelectTrigger className="bg-black/40 border-white/20 text-white">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 text-white border-white/20">
                <SelectItem value="ContentError">ContentError</SelectItem>
                <SelectItem value="TechnicalIssue">TechnicalIssue</SelectItem>
                <SelectItem value="TooDifficult">TooDifficult</SelectItem>
                <SelectItem value="TooEasy">TooEasy</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Rating</label>
            <ToggleGroup type="single" value={rating} onValueChange={(v) => v && setRating(v)} className="gap-2">
              {['1','2','3','4','5'].map(v => (
                <ToggleGroupItem key={v} value={v} aria-label={`Rate ${v}`} className="h-9 w-9 rounded-md border border-white/20 bg-white/5 data-[state=on]:bg-[#f5c16c] data-[state=on]:text-black">
                  {v}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Comment</label>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Describe the issue or suggestion" className="min-h-28 bg-black/40 border-white/20 text-white" maxLength={1000} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/20">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black">{submitting ? 'Submitting...' : 'Submit'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

