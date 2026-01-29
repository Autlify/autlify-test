"use client";

import {
  Sidebar as SidebarOptions,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  DollarSign,
  Home,
  Infinity,
  LinkIcon,
  Package2,
  Percent,
  PieChart,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from "lucide-react"; 
import DashboardNavigation from "@/components/sidebar-00/nav-main";
import { NotificationsPopover } from "@/components/sidebar-00/nav-notifications";
import { TeamSwitcher } from "@/components/sidebar-00/team-switcher";
import type { Team } from "@/components/sidebar-00/team-switcher";
import type { Route } from "@/components/sidebar-00/nav-main";
import type { Notification } from "@/components/sidebar-00/nav-notifications";
import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";


type Props = {
  id: string;
  type: "agency" | "subaccount";
  whitelabel?: boolean;
  teams: Team;
  notifications: Notification[];
}

const Sidebar = ({
  id,
  type,
  teams,
  whitelabel = false,
  notifications,
}: Props) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  let logo 
  if (!whitelabel) {
    logo = '/assets/autlify-logo.svg'
  } else {
    if (type === 'agency') {
      logo = teams.find(team => team.id === id)?.logo
    } else {
      const parentAgency = teams.find(item => item.subaccounts?.some(sub => sub.id === id))
      logo = parentAgency?.logo
    }
  }



return (
  <SidebarOptions variant="inset" collapsible="icon" className="border-r">
    <SidebarHeader
      className={cn(
        "flex",
        isCollapsed
          ? "flex-col items-center justify-center gap-3 px-2 py-3"
          : "flex-row items-center justify-between px-4 py-3"
      )}
    >
      <a href="#" className={cn(
        "flex items-center gap-2",
        isCollapsed && "justify-center w-full"
      )}>
        <div className="ml-0">
        <Image
          src={logo || '/assets/autlify-logo.svg'}
          alt="Sidebar Logo"
          width={64}
          height={64}
          className={cn(
            "shrink-0 mr-2",
            isCollapsed ? "w-8 h-8" : "w-8 h-8"
          )}
        />
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-foreground">
            Autlify
          </span>
        )}
      </a>

      {!isCollapsed && (
        <div className="flex items-center gap-2">
          <NotificationsPopover notifications={notifications} />
          <SidebarTrigger />
        </div>
      )}
      {isCollapsed && (
        <div className="flex flex-col items-center gap-2 w-full">
          <NotificationsPopover notifications={notifications} />
          <SidebarTrigger />
        </div>
      )}
    </SidebarHeader>
    <SidebarContent className="gap-0 px-2">
      <DashboardNavigation id={id} type={type} />
    </SidebarContent>
    <SidebarFooter className="px-2 py-3 border-t">
      <TeamSwitcher items={teams} type={type} activeItemId={id} />
    </SidebarFooter>
  </SidebarOptions>
);
}

Sidebar.displayName = "Sidebar";

export { Sidebar };