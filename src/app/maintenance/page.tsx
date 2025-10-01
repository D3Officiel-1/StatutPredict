'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface MaintenanceEvent {
  id: string;
  date: string; // Keep as string for display consistency
  title: string;
  status: string;
  resolvedAt: string;
  description: string;
}

const allMonths = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const monthNameToNumber: { [key: string]: number } = {
  "Janvier": 0, "Février": 1, "Mars": 2, "Avril": 3, "Mai": 4, "Juin": 5,
  "Juillet": 6, "Août": 7, "Septembre": 8, "Octobre": 9, "Novembre": 10, "Décembre": 11
};

export default function MaintenancePage() {
    const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [maintenances, setMaintenances] = useState<{ [key: string]: MaintenanceEvent[] }>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMaintenances = async () => {
            setIsLoading(true);
            try {
                const maintenanceCollection = collection(db, 'maintenance');
                const q = query(maintenanceCollection, orderBy('date', 'desc'));
                const querySnapshot = await getDocs(q);
                
                const eventsByMonth: { [key: string]: MaintenanceEvent[] } = {};

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const eventDate = (data.date as any).toDate();
                    
                    const monthYearKey = `${allMonths[eventDate.getMonth()]} ${eventDate.getFullYear()}`;
                    
                    if (!eventsByMonth[monthYearKey]) {
                        eventsByMonth[monthYearKey] = [];
                    }

                    eventsByMonth[monthYearKey].push({
                        id: doc.id,
                        date: `${eventDate.getDate().toString().padStart(2, '0')} ${allMonths[eventDate.getMonth()].slice(0,3)} ${eventDate.getFullYear()}`,
                        title: data.title,
                        status: data.status,
                        resolvedAt: data.resolvedAt ? `${(data.resolvedAt as any).toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à ${(data.resolvedAt as any).toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}` : '',
                        description: data.description,
                    });
                });
                
                setMaintenances(eventsByMonth);
            } catch (error) {
                console.error("Erreur lors de la récupération des maintenances: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMaintenances();
    }, []);

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const formatMonthYear = (date: Date) => {
        const month = allMonths[date.getMonth()];
        const year = date.getFullYear();
        return `${month} ${year}`;
    };
    
    const getEndDate = (startDate: Date) => {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + 2);
        return d;
    }
    
    const getDisplayedMonths = () => {
        const months = [];
        for (let i = 0; i < 3; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
            months.push(`${allMonths[date.getMonth()]} ${date.getFullYear()}`);
        }
        return months;
    };

    const displayedMonths = getDisplayedMonths();

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
              <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Statut
              </Link>
              <Link href="/maintenance" className="text-foreground transition-colors hover:text-foreground/80">
                  Maintenance
              </Link>
              <Link href="https://whatsapp.com/channel/0029VbAyaNz3WHTSsxF39V2n" target="_blank" rel="noopener noreferrer" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Chaîne
              </Link>
          </nav>
          <div className="flex-1 flex justify-end items-center gap-4">
            <Image src="https://1win-partners.com/panel/assets/images/android-BwQlK3Xs.svg" width={24} height={24} alt="Android App" />
            <Image src="https://1win-partners.com/panel/assets/images/ios-LCbvsU86.svg" width={24} height={24} alt="Apple App" />
            <Image src="https://i.postimg.cc/g0zDTFgZ/windows.png" width={24} height={24} alt="Windows App" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight font-headline">Historique des maintenances</h1>
            <p className="mt-2 text-muted-foreground">Suivi des incidents et des maintenances planifiées.</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-muted-foreground">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-lg font-medium text-foreground">
                    {formatMonthYear(currentDate)} - {formatMonthYear(getEndDate(currentDate))}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
          </div>

          <div className="space-y-12">
            {displayedMonths.map((month) => {
              const events = maintenances[month] || [];
              const [monthName, year] = month.split(' ');
              const monthIndex = monthNameToNumber[monthName];
              
              return (
                <div key={month}>
                  <h2 className="text-2xl font-semibold mb-4 font-headline">{month}</h2>
                  <div className="relative pl-6 before:absolute before:left-[11px] before:top-0 before:h-full before:w-0.5 before:bg-border">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="flex items-center gap-4 text-muted-foreground py-4">
                           <div className="h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-primary" />
                           </div>
                           <p>Aucune maintenance enregistrée pour ce mois.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {events.map(event => (
                                <div key={event.id} className="relative">
                                    <div className="absolute left-[-11px] top-1 h-6 w-6 rounded-full bg-background border-2 border-orange-400 flex items-center justify-center">
                                        <ShieldAlert className="h-4 w-4 text-orange-400" />
                                    </div>
                                    <div className="pl-8">
                                        <p className="text-sm text-muted-foreground">{event.date}</p>
                                        <h3 className="font-semibold text-lg mt-1">{event.title}</h3>
                                        <div className="mt-2 p-4 rounded-md bg-muted/50 border">
                                            <div className={`flex items-center gap-2 text-sm ${event.status === 'Résolu' ? 'text-green-400' : 'text-amber-400'}`}>
                                                <CheckCircle className="h-4 w-4" />
                                                <span>{event.status} {event.resolvedAt}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

       <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 Statut Predict — #D3 Officiel</p>
      </footer>
    </div>
  );
}
