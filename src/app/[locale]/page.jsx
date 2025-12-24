"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import heroAnimation from "../../../public/animations/Hero.json";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";

const metadata = {
  title: "Invexix — Global Business Management",
};

export default function HomePage() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billing, setBilling] = useState("monthly");

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center z-20">
              <span className="flex items-center">
                <Image
                  src="/logo/Invexix Logo - Dark Mode.svg"
                  alt="Invexix Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                {/* <Image
                  src="/logo/Invexix Word Logo.svg"
                  alt="Invexix Logo"
                  width={80}
                  height={60}
                  className="mr-2"
                /> */}
              </span>
              <span className="text-xl md:text-2xl font-extrabold text-slate-900">
                Invexix
                <span className="text-orange-500">.</span>
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden z-20 p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Right-side actions */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <nav className="flex items-center gap-6">
                <Link
                  href={`/${locale}`}
                  className="text-sm text-slate-700 hover:text-slate-900 transition"
                >
                  {t("nav.home")}
                </Link>
                <Link
                  href="#features"
                  className="text-sm text-slate-700 hover:text-slate-900 transition"
                >
                  {t("nav.features")}
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm text-slate-700 hover:text-slate-900 transition"
                >
                  {t("nav.pricing")}
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-sm text-slate-700 px-4 py-1 hover:text-orange-500 transition"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href={`/${locale}/auth/signup`}
                  className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  {t("cta.start")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden fixed inset-0 bg-black/30 z-10"
              />

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-20 overflow-hidden"
              >
                <nav className="flex flex-col p-6 space-y-3">
                  <Link
                    href={`/${locale}`}
                    className="font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.home")}
                  </Link>
                  <Link
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.features")}
                  </Link>
                  <Link
                    href="#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.pricing")}
                  </Link>
                  <div className="pt-4 border-t mt-4">
                    <Link
                      href={`/${locale}/auth/login`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      href={`/${locale}/auth/signup`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-orange-500 font-semibold"
                    >
                      {t("cta.start")}
                    </Link>
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-linear-to-b from-[#0b2036] to-[#071426] text-white">
        <div className="absolute -top-40 left-0 w-[80%] h-[400px] rounded-b-full bg-linear-to-r from-orange-600/30 to-transparent opacity-20 blur-3xl rotate-2" />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              {t("hero.title")}
            </h1>
            <p className="mt-4 text-lg text-orange-100/80 max-w-xl">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href={`/${locale}/auth/signup`}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg"
              >
                {t("cta.start")}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-white/90 px-4 py-2 rounded-lg border border-white/10"
              >
                {t("cta.demo")}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 max-w-md">
              <div className="bg-white/5 rounded-md px-4 py-3">
                <div className="text-xs text-orange-300 uppercase font-medium tracking-wider">
                  {t("hero.kpi1.title")}
                </div>
                <div className="font-bold text-xl mt-1">
                  {t("hero.kpi1.value")}
                </div>
              </div>
              <div className="bg-white/5 rounded-md px-4 py-3">
                <div className="text-xs text-orange-300 uppercase font-medium tracking-wider">
                  {t("hero.kpi2.title")}
                </div>
                <div className="font-bold text-xl mt-1">
                  {t("hero.kpi2.value")}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-2xl bg-white/5 rounded-3xl p-6 shadow-2xl">
              <div className="h-96 bg-linear-to-b from-white/5 to-transparent rounded-xl flex items-center justify-center">
                {/* Placeholder for dashboard mockup */}
                <Lottie
                  animationData={heroAnimation}
                  loop
                  className="max-w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-sm uppercase text-slate-500 font-semibold">
            {t("trust.heading")}
          </h3>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-6 items-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 flex items-center justify-center text-slate-400 bg-gray-50 rounded-md"
              >
                Logo {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold">{t("features.title")}</h2>
            <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚙️",
                title: t("features.operations.title"),
                desc: t("features.operations.desc"),
              },
              {
                icon: "📦",
                title: t("features.inventory.title"),
                desc: t("features.inventory.desc"),
              },
              {
                icon: "📊",
                title: t("features.analytics.title"),
                desc: t("features.analytics.desc"),
              },
              {
                icon: "👥",
                title: t("features.staff.title"),
                desc: t("features.staff.desc"),
              },
              {
                icon: "🔔",
                title: t("features.notifications.title"),
                desc: t("features.notifications.desc"),
              },
              {
                icon: "📑",
                title: t("features.logs.title"),
                desc: t("features.logs.desc"),
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition"
              >
                <div className="text-3xl">{f.icon}</div>
                <div className="mt-4 font-semibold">{f.title}</div>
                <div className="mt-2 text-sm text-slate-600">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h3 className="text-lg font-extrabold">{t("how.title")}</h3>
            <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
              {t("how.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              t("how.steps.step1"),
              t("how.steps.step2"),
              t("how.steps.step3"),
              t("how.steps.step4"),
              t("how.steps.step5"),
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl text-center">
                <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                  {i + 1}
                </div>
                <div className="mt-4 font-semibold">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-extrabold">{t("why.title")}</h3>
            <p className="mt-4 text-slate-600">{t("why.subtitle")}</p>

            <ul className="mt-6 space-y-3 text-slate-700">
              {[
                t("why.items.0"),
                t("why.items.1"),
                t("why.items.2"),
                t("why.items.3"),
              ].map((it, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="text-orange-500 mt-1">•</div>
                  <div>{it}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-64 bg-linear-to-b from-white/5 to-transparent rounded-xl flex items-center justify-center">
              Dashboard preview
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold">{t("pricing.title")}</h2>
          <p className="mt-2 text-slate-600 max-w-xl mx-auto">
            {t("pricing.subtitle")}
          </p>

          <div className="mt-8 inline-flex items-center gap-4 bg-gray-50 rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 rounded-full ${
                billing === "monthly" ? "bg-white shadow" : ""
              }`}
            >
              {t("pricing.month")}
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-2 rounded-full ${
                billing === "yearly" ? "bg-white shadow" : ""
              }`}
            >
              {t("pricing.year")}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                plan: "Basic",
                price: billing === "monthly" ? "$19" : "$190",
                bullets: ["Inventory", "Sales"],
              },
              {
                plan: "Mid",
                price: billing === "monthly" ? "$59" : "$590",
                bullets: ["Everything in Basic", "Reports"],
              },
              {
                plan: "Pro",
                price: billing === "monthly" ? "$199" : "$1990",
                bullets: ["Enterprise", "SLA"],
              },
            ].map((p, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl shadow-sm bg-white ${
                  i === 1 ? "border-2 border-orange-500 scale-100" : ""
                }`}
              >
                <div className="text-sm text-slate-500 uppercase font-semibold">
                  {p.plan}
                </div>
                <div className="mt-4 text-3xl font-extrabold">
                  {p.price}
                  <span className="text-sm text-slate-500">
                    /
                    {billing === "monthly"
                      ? t("pricing.month")
                      : t("pricing.year")}
                  </span>
                </div>
                <ul className="mt-6 text-sm text-slate-700 space-y-2">
                  {p.bullets.map((b, j) => (
                    <li key={j}>• {b}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href={`/${locale}/auth/signup`}
                    className="w-full inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                  >
                    {t("pricing.cta")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-xl font-extrabold">{t("cases.title")}</h3>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            {t("cases.subtitle")}
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              t("cases.items.retail"),
              t("cases.items.wholesale"),
              t("cases.items.services"),
              t("cases.items.logistics"),
            ].map((c, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-[#0b2036] text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold">{t("cta.final.title")}</h2>
          <p className="mt-2 text-slate-200 max-w-2xl mx-auto">
            {t("cta.final.subtitle")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href={`/${locale}/auth/signup`}
              className="bg-orange-500 px-6 py-3 rounded-lg font-semibold"
            >
              {t("cta.start")}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="border border-white/20 px-5 py-3 rounded-lg"
            >
              {t("cta.demo")}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-extrabold">Invexix</div>
            <p className="mt-4 text-sm text-slate-600">{t("footer.desc")}</p>
          </div>
          <div>
            <div className="font-semibold">{t("footer.links.title")}</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>{t("footer.links.about")}</li>
              <li>{t("footer.links.features")}</li>
              <li>{t("footer.links.pricing")}</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">{t("footer.contact.title")}</div>
            <div className="mt-4 text-sm text-slate-600">
              {t("footer.contact.email")}
            </div>
          </div>
          <div>
            <div className="font-semibold">{t("footer.legal.title")}</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>{t("footer.legal.privacy")}</li>
              <li>{t("footer.legal.terms")}</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
