'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Power, CheckCircle2, Megaphone, ChevronDown, ShieldAlert } from 'lucide-react';
import type { Application, AppStatusHistory } from '@/types';
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
import { Skeleton } from '../ui/skeleton';
import PwaInstallButton from '../pwa-install-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const getStatusForDay = (day: Date, history: AppStatusHistory[], currentStatus: boolean): 'operational' | 'maintenance' | 'partial' | 'unknown' => {
  const startOfDay = new Date(day);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(day);
  endOfDay.setHours(23, 59, 59, 999);

  const relevantHistory = history.filter(event => {
    const eventDate = event.timestamp.toDate();
    return eventDate >= startOfDay && eventDate <= endOfDay;
  });

  const historyBeforeDay = history.filter(event => event.timestamp.toDate() < startOfDay);
  const lastStatusBeforeDay = historyBeforeDay.length > 0 ? historyBeforeDay[0].status : currentStatus;

  if (relevantHistory.length === 0) {
    return lastStatusBeforeDay ? 'maintenance' : 'operational';
  }

  // Note: status: true is maintenance, false is operational
  const statuses = [lastStatusBeforeDay, ...relevantHistory.map(h => h.status)];
  const hasMaintenance = statuses.includes(true);
  const hasOperational = statuses.includes(false);

  if (hasMaintenance && !hasOperational) return 'maintenance';
  if (!hasMaintenance && hasOperational) return 'operational';
  if (hasMaintenance && hasOperational) return 'partial';
  
  return 'unknown';
};


export default function StatusPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'applications'), orderBy('name'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const appsDataPromises = snapshot.docs.map(async (doc) => {
        const appData = { id: doc.id, ...doc.data() } as Application;
        
        const historyQuery = query(
          collection(db, 'app_status_history'), 
          where('appId', '==', appData.id), 
          where('timestamp', '>=', thirtyDaysAgo),
          orderBy('timestamp', 'desc')
        );
        const historySnapshot = await getDocs(historyQuery);
        appData.statusHistory = historySnapshot.docs.map(d => ({...d.data(), timestamp: d.data().timestamp } as AppStatusHistory));

        return appData;
      });

      const appsData = await Promise.all(appsDataPromises);
      setApps(appsData);
      setLastUpdated(new Date());
      setLoading(false);
    }, (error) => {
        console.error("Erreur de chargement des applications: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const allSystemsOperational = apps.every(app => !app.status); // false = operational
  const operationalApps = apps.filter(app => !app.status).length;
  const totalApps = apps.length;

  const groupedApps = apps.reduce((acc, app) => {
    const groupName = app.name.includes("XalaFlix") ? "XalaFlix" : "Services Généraux";
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(app);
    return acc;
  }, {} as Record<string, Application[]>);

  const StatusHeaderSkeleton = () => (
    <div className="mb-8 text-center flex flex-col items-center">
      <Skeleton className="h-12 w-12 rounded-full mb-4" />
      <Skeleton className="h-10 w-3/4 mb-2" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );

  const AccordionSkeleton = () => (
    <div className="space-y-6">
        {Array.from({length: 2}).map((_, i) => (
            <Card key={i} className="bg-card/50">
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-20 w-full" />
                   </div>
                </CardContent>
            </Card>
        ))}
    </div>
  );

  const renderStatusBars = (app: Application) => {
    const days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d;
    });

    return (
      <TooltipProvider>
        <div className="flex gap-0.5 w-full h-4">
          {days.map((day, i) => {
            const status = getStatusForDay(day, app.statusHistory || [], app.status);
            let bgColor = 'bg-gray-300 dark:bg-gray-600';
            let tooltipText = `Statut inconnu le ${day.toLocaleDateString()}`;

            switch (status) {
              case 'operational':
                bgColor = 'bg-green-500';
                tooltipText = `Opérationnel le ${day.toLocaleDateString()}`;
                break;
              case 'maintenance':
                bgColor = 'bg-orange-500';
                tooltipText = `En maintenance le ${day.toLocaleDateString()}`;
                break;
              case 'partial':
                bgColor = 'bg-yellow-500';
                tooltipText = `Maintenance partielle le ${day.toLocaleDateString()}`;
                break;
            }
            
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className={`flex-1 ${bgColor} rounded-sm`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }


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
               <Link href="/canal" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Canal
              </Link>
              <Link href="/predict" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Predict
              </Link>
              <Link href="/" className="text-foreground transition-colors hover:text-foreground/80">
                  Statut
              </Link>
              <Link href="/maintenance" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Maintenance
              </Link>
              <Link href="/chaine" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Chaîne
              </Link>
          </nav>
          <PwaInstallButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-5xl">
            {loading ? <StatusHeaderSkeleton /> : (
                 <div className="mb-8 text-center">
                    {allSystemsOperational ? (
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    ) : (
                        <ShieldAlert className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    )}
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        { allSystemsOperational ? "Tous les services sont opérationnels" : "Certains services sont en maintenance"}
                    </h1>
                    <p className="text-muted-foreground">
                        {operationalApps} sur {totalApps} services sont actifs.
                        Dernière mise à jour le{' '}
                        {lastUpdated
                            ? lastUpdated.toLocaleString('fr-FR', {
                                dateStyle: 'medium',
                                timeStyle: 'medium',
                            })
                            : 'chargement...'}
                    </p>
                </div>
            )}
         
          <Alert className="mb-8 bg-card border-card-border">
            <Megaphone className="h-4 w-4" />
            <AlertDescription>
            Bienvenue sur le centre névralgique de Statut Predict. Suivez en temps réel la pulsation de nos services, conçus pour une performance et une fiabilité sans compromis. Votre tranquillité d'esprit est notre priorité. 🚀
            </AlertDescription>
          </Alert>

          {loading ? <AccordionSkeleton /> : (
            <Accordion type="multiple" defaultValue={Object.keys(groupedApps)} className="w-full space-y-6">
                {Object.entries(groupedApps).map(([groupName, groupApps]) => {
                    const isGroupOperational = groupApps.every(app => !app.status);
                    return (
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
                                    <Badge variant={isGroupOperational ? 'default' : 'destructive'} className={isGroupOperational ? `bg-green-500/20 text-green-500 border-green-500/30` : ''}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> {isGroupOperational ? 'Opérationnel' : 'Partiellement Opérationnel'}
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
                                                {!app.status ? (
                                                     <CheckCircle2 className="h-5 w-5 text-green-400" />
                                                ) : (
                                                     <ShieldAlert className="h-5 w-5 text-orange-400" />
                                                )}
                                               
                                                <p className="font-medium text-foreground">{app.name}</p>
                                            </div>
                                            <p className={`text-sm ${!app.status ? 'text-green-400' : 'text-orange-400'} font-semibold`}>{!app.status ? 'Opérationnel' : 'Maintenance'}</p>
                                        </div>
                                        
                                        {renderStatusBars(app)}

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
                )})}
            </Accordion>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 Statut Predict — #D3 Officiel</p>
      </footer>
    </div>
  );
}
