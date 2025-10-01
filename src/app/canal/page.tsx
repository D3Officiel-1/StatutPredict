'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import PwaInstallButton from '@/components/pwa-install-button';
import { Card, CardContent } from '@/components/ui/card';

export default function CanalPage() {
  return (
    <div className="min-h-screen">
      <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex-1">
            <Link href="/login" className="flex items-center gap-3">
              <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={40} height={40} alt="Statut Predict Logo" />
              <span className="text-lg font-bold font-headline text-foreground">
                Statut Predict
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex flex-1 justify-center items-center gap-6 text-sm font-medium">
               <Link href="/canal" className="text-foreground transition-colors hover:text-foreground/80">
                  Canal
              </Link>
              <Link href="/predict" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Predict
              </Link>
              <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Statut
              </Link>
              <Link href="/maintenance" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Maintenance
              </Link>
              <Link href="/chaine" className="text-foreground/60 transition-colors hover:text-foreground/80">
                  Chaîne
              </Link>
          </nav>
          <PwaInstallButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Canal Telegram</h1>
                <p className="mt-2 text-muted-foreground">Suivez nos dernières publications directement ici.</p>
            </div>
          
            <Card>
                <CardContent className="p-4">
                    <div id="tg-embed">
                        <Script 
                            async 
                            src="https://telegram.org/js/telegram-widget.js?22"
                            data-telegram-post="Predict_D3offiiel/15"
                            data-width="100%"
                        />
                    </div>
                    
                    <noscript>
                        <p className="text-center text-muted-foreground">
                            Votre navigateur bloque les scripts. Accédez au canal : <a href="https://t.me/Predict_D3offiiel" className="text-primary underline">Predict</a>
                        </p>
                    </noscript>
                </CardContent>
            </Card>

            <div className="mt-6 text-center">
                <a href="https://t.me/Predict_D3offiiel" target="_blank" rel="noopener noreferrer"
                    className="inline-block px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold no-underline hover:bg-blue-600 transition-colors">
                    Rejoindre le canal
                </a>
            </div>
        </div>
      </main>

       <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 Statut Predict — #D3 Officiel</p>
      </footer>
    </div>
  );
}
