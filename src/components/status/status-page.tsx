'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Power, CheckCircle2, Megaphone, ChevronDown } from 'lucide-react';
import type { Application } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import ResponseTimeChart from '@/components/status/response-time-chart';
import { Badge } from '@/components/ui/badge';

export default function StatusPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
      const appsData: Application[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));
      setApps(appsData);
      setLastUpdated(new Date());
    });

    return () => unsubscribe();
  }, []);

  const allSystemsOperational = apps.every(app => app.status);
  const groupedApps = apps.reduce((acc, app) => {
    const groupName = app.name.includes("XalaFlix") ? "XalaFlix" : "Services Généraux";
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(app);
    return acc;
  }, {} as Record<string, Application[]>);


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
              <Link href="/predict" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Predict
              </Link>
              <Link href="/" className="text-foreground transition-colors hover:text-foreground/80">
                  Statut
              </Link>
              <Link href="/maintenance" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Maintenance
              </Link>
              <Link href="https://whatsapp.com/channel/0029VbAyaNz3WHTSsxF39V2n" target="_blank" rel="noopener noreferrer" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Chaîne
              </Link>
          </nav>
          <div className="flex-1"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
                { allSystemsOperational ? "Tous les services sont opérationnels" : "Certains services sont affectés"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Dernière mise à jour le{' '}
              {lastUpdated
                ? lastUpdated.toLocaleString('fr-FR', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })
                : 'chargement...'}
            </p>
          </div>
          
          <Alert className="mb-8 bg-card border-card-border">
            <Megaphone className="h-4 w-4" />
            <AlertDescription>
              Nous surveillons en continu nos services pour garantir une expérience optimale. Merci pour votre confiance ! 💜
            </AlertDescription>
          </Alert>

          <Accordion type="multiple" defaultValue={Object.keys(groupedApps)} className="w-full space-y-6">
            {Object.entries(groupedApps).map(([groupName, groupApps]) => (
                <AccordionItem value={groupName} key={groupName} className="border-none">
                  <Card className="bg-card/50">
                    <AccordionTrigger className="p-6 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                            <CardHeader className="p-0">
                                <CardTitle as="h2" className="text-xl font-semibold">
                                    {groupName}
                                </CardTitle>
                            </CardHeader>
                            <div className="flex items-center gap-4">
                                <Badge variant={groupApps.every(app => app.status) ? "outline" : "destructive"} className="flex gap-2 items-center">
                                    <CheckCircle2 className="h-4 w-4 text-green-400" /> Opérationnel
                                </Badge>
                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CardContent className="space-y-6">
                            {groupApps.map((app) => (
                                <div key={app.id}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className={`h-5 w-5 ${app.status ? 'text-green-400' : 'text-orange-400'}`}/>
                                            <p className="font-medium text-foreground">{app.name}</p>
                                        </div>
                                        <p className={`text-sm ${app.status ? 'text-green-400' : 'text-orange-400'} font-semibold`}>{app.status ? 'Opérationnel' : 'Maintenance'}</p>
                                    </div>
                                    <div className="flex gap-0.5 w-full h-2">
                                        {Array.from({ length: 30 }).map((_, i) => (
                                            <div key={i} className={`flex-1 ${app.status ? 'bg-green-500' : 'bg-orange-500'} rounded-sm`} />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>Il y a 30 jours</span>
                                        <span>Aujourd'hui</span>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6">
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Temps de réponse</h3>
                                <ResponseTimeChart />
                            </div>
                        </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 Statut Predict — #D3 Officiel</p>
      </footer>
    </div>
  );
}
