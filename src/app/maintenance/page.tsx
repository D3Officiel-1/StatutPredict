
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const maintenanceSchedule = [
  {
    id: 1,
    date: '25 Octobre 2025',
    time: '02:00 - 04:00 (CET)',
    description: 'Mise à jour majeure de l\'infrastructure serveur pour améliorer les performances et la sécurité. Une interruption de service est à prévoir.',
    apps: ['App principale', 'API de facturation'],
  },
  {
    id: 2,
    date: '15 Novembre 2025',
    time: '03:00 - 03:30 (CET)',
    description: 'Déploiement de nouvelles fonctionnalités sur le portail client. L\'accès pourrait être intermittent.',
    apps: ['Portail Client'],
  },
  {
    id: 3,
    date: '05 Décembre 2025',
    time: '23:00 - 23:59 (CET)',
    description: 'Maintenance de routine de la base de données pour optimiser les performances.',
    apps: ['Tous les services'],
  },
];

export default function MaintenancePage() {
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Maintenances programmées</h1>
            <p className="mt-2 text-muted-foreground">
              Voici la liste des prochaines opérations de maintenance prévues sur nos systèmes.
            </p>
          </div>

          <div className="space-y-6">
            {maintenanceSchedule.map((event) => (
              <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle as="h3" className="text-xl font-headline">{event.description}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <div className="flex items-center gap-2">
                         <Calendar className="h-4 w-4" />
                         <span>{event.date}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Clock className="h-4 w-4" />
                         <span>{event.time}</span>
                       </div>
                     </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-semibold mb-2">Services impactés :</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.apps.map((app, index) => (
                        <span key={index} className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

       <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 Statut Predict — #D3 Officiel</p>
      </footer>
    </div>
  );
}
