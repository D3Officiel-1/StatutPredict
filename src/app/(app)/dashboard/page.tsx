
'use client';

import { useState } from 'react';
import { collection, writeBatch, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Plus, ExternalLink, Users, DollarSign, Activity, BarChart as BarChartIcon } from 'lucide-react';
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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const salesData = [
  { name: "Jan", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Fév", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Mar", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Avr", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Mai", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Jui", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Jul", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Aoû", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Sep", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Oct", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Nov", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Déc", total: Math.floor(Math.random() * 2000) + 500 },
];

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
      <Card className="border-0 shadow-none bg-transparent">
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle as="h3" className="text-sm font-medium">
              Revenu Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231.89 FCFA</div>
            <p className="text-xs text-muted-foreground">
              +20.1% depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle as="h3" className="text-sm font-medium">
              Abonnements
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle as="h3" className="text-sm font-medium">Inscriptions</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle as="h3" className="text-sm font-medium">
              Utilisateurs Actifs
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 depuis la dernière heure
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle as="h3">Vue d'ensemble</CardTitle>
          <CardDescription>
            Un aperçu de l'activité de votre plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={salesData}>
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}
