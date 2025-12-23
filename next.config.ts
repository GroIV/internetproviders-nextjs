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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withPWA(nextConfig as any);
