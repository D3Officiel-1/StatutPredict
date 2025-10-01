'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Share, MoreVertical, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isManualInstallOpen, setIsManualInstallOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      // Fallback to manual installation guide if prompt is not available
      setIsManualInstallOpen(true);
    }
  };

  return (
    <>
      <div className="flex-1 flex justify-end items-center gap-4">
        <button onClick={handleInstallClick} aria-label="Install Android App">
          <Image src="https://1win-partners.com/panel/assets/images/android-BwQlK3Xs.svg" width={24} height={24} alt="Android App" />
        </button>
         <button onClick={handleInstallClick} aria-label="Install Apple App">
          <Image src="https://1win-partners.com/panel/assets/images/ios-LCbvsU86.svg" width={24} height={24} alt="Apple App" />
        </button>
         <button onClick={handleInstallClick} aria-label="Install Windows App">
          <Image src="https://i.postimg.cc/g0zDTFgZ/windows.png" width={24} height={24} alt="Windows App" />
        </button>
      </div>

      <Dialog open={isManualInstallOpen} onOpenChange={setIsManualInstallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comment installer l'application</DialogTitle>
            <DialogDescription>
              Suivez les instructions ci-dessous pour votre appareil.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="ios" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ios">iOS (Apple)</TabsTrigger>
              <TabsTrigger value="android">Android</TabsTrigger>
            </TabsList>
            <TabsContent value="ios">
              <div className="space-y-4 text-sm p-4">
                <p>1. Appuyez sur l'icône de partage <Share className="inline h-4 w-4 mx-1" /> dans la barre d'outils de Safari.</p>
                <p>2. Faites défiler vers le bas et sélectionnez "Sur l'écran d'accueil" <PlusSquare className="inline h-4 w-4 mx-1" />.</p>
                <p>3. Appuyez sur "Ajouter" pour confirmer.</p>
              </div>
            </TabsContent>
             <TabsContent value="android">
                <div className="space-y-4 text-sm p-4">
                    <p>1. Appuyez sur l'icône du menu <MoreVertical className="inline h-4 w-4 mx-1" /> (les 3 points) dans votre navigateur.</p>
                    <p>2. Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil".</p>
                    <p>3. Suivez les instructions pour confirmer.</p>
                </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button onClick={() => setIsManualInstallOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
