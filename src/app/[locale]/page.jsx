
import { Suspense } from "react";
import LandingPageContent from "@/components/pages/landing/LandingPageContent";
import WhatsAppButton from "@/components/pages/landing/WhatsAppButton";
import GlobalLoader from "@/components/shared/GlobalLoader";

export const metadata = {
  title: "Invexix - Powerhouse for your modern business",
  description: "Experience the next generation of business management.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<GlobalLoader visible={true} text="Initializing..." forceLight={true} />}>
      <LandingPageContent />
      <WhatsAppButton />
    </Suspense>
  );
}
