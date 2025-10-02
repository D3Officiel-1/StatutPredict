
'use client';

import { useState, useEffect }
from 'react';
import { collection, writeBatch, getDocs, serverTimestamp, addDoc, onSnapshot } from 'firebase/firestore';
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
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Progress } from '@/components/ui/progress';
import type { Application } from '@/types';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [revenueByApp, setRevenueByApp] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAddAppDialogOpen, setIsAddAppDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const sales = [
        { name: "Jan", total: Math.floor(Math.random() * 2000) + 500 },
        { name: "Fév", total: Math.floor(Math.random() * 3000) + 700 },
        { name: "Mar", total: Math.floor(Math.random() * 2500) + 600 },
        { name: "Avr", total: Math.floor(Math.random() * 4000) + 800 },
        { name: "Mai", total: Math.floor(Math.random() * 3500) + 900 },
        { name: "Jui", total: Math.floor(Math.random() * 5000) + 1200 },
        { name: "Jul", total: Math.floor(Math.random() * 4800) + 1100 },
        { name: "Aoû", total: Math.floor(Math.random() * 5500) + 1500 },
        { name: "Sep", total: Math.floor(Math.random() * 5200) + 1400 },
        { name: "Oct", total: Math.floor(Math.random() * 6000) + 1600 },
        { name: "Nov", total: Math.floor(Math.random() * 5800) + 1550 },
        { name: "Déc", total: Math.floor(Math.random() * 7000) + 2000 },
    ];
    setSalesData(sales);

    const unsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
        const appsData: Application[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Application));
        
        const appRevenueData = appsData.map(app => ({
            name: app.name,
            value: Math.floor(Math.random() * 10000) + 2000 // Dummy revenue data
        }));
        setRevenueByApp(appRevenueData);
    });

    return () => unsubscribe();
  }, []);
  
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

  const totalRevenue = 45231.89;
  const revenueGoal = 50000;
  const revenueProgress = (totalRevenue / revenueGoal) * 100;
  
  const totalSubscriptions = 2350;
  const subscriptionsGoal = 3000;
  const subscriptionsProgress = (totalSubscriptions / subscriptionsGoal) * 100;

  const totalSignups = 12234;
  const signupsGoal = 15000;
  const signupsProgress = (totalSignups / signupsGoal) * 100;

  const activeUsers = 573;
  const activeUsersGoal = 1000;
  const activeUsersProgress = (activeUsers / activeUsersGoal) * 100;

  const recentActivities = [
    { type: 'user', description: 'Nouvel utilisateur : john.doe@example.com', time: 'il y a 5 minutes' },
    { type: 'status', description: 'L\'app "Portail Client" est passée en maintenance', time: 'il y a 2 heures' },
    { type: 'user', description: 'Nouvel utilisateur : jane.doe@example.com', time: 'il y a 8 heures' },
    { type: 'discount', description: 'Nouveau code promo "SUMMER24" créé', time: 'il y a 1 jour' },
  ];

  if (!isClient) {
    return (
        <div className="flex items-center justify-center h-full">
            <CustomLoader size="large" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle as="h2" className="font-headline text-2xl lg:text-3xl">
                Bonjour, Bienvenue !
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                Voici le résumé de l'activité de votre plateforme.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/" target="_blank">
                  <ExternalLink />
                  Page de statut
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle as="h3" className="text-sm font-medium">
              Revenu Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} FCFA</div>
            <p className="text-xs text-muted-foreground">
              +20.1% depuis le mois dernier
            </p>
            <Progress value={revenueProgress} className="mt-4 h-2" />
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
            <div className="text-2xl font-bold">+{totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +180.1% depuis le mois dernier
            </p>
            <Progress value={subscriptionsProgress} className="mt-4 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle as="h3" className="text-sm font-medium">Inscriptions</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSignups.toLocaleString('fr-FR')}</div>
            <p className="text-xs text-muted-foreground">
              +19% depuis le mois dernier
            </p>
            <Progress value={signupsProgress} className="mt-4 h-2" />
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
            <div className="text-2xl font-bold">+{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +201 depuis la dernière heure
            </p>
             <Progress value={activeUsersProgress} className="mt-4 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle as="h3">Vue d'ensemble des revenus</CardTitle>
            <CardDescription>
              Aperçu des revenus mensuels pour l'année en cours.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
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
                          tickFormatter={(value) => `${(value as number / 1000)}k`}
                      />
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))'
                        }}
                      />
                      <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle as="h3">Répartition des revenus</CardTitle>
                <CardDescription>Part des revenus par application.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={revenueByApp}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {revenueByApp.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))'
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle as="h3">Activité Récente</CardTitle>
          <CardDescription>
            Un journal des derniers événements sur la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="bg-muted rounded-full p-2">
                {activity.type === 'user' && <Users className="h-4 w-4 text-muted-foreground" />}
                {activity.type === 'status' && <ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                {activity.type === 'discount' && <DollarSign className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}

    

    