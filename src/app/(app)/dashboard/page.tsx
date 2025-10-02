
'use client';

import { useState } from 'react';
import { collection, writeBatch, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';
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
      const historyCollection = collection(db, 'app_status_history');

      appsSnapshot.forEach((doc) => {
        batch.update(doc.ref, { status: true }); // true for maintenance
        
        // We don't use batch for addDoc as it's not supported in the same way.
        // We will add history documents separately.
      });

      await batch.commit();

      // Now, add history records for each app
      const historyPromises = appsSnapshot.docs.map(doc => {
        return addDoc(historyCollection, {
          appId: doc.id,
          status: true, // true for maintenance
          timestamp: serverTimestamp(),
        });
      });

      await Promise.all(historyPromises);

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
    </div>
  );
}
