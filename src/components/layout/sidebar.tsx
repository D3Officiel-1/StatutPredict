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
import {
  LayoutDashboard,
  Settings,
  Power,
  LogOut,
  ShieldCheck,
  BrainCircuit,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const AppSidebar = () => {
  const pathname = usePathname();
  const { state } = useSidebar();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
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
              href="/"
              tooltip="Page de Statut"
              target="_blank"
            >
              <ShieldCheck />
              <span>Page de Statut</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
      </SidebarFooter>
    </>
  );
};

export default AppSidebar;
