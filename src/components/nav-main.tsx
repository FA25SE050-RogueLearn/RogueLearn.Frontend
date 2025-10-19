"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url?: string
    icon: LucideIcon
    isActive?: boolean
    onSelect?: () => void
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[#f5c16c]/70 uppercase tracking-[0.35em] text-xs">Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              {item.onSelect ? (
                <SidebarMenuButton
                  type="button"
                  tooltip={item.title}
                  onClick={(event) => {
                    event.preventDefault()
                    item.onSelect?.()
                  }}
                  data-active={item.isActive}
                  className="hover:bg-[#d23187]/20 hover:text-[#f5c16c] data-[active=true]:bg-[#d23187]/25 data-[active=true]:text-[#f5c16c] data-[active=true]:border-l-2 data-[active=true]:border-[#d23187]"
                >
                  <item.icon className="text-[#f5c16c]" />
                  <span className="text-white/90">{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  data-active={item.isActive}
                  className="hover:bg-[#d23187]/20 hover:text-[#f5c16c] data-[active=true]:bg-[#d23187]/25 data-[active=true]:text-[#f5c16c] data-[active=true]:border-l-2 data-[active=true]:border-[#d23187]"
                >
                  <a href={item.url ?? "#"}>
                    <item.icon className="text-[#f5c16c]" />
                    <span className="text-white/90">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90 text-[#f5c16c]/70 hover:text-[#f5c16c]">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild className="hover:bg-[#d23187]/15 hover:text-[#f5c16c]">
                            <a href={subItem.url}>
                              <span className="text-white/80">{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
