'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
        const month = allMonths[date.getMonth()].slice(0,3);
        const year = date.getFullYear();
        return `${month} ${year}`;
    };
    
    const getEndDate = (startDate: Date) => {
        return new Date(startDate.getFullYear(), startDate.getMonth() + 2, 1);
    }
    
    const getDisplayedMonths = (startDate: Date) => {
        const months = [];
        for (let i = 0; i < 3; i++) {
            const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            months.push(`${allMonths[date.getMonth()]} ${date.getFullYear()}`);
        }
        return months;
    };

    const displayedMonths = getDisplayedMonths(currentDate);

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
              <Link href="#" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Chaîne
              </Link>
          </nav>
          <div className="flex-1"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight font-headline">Maintenance</h1>
            <div className="mt-4 flex items-center justify-center gap-4 text-muted-foreground">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-lg font-medium text-foreground">
                    {formatMonthYear(currentDate)} au {formatMonthYear(getEndDate(currentDate))}
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
              const displayDate = new Date(parseInt(year), monthIndex, 1);

              const isVisible = displayDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) &&
                                displayDate <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1);

              if (!isVisible) return null;
              
              return (
                <div key={month}>
                  <h2 className="text-xl font-semibold mb-4 font-headline">{month}</h2>
                  <Card className="bg-card/50">
                    <CardContent className="p-6">
                      {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                        </div>
                      ) : events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                          <CheckCircle className="h-8 w-8 mb-2" />
                          <p>Aucune maintenance</p>
                        </div>
                      ) : (
                          <div className="space-y-6">
                              {events.map(event => (
                                  <div key={event.id}>
                                      <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm text-muted-foreground">{event.date}</p>
                                        <p className="text-sm text-muted-foreground">1 maintenance</p>
                                      </div>
                                      <div className="border rounded-lg p-4 bg-background">
                                          <div className="flex justify-between items-start">
                                              <h3 className="font-semibold text-lg">{event.title}</h3>
                                              <Badge variant={event.status === 'Résolu' ? 'outline' : 'default'}>{event.status}</Badge>
                                          </div>
                                          <div className="mt-4 p-4 rounded-md bg-muted/50">
                                              <div className={`flex items-center gap-2 text-sm ${event.status === 'Résolu' ? 'text-green-400' : 'text-amber-400'}`}>
                                                  <CheckCircle className="h-4 w-4" />
                                                  <span>{event.status} {event.resolvedAt}</span>
                                              </div>
                                              <p className="text-sm text-muted-foreground mt-1 ml-6">
                                                  {event.description}
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                    </CardContent>
                  </Card>
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
