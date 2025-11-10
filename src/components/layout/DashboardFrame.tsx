"use client"

import { ReactNode } from "react"
import { DungeonNav } from "@/components/layout/DungeonNav"

interface DashboardFrameProps {
  children: ReactNode
}

export function DashboardFrame({ children }: DashboardFrameProps) {
  return (
    <>
      <DungeonNav />
      <main className="min-h-screen w-full">
        <div className="mx-auto max-w-[1800px] px-6 py-8">
          {children}
        </div>
      </main>
    </>
  )
}