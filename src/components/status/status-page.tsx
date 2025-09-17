'use client';

import { useState, useEffect } from 'react';
import { Power } from 'lucide-react';
import AppStatusBadge from './app-status-badge';
import { applications as initialApplications } from '@/lib/data';
import type { Application } from '@/types';
import { Button } from '../ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function StatusPage() {
  const [apps, setApps] = useState<Application[]>(initialApplications);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  const allSystemsOperational = apps.every(app => app.status === 'active');

  return (
    <div className="min-h-screen">
      <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex-1">
            <Link href="/login" className="flex items-center gap-3">
              <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={40} height={40} alt="Statut Predict Logo" />
              <span className="text-lg font-bold font-headline text-foreground">
                Statut Predict
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex flex-1 justify-center items-center gap-6 text-sm font-medium">
              <Link href="#" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Predict
              </Link>
              <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Statut
              </Link>
              <Link href="/maintenance" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Maintenance
              </Link>
              <Link href="#" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Chaîne
              </Link>
          </nav>
          <div className="flex-1"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
            <div
              className={`flex items-center gap-3 text-xl font-bold ${
                allSystemsOperational ? 'text-green-500' : 'text-orange-500'
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full ${
                  allSystemsOperational ? 'bg-green-500' : 'bg-orange-500'
                }`}
              ></div>
              <span>
                {allSystemsOperational
                  ? 'Tous les systèmes sont opérationnels'
                  : 'Certains systèmes sont en maintenance'}
              </span>
            </div>
            <p className="mt-2 text-muted-foreground">
              Dernière mise à jour le{' '}
              {lastUpdated
                ? lastUpdated.toLocaleString('fr-FR', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                  })
                : 'chargement...'}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight font-headline">
              Statut des applications
            </h2>
            <div className="space-y-4">
              {apps.map(app => (
                <AppStatusBadge key={app.id} app={app} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 Statut Predict — #D3 Officiel</p>
      </footer>
    </div>
  );
}
