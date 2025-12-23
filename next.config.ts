import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure consistent URLs (no trailing slash)
  trailingSlash: false,

  // 301 Redirects for SEO
  async redirects() {
    return [
      // Common misspellings and old URL patterns
      {
        source: '/provider/:slug',
        destination: '/providers/:slug',
        permanent: true,
      },
      {
        source: '/isp/:slug',
        destination: '/providers/:slug',
        permanent: true,
      },
      {
        source: '/isps',
        destination: '/providers',
        permanent: true,
      },
      {
        source: '/guide/:slug',
        destination: '/guides/:slug',
        permanent: true,
      },
      {
        source: '/articles/:slug',
        destination: '/guides/:slug',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/guides/:slug',
        permanent: true,
      },
      // State page variations
      {
        source: '/states/:state',
        destination: '/internet/:state',
        permanent: true,
      },
      {
        source: '/state/:state',
        destination: '/internet/:state',
        permanent: true,
      },
      // Compare variations
      {
        source: '/search',
        destination: '/compare',
        permanent: true,
      },
      {
        source: '/find',
        destination: '/compare',
        permanent: true,
      },
      {
        source: '/availability',
        destination: '/compare',
        permanent: true,
      },
      // Tool variations
      {
        source: '/speedtest',
        destination: '/tools/speed-test',
        permanent: true,
      },
      {
        source: '/speed-test',
        destination: '/tools/speed-test',
        permanent: true,
      },
      // Remove trailing slashes
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ]
  },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
