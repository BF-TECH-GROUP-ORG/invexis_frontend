// app/welcome/page.tsx  (or wherever it lives)
import OnBoardingPage from "@/components/pages/OnboardingPage";
import { useTranslations } from "next-intl";

const steps = [
  { key: "welcome", image: "/images/1.png" },
  { key: "smart",   image: "/images/2.png" },
  { key: "roles",   image: "/images/3.png" },
  { key: "grow",    image: "/images/4.png" },
];

export const metadata = { title: "Welcome" };

export default function Welcome() {
  const t = useTranslations("onboarding");

  return (
    <section className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      <OnBoardingPage steps={steps.map(s => ({ ...s, title: t(s.key + "Title"), description: t(s.key + "Desc") }))} />
    </section>
  );
}