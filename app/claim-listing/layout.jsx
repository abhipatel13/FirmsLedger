import { BASE_URL, SITE_NAME } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Claim Your Company Listing | ${SITE_NAME}`,
  description: 'Claim and verify your company listing on FirmsLedger to manage your profile, respond to reviews, and unlock premium features.',
  alternates: { canonical: `${_BASE}/claim-listing` },
  openGraph: {
    title: `Claim Your Company Listing | ${SITE_NAME}`,
    description: 'Claim and verify your company listing on FirmsLedger.',
    type: 'website',
    url: `${_BASE}/claim-listing`,
  },
};

export default function ClaimListingLayout({ children }) {
  return children;
}
