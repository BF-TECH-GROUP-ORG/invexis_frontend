// src/app/[locale]/layout.jsx
import "../../styles/globals.css";
import ClientProviders from "../../providers/ClientProviders";
import { ThemeRegistry } from "../../providers/ThemeRegistry";
import LayoutWrapper from "@/components/layouts/LayoutWrapper";
import SettingsInitializer from "@/components/shared/SettingsInitializer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "../../../routing";
import { notFound } from "next/navigation";

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

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-metropolis antialiased">
        <NextIntlClientProvider messages={messages}>
          <ClientProviders>
            <ThemeRegistry>
              {/* Initialize settings from localStorage */}
              <SettingsInitializer />
              <LayoutWrapper>{children}</LayoutWrapper>
            </ThemeRegistry>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}