'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, Globe, Smartphone, Server } from 'lucide-react';
import type { Application } from '@/types';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import PwaInstallButton from '@/components/pwa-install-button';

const AppIcon = ({ type }: { type: Application['type'] }) => {
  const className = "h-6 w-6 text-muted-foreground";
  switch (type) {
    case 'web':
      return <Globe className={className} />;
    case 'mobile':
      return <Smartphone className={className} />;
    case 'api':
      return <Server className={className} />;
    default:
      return null;
  }
};

const CardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
        </CardHeader>
        <CardContent className="flex-grow flex items-end">
            <Skeleton className="h-10 w-full" />
        </CardContent>
    </Card>
);

export default function PredictPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'applications'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsData: Application[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));
      setApps(appsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
              <Link href="/predict" className="text-foreground transition-colors hover:text-foreground/80">
                  Predict
              </Link>
              <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Statut
              </Link>
              <Link href="/maintenance" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Maintenance
              </Link>
              <Link href="https://whatsapp.com/channel/0029VbAyaNz3WHTSsxF39V2n" target="_blank" rel="noopener noreferrer" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Chaîne
              </Link>
          </nav>
          <PwaInstallButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-headline text-center">Prédictions</h1>
            <p className="text-muted-foreground mt-2 text-center">
              Accédez à chacune de vos applications pour visualiser les prédictions et analyses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
                apps.map((app) => (
                <Card key={app.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle as="h3" className="text-lg font-semibold font-headline">{app.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{app.url}</p>
                    </div>
                    <AppIcon type={app.type} />
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                    <Button asChild className="w-full">
                        <Link href={app.url.startsWith('http') ? app.url : `https://${app.url}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Accéder à l'application
                        </Link>
                    </Button>
                    </CardContent>
                </Card>
                ))
            )}
          </div>
        </div>
      </main>

       <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 Statut Predict — #D3 Officiel</p>
      </footer>
    </div>
  );
}
