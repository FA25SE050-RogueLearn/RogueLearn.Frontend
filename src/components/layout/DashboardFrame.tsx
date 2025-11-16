"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { DungeonNav } from "@/components/layout/DungeonNav"

interface DashboardFrameProps {
  children: ReactNode
  className?: string
}

export function DashboardFrame({ children, className }: DashboardFrameProps) {
  return (
    <>
      <DungeonNav />
      <main className={cn("min-h-screen w-full", className)}>
        <div className="mx-auto max-w-[1800px] px-6 py-8">
          {children}
        </div>
      </main>
    </>
  )
}