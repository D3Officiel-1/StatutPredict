
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Smartphone, Server, Settings } from 'lucide-react';
import Link from 'next/link';

const AppIcon = ({ type }: { type: Application['type'] }) => {
  const className = "h-6 w-6 text-muted-foreground";
  switch (type) {
    case 'web':
      return <Globe className={className} />;
    case 'mobile':
      return <Smartphone className={className} />;
    case 'api':
      return <Server className={className} />;
    default:
      return null;
  }
};

export default function PricingManagement() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "applications"), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const appsData: Application[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Application));
        setApps(appsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching applications:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))
      ) : (
        apps.map((app) => (
          <Card key={app.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle as="h3" className="text-lg font-semibold font-headline">{app.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{app.url}</p>
              </div>
              <AppIcon type={app.type} />
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
                <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    Gérer les tarifs
                </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
