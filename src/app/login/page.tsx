'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '@/components/ui/custom-loader';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [correctPasswordLength, setCorrectPasswordLength] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPasswordInfo = async () => {
      try {
        const docRef = doc(db, 'Predict', 'mot_de_passe');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const correctPassword = docSnap.data().Admin;
          setCorrectPasswordLength(correctPassword.length);
        } else {
            toast({
                title: 'Erreur',
                description: 'Impossible de charger la configuration du mot de passe.',
                variant: 'destructive',
            });
        }
      } catch (error) {
        console.error("Error fetching password info: ", error);
      }
    };
    fetchPasswordInfo();
  }, [toast]);

  useEffect(() => {
    const handleLogin = async () => {
      if (!correctPasswordLength || password.length !== correctPasswordLength) {
        return;
      }

      setIsLoading(true);

      try {
        const docRef = doc(db, 'Predict', 'mot_de_passe');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const correctPassword = docSnap.data().Admin;
          if (password === correctPassword) {
            router.push('/dashboard');
          } else {
            toast({
              title: 'Erreur',
              description: 'Mot de passe incorrect.',
              variant: 'destructive',
            });
            setPassword('');
          }
        } else {
          toast({
              title: 'Erreur',
              description: 'Impossible de vérifier le mot de passe. Veuillez réessayer.',
              variant: 'destructive',
            });
        }
      } catch (error) {
        console.error("Error logging in: ", error);
        toast({
          title: 'Erreur de connexion',
          description: "Une erreur s'est produite. Veuillez réessayer.",
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    handleLogin();
  }, [password, correctPasswordLength, router, toast]);

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
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input 
                id="password" 
                type="password" 
                placeholder="Mot de passe" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                {isLoading ? <CustomLoader /> : <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
            {isLoading && <p className="text-sm text-center text-muted-foreground">Vérification en cours...</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
