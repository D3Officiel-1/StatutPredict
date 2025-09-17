'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight, Tool } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const upcomingMaintenances = {
  'Décembre 2024': [],
  'Janvier 2025': [
    {
      id: 1,
      date: '03 Janv 2025',
      title: 'Mise à jour du lecteur vidéo',
      status: 'Résolu',
      resolvedAt: '03 Janv à 01:00 CET',
      description: 'Le lecteur vidéo des films et séries peut être indisponible pendant quelques minutes.',
    },
  ],
  'Février 2025': [],
};

const allMonths = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function MaintenancePage() {
    const [currentDate, setCurrentDate] = useState(new Date('2024-12-01'));

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
              <Link href="#" className="text-foreground/60 transition-colors hover:text-foreground/80">
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
              const events = upcomingMaintenances[month as keyof typeof upcomingMaintenances] || [];
              return (
                <div key={month}>
                  <h2 className="text-xl font-semibold mb-4 font-headline">{month}</h2>
                  <Card className="bg-card/50">
                    <CardContent className="p-6">
                      {events.length === 0 ? (
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
                                              <Badge variant="outline">Maintenance</Badge>
                                          </div>
                                          <div className="mt-4 p-4 rounded-md bg-muted/50">
                                              <div className="flex items-center gap-2 text-sm text-green-400">
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
