'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { api } from '@/api/apiClient';

const PAGE_KEYS = ['Home', 'AdminDashboard', 'AgencyDashboard', 'AgencyProfile', 'BlogPost', 'Blogs', 'Categories', 'CategoryPage', 'Compare', 'CountryPage', 'Directory', 'RequestProposal', 'TopRankings', 'WriteReview'];
const mainPageKey = 'Home';

export default function NavigationTracker() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!pathname || !isAuthenticated) return;
    const pathSegment = pathname.replace(/^\//, '').split('/')[0] || '';
    const pageName = pathSegment === '' ? mainPageKey : PAGE_KEYS.find(k => k.toLowerCase() === pathSegment.toLowerCase()) || null;
    if (pageName) {
      api.appLogs.logUserInApp(pageName).catch(() => {});
    }
  }, [pathname, isAuthenticated]);

  return null;
}
