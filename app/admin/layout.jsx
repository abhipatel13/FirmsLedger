// Server component — owns metadata, wraps the interactive client layout
import AdminClientLayout from './AdminClientLayout';

export const metadata = {
  title: 'Admin — FirmsLedger',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
