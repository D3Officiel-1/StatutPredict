'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Settings,
  Power,
  LogOut,
} from 'lucide-react';
import { mainUser } from '@/lib/data';

const AppSidebar = () => {
  const pathname = usePathname();
  const { state } = useSidebar();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Power className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">
            Statut Predict
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/dashboard"
              isActive={isActive('/dashboard')}
              tooltip="Tableau de bord"
            >
              <LayoutDashboard />
              <span>Tableau de bord</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              href="/settings"
              isActive={isActive('/settings')}
              tooltip="Paramètres"
            >
              <Settings />
              <span>Paramètres</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="my-2 bg-sidebar-border" />
        <div
          className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
            state === 'collapsed' ? 'justify-center' : ''
          }`}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={mainUser.avatarUrl} alt={mainUser.name} />
            <AvatarFallback>{mainUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {state === 'expanded' && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {mainUser.name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {mainUser.email}
              </p>
            </div>
          )}
        </div>
        <SidebarMenuButton
          href="#"
          className="mt-2"
          tooltip="Déconnexion"
        >
          <LogOut />
          <span>Déconnexion</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </>
  );
};

export default AppSidebar;
