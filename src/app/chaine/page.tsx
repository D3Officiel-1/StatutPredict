
'use client';

import Link from 'next/link';
import Image from 'next/image';
import PwaInstallButton from '@/components/pwa-install-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WhatsAppChannelCard = ({ title, description, link }: { title: string, description: string, link: string }) => (
    <Card>
        <CardContent className="p-6 text-center">
            <Image
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                width={50}
                height={50}
                className="mx-auto mb-3"
            />
            <h3 className="text-lg font-semibold mb-2 font-headline">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            <Button asChild style={{ backgroundColor: '#25D366', color: 'white' }}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                    Suivre la chaîne
                </a>
            </Button>
        </CardContent>
    </Card>
);

export default function ChainePage() {
    const channels = [
        {
            title: "Predict",
            description: "L'essentiel de l'actualité, des analyses pointues et des opportunités exclusives, livrés instantanément sur votre WhatsApp. Rejoignez l'avant-garde.",
            link: "https://whatsapp.com/channel/0029VbBc22V4yltHAKWD0R2x"
        }
    ];

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
                        <Link href="/canal" className="text-foreground/60 transition-colors hover:text-foreground/80">
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
                        <Link href="/chaine" className="text-foreground transition-colors hover:text-foreground/80">
                            Chaîne
                        </Link>
                    </nav>
                    <PwaInstallButton />
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold tracking-tight font-headline">Notre chaîne WhatsApp</h1>
                        <p className="mt-2 text-muted-foreground">Suivez-nous pour ne rien manquer.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md mx-auto">
                        {channels.map((channel, index) => (
                            <WhatsAppChannelCard key={index} {...channel} />
                        ))}
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-muted-foreground">
                <p>© 2025 Statut Predict — #D3 Officiel</p>
            </footer>
        </div>
    );
}
