import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <Button asChild variant="ghost">
          <Link href="/">
            &larr; Retour à la page de statut
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={60} height={60} alt="Statut Predict Logo" />
            </div>
          <CardTitle>Accès au tableau de bord</CardTitle>
          <CardDescription>
            Veuillez entrer votre mot de passe pour continuer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Input id="password" type="password" placeholder="Mot de passe" required />
            </div>
            <Button type="submit" className="w-full">
              <Lock className="mr-2 h-4 w-4" /> Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
