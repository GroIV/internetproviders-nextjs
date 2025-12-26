import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline",
    image: "/icons/icon-192x192.png",
    audio: "",
    video: "",
    font: "",
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-fonts",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-images",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-js",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-styles",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  // Ensure consistent URLs (no trailing slash)
  trailingSlash: false,

  // 301 Redirects for SEO
  // SEO Migration: Redirect old URLs to preserve Google authority
  async redirects() {
    return [
      // =============================================
      // LEGACY URL PATTERNS (from old DigitalOcean site)
      // Per SEO migration plan: preserve authority
      // =============================================

      // Resources → Guides (old content section)
      {
        source: '/resources/:slug',
        destination: '/guides/:slug',
        permanent: true,
      },
      {
        source: '/resources',
        destination: '/guides',
        permanent: true,
      },

      // Provider state-only pages → Internet state pages
      // e.g., /providers/md → /internet/md
      {
        source: '/providers/:state(\\w{2})',
        destination: '/internet/:state',
        permanent: true,
      },

      // Frontier Fiber city pages → Frontier provider page
      {
        source: '/frontier-fiber/:path*',
        destination: '/providers/frontier-fiber',
        permanent: true,
      },

      // Legacy info pages → About
      {
        source: '/editorial-policy',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/disclosure',
        destination: '/about',
        permanent: true,
      },

      // Coverage page → Compare
      {
        source: '/coverage',
        destination: '/compare',
        permanent: true,
      },

      // Provider state/city pages → Internet location pages
      // e.g., /providers/texas/austin → /internet/texas/austin
      {
        source: '/providers/:state/:city',
        destination: '/internet/:state/:city',
        permanent: true,
      },

      // Technology-specific pages → Best/ranking pages
      {
        source: '/fiber-internet',
        destination: '/best/fiber-providers',
        permanent: true,
      },
      {
        source: '/fiber-internet/:path*',
        destination: '/best/fiber-providers',
        permanent: true,
      },
      {
        source: '/cable-internet',
        destination: '/best/cable-providers',
        permanent: true,
      },
      {
        source: '/cable-internet/:path*',
        destination: '/best/cable-providers',
        permanent: true,
      },
      {
        source: '/satellite-internet',
        destination: '/providers',
        permanent: true,
      },
      {
        source: '/satellite-internet/:path*',
        destination: '/providers',
        permanent: true,
      },
      {
        source: '/5g-home-internet',
        destination: '/providers',
        permanent: true,
      },
      {
        source: '/5g-home-internet/:path*',
        destination: '/providers',
        permanent: true,
      },
      {
        source: '/dsl-internet',
        destination: '/providers',
        permanent: true,
      },
      {
        source: '/dsl-internet/:path*',
        destination: '/providers',
        permanent: true,
      },

      // ZIP pages → Home (KILL category per SEO plan)
      // These were Soft 404s, redirect to home to pass any link equity
      {
        source: '/zip/:zip',
        destination: '/',
        permanent: true,
      },
      {
        source: '/internet-providers/zip/:zip',
        destination: '/',
        permanent: true,
      },

      // Business pages → Providers listing
      {
        source: '/business-internet',
        destination: '/providers',
        permanent: true,
      },
      {
        source: '/business-internet/:path*',
        destination: '/providers',
        permanent: true,
      },

      // =============================================
      // COMMON MISSPELLINGS AND URL VARIATIONS
      // =============================================

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

      // =============================================
      // STATE PAGE VARIATIONS
      // =============================================

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

      // =============================================
      // COMPARE/SEARCH VARIATIONS
      // =============================================

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

      // =============================================
      // TOOL VARIATIONS
      // =============================================

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

      // =============================================
      // URL NORMALIZATION
      // =============================================

      // Remove trailing slashes (must be last)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withPWA(nextConfig as any);
