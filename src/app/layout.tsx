import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LocationProvider } from "@/contexts/LocationContext";
import { LocationBanner } from "@/components/LocationBanner";
import { JsonLd, generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const SITE_URL = "https://www.internetproviders.ai";

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
        <LocationProvider>
          <Navbar />
          <LocationBanner />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </LocationProvider>
      </body>
    </html>
  );
}
