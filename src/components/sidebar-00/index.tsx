import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar as SidebarMenu } from "@/components/sidebar-00/app-sidebar";
import { getUserAccessibleTeams } from "../../lib/features/iam/authz/permissions";
import type { Route } from "@/components/sidebar-00/nav-main";
import type { NotificationWithUser } from "../../lib/types";
import { auth } from "@/auth";
import type { Notification } from "./nav-notifications";
import type { ReactNode } from "react";

type Props = {
  id: string;
  type: "agency" | "subaccount";
  notifications: Notification[];
  children: ReactNode;
}

const Sidebar = async ({ id, type, notifications, children }: Props) => {
  if (!id || !type) return null;
  const session = await auth();
  if (!session?.user) return null;

  // Get user's accessible teams with nested subaccounts
  const teams = await getUserAccessibleTeams();

  return (
    <SidebarProvider defaultOpen={true}>
    <div className="relative flex h-screen w-full">
      <SidebarMenu id={id} type={type} teams={teams} notifications={notifications} />
      <SidebarInset className="flex flex-col" >
        {children}
      </SidebarInset>
      </div>
            {/* <div className="relative flex h-screen w-full">
              <DashboardSidebar />
              <SidebarInset className="flex flex-col" />
            </div> */}
    </SidebarProvider>
  );
}

Sidebar.displayName = "Sidebar";

export default Sidebar;