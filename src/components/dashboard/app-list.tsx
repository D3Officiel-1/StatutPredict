'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AppStatusCard from './app-status-card';
import type { Application } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppList() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'applications'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsData: Application[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));
      setApps(appsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: boolean) => {
    const appRef = doc(db, 'applications', appId);
    try {
      // Mettre à jour le statut actuel de l'application
      await updateDoc(appRef, { status: newStatus });
      
      // Enregistrer l'événement de changement de statut dans l'historique
      await addDoc(collection(db, 'app_status_history'), {
        appId: appId,
        status: newStatus,
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  if (loading) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {apps.map(app => (
        <AppStatusCard key={app.id} app={app} onStatusChange={handleStatusChange} />
      ))}
    </div>
  );
}

const CardSkeleton = () => (
    <div className="p-4 border rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-5" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-11 rounded-full" />
        </div>
    </div>
)

      