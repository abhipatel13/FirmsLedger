import { redirect } from 'next/navigation';
import { getAdminFromCookie } from '@/lib/admin-auth';

export const metadata = {
  title: 'Invite Agency',
  robots: { index: false, follow: false },
};

export default async function InviteAgencyLayout({ children }) {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) {
    redirect('/admin');
  }
  return children;
}
