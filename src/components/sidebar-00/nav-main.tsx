"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuItem as SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { icons } from '@/lib/constants'

export type Route = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  link: string;
  subs?: {
    title: string;
    link: string;
    icon?: React.ReactNode;
  }[];
};

type Props = {
  id: string;
  type: "agency" | "subaccount";
}

export default function DashboardNavigation({ id, type }:  Props) {
  const { state } = useSidebar();
  const [routes, setRoutes] = useState<Route[]>([]);
  const isCollapsed = state === "collapsed";
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
    const agencyRoutes: Route[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'category',
      link: `/agency/${id}`,
    },
    {
      id: 'launchpad',
      title: 'Launchpad',
      icon: 'clipboardIcon',
      link: `/agency/${id}/launchpad`,
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: 'payment',
      link: ``,
      subs: [
        { title: 'Overview', link: `/agency/${id}/billing` },
        { title: 'Invoices', link: `/agency/${id}/billing/invoices` },
        { title: 'Payment Methods', link: `/agency/${id}/billing/payment-methods` },
        { title: 'Subscription', link: `/agency/${id}/billing/subscription` },
        { title: 'Usage', link: `/agency/${id}/billing/usage` },
        { title: 'Credits', link: `/agency/${id}/billing/credits` },
        { title: 'Dunning', link: `/agency/${id}/billing/dunning` },
        { title: 'Coupons', link: `/agency/${id}/billing/coupons` },
        { title: 'Allocations', link: `/agency/${id}/billing/allocations` },
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      link: `/agency/${id}/settings`,
    },
    {
      id: 'subaccounts',
      title: 'Sub Accounts',
      icon: 'person',
      link: `/agency/${id}/all-subaccounts`,
    },
    {
      id: 'team',
      title: 'Team',
      icon: 'shield',
      link: `/agency/${id}/team`,
    },
  ]
  const subAccountRoutes: Route[] = [
    {
      id: 'dashboard',
      title: 'Launchpad',
      icon: 'clipboardIcon',
      link: `/subaccount/${id}/launchpad`,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      link: `/subaccount/${id}/settings`,
    },
    {
      id: 'funnels',
      title: 'Funnels',
      icon: 'pipelines',
      link: `/subaccount/${id}/funnels`,
    },
    {
      id: 'media',
      title: 'Media',
      icon: 'database',
      link: `/subaccount/${id}/media`,
    },
    {
      id: 'automations',
      title: 'Automations',
      icon: 'chip',
      link: `/subaccount/${id}/automations`,
    },
    {
      id: 'pipelines',
      title: 'Pipelines',
      icon: 'flag',
      link: `/subaccount/${id}/pipelines`,
    },
    {
      id: 'contacts',
      title: 'Contacts',
      icon: 'person',
      link: `/subaccount/${id}/contacts`,
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'category',
      link: `/subaccount/${id}`,
    },
  ]

  useEffect(() => {
    if (type === 'agency') {
      setRoutes(agencyRoutes);
    } else if (type === 'subaccount') {
      setRoutes(subAccountRoutes);
    } else {
      setRoutes([]);
    }
  }, [type, id]);

  return (
    <SidebarMenu>
      {routes.map((route) => {
        const isOpen = !isCollapsed && openCollapsible === route.id;
        const hasSubRoutes = !!route.subs?.length;

        return (
          <SidebarMenuItem key={route.id}>
            {hasSubRoutes ? (
              <Collapsible
                open={isOpen}
                onOpenChange={(open) =>
                  setOpenCollapsible(open ? route.id : null)
                }
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={cn(
                      "flex w-full items-center rounded-lg px-2 transition-colors",
                      isOpen
                        ? "bg-sidebar-muted text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-muted hover:text-foreground",
                      isCollapsed && "justify-center"
                    )}
                  >
                    {(() => {
                      const iconData = icons.find((icon) => icon.value === route.icon);
                      if (!iconData) return null;
                      const Icon = iconData.path;
                      return <Icon />;
                    })()}
                    {!isCollapsed && (
                      <span className="ml-2 flex-1 text-sm font-medium">
                        {route.title}
                      </span>
                    )}
                    {!isCollapsed && hasSubRoutes && (
                      <span className="ml-auto">
                        {isOpen ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </span>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {!isCollapsed && (
                  <CollapsibleContent>
                    <SidebarMenuSub className="my-1 ml-3.5 ">
                      {route.subs?.map((subRoute) => (
                        <SidebarMenuSubItem
                          key={`${route.id}-${subRoute.title}`}
                          className="h-auto"
                        >
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={subRoute.link}
                              prefetch={true}
                              className="flex items-center rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-muted hover:text-foreground"
                            >
                              {subRoute.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </Collapsible>
            ) : (
              <SidebarMenuButton tooltip={route.title} asChild>
                <Link
                  href={route.link}
                  prefetch={true}
                  className={cn(
                    "flex items-center rounded-lg px-2 transition-colors text-muted-foreground hover:bg-sidebar-muted hover:text-foreground",
                    isCollapsed && "justify-center"
                  )}
                >
                  {(() => {
                    const iconData = icons.find((icon) => icon.value === route.icon);
                    if (!iconData) return null;
                    const Icon = iconData.path;
                    return <Icon />;
                  })()}
                  {!isCollapsed && (
                    <span className="ml-2 text-sm font-medium">
                      {route.title}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
