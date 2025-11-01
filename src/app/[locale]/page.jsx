"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import heroAnimation from "../../../public/animations/Hero.json";
import { useTranslations, useLocale } from "next-intl";

const metadata = {
  title: "Home",
};

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <div className="p-2 bg-white">
      <header className="relative bg-orange-100">
        <div className="max-w-7xl mx-auto px-1">
          <div className="flex items-center justify-between h-20 gap-x-20">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-extrabold">
                INVEX<span className="text-orange-500">iS</span>
              </span>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-8">
              <span className="flex items-center justify-center">
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-sm text-gray-800 px-4 py-1 hover:text-orange-500 transition hidden md:inline-block border-r border-black"
                >
                  {t("login")}
                </Link>
                <Link
                  href={`/${locale}/auth/signup`}
                  className="text-sm text-gray-800 px-4 hover:text-orange-500 transition hidden md:inline-block"
                >
                  {t("register")}
                </Link>
              </span>
              <button
                aria-label="Search"
                className="w-10 h-10 rounded-full border border-orange-400 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Center Nav */}
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2">
          <div className="relative inline-block">
            <div className="absolute inset-0 -top-1/2 bg-white rounded-b-3xl" />
            <nav className="relative flex items-center gap-16 px-20 py-2">
              <Link
                href={`/${locale}`}
                className="text-orange-500 font-semibold hover:text-orange-600"
              >
                {t("home")}
              </Link>
              <Link
                href="#about"
                className="text-gray-700 hover:text-orange-500 transition"
              >
                {t("about")}
              </Link>
              <Link
                href="#faq"
                className="text-gray-700 hover:text-orange-500 transition"
              >
                {t("faq")}
              </Link>
              <Link
                href="#services"
                className="text-gray-700 hover:text-orange-500 transition"
              >
                {t("services")}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between flex-1 px-6 py-10 md:px-12 lg:px-20 bg-orange-100">
        <motion.div
          className="max-w-lg space-y-6 md:mr-6"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-snug text-gray-900">
            {t("hero.title1")} <br />
            <span className="text-orange-500">{t("hero.title2")}</span>
          </h1>
          <p className="text-gray-600 text-lg">{t("hero.subtitle")}</p>
          <Link href={`/${locale}/welcome`}>
            <motion.button
              className="px-6 py-3 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("hero.getStarted")}
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          className="flex justify-center md:justify-end w-full md:w-[40%] mb-8 md:mb-0"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          <Lottie
            animationData={heroAnimation}
            loop={true}
            className="w-[100%] max-w-md"
          />
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-8 py-12 md:px-16 bg-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {[
          { number: "25K+", label: t("stats.users") },
          { number: "158", label: t("stats.system") },
          { number: "100%", label: t("stats.satisfaction") },
          { number: "99.9%", label: t("stats.uptime") },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="bg-gray-50 rounded-lg shadow p-6 text-center hover:shadow-lg transition"
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-orange-500">
              {stat.number}
            </h2>
            <p className="text-gray-600 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}