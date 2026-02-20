import { redirect } from 'next/navigation';
import { getAdminFromCookie } from '@/lib/admin-auth';

export default async function InviteAgencyLayout({ children }) {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) {
    redirect('/admin');
  }
  return children;
}
