import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  placeholder?: string
}

export function DateTimePicker({ date, setDate, placeholder = "Pick a date and time" }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState<string>(() => {
    // Default to current time in GMT+7
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  })

  // When date changes, update time value from it
  React.useEffect(() => {
    if (date) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      setTimeValue(`${hours}:${minutes}`)
    }
  }, [date])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve existing time if date already has one, otherwise use current timeValue
      const [hours, minutes] = timeValue.split(':')
      selectedDate.setHours(parseInt(hours), parseInt(minutes))
      setDate(selectedDate)
    } else {
      setDate(undefined)
    }
    setOpen(false)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setTimeValue(time)

    if (date) {
      const [hours, minutes] = time.split(':')
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      setDate(newDate)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-amber-900/30 bg-amber-950/20 text-amber-100 hover:bg-amber-900/30",
              !date && "text-amber-700"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP HH:mm") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              month_caption: "flex h-auto w-full items-center justify-center relative",
              caption: "flex justify-center items-center text-amber-100",
              caption_label: "text-sm font-medium mx-2",
              nav: "flex items-center gap-1 absolute inset-x-0 justify-between px-1",
              button_previous: cn(
                "h-7 w-7 bg-amber-900/30 p-0 hover:bg-amber-800/50 text-amber-300 hover:text-amber-100 border border-amber-700/50 rounded-md transition-colors"
              ),
              button_next: cn(
                "h-7 w-7 bg-amber-900/30 p-0 hover:bg-amber-800/50 text-amber-300 hover:text-amber-100 border border-amber-700/50 rounded-md transition-colors"
              ),
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-amber-500 rounded-md w-9 font-bold text-[0.9rem] text-center",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100 rounded-md"
              ),
              day_range_end: "day-range-end",
              day_selected: "bg-amber-600 text-white hover:bg-amber-700 hover:text-white focus:bg-amber-700 focus:text-white",
              day_today: "bg-amber-900/50 text-amber-100 font-bold",
              day_outside: "day-outside text-amber-800 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              day_disabled: "text-amber-900 opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
          <div className="border-t border-amber-900/30 p-3">
            <div className="flex items-center gap-2">
              <label htmlFor="time-picker" className="text-sm text-amber-300">
                Time:
              </label>
              <input
                type="time"
                id="time-picker"
                value={timeValue}
                onChange={handleTimeChange}
                className="flex h-9 rounded-md border border-amber-900/30 bg-amber-950/20 px-3 py-1 text-sm text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
