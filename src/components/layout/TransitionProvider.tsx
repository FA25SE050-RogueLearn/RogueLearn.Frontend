"use client"

import { ReactNode } from "react"
import { PageTransitionProvider } from "./PageTransition"

export function TransitionProvider({ children }: { children: ReactNode }) {
  return (
    <PageTransitionProvider>
      {children}
    </PageTransitionProvider>
  )
}
