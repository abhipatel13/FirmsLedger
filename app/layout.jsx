import { Providers } from './providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import JsonLd from '@/components/JsonLd';
import '@/index.css';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// Site-wide JSON-LD: Organization + WebSite with SearchAction.
// Organization helps Google build a knowledge panel; WebSite/SearchAction
// can earn the sitelinks search box in SERPs.
const siteJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FirmsLedger',
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    sameAs: ['https://twitter.com/firmsledger'],
    description: 'Global directory of verified business service providers. Compare staffing, IT, marketing, accounting, legal, and 8,000+ other categories with real client reviews.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FirmsLedger',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/directory?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  },
];

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'FirmsLedger – Global Business & Service Provider Directory',
    template: '%s | FirmsLedger',
  },
  description: "Find and compare the best companies worldwide. Verified reviews, ratings, and direct contact for staffing, healthcare, travel, IT, education, and more across every industry.",
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
    <html lang="en">
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
