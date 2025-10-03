
'use client';

import { useState, useEffect }
from 'react';
import { collection, writeBatch, getDocs, serverTimestamp, addDoc, onSnapshot, query, where, collectionGroup, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Plus, ExternalLink, Users, DollarSign, Activity, BarChart as BarChartIcon, TicketPercent } from 'lucide-react';
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
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar } from 'recharts';
import { Progress, CircleProgress } from '@/components/ui/progress';
import type { Application, PricingPlan, User, PricingItem, DiscountCode, AppStatusHistory } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

type RecentActivity = {
  type: 'user' | 'status' | 'discount';
  description: string;
  time: string;
  timestamp: Date;
  icon: React.ReactNode;
};

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [revenueByApp, setRevenueByApp] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [totalSignups, setTotalSignups] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isAddAppDialogOpen, setIsAddAppDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
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

    const appsQuery = query(collection(db, 'applications'));
    const usersQuery = query(collection(db, 'users'));
    
    // Combined listener for apps and users
    const unsubscribe = onSnapshot(usersQuery, (usersSnapshot) => {
        getDocs(appsQuery).then(async (appsSnapshot) => {
            const appsData = appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
            const appNameMap = new Map(appsData.map(app => [app.id, app.name]));

            // 1. Fetch all plans for all apps
            const allPlans: PricingPlan[] = [];
            const plansPromises = appsData.map(app => getDocs(collection(db, `applications/${app.id}/plans`)));
            const plansSnapshots = await Promise.all(plansPromises);
            plansSnapshots.forEach((planSnap, index) => {
                planSnap.docs.forEach(doc => {
                    allPlans.push({ id: doc.id, appId: appsData[index].id, ...doc.data() } as PricingPlan);
                });
            });
            
            // Map for app revenue: appId -> revenue
            const appRevenueMap = new Map<string, number>(appsData.map(app => [app.id, 0]));
            let activeSubscriptionsCount = 0;

            // 2. Fetch all users and their subscriptions
            const usersDataPromises = usersSnapshot.docs.map(async (userDoc) => {
                const user = { id: userDoc.id, ...userDoc.data() } as User;
                const pricingCol = collection(db, 'users', userDoc.id, 'pricing');
                const pricingSnapshot = await getDocs(pricingCol);
                user.pricingData = pricingSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as PricingItem));
                return user;
            });
            const usersWithPricing = await Promise.all(usersDataPromises);

            // 3. Calculate revenue
            usersWithPricing.forEach(user => {
                user.pricingData?.forEach(subscription => {
                    // Handle new structure
                    if (subscription.appId && subscription.planId && subscription.status === 'active') {
                        activeSubscriptionsCount++;
                        const plan = allPlans.find(p => p.appId === subscription.appId && p.id === subscription.planId);
                        if (plan) {
                            const currentRevenue = appRevenueMap.get(plan.appId) || 0;
                            appRevenueMap.set(plan.appId, currentRevenue + (plan.promoPrice ?? plan.price));
                        }
                    }
                    // Handle legacy structure for 'jetpredict'
                    else if (subscription.actif_jetpredict) {
                        activeSubscriptionsCount++;
                        // Find the app "JetPredict" and one of its plans to associate the revenue
                        const jetpredictApp = appsData.find(app => app.name.toLowerCase().includes('jetpredict'));
                        if (jetpredictApp) {
                            const plan = allPlans.find(p => p.appId === jetpredictApp.id && p.period === subscription.idplan_jetpredict);
                             if (plan) {
                                const currentRevenue = appRevenueMap.get(jetpredictApp.id) || 0;
                                appRevenueMap.set(jetpredictApp.id, currentRevenue + (plan.promoPrice ?? plan.price));
                            }
                        }
                    }
                });
            });

            const revenueByAppData = appsData
                .map(app => ({
                    name: app.name,
                    value: appRevenueMap.get(app.id) || 0
                }))
                .filter(item => item.value > 0); // Filter out apps with no revenue

            const totalRevenueCalculated = Array.from(appRevenueMap.values()).reduce((sum, current) => sum + current, 0);

            setRevenueByApp(revenueByAppData);
            setTotalRevenue(totalRevenueCalculated);
            setTotalSubscriptions(activeSubscriptionsCount);
            
            // 4. Fetch recent activities
            const fetchRecentActivities = async () => {
                const activities: RecentActivity[] = [];

                // New Users
                const newUsersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5));
                const newUsersSnapshot = await getDocs(newUsersQuery);
                newUsersSnapshot.forEach(doc => {
                    const user = doc.data() as User;
                    activities.push({
                        type: 'user',
                        description: `Nouvel utilisateur : ${user.email}`,
                        timestamp: user.createdAt.toDate(),
                        time: formatDistanceToNow(user.createdAt.toDate(), { addSuffix: true, locale: fr }),
                        icon: <Users className="h-4 w-4 text-muted-foreground" />
                    });
                });

                // App Status Changes
                const statusHistoryQuery = query(collection(db, 'app_status_history'), orderBy('timestamp', 'desc'), limit(5));
                const statusHistorySnapshot = await getDocs(statusHistoryQuery);
                statusHistorySnapshot.forEach(doc => {
                    const history = doc.data() as AppStatusHistory;
                    const appName = appNameMap.get(history.appId) || 'App inconnue';
                    const statusText = history.status ? 'est passée en maintenance' : 'est de nouveau opérationnelle';
                    activities.push({
                        type: 'status',
                        description: `L'app "${appName}" ${statusText}`,
                        timestamp: history.timestamp.toDate(),
                        time: formatDistanceToNow(history.timestamp.toDate(), { addSuffix: true, locale: fr }),
                        icon: <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    });
                });

                // New Discount Codes
                const newDiscountsQuery = query(collection(db, 'promo'), orderBy('debutdate', 'desc'), limit(5));
                const newDiscountsSnapshot = await getDocs(newDiscountsQuery);
                newDiscountsSnapshot.forEach(doc => {
                    const discount = doc.data() as DiscountCode;
                    activities.push({
                        type: 'discount',
                        description: `Nouveau code promo : "${discount.code}" créé`,
                        timestamp: discount.debutdate.toDate(),
                        time: formatDistanceToNow(discount.debutdate.toDate(), { addSuffix: true, locale: fr }),
                        icon: <TicketPercent className="h-4 w-4 text-muted-foreground" />
                    });
                });

                // Sort all activities by timestamp
                activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                setRecentActivities(activities.slice(0, 7));
            };
            fetchRecentActivities();

        });

        // Other user-based stats
        setTotalSignups(usersSnapshot.size);
        const activeUsersCount = usersSnapshot.docs.filter(doc => doc.data().isOnline === true).length;
        setActiveUsers(activeUsersCount);
    });

    return () => {
        unsubscribe();
    };
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
      });

      await batch.commit();

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

  const kpiData = [
    { name: 'Revenus', value: totalRevenue, goal: Math.max(totalRevenue * 1.25, 50000), format: (v: number) => `${v.toLocaleString('fr-FR')} FCFA`, icon: DollarSign },
    { name: 'Abonnements', value: totalSubscriptions, goal: Math.max(totalSubscriptions * 1.25, 100), format: (v: number) => `+${v}`, icon: Users },
    { name: 'Inscriptions', value: totalSignups, goal: Math.max(totalSignups * 1.25, 500), format: (v: number) => `+${v.toLocaleString('fr-FR')}`, icon: BarChartIcon },
    { name: 'Utilisateurs Actifs', value: activeUsers, goal: Math.max(activeUsers * 1.25, 100), format: (v: number) => `+${v}`, icon: Activity },
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-2xl lg:text-3xl">
                Bonjour, Bienvenue !
              </h2>
              <CardDescription className="mt-1 text-base">
                Voici le résumé de l'activité de votre plateforme.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
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
        {kpiData.map((kpi, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle as="h3" className="text-sm font-medium">
                {kpi.name}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.format(kpi.value)}</div>
              <p className="text-xs text-muted-foreground">
                Objectif: {kpi.format(kpi.goal)}
              </p>
              <Progress value={(kpi.value / kpi.goal) * 100} className="mt-4 h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle as="h3">Vue d'ensemble des revenus</CardTitle>
            <CardDescription>
              Aperçu des revenus mensuels pour l'année en cours (données simulées).
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
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))'
                        }}
                      />
                      <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle as="h3">Répartition des revenus</CardTitle>
                    <CardDescription>Part des revenus par application.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            <Pie
                                data={revenueByApp}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="hsl(var(--background))"
                                strokeWidth={4}
                            >
                                {revenueByApp.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))'
                                }}
                                formatter={(value: number) => `${value.toLocaleString('fr-FR')} FCFA`}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2">
                        {revenueByApp.map((entry, index) => (
                            <div key={`legend-${index}`} className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span>{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card className="flex-grow">
                <CardHeader>
                <CardTitle as="h3">Activité Récente</CardTitle>
                <CardDescription>
                    Derniers événements sur la plateforme.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                {recentActivities.length > 0 ? (
                    recentActivities.slice(0,3).map((activity, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="bg-muted rounded-full p-2">
                        {activity.icon}
                        </div>
                        <div className="flex-1">
                        <p className="text-sm leading-tight">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente.</p>
                )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
