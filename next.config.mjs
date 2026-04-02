/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net', pathname: '/**' },
    ],
  },
  async redirects() {
    return [
      { source: '/Home', destination: '/', permanent: true },
      { source: '/list-your-company', destination: '/ListYourCompany', permanent: false },
      { source: '/join',              destination: '/ListYourCompany', permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap-index' },
      { source: '/sitemap/:id.xml', destination: '/api/sitemap/:id' },
      { source: '/directory', destination: '/Directory' },
      { source: '/directory/:path*', destination: '/Directory/:path*' },
      { source: '/blogs', destination: '/Blogs' },
      { source: '/blogs/:path*', destination: '/Blogs/:path*' },
      { source: '/contact', destination: '/Contact' },
      { source: '/blog-automation', destination: '/BlogAutomation' },
      // Admin routes — served directly from app/admin/ (no rewrite needed)
      // but kept here as documentation; Next.js App Router resolves /admin/** automatically
    ];
  },
};

export default nextConfig;
