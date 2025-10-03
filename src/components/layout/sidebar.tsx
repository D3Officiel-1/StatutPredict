
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
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const AppSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile, isMobile, state } = useSidebar();

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path || pathname.startsWith('/dashboard');
    return pathname.startsWith(path) && path !== '/';
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/90 backdrop-blur-sm border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden" onClick={handleLinkClick}>
          <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={40} height={40} alt="Statut Predict Logo" className="shrink-0" />
          <div className={cn("transition-all duration-300", state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-auto opacity-100")}>
            <span className="text-lg font-semibold text-sidebar-foreground whitespace-nowrap">
              Statut Predict
            </span>
          </div>
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="flex-1 flex flex-col p-4">
        <SidebarMenu className="w-full flex-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip="Tableau de bord"
              className="justify-start text-base"
            >
              <Link href="/dashboard" onClick={handleLinkClick}>
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
              className="justify-start text-base"
            >
              <Link href="/status" onClick={handleLinkClick}>
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
              className="justify-start text-base"
            >
              <Link href="/notifications" onClick={handleLinkClick}>
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
              className="justify-start text-base"
            >
              <Link href="/pricing" onClick={handleLinkClick}>
                <Banknote className="h-5 w-5" />
                <span>Tarifs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/discounts')}
              tooltip="Codes de réduction"
              className="justify-start text-base"
            >
              <Link href="/discounts" onClick={handleLinkClick}>
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
              className="justify-start text-base"
            >
              <Link href="/maintenance-programs" onClick={handleLinkClick}>
                <Wrench className="h-5 w-5" />
                <span>Maintenance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/users')}
              tooltip="Utilisateurs"
              className="justify-start text-base"
            >
              <Link href="/users" onClick={handleLinkClick}>
                <Users className="h-5 w-5" />
                <span>Utilisateurs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              isActive={isActive('/settings')}
              tooltip="Paramètres"
              className="justify-start text-base"
            >
              <Link href="/settings" onClick={handleLinkClick}>
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu className="w-full mt-auto">
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={false}
              tooltip="Page de Statut Publique"
              className="justify-start text-base"
            >
              <Link href="/" target="_blank" onClick={handleLinkClick}>
                <ShieldCheck className="h-5 w-5" />
                <span>Page Publique</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className={cn(
        "p-4 border-t border-border/50 text-center transition-opacity duration-300",
        state === 'collapsed' && !isMobile && "opacity-0"
      )}>
        <p className="text-xs text-muted-foreground whitespace-nowrap">© 2025 Statut Predict — #D3 Officiel</p>
      </SidebarFooter>
    </div>
  );
};

export default AppSidebar;
