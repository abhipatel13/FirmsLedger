import { Providers } from './providers';
import '@/index.css';

export const metadata = {
  title: 'FirmsLedger - Business Directory',
  description: "India's most trusted platform to discover and connect with verified business service providers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="https://base44.com/logo_v2.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
