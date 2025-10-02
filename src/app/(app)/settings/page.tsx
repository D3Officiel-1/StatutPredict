
'use client';

import AppSettings from '@/components/settings/app-settings';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Paramètres des applications</h2>
        <p className="text-muted-foreground">
          Gérez les paramètres de vos applications.
        </p>
      </div>

      <div className="w-full">
        <AppSettings />
      </div>
    </div>
  );
}
