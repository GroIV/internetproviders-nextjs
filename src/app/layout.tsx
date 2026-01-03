import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { LocationProvider } from "@/contexts/LocationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppShell } from "@/components/AppShell";
import { InstallPrompt } from "@/components/InstallPrompt";
import { JsonLd, generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import { GlobalBackground } from "@/components/effects/GlobalBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WebVitals } from "@/components/WebVitals";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const SITE_URL = "https://www.internetproviders.ai";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "InternetProviders.ai - Find the Best Internet Service",
    template: "%s | InternetProviders.ai",
  },
  description: "Compare internet providers in your area. Find the best deals on fiber, cable, DSL, and 5G internet service.",
  keywords: ["internet providers", "ISP comparison", "fiber internet", "cable internet", "best internet service"],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ISP Compare",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "InternetProviders.ai",
  },
  twitter: {
    card: "summary_large_image",
    site: "@internetprovidersai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('ipai-theme');
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={[generateOrganizationSchema(), generateWebSiteSchema()]} />
      </head>
      <body className={`${outfit.variable} font-sans antialiased bg-gray-950 text-gray-100 min-h-screen flex flex-col overflow-x-hidden`}>
        {/* Web Vitals monitoring */}
        <WebVitals />

        {/* Global animated background - fixed, behind all content */}
        <GlobalBackground />

        {/* Content wrapper - above background */}
        <div className="relative z-10 flex flex-col min-h-screen overflow-x-hidden max-w-full">
          <ErrorBoundary>
            <ThemeProvider>
              <LocationProvider>
                <ChatProvider>
                  <Navbar />
                  <AppShell>
                    {children}
                  </AppShell>
                  <InstallPrompt />
                </ChatProvider>
              </LocationProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}
