
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function PublicMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col gap-6 p-6">
          <Link
            href="/canal"
            className="text-lg font-medium hover:text-foreground/80"
            onClick={() => setIsOpen(false)}
          >
            Canal
          </Link>
          <Link
            href="/predict"
            className="text-lg font-medium hover:text-foreground/80"
            onClick={() => setIsOpen(false)}
          >
            Predict
          </Link>
          <Link
            href="/"
            className="text-lg font-medium hover:text-foreground/80"
            onClick={() => setIsOpen(false)}
          >
            Statut
          </Link>
          <Link
            href="/maintenance"
            className="text-lg font-medium hover:text-foreground/80"
            onClick={() => setIsOpen(false)}
          >
            Maintenance
          </Link>
          <Link
            href="/chaine"
            className="text-lg font-medium hover:text-foreground/80"
            onClick={() => setIsOpen(false)}
          >
            Chaîne
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
