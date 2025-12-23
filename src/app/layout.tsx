import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InternetProviders.ai - Find the Best Internet Service",
    template: "%s | InternetProviders.ai",
  },
  description: "Compare internet providers in your area. Find the best deals on fiber, cable, DSL, and 5G internet service.",
  keywords: ["internet providers", "ISP comparison", "fiber internet", "cable internet", "best internet service"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.internetproviders.ai",
    siteName: "InternetProviders.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased bg-gray-950 text-gray-100 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
