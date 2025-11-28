"use client";

import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import heroAnimation from "../../../public/animations/Hero.json";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";

const metadata = {
  title: "Home",
};

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="p-2 bg-white">
      <header className="relative bg-orange-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center z-20">
              <span className="text-xl md:text-2xl font-extrabold">
                INVEX<span className="text-orange-500">iS</span>
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden z-20 p-2 rounded-lg hover:bg-orange-200 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Right-side actions */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <span className="flex items-center justify-center">
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-sm text-gray-800 px-4 py-1 hover:text-orange-500 transition border-r border-black"
                >
                  {t("login")}
                </Link>
                <Link
                  href={`/${locale}/auth/signup`}
                  className="text-sm text-gray-800 px-4 hover:text-orange-500 transition"
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

        {/* Desktop Center Nav - Hidden on mobile */}
        <div className="hidden md:block absolute left-1/2 top-0 transform -translate-x-1/2">
          <div className="relative inline-block">
            <div className="absolute inset-0 -top-1/2 bg-white rounded-b-3xl" />
            <nav className="relative flex items-center gap-8 lg:gap-16 px-12 lg:px-20 py-2">
              <Link
                href={`/${locale}`}
                className="text-orange-500 font-semibold hover:text-orange-600 transition text-sm lg:text-base"
              >
                {t("home")}
              </Link>
              <Link
                href="#about"
                className="text-gray-700 hover:text-orange-500 transition text-sm lg:text-base"
              >
                {t("about")}
              </Link>
              <Link
                href="#faq"
                className="text-gray-700 hover:text-orange-500 transition text-sm lg:text-base"
              >
                {t("faq")}
              </Link>
              <Link
                href="#services"
                className="text-gray-700 hover:text-orange-500 transition text-sm lg:text-base"
              >
                {t("services")}
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile Menu - Slide down from top */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden fixed inset-0 bg-black/30 z-10"
              />

              {/* Mobile Nav Menu */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-20 overflow-hidden"
              >
                <nav className="flex flex-col p-6 space-y-4">
                  <Link
                    href={`/${locale}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-orange-500 font-semibold hover:text-orange-600 transition py-2 border-b border-gray-100"
                  >
                    {t("home")}
                  </Link>
                  <Link
                    href="#about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-orange-500 transition py-2 border-b border-gray-100"
                  >
                    {t("about")}
                  </Link>
                  <Link
                    href="#faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-orange-500 transition py-2 border-b border-gray-100"
                  >
                    {t("faq")}
                  </Link>
                  <Link
                    href="#services"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-orange-500 transition py-2 border-b border-gray-100"
                  >
                    {t("services")}
                  </Link>

                  {/* Mobile Auth Links */}
                  <div className="flex flex-col gap-3 pt-4 border-t-2 border-gray-200">
                    <Link
                      href={`/${locale}/auth/login`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href={`/${locale}/auth/signup`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-lg hover:bg-orange-50 transition font-semibold"
                    >
                      {t("register")}
                    </Link>
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-1  py-12 md:px-16 bg-white"
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
            className="bg-gray-50 rounded-lg shadow- p-6 text-center hover:shadow-lg transition"
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