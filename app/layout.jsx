import { Providers } from './providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import '@/index.css';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'FirmsLedger – Business Directory India',
    template: '%s | FirmsLedger',
  },
  description: "India's most trusted platform to discover and connect with verified business service providers.",
  openGraph: {
    type: 'website',
    locale: 'en_IN',
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
    icon: { url: '/icon.svg', type: 'image/svg+xml' },
    apple: { url: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
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
      </head>
      <body>
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
