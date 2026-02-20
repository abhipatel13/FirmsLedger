/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  async redirects() {
    return [
      { source: '/Home', destination: '/', permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: '/directory', destination: '/Directory' },
      { source: '/directory/:path*', destination: '/Directory/:path*' },
      { source: '/blogs', destination: '/Blogs' },
      { source: '/blogs/:path*', destination: '/Blogs/:path*' },
    ];
  },
};

export default nextConfig;
