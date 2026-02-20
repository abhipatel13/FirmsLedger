/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  async redirects() {
    return [{ source: '/Home', destination: '/', permanent: true }];
  },
};

export default nextConfig;
