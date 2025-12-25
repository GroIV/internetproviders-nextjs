import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LocationProvider } from "@/contexts/LocationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { LocationBanner } from "@/components/LocationBanner";
import { PageChatSection } from "@/components/PageChatSection";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { InstallPrompt } from "@/components/InstallPrompt";
import { JsonLd, generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import { GlobalBackground } from "@/components/effects/GlobalBackground";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <JsonLd data={[generateOrganizationSchema(), generateWebSiteSchema()]} />
      </head>
      <body className={`${outfit.variable} font-sans antialiased bg-gray-950 text-gray-100 min-h-screen flex flex-col`}>
        {/* Global animated background - fixed, behind all content */}
        <GlobalBackground />

        {/* Content wrapper - above background */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <LocationProvider>
            <ChatProvider>
              <Navbar />
              <LocationBanner />
              <PageChatSection />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <FloatingChatButton />
              <InstallPrompt />
            </ChatProvider>
          </LocationProvider>
        </div>
      </body>
    </html>
  );
}
