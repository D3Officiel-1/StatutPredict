
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
import { Share, MoreVertical, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type ManualInstallOS = 'ios' | 'android' | 'windows';

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [manualInstallOS, setManualInstallOS] = useState<ManualInstallOS | null>(null);

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

  const handleInstallClick = async (os: ManualInstallOS) => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      // Fallback to manual installation guide if prompt is not available
      setManualInstallOS(os);
    }
  };

  const renderGuide = () => {
    switch (manualInstallOS) {
      case 'ios':
        return (
          <div className="space-y-4 text-sm p-4">
            <DialogTitle>Installer sur iOS (Apple)</DialogTitle>
            <p>1. Appuyez sur l'icône de partage <Share className="inline h-4 w-4 mx-1" /> dans la barre d'outils de Safari.</p>
            <p>2. Faites défiler vers le bas et sélectionnez "Sur l'écran d'accueil" <PlusSquare className="inline h-4 w-4 mx-1" />.</p>
            <p>3. Appuyez sur "Ajouter" pour confirmer.</p>
          </div>
        );
      case 'android':
        return (
          <div className="space-y-4 text-sm p-4">
            <DialogTitle>Installer sur Android</DialogTitle>
            <p>1. Appuyez sur l'icône du menu <MoreVertical className="inline h-4 w-4 mx-1" /> (les 3 points) dans votre navigateur.</p>
            <p>2. Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil".</p>
            <p>3. Suivez les instructions pour confirmer.</p>
          </div>
        );
      case 'windows':
         return (
          <div className="space-y-4 text-sm p-4">
            <DialogTitle>Installer sur Windows</DialogTitle>
            <p>1. Cliquez sur l'icône du menu <MoreVertical className="inline h-4 w-4 mx-1" /> (les 3 points) dans votre navigateur (Edge ou Chrome).</p>
            <p>2. Cherchez et sélectionnez "Applications" ou "Apps", puis "Installer ce site en tant qu'application".</p>
            <p>3. Confirmez l'installation.</p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <div className="flex-1 flex justify-end items-center gap-4">
        <button onClick={() => handleInstallClick('android')} aria-label="Install Android App">
          <Image src="https://1win-partners.com/panel/assets/images/android-BwQlK3Xs.svg" width={24} height={24} alt="Android App" />
        </button>
         <button onClick={() => handleInstallClick('ios')} aria-label="Install Apple App">
          <Image src="https://1win-partners.com/panel/assets/images/ios-LCbvsU86.svg" width={24} height={24} alt="Apple App" />
        </button>
         <button onClick={() => handleInstallClick('windows')} aria-label="Install Windows App">
          <Image src="https://i.postimg.cc/g0zDTFgZ/windows.png" width={24} height={24} alt="Windows App" />
        </button>
      </div>

      <Dialog open={!!manualInstallOS} onOpenChange={(isOpen) => !isOpen && setManualInstallOS(null)}>
        <DialogContent>
          <DialogHeader>
             <DialogDescription>
              Suivez les instructions ci-dessous pour votre appareil.
            </DialogDescription>
          </DialogHeader>
          
          {renderGuide()}
          
          <DialogFooter>
            <Button onClick={() => setManualInstallOS(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
