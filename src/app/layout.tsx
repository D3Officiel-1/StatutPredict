
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const title = 'Statut Predict';
const description = 'Suivez en temps réel la pulsation de nos services, conçus pour une performance et une fiabilité sans compromis.';
const url = 'https://statut-predict.com';
const imageUrl = 'https://i.postimg.cc/9F0Y7yB9/statut-predict-og.png';


export const metadata: Metadata = {
  title: title,
  description: description,
  manifest: "/manifest.json",
  metadataBase: new URL(url),
  openGraph: {
    type: 'website',
    url: url,
    title: title,
    description: description,
    images: [{
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: title,
    }],
    siteName: title,
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: [imageUrl],
    creator: '@PredictD3',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <meta name="application-name" content={title} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={title} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0a1221" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#0a1221" />

        <link rel="apple-touch-icon" href="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" />
        <link rel="icon" type="image/png" href="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" />
        <link rel="shortcut icon" href="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" />
      </head>
       <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
