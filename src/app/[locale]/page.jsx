
import { Suspense } from "react";
import LandingPageContent from "@/components/pages/landing/LandingPageContent";

export const metadata = {
  title: "Invexix - Powerhouse for your modern business",
  description: "Experience the next generation of business management.",
};

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-[#081422]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <LandingPageContent />
    </Suspense>
  );
}
