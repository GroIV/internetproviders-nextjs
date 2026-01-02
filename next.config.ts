import type { NextConfig } from "next";
import withPWAInit from "next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

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
      // e.g., /providers/tx → /internet/tx → (then chained to /internet/texas)
      // Note: These chain through the 2-letter → state-name redirects below
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
      // Excludes provider slugs (which contain hyphens) like frontier-fiber
      {
        source: '/providers/:state([a-z]+)/:city',
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
      // STATE CODE TO STATE-NAME SLUG REDIRECTS
      // Canonical URLs: /internet/texas (not /internet/tx)
      // =============================================

      // State-only pages
      { source: '/internet/al', destination: '/internet/alabama', permanent: true },
      { source: '/internet/ak', destination: '/internet/alaska', permanent: true },
      { source: '/internet/az', destination: '/internet/arizona', permanent: true },
      { source: '/internet/ar', destination: '/internet/arkansas', permanent: true },
      { source: '/internet/ca', destination: '/internet/california', permanent: true },
      { source: '/internet/co', destination: '/internet/colorado', permanent: true },
      { source: '/internet/ct', destination: '/internet/connecticut', permanent: true },
      { source: '/internet/de', destination: '/internet/delaware', permanent: true },
      { source: '/internet/fl', destination: '/internet/florida', permanent: true },
      { source: '/internet/ga', destination: '/internet/georgia', permanent: true },
      { source: '/internet/hi', destination: '/internet/hawaii', permanent: true },
      { source: '/internet/id', destination: '/internet/idaho', permanent: true },
      { source: '/internet/il', destination: '/internet/illinois', permanent: true },
      { source: '/internet/in', destination: '/internet/indiana', permanent: true },
      { source: '/internet/ia', destination: '/internet/iowa', permanent: true },
      { source: '/internet/ks', destination: '/internet/kansas', permanent: true },
      { source: '/internet/ky', destination: '/internet/kentucky', permanent: true },
      { source: '/internet/la', destination: '/internet/louisiana', permanent: true },
      { source: '/internet/me', destination: '/internet/maine', permanent: true },
      { source: '/internet/md', destination: '/internet/maryland', permanent: true },
      { source: '/internet/ma', destination: '/internet/massachusetts', permanent: true },
      { source: '/internet/mi', destination: '/internet/michigan', permanent: true },
      { source: '/internet/mn', destination: '/internet/minnesota', permanent: true },
      { source: '/internet/ms', destination: '/internet/mississippi', permanent: true },
      { source: '/internet/mo', destination: '/internet/missouri', permanent: true },
      { source: '/internet/mt', destination: '/internet/montana', permanent: true },
      { source: '/internet/ne', destination: '/internet/nebraska', permanent: true },
      { source: '/internet/nv', destination: '/internet/nevada', permanent: true },
      { source: '/internet/nh', destination: '/internet/new-hampshire', permanent: true },
      { source: '/internet/nj', destination: '/internet/new-jersey', permanent: true },
      { source: '/internet/nm', destination: '/internet/new-mexico', permanent: true },
      { source: '/internet/ny', destination: '/internet/new-york', permanent: true },
      { source: '/internet/nc', destination: '/internet/north-carolina', permanent: true },
      { source: '/internet/nd', destination: '/internet/north-dakota', permanent: true },
      { source: '/internet/oh', destination: '/internet/ohio', permanent: true },
      { source: '/internet/ok', destination: '/internet/oklahoma', permanent: true },
      { source: '/internet/or', destination: '/internet/oregon', permanent: true },
      { source: '/internet/pa', destination: '/internet/pennsylvania', permanent: true },
      { source: '/internet/ri', destination: '/internet/rhode-island', permanent: true },
      { source: '/internet/sc', destination: '/internet/south-carolina', permanent: true },
      { source: '/internet/sd', destination: '/internet/south-dakota', permanent: true },
      { source: '/internet/tn', destination: '/internet/tennessee', permanent: true },
      { source: '/internet/tx', destination: '/internet/texas', permanent: true },
      { source: '/internet/ut', destination: '/internet/utah', permanent: true },
      { source: '/internet/vt', destination: '/internet/vermont', permanent: true },
      { source: '/internet/va', destination: '/internet/virginia', permanent: true },
      { source: '/internet/wa', destination: '/internet/washington', permanent: true },
      { source: '/internet/wv', destination: '/internet/west-virginia', permanent: true },
      { source: '/internet/wi', destination: '/internet/wisconsin', permanent: true },
      { source: '/internet/wy', destination: '/internet/wyoming', permanent: true },
      { source: '/internet/dc', destination: '/internet/district-of-columbia', permanent: true },

      // State + city pages (2-letter code → state-name slug)
      { source: '/internet/al/:city', destination: '/internet/alabama/:city', permanent: true },
      { source: '/internet/ak/:city', destination: '/internet/alaska/:city', permanent: true },
      { source: '/internet/az/:city', destination: '/internet/arizona/:city', permanent: true },
      { source: '/internet/ar/:city', destination: '/internet/arkansas/:city', permanent: true },
      { source: '/internet/ca/:city', destination: '/internet/california/:city', permanent: true },
      { source: '/internet/co/:city', destination: '/internet/colorado/:city', permanent: true },
      { source: '/internet/ct/:city', destination: '/internet/connecticut/:city', permanent: true },
      { source: '/internet/de/:city', destination: '/internet/delaware/:city', permanent: true },
      { source: '/internet/fl/:city', destination: '/internet/florida/:city', permanent: true },
      { source: '/internet/ga/:city', destination: '/internet/georgia/:city', permanent: true },
      { source: '/internet/hi/:city', destination: '/internet/hawaii/:city', permanent: true },
      { source: '/internet/id/:city', destination: '/internet/idaho/:city', permanent: true },
      { source: '/internet/il/:city', destination: '/internet/illinois/:city', permanent: true },
      { source: '/internet/in/:city', destination: '/internet/indiana/:city', permanent: true },
      { source: '/internet/ia/:city', destination: '/internet/iowa/:city', permanent: true },
      { source: '/internet/ks/:city', destination: '/internet/kansas/:city', permanent: true },
      { source: '/internet/ky/:city', destination: '/internet/kentucky/:city', permanent: true },
      { source: '/internet/la/:city', destination: '/internet/louisiana/:city', permanent: true },
      { source: '/internet/me/:city', destination: '/internet/maine/:city', permanent: true },
      { source: '/internet/md/:city', destination: '/internet/maryland/:city', permanent: true },
      { source: '/internet/ma/:city', destination: '/internet/massachusetts/:city', permanent: true },
      { source: '/internet/mi/:city', destination: '/internet/michigan/:city', permanent: true },
      { source: '/internet/mn/:city', destination: '/internet/minnesota/:city', permanent: true },
      { source: '/internet/ms/:city', destination: '/internet/mississippi/:city', permanent: true },
      { source: '/internet/mo/:city', destination: '/internet/missouri/:city', permanent: true },
      { source: '/internet/mt/:city', destination: '/internet/montana/:city', permanent: true },
      { source: '/internet/ne/:city', destination: '/internet/nebraska/:city', permanent: true },
      { source: '/internet/nv/:city', destination: '/internet/nevada/:city', permanent: true },
      { source: '/internet/nh/:city', destination: '/internet/new-hampshire/:city', permanent: true },
      { source: '/internet/nj/:city', destination: '/internet/new-jersey/:city', permanent: true },
      { source: '/internet/nm/:city', destination: '/internet/new-mexico/:city', permanent: true },
      { source: '/internet/ny/:city', destination: '/internet/new-york/:city', permanent: true },
      { source: '/internet/nc/:city', destination: '/internet/north-carolina/:city', permanent: true },
      { source: '/internet/nd/:city', destination: '/internet/north-dakota/:city', permanent: true },
      { source: '/internet/oh/:city', destination: '/internet/ohio/:city', permanent: true },
      { source: '/internet/ok/:city', destination: '/internet/oklahoma/:city', permanent: true },
      { source: '/internet/or/:city', destination: '/internet/oregon/:city', permanent: true },
      { source: '/internet/pa/:city', destination: '/internet/pennsylvania/:city', permanent: true },
      { source: '/internet/ri/:city', destination: '/internet/rhode-island/:city', permanent: true },
      { source: '/internet/sc/:city', destination: '/internet/south-carolina/:city', permanent: true },
      { source: '/internet/sd/:city', destination: '/internet/south-dakota/:city', permanent: true },
      { source: '/internet/tn/:city', destination: '/internet/tennessee/:city', permanent: true },
      { source: '/internet/tx/:city', destination: '/internet/texas/:city', permanent: true },
      { source: '/internet/ut/:city', destination: '/internet/utah/:city', permanent: true },
      { source: '/internet/vt/:city', destination: '/internet/vermont/:city', permanent: true },
      { source: '/internet/va/:city', destination: '/internet/virginia/:city', permanent: true },
      { source: '/internet/wa/:city', destination: '/internet/washington/:city', permanent: true },
      { source: '/internet/wv/:city', destination: '/internet/west-virginia/:city', permanent: true },
      { source: '/internet/wi/:city', destination: '/internet/wisconsin/:city', permanent: true },
      { source: '/internet/wy/:city', destination: '/internet/wyoming/:city', permanent: true },
      { source: '/internet/dc/:city', destination: '/internet/district-of-columbia/:city', permanent: true },

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

// Wrap with PWA first, then Sentry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pwaConfig = withPWA(nextConfig as any);

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Webpack-specific options (new format to avoid deprecation warnings)
  webpack: {
    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
    // Enables automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,
  },
};

export default withSentryConfig(pwaConfig, sentryWebpackPluginOptions);
