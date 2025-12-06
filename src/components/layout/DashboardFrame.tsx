"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { SidebarNav } from "@/components/layout/SidebarNav"
import { useUserFullInfo } from "@/hooks/queries/useUserData"

interface DashboardFrameProps {
  children: ReactNode
  className?: string
}

export function DashboardFrame({ children, className }: DashboardFrameProps) {
  const { data: fullInfo } = useUserFullInfo();
  const userProfile = fullInfo?.profile;

  return (
    <>
      <SidebarNav userProfile={userProfile} />
      <main className={cn("min-h-screen w-full pl-20", className)}>
        <div className="mx-auto max-w-[1800px] px-6 py-8">
          {children}
        </div>
      </main>
    </>
  )
}