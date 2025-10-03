
'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import PwaInstallButton from '@/components/pwa-install-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PublicMobileNav from '@/components/layout/public-mobile-nav';
import LogoLink from '@/components/layout/logo-link';

export default function CanalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex-1">
            <LogoLink />
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

      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12 flex items-center justify-center">
        <div className="mx-auto max-w-md w-full">
            <div className="mb-8 text-center">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Canal Telegram</h1>
                <p className="mt-2 text-muted-foreground md:text-base">Accédez à un flux exclusif de nouvelles, d'analyses et d'opportunités.</p>
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
                <h3 className="text-lg font-semibold mb-2">Predict</h3>
                <p className="text-muted-foreground mb-4">Notre canal Telegram est votre accès direct à l'information privilégiée, conçue pour les esprits visionnaires.</p>
                <Button asChild style={{ backgroundColor: '#2AABEE', color: 'white' }}>
                    <a href="https://t.me/Predict_D3officiel" target="_blank" rel="noopener noreferrer">
                        Rejoindre le canal
                    </a>
                </Button>
              </CardContent>
            </Card>
        </div>
      </main>

       <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 Statut Predict — #D3 Officiel</p>
      </footer>
    </div>
  );
}
