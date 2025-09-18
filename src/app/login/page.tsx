
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '@/components/ui/custom-loader';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [correctPassword, setCorrectPassword] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const docRef = doc(db, 'Predict', 'mot_de_passe');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCorrectPassword(docSnap.data().Admin);
        } else {
            toast({
                title: 'Erreur',
                description: 'Impossible de charger la configuration du mot de passe.',
                variant: 'destructive',
            });
        }
      } catch (error) {
        console.error("Error fetching password: ", error);
        toast({
            title: 'Erreur de configuration',
            description: "Impossible de contacter la base de données.",
            variant: 'destructive',
        });
      }
    };
    fetchPassword();
  }, [toast]);

  useEffect(() => {
    if (correctPassword && password.length > 0 && password.length === correctPassword.length) {
      if (password === correctPassword) {
        setIsVerifying(true);
        toast({
          title: 'Connexion réussie !',
          description: 'Redirection vers le tableau de bord...',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Mot de passe incorrect',
          description: 'Veuillez vérifier le mot de passe et réessayer.',
          variant: 'destructive',
        });
        setPassword('');
      }
    }
  }, [password, correctPassword, router, toast]);

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
          <div className="space-y-6">
            <div className="relative">
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isVerifying || !correctPassword}
                className="text-center"
              />
              {isVerifying && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <CustomLoader />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
