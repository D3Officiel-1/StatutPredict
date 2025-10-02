
'use client';

import { useState } from 'react';
import SettingsNav from '@/components/settings/settings-nav';
import AppSettings from '@/components/settings/app-settings';
import UserManagement from '@/components/settings/user-management';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('applications');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Paramètres</h2>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre compte et de vos applications.
        </p>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>
        <div className="flex-1 lg:max-w-4xl">
            {activeTab === 'applications' && <AppSettings />}
            {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  );
}
