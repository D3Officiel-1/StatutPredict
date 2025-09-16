'use client';

import { useState, useEffect } from 'react';
import { Power } from 'lucide-react';
import AppStatusBadge from './app-status-badge';
import { applications as initialApplications } from '@/lib/data';
import type { Application } from '@/types';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function StatusPage() {
  const [apps, setApps] = useState<Application[]>(initialApplications);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  const allSystemsOperational = apps.every(app => app.status === 'active');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Power className="h-6 w-6" />
            </div>
            <span className="text-lg font-bold font-headline text-foreground">
              Statut Predict
            </span>
          </div>
          <Button asChild>
            <Link href="/dashboard">
              Accéder au tableau de bord
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
            <div
              className={`flex items-center gap-3 text-xl font-bold ${
                allSystemsOperational ? 'text-green-600' : 'text-orange-600'
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
        <p>&copy; {new Date().getFullYear()} Statut Predict. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
