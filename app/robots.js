const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/AdminDashboard',
          '/AgencyDashboard',
          '/AgencyProfile',
          '/InviteAgency',
          '/api/',
          '/companies/',
          '/join',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
