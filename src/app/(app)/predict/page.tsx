import { applications } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, Globe, Smartphone, Server } from 'lucide-react';
import type { Application } from '@/types';

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

export default function PredictPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">Prédictions</h2>
        <p className="text-muted-foreground mt-2">
          Accédez à chacune de vos applications pour visualiser les prédictions et analyses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <Card key={app.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle as="h3" className="text-lg font-semibold font-headline">{app.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{app.url}</p>
              </div>
              <AppIcon type={app.type} />
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button asChild className="w-full">
                <Link href={app.url.startsWith('http') ? app.url : `https://${app.url}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Accéder à l'application
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
