import { Providers } from './providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import '@/index.css';

export const metadata = {
  title: 'FirmsLedger - Business Directory',
  description: "India's most trusted platform to discover and connect with verified business service providers.",
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
      </head>
      <body>
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
