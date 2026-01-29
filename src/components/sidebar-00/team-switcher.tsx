"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronsUpDown, ChevronRight, Plus } from "lucide-react";
import * as React from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import { ZodBoolean } from "zod";

export type TeamItem = {
  id: string
  name: string
  logo?: string
  subtitle?: string
  description?: string
  type: 'agency' | 'subaccount'
  isActive?: boolean
  subaccounts?: TeamItem[]
}

export type Team = TeamItem[]

type TeamSwitcherProps = {
  items: Team
  whitelabel?: boolean
  activeItemId?: string
  onSwitch?: (itemId: string, type: 'agency' | 'subaccount') => void
  onCreateSubAccount?: () => void
  canCreateSubAccount?: boolean
  type: 'agency' | 'subaccount'
}

const TeamSwitcher = ({
  items,
  activeItemId,
  onSwitch,
  onCreateSubAccount,
  canCreateSubAccount = false,
  type, 
  whitelabel = false,
}: TeamSwitcherProps) => {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(items[0]);

  React.useEffect(() => {
    const foundTeam = items.find((item) => item.id === activeItemId);
    if (foundTeam) {
      setActiveTeam(foundTeam);
    }
  }, [activeItemId, items]);

  if (!activeTeam) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-background text-foreground">
                {activeTeam.logo ? (
                  <AspectRatio ratio={16 / 8}>
                    <Image
                      src={activeTeam.logo}
                      alt="Sidebar Logo"
                      fill
                      className="rounded-md object-contain"
                    />
                  </AspectRatio>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                    {activeTeam.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs">{activeTeam.type}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg mb-4"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {items.map((item, index) => {
              const hasSubaccounts = item.subaccounts && item.subaccounts.length > 0;
              const shouldDefaultOpen = type === 'subaccount' && hasSubaccounts;

              if (hasSubaccounts) {
                return (
                  <DropdownMenuSub key={item.id} defaultOpen={shouldDefaultOpen}>
                    <DropdownMenuSubTrigger className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        {item.logo ? (
                          <Image
                            src={item.logo}
                            alt={`${item.name} Logo`}
                            width={16}
                            height={16}
                            className="size-4 shrink-0"
                          />
                        ) : (
                          <div className="flex size-4 items-center justify-center text-xs font-semibold">
                            {item.name.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {item.name}
                      <ChevronRight className="ml-auto size-4" />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveTeam(item);
                          onSwitch?.(item.id, item.type);
                        }}
                        className="gap-2 p-2"
                      >
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          {item.logo ? (
                            <Image
                              src={item.logo}
                              alt={`${item.name} Logo`}
                              width={16}
                              height={16}
                              className="size-4 shrink-0"
                            />
                          ) : (
                            <div className="flex size-4 items-center justify-center text-xs font-semibold">
                              {item.name.substring(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {item.name}
                      </DropdownMenuItem>
                      {item.subaccounts?.map((subaccount) => (
                        <DropdownMenuItem
                          key={subaccount.id}
                          onClick={() => {
                            setActiveTeam(subaccount);
                            onSwitch?.(subaccount.id, subaccount.type);
                          }}
                          className="gap-2 p-2"
                        >
                          <div className="flex size-6 items-center justify-center rounded-sm border">
                            {subaccount.logo ? (
                              <Image
                                src={subaccount.logo}
                                alt={`${subaccount.name} Logo`}
                                width={16}
                                height={16}
                                className="size-4 shrink-0"
                              />
                            ) : (
                              <div className="flex size-4 items-center justify-center text-xs font-semibold">
                                {subaccount.name.substring(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {subaccount.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                );
              }

              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => {
                    setActiveTeam(item);
                    onSwitch?.(item.id, item.type);
                  }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt={`${item.name} Logo`}
                        width={16}
                        height={16}
                        className="size-4 shrink-0"
                      />
                    ) : (
                      <div className="flex size-4 items-center justify-center text-xs font-semibold">
                        {item.name.substring(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {item.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            })}
            {type === 'agency' && canCreateSubAccount && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onCreateSubAccount}
                  className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Add team</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

TeamSwitcher.displayName = "TeamSwitcher";

export { TeamSwitcher };