'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User as UserIcon, BrainCircuit } from 'lucide-react';
import { usePathname } from 'next/navigation';

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/settings')) {
    return 'Paramètres';
  }
  if (pathname.startsWith('/dashboard')) {
    return 'Tableau de bord';
  }
  return 'Centre de Statut';
}

export default function AppHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold font-headline">{pageTitle}</h1>
      </div>

    </header>
  );
}
