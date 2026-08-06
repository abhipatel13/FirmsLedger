import { Inter, IBM_Plex_Mono } from 'next/font/google';
import { Providers } from './providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import JsonLd from '@/components/JsonLd';
import '@/index.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// Site-wide JSON-LD: Organization, for Google's knowledge panel.
// WebSite/SearchAction lives on the homepage only (app/page.jsx) — schema.org
// and Google both expect a single WebSite entity, not one repeated per page.
const siteJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FirmsLedger',
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    sameAs: ['https://twitter.com/firmsledger'],
    description: 'The US manufacturer directory. Find manufacturers across all 50 states — electrical, mechanical, metal fabrication, electronics, automotive, and more. No paid placements.',
  },
];

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'FirmsLedger – US Manufacturer Directory | Find Manufacturers by State',
    template: '%s | FirmsLedger',
  },
  description: 'Find US manufacturers by category and state. Zero paid rankings. Browse electrical, mechanical, automotive, and more manufacturing categories across all 50 states.',
  openGraph: {
    type: 'website',
    locale: 'en',
    siteName: 'FirmsLedger',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@firmsledger',
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
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icon.svg', color: '#1A2E4A' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* Preconnect to third-party origins used for images and analytics */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        {/* Supabase API — used for data fetching on most pages */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}
      </head>
      <body>
        {siteJsonLd.map((data, i) => <JsonLd key={i} data={data} />)}
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
