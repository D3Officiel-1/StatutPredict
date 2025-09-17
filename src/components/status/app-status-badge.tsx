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
            isActive && 'bg-green-400',
            isMaintenance && 'bg-orange-400',
            !isActive && !isMaintenance && 'bg-gray-500'
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
          isActive && 'bg-green-900/50 text-green-300',
          isMaintenance && 'bg-orange-900/50 text-orange-300',
          !isActive && !isMaintenance && 'bg-gray-800 text-gray-300'
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
