
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
            <span className="text-lg font-semibold font-headline text-sidebar-foreground whitespace-nowrap">
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

      <SidebarContent className="flex-1 flex items-center justify-center p-2">
        <SidebarMenu className="w-full">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip="Tableau de bord"
              className="justify-center text-lg"
            >
              <Link href="/dashboard" onClick={handleLinkClick}>
                <LayoutDashboard className="h-5 w-5" />
                <span className={cn(
                  "transition-all duration-200", 
                  state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-full opacity-100"
                )}>Tableau de bord</span>
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
              <Link href="/status" onClick={handleLinkClick}>
                <HeartPulse className="h-5 w-5" />
                <span className={cn(
                  "transition-all duration-200", 
                  state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-full opacity-100"
                )}>Statut</span>
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
              <Link href="/notifications" onClick={handleLinkClick}>
                <Send className="h-5 w-5" />
                <span className={cn(
                  "transition-all duration-200", 
                  state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-full opacity-100"
                )}>Notifications</span>
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
              <Link href="/pricing" onClick={handleLinkClick}>
                <Banknote className="h-5 w-5" />
                <span className={cn(
                  "transition-all duration-200", 
                  state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-full opacity-100"
                )}>Tarifs</span>
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
              <Link href="/discounts" onClick={handleLinkClick}>
                <TicketPercent className="h-5 w-5" />
                <span className={cn(
                  "transition-all duration-200", 
                  state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-full opacity-100"
                )}>Codes de réduction</span>
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
              <Link href="/maintenance-programs" onClick={handleLinkClick}>
                <Wrench className="h-5 w-5" />
                <span className={cn(
                  "transition-all duration-200", 
                  state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-full opacity-100"
                )}>Maintenance</span>
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
              <Link href="/users" onClick={handleLinkClick}>
                <Users className="h-5 w-5" />
                <span className={cn(
                  "transition-all duration-200", 
                  state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-full opacity-100"
                )}>Utilisateurs</span>
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
              <Link href="/settings" onClick={handleLinkClick}>
                <Settings className="h-5 w-5" />
                <span className={cn(
                  "transition-all duration-200", 
                  state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-full opacity-100"
                )}>Paramètres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={false}
              tooltip="Page de Statut Publique"
              className="justify-center text-lg"
            >
              <Link href="/" target="_blank" onClick={handleLinkClick}>
                <ShieldCheck className="h-5 w-5" />
                <span className={cn(
                  "transition-all duration-200", 
                  state === 'collapsed' && !isMobile ? "w-0 opacity-0" : "w-full opacity-100"
                )}>Page Publique</span>
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

    