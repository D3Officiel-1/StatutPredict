
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
    { href: "/canal", label: "Canal" },
    { href: "/predict", label: "Predict" },
    { href: "/", label: "Statut" },
    { href: "/maintenance", label: "Maintenance" },
    { href: "/chaine", label: "Chaîne" },
];

export default function PublicMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5"/>
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full h-full bg-background/90 p-0 border-r border-border/50 backdrop-blur-sm">
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                 <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={32} height={32} alt="Statut Predict Logo" />
                    <span className="text-lg font-bold text-foreground">Statut Predict</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Fermer le menu</span>
                </Button>
            </div>
          <nav className="flex flex-col flex-1 items-center justify-center gap-6 p-6">
            {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "text-2xl font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-105",
                            isActive && "text-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                    >
                        {link.label}
                    </Link>
                );
            })}
          </nav>
           <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/50">
                <p>© 2025 Statut Predict — #D3 Officiel</p>
            </footer>
        </div>
      </SheetContent>
    </Sheet>
  );
}
