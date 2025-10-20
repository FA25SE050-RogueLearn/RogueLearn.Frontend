// roguelearn-web/src/components/nav-secondary.tsx
import * as React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  onClick,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
  onClick?: () => void
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {/* MODIFIED: The onClick handler is passed directly to SidebarMenuButton */}
              <SidebarMenuButton
                size="sm"
                className="hover:bg-[#d23187]/20 hover:text-[#f5c16c] border border-[#d23187]/30 bg-[#d23187]/10"
                onClick={onClick}
                // MODIFIED: Set asChild to false when there's an onClick handler, so it renders a button.
                asChild={!onClick}
              >
                {/* MODIFIED: Removed the nested <button>. The content is now rendered directly. */}
                {onClick ? (
                  <>
                    <item.icon className="text-[#f5c16c]" />
                    <span className="text-white/90">{item.title}</span>
                  </>
                ) : (
                  <a href={item.url} className="flex items-center gap-2">
                    <item.icon className="text-[#f5c16c]" />
                    <span className="text-white/90">{item.title}</span>
                  </a>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}