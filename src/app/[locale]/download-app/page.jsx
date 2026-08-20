import React from "react";
import DownloadAppContent from "@/components/pages/download/DownloadAppContent";

export const metadata = {
  title: "Download Scanning App | Invexix",
  description: "Download the official Invexix mobile barcode scanner APK for Android and iOS devices.",
};

export default async function DownloadAppPage({ params }) {
  const { locale } = await params;
  return <DownloadAppContent locale={locale} />;
}
