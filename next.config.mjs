/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,
  transpilePackages: [],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net', pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:all*\\.(svg|png|jpg|jpeg|webp|ico|woff2|woff)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // ── PascalCase → lowercase (SEO canonical cleanup) ─────────────────
      { source: '/Home',            destination: '/',                  permanent: true },
      // NOTE: no '/Contact' -> '/contact' rule here. Next.js redirect source
      // matching is case-insensitive, so a same-word rule like that matches
      // '/contact' itself and creates an infinite 308 redirect loop.
      { source: '/ListYourCompany', destination: '/list-your-company', permanent: true },
      { source: '/Categories',      destination: '/browse',            permanent: true },

      // ── /companies/:slug → /company/:slug ──────────────────────────────
      { source: '/companies/:slug', destination: '/company/:slug',     permanent: true },

      // ── Legacy route redirects ──────────────────────────────────────────
      { source: '/join',            destination: '/list-your-company', permanent: false },

      // ── Blog URL cleanup ────────────────────────────────────────────────
      { source: '/Blogs',           destination: '/blog',              permanent: true },
      { source: '/Blogs/:slug',     destination: '/blog/:slug',        permanent: true },

      // ── Legacy /top/:category/:state → /:category/:state ───────────────
      { source: '/top/:category/:state', destination: '/:category/:state', permanent: true },

      // ── Old category slugs → new canonical slugs ────────────────────────
      { source: '/electrical-manufacturers/:state*',               destination: '/electrical-components/:state*',    permanent: true },
      { source: '/mechanical-manufacturers/:state*',               destination: '/mechanical-components/:state*',   permanent: true },
      { source: '/plastics-packaging-manufacturers/:state*',       destination: '/plastics-packaging/:state*',      permanent: true },
      { source: '/metal-fabrication-machining/:state*',            destination: '/metal-fabrication/:state*',       permanent: true },
      { source: '/electronics-semiconductor-manufacturers/:state*', destination: '/electronics-semiconductor/:state*', permanent: true },
      { source: '/automotive-parts-manufacturers/:state*',         destination: '/automotive-parts/:state*',        permanent: true },
      { source: '/textile-apparel-manufacturers/:state*',          destination: '/textile-apparel/:state*',         permanent: true },
      { source: '/furniture-woodworking-manufacturers/:state*',    destination: '/furniture-woodworking/:state*',   permanent: true },
      { source: '/medical-device-manufacturers/:state*',           destination: '/medical-devices/:state*',         permanent: true },
      { source: '/bike-manufacturers/:state*',                     destination: '/',                                permanent: false },

      // ── /categories/* → canonical /:slug ───────────────────────────────
      { source: '/categories/electrical-manufacturers',            destination: '/electrical-components',   permanent: true },
      { source: '/categories/mechanical-manufacturers',            destination: '/mechanical-components',   permanent: true },
      { source: '/categories/plastics-packaging-manufacturers',    destination: '/plastics-packaging',      permanent: true },
      { source: '/categories/metal-fabrication-machining',         destination: '/metal-fabrication',       permanent: true },
      { source: '/categories/electronics-semiconductor-manufacturers', destination: '/electronics-semiconductor', permanent: true },
      { source: '/categories/automotive-parts-manufacturers',      destination: '/automotive-parts',        permanent: true },
      { source: '/categories/textile-apparel-manufacturers',       destination: '/textile-apparel',         permanent: true },
      { source: '/categories/furniture-woodworking-manufacturers', destination: '/furniture-woodworking',   permanent: true },
      { source: '/categories/medical-device-manufacturers',        destination: '/medical-devices',         permanent: true },
      { source: '/categories/bike-manufacturers',                  destination: '/',                        permanent: false },
      { source: '/categories/electrical-components',               destination: '/electrical-components',   permanent: true },
      { source: '/categories/mechanical-components',               destination: '/mechanical-components',   permanent: true },
      { source: '/categories/plastics-packaging',                  destination: '/plastics-packaging',      permanent: true },
      { source: '/categories/metal-fabrication',                   destination: '/metal-fabrication',       permanent: true },
      { source: '/categories/electronics-semiconductor',           destination: '/electronics-semiconductor', permanent: true },
      { source: '/categories/automotive-parts',                    destination: '/automotive-parts',        permanent: true },
      { source: '/categories/textile-apparel',                     destination: '/textile-apparel',         permanent: true },
      { source: '/categories/furniture-woodworking',               destination: '/furniture-woodworking',   permanent: true },
      { source: '/categories/medical-devices',                     destination: '/medical-devices',         permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: '/blogs',            destination: '/blog' },
      { source: '/blogs/:path*',     destination: '/blog/:path*' },
      { source: '/blog-automation',  destination: '/BlogAutomation' },
    ];
  },
};

export default nextConfig;
