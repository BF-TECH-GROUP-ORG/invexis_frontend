// src/app/[locale]/layout.jsx
import { Suspense } from "react";
import "../../styles/globals.css";
import ClientProviders from "../../providers/ClientProviders";
import { ThemeRegistry } from "../../providers/ThemeRegistry";
import LayoutWrapper from "@/components/layouts/LayoutWrapper";
import SettingsInitializer from "@/components/shared/SettingsInitializer";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import AuthProvider from "@/providers/AuthProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";
import WebSocketProvider from "@/providers/WebSocketProvider";
import JsonLd from "@/components/seo/JsonLd";

export const metadata = {
  title: {
    default: "Dashboard | Invexis",
    template: "%s | Invexis",
  },
  description: "Inventory and business management dashboard",
  keywords: ["Invexis", "Inventory", "Business Management", "POS", "Rwanda", "Africa", "SaaS", "Dashboard"],
  authors: [{ name: "MIP Devs" }],
  creator: "MIP Devs",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://invexix.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'fr': '/fr',
      'rw': '/rw',
      'sw': '/sw',
    },
  },
  openGraph: {
    title: "Invexis - Smart Business Management",
    description: "Streamline your inventory, sales, and staff management with Invexis.",
    url: '/',
    siteName: 'Invexis',
    images: [
      {
        url: '/images/dashboard-hero.png', // Fallback OG image
        width: 1200,
        height: 630,
        alt: 'Invexis Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Invexis - Smart Business Management",
    description: "Streamline your inventory, sales, and staff management with Invexis.",
    images: ['/images/dashboard-hero.png'], // Fallback Twitter image
  },
  icons: {
    icon: "/images/Invexix Logo-Light Mode.png",
    shortcut: "/images/Invexix Logo-Light Mode.png",
    apple: "/images/Invexix Logo-Light Mode.png",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-metropolis antialiased">
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Invexis',
            url: process.env.NEXT_PUBLIC_APP_URL || 'https://invexix.com',
            logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://invexix.com'}/images/Invexix Logo-Light Mode.png`,
            sameAs: [
              'https://twitter.com/invexix',
              'https://facebook.com/invexix',
              'https://linkedin.com/company/invexix',
            ],
          }}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Invexix',
            url: process.env.NEXT_PUBLIC_APP_URL || 'https://invexix.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${process.env.NEXT_PUBLIC_APP_URL || 'https://invexix.com'}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <NextIntlClientProvider locale={locale}>
          <ClientProviders session={session}>
            <AuthProvider>
              <LoadingProvider>
                <ThemeRegistry>
                  <WebSocketProvider>
                    {/* Initialize settings from localStorage */}
                    <SettingsInitializer />
                    <Suspense fallback={null}>
                      <LayoutWrapper>{children}</LayoutWrapper>
                    </Suspense>
                  </WebSocketProvider>
                </ThemeRegistry>
              </LoadingProvider>
            </AuthProvider>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
