export const metadata = {
  title: 'Your Dashboard | FirmsLedger',
  description: 'Manage the company listings you have claimed on FirmsLedger.',
  // Per-account content behind a login — never indexable.
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  return children;
}
