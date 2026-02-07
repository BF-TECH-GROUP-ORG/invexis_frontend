// src/app/[locale]/layout.jsx
import { Suspense } from "react";
import "../../styles/globals.css";
import ClientProviders from "../../providers/ClientProviders";
import { ThemeRegistry } from "../../providers/ThemeRegistry";
import LayoutWrapper from "@/components/layouts/LayoutWrapper";
import SettingsInitializer from "@/components/shared/SettingsInitializer";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const metadata = {
  title: {
    default: "Dashboard | Invexis",
    template: "%s | Invexis",
  },
  description: "Inventory and business management dashboard",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

import AuthProvider from "@/providers/AuthProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";
import WebSocketProvider from "@/providers/WebSocketProvider";

// ... existing imports

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Get messages for the locale
  // const messages = await getMessages();

  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-metropolis antialiased">
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
