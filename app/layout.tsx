import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/ui/Lenis/LenisProvider";
import { AuthProvider } from "@/components/contexts/AuthContext";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import PageViewTracker from "@/components/analytics/PageViewTracker";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://knightybuilds.com'),
  title: {
    default: 'Knighty Builds - Premium Minecraft Builds & Schematic Downloads',
    template: '%s | Knighty Builds',
  },
  description: 'Download premium Minecraft builds, schematics, and world maps. Instant access to 500+ high-quality builds with step-by-step guides. Join thousands of builders worldwide.',
  keywords: ['minecraft builds', 'minecraft schematics', 'minecraft maps', 'minecraft downloads', 'minecraft world downloads', 'premium minecraft builds', 'minecraft guides', 'minecraft tutorials', 'litematic', 'schematic downloads', 'minecraft architecture', 'minecraft houses', 'minecraft statues', 'minecraft portals'],
  authors: [{ name: 'Knighty Builds' }],
  creator: 'Knighty Builds',
  publisher: 'Knighty Builds',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Knighty Builds',
    title: 'Knighty Builds - Premium Minecraft Builds & Schematic Downloads',
    description: 'Download premium Minecraft builds, schematics, and world maps. Instant access to 500+ high-quality builds with step-by-step guides.',
    images: [
      {
        url: '/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Knighty Builds - Premium Minecraft Builds',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Knighty Builds - Premium Minecraft Builds & Schematic Downloads',
    description: 'Download premium Minecraft builds, schematics, and world maps. Instant access to 500+ high-quality builds with step-by-step guides.',
    images: ['/og-image.jpeg'],
    creator: '@knightybuilds',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/knighty.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${outfit.variable}`} lang="en">
      <body>
        <GoogleAnalytics />
        <AuthProvider>
          <LenisProvider>
            <PageViewTracker />
            {children}
          </LenisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
