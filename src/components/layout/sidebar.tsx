'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const AppSidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={40} height={40} alt="Statut Predict Logo" />
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">
            Statut Predict
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/')}
              tooltip="Page de Statut"
            >
              <Link href="/">
                <ShieldCheck />
                <span>Page de Statut</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip="Tableau de bord"
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Tableau de bord</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/notifications')}
              tooltip="Notifications"
            >
              <Link href="/notifications">
                <Send />
                <span>Notifications</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              isActive={isActive('/settings')}
              tooltip="Paramètres"
            >
              <Link href="/settings">
                <Settings />
                <span>Paramètres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
      </SidebarFooter>
    </>
  );
};

export default AppSidebar;
