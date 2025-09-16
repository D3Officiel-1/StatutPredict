'use client';

import { useState } from 'react';
import { applications as initialApplications } from '@/lib/data';
import AppStatusCard from './app-status-card';
import type { Application, AppStatus } from '@/types';

export default function AppList() {
  const [apps, setApps] = useState<Application[]>(initialApplications);

  const handleStatusChange = (appId: string, newStatus: AppStatus) => {
    setApps(currentApps =>
      currentApps.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {apps.map(app => (
        <AppStatusCard key={app.id} app={app} onStatusChange={handleStatusChange} />
      ))}
    </div>
  );
}
