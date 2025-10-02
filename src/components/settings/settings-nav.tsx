
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

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1 lg:max-w-4xl">
            <AppSettings />
        </div>
      </div>
    </div>
  );
}
