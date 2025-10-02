
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
  HeartPulse,
  Users,
  TicketPercent,
  Banknote,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const AppSidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path || pathname.startsWith('/dashboard');
    return pathname.startsWith(path) && path !== '/';
  };

  return (
    <div className="flex flex-col h-full bg-background/90 backdrop-blur-sm border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={40} height={40} alt="Statut Predict Logo" />
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">
            Statut Predict
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 flex items-center justify-center p-2">
        <SidebarMenu className="w-full text-center">
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={false}
              tooltip="Page de Statut Publique"
              className="justify-center text-lg"
            >
              <Link href="/" target="_blank">
                <ShieldCheck className="h-5 w-5" />
                <span>Page Publique</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip="Tableau de bord"
              className="justify-center text-lg"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                <span>Tableau de bord</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/status')}
              tooltip="Statut des applications"
              className="justify-center text-lg"
            >
              <Link href="/status">
                <HeartPulse className="h-5 w-5" />
                <span>Statut</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/notifications')}
              tooltip="Notifications"
              className="justify-center text-lg"
            >
              <Link href="/notifications">
                <Send className="h-5 w-5" />
                <span>Notifications</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/pricing')}
              tooltip="Tarifs"
              className="justify-center text-lg"
            >
              <Link href="/pricing">
                <Banknote className="h-5 w-5" />
                <span>Tarifs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/users')}
              tooltip="Utilisateurs"
              className="justify-center text-lg"
            >
              <Link href="/users">
                <Users className="h-5 w-5" />
                <span>Utilisateurs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/discounts')}
              tooltip="Codes de réduction"
              className="justify-center text-lg"
            >
              <Link href="/discounts">
                <TicketPercent className="h-5 w-5" />
                <span>Codes de réduction</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/maintenance-programs')}
              tooltip="Maintenance"
              className="justify-center text-lg"
            >
              <Link href="/maintenance-programs">
                <Wrench className="h-5 w-5" />
                <span>Maintenance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              isActive={isActive('/settings')}
              tooltip="Paramètres"
              className="justify-center text-lg"
            >
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">© 2025 Statut Predict — #D3 Officiel</p>
      </SidebarFooter>
    </div>
  );
};

export default AppSidebar;
