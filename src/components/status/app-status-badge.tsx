'use client';

import { cn } from '@/lib/utils';
import type { Application } from '@/types';

export default function AppStatusBadge({ app }: { app: Application }) {
  const isMaintenance = app.status === 'maintenance';
  const isActive = app.status === 'active';

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'h-3 w-3 rounded-full',
            isActive && 'bg-green-500',
            isMaintenance && 'bg-orange-500',
            !isActive && !isMaintenance && 'bg-gray-400'
          )}
        />
        <div>
          <p className="font-semibold text-card-foreground">{app.name}</p>
          <p className="text-sm text-muted-foreground">{app.url}</p>
        </div>
      </div>
      <div
        className={cn(
          'rounded-full px-3 py-1 text-sm font-medium',
          isActive && 'bg-green-100 text-green-800',
          isMaintenance && 'bg-orange-100 text-orange-800',
          !isActive && !isMaintenance && 'bg-gray-100 text-gray-800'
        )}
      >
        {app.status === 'active'
          ? 'Actif'
          : app.status === 'maintenance'
          ? 'Maintenance'
          : 'Inconnu'}
      </div>
    </div>
  );
}
