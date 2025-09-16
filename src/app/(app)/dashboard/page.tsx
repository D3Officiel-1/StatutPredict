import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Plus } from 'lucide-react';
import AppList from '@/components/dashboard/app-list';
import NotificationForm from '@/components/dashboard/notification-form';

export default function DashboardPage() {
  const activeAppsCount = 4;
  const totalAppsCount = 5;

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-0 shadow-none">
        <CardHeader className="p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle as="h2" className="font-headline text-2xl">
                Bonjour, {`Alice`}!
              </CardTitle>
              <CardDescription className="mt-1">
                Voici l'état de vos applications. {activeAppsCount} sur {totalAppsCount} sont actives.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive">
                <ShieldAlert />
                Maintenance globale
              </Button>
              <Button>
                <Plus />
                Ajouter une app
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 font-headline">Statut des Applications</h3>
          <AppList />
        </div>
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 font-headline">Notifications Centralisées</h3>
          <NotificationForm />
        </div>
      </div>
    </div>
  );
}
