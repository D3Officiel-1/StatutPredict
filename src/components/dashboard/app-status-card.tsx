'use client';

import type { Application, AppStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Globe, Smartphone, Server, Power, ShieldAlert, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import MaintenanceConfigDialog from './maintenance-config-dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AppStatusCardProps {
  app: Application;
  onStatusChange: (appId: string, newStatus: AppStatus) => void;
}

const AppIcon = ({ type }: { type: Application['type'] }) => {
  const className = "h-5 w-5 text-muted-foreground";
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

export default function AppStatusCard({ app, onStatusChange }: AppStatusCardProps) {
  const isMaintenance = app.status === 'maintenance';
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleSwitchChange = (checked: boolean) => {
    onStatusChange(app.id, checked ? 'maintenance' : 'active');
  };

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle as="h4" className="text-base font-medium font-headline">
          {app.name}
        </CardTitle>
        <div className="flex items-center gap-2">
            <AppIcon type={app.type} />
            <MaintenanceConfigDialog app={app} open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Settings className="h-4 w-4" />
              </Button>
            </MaintenanceConfigDialog>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col justify-between">
        <div>
          <div
            className={cn(
              'flex items-center gap-2 text-sm font-medium',
              isMaintenance ? 'text-orange-500' : 'text-green-500'
            )}
          >
            {isMaintenance ? (
              <ShieldAlert className="h-4 w-4" />
            ) : (
              <Power className="h-4 w-4" />
            )}
            <span>{isMaintenance ? 'Maintenance' : 'Actif'}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{app.url}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Label htmlFor={`maintenance-switch-${app.id}`} className="text-sm text-muted-foreground">
            Maintenance
          </Label>
          <Switch
            id={`maintenance-switch-${app.id}`}
            checked={isMaintenance}
            onCheckedChange={handleSwitchChange}
            aria-label={`Mettre ${app.name} en mode maintenance`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
