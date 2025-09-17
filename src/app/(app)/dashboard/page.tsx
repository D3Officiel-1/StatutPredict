
'use client';

import { useState } from 'react';
import { collection, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Plus, ExternalLink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AppList from '@/components/dashboard/app-list';
import NotificationForm from '@/components/dashboard/notification-form';
import Link from 'next/link';
import AddAppDialog from '@/components/settings/add-app-dialog';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '@/components/ui/custom-loader';


export default function DashboardPage() {
  const activeAppsCount = 4;
  const totalAppsCount = 5;
  const [isAddAppDialogOpen, setIsAddAppDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleGlobalMaintenance = async () => {
    setIsSubmitting(true);
    try {
      const appsCollection = collection(db, 'applications');
      const appsSnapshot = await getDocs(appsCollection);
      const batch = writeBatch(db);

      appsSnapshot.forEach((doc) => {
        batch.update(doc.ref, { status: false });
      });

      await batch.commit();
      toast({
        title: 'Maintenance globale activée',
        description: 'Toutes les applications sont maintenant en mode maintenance.',
      });
    } catch (error) {
      console.error("Error setting global maintenance: ", error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer la maintenance globale. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-0 shadow-none">
        <CardHeader className="p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle as="h2" className="font-headline text-2xl">
                Bonjour !
              </CardTitle>
              <CardDescription className="mt-1">
                Voici l'état de vos applications. {activeAppsCount} sur {totalAppsCount} sont actives.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/" target="_blank">
                  <ExternalLink />
                  Voir la page de statut
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <ShieldAlert />
                    Maintenance globale
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action mettra toutes vos applications en mode maintenance.
                      Les utilisateurs ne pourront pas y accéder.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGlobalMaintenance} disabled={isSubmitting}>
                      {isSubmitting ? <CustomLoader /> : 'Confirmer'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AddAppDialog
                open={isAddAppDialogOpen}
                onOpenChange={setIsAddAppDialogOpen}
              >
                <Button>
                  <Plus />
                  Ajouter une app
                </Button>
              </AddAppDialog>
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
