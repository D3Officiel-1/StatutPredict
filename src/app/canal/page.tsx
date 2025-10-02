
'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import PwaInstallButton from '@/components/pwa-install-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PublicMobileNav from '@/components/layout/public-mobile-nav';

export default function CanalPage() {
  return (
    <div className="min-h-screen">
      <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex-1">
            <Link href="/login" className="flex items-center gap-2 md:gap-3">
              <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={32} height={32} alt="Statut Predict Logo" className="md:h-10 md:w-10" />
              <span className="text-base md:text-lg font-bold font-headline text-foreground">
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
          <div className="flex flex-1 justify-end items-center gap-2">
            <PwaInstallButton />
            <PublicMobileNav />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Canal Telegram</h1>
                <p className="mt-2 text-muted-foreground">Accédez à un flux exclusif de nouvelles, d'analyses et d'opportunités. Notre canal Telegram est votre accès direct à l'information privilégiée, conçue pour les esprits visionnaires.</p>
            </div>
          
            <Card>
              <CardContent className="p-6 text-center">
                <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                    alt="Telegram"
                    width={50}
                    height={50}
                    className="mx-auto mb-3"
                />
                <h3 className="text-lg font-semibold mb-2 font-headline">Predict</h3>
                <p className="text-muted-foreground mb-4">Accédez à un flux exclusif de nouvelles, d'analyses et d'opportunités. Notre canal Telegram est votre accès direct à l'information privilégiée, conçue pour les esprits visionnaires.</p>
                <Button asChild style={{ backgroundColor: '#2AABEE', color: 'white' }}>
                    <a href="https://t.me/Predict_D3offiiel" target="_blank" rel="noopener noreferrer">
                        Rejoindre le canal
                    </a>
                </Button>
              </CardContent>
            </Card>

             <div className="mt-8">
                 <div id="tg-embed">
                    <Script
                        async
                        src="https://telegram.org/js/telegram-widget.js?22"
                        data-telegram-post="Predict_D3offiiel/15"
                        data-width="100%"
                    />
                </div>
            </div>
        </div>
      </main>

       <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 Statut Predict — #D3 Officiel</p>
      </footer>
    </div>
  );
}
