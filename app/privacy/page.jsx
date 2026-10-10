import { BASE_URL, SITE_NAME, OG_IMAGES } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'Privacy Policy & Data Use',
  description: 'Privacy Policy for FirmsLedger — how we collect, use, and protect your information.',
  alternates: { canonical: `${_BASE}/privacy` },
  robots: { index: true, follow: true },
  openGraph: {
    images: OG_IMAGES,
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'Privacy Policy for FirmsLedger — how we collect, use, and protect your information.',
    type: 'website',
    url: `${_BASE}/privacy`,
  },
};

const SECTIONS = [
  {
    heading: '1. Information We Collect',
    body: `We collect information you provide directly, such as when you submit a company listing, write a review, request a proposal, or contact us — including name, email address, company name, and message content. We also collect standard technical data (IP address, browser type, pages visited) via analytics tools when you use the Site.`,
  },
  {
    heading: '2. How We Use Information',
    body: `We use the information we collect to operate and improve ${SITE_NAME}, respond to inquiries, connect buyers with listed companies, prevent fraud and abuse, and send service-related communications. We do not sell your personal information to third parties.`,
  },
  {
    heading: '3. Cookies and Analytics',
    body: 'We use cookies and similar technologies to remember preferences and understand how the Site is used, including through third-party analytics services. You can control cookies through your browser settings.',
  },
  {
    heading: '4. Sharing of Information',
    body: 'When you request a proposal or contact a listed company through the Site, relevant details you provide are shared with that company so they can respond to your inquiry. We may also share information with service providers who help us operate the Site (such as hosting and email delivery), under obligations to protect it.',
  },
  {
    heading: '5. Data Retention',
    body: 'We retain information for as long as necessary to provide the Site\'s services and comply with legal obligations. You may request deletion of your information by contacting us.',
  },
  {
    heading: '6. Your Rights',
    body: 'Depending on your location, you may have rights to access, correct, or delete your personal information. To exercise these rights, contact us through our Contact page.',
  },
  {
    heading: '7. Security',
    body: 'We use reasonable technical and organizational measures to protect your information, but no method of transmission or storage is completely secure.',
  },
  {
    heading: '8. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised policy.',
  },
  {
    heading: '9. Contact',
    body: 'Questions about this Privacy Policy can be sent through our Contact page.',
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 40 }}>Last updated: July 2026</p>

        {SECTIONS.map((s) => (
          <section key={s.heading} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>{s.heading}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: '#475569', margin: 0 }}>{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
