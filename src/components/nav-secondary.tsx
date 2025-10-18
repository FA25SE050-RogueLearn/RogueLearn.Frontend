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
              <SidebarMenuButton 
                asChild={!onClick} 
                size="sm"
                className="hover:bg-[#d23187]/20 hover:text-[#f5c16c] border border-[#d23187]/30 bg-[#d23187]/10"
                onClick={onClick}
              >
                {onClick ? (
                  <button type="button" className="flex items-center gap-2">
                    <item.icon className="text-[#f5c16c]" />
                    <span className="text-white/90">{item.title}</span>
                  </button>
                ) : (
                  <a href={item.url}>
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
