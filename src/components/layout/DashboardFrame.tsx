"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { SidebarNav } from "@/components/layout/SidebarNav"

interface DashboardFrameProps {
  children: ReactNode
  className?: string
  userProfile?: {
    username: string
    firstName: string
    lastName: string
    profileImageUrl: string | null
  }
}

export function DashboardFrame({ children, className, userProfile }: DashboardFrameProps) {
  return (
    <>
      {userProfile && <SidebarNav userProfile={userProfile} />}
      <main className={cn("min-h-screen w-full", userProfile ? "pl-20" : "", className)}>
        <div className="mx-auto max-w-[1800px] px-6 py-8">
          {children}
        </div>
      </main>
    </>
  )
}