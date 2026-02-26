"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect, Suspense } from "react";
import styles from "@/styles/landing.module.css";
import {
  ArrowRight,
  Box,
  Zap,
  Shield,
  Database,
  Layout,
  Package,
  Users,
  CheckCircle2,
  Globe,
  Star,
  ChevronRight,
  ChevronDown,
  Plus,
  ArrowUp,
  Menu,
  X,
} from "lucide-react";
import { useRef } from "react";

// Counting Animation Component
function CountingNumber({ value, duration = 2 }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min(
        (timestamp - startTimestamp) / (duration * 1000),
        1
      );
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        window.requestAnimationFrame(step);
        observer.disconnect();
      }
    });

    if (countRef.current) observer.observe(countRef.current);

    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={countRef}>{count.toLocaleString()}</span>;
}

const BackgroundRain = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const particles = Array.from({ length: 20 });
  return (
    <div className={styles.rainContainer}>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={styles.particle}
          initial={{
            top: -20,
            left: `${Math.random() * 100}%`,
            opacity: 0
          }}
          animate={{
            top: "100%",
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

function HomePageContent() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations("landing");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [billing, setBilling] = useState("monthly");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const locales = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
    { code: "sw", name: "Kiswahili", flag: "🇹🇿" },
  ];

  const handleLocaleChange = (newLocale) => {
    router.replace(pathname, { locale: newLocale });
    setIsLangOpen(false);
  };

  // Smart Navbar State
  const [navVisible, setNavVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always keep nav visible, only track if we've scrolled past a small threshold
      setNavScrolled(currentScrollY > 50);
      setNavVisible(true);
      setShowScrollTop(currentScrollY > 1000);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`${styles.landingBody} font-metropolis`} id="home">
      {/* Background Circuit Lines - Redesigned with Orange Glow */}
      <div className={styles.circuitLines}>
        <svg
          className={styles.svgCircuit}
          viewBox="0 0 1440 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={styles.circuitPath}
            d="M0 100 L300 100 L400 200 L800 200 L900 300 L1440 300"
            stroke="rgba(249, 115, 22, 0.4)"
            strokeWidth="2"
          />
          <path
            className={styles.circuitPath}
            d="M1440 700 L1100 700 L1000 600 L600 600 L500 500 L0 500"
            stroke="rgba(251, 191, 36, 0.4)"
            strokeWidth="2"
            style={{ animationDelay: "1s" }}
          />
          <circle cx="300" cy="100" r="4" fill="#f97316" fillOpacity="0.6" />
          <circle cx="800" cy="200" r="4" fill="#f97316" fillOpacity="0.6" />
          <circle cx="1100" cy="700" r="4" fill="#fbbf24" fillOpacity="0.6" />
        </svg>
      </div>

      {/* Smart Nav - Orange Theme */}
      <nav
        className={`${styles.nav} ${navScrolled ? styles.navScrolled : ""} ${!navVisible ? styles.navHidden : ""
          }`}
      >
        <div className="flex items-center gap-3">
          <Link href="#home" className="flex items-center gap-3">
            <Image
              src="/logo/Invexix Logo - Dark Mode.svg"
              alt="Invexix Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-2xl font-black tracking-tighter">
              INVEXIX
            </span>
          </Link>
        </div>

        <div className={styles.navLinks}>
          <a href="#home">{t("nav.home")}</a>
          <a href="#about">{t("nav.about")}</a>
          <a href="#features">{t("nav.features")}</a>
          <a href="#pricing">{t("nav.pricing")}</a>
          <a href="#why">{t("nav.why")}</a>
          <a href="#faq">{t("nav.faq")}</a>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Picker */}
          <div className="relative mr-2">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-all text-sm font-bold text-gray-700"
            >
              <span>{locales.find((l) => l.code === locale)?.flag}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isLangOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 p-2"
              >
                {locales.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLocaleChange(l.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${locale === l.code
                      ? "bg-orange-50 text-orange-700 font-bold"
                      : "hover:bg-gray-50 text-gray-600 font-medium"
                      }`}
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span className="text-sm">{l.name}</span>
                    {locale === l.code && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className={styles.desktopOnly}>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href={`/${locale}/inventory/dashboard`}
                  className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
                >
                  {t("nav.dashboard")}
                </Link>
              ) : (
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
                >
                  {t("nav.login")}
                </Link>
              )}
              <Link
                href={isAuthenticated ? `/${locale}/inventory/dashboard` : `/${locale}/welcome`}
                className={styles.joinWaitlist}
              >
                {isAuthenticated ? t("nav.dashboard") : t("cta.start")}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileMenuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, x: 0, pointerEvents: "auto" },
          closed: { opacity: 0, x: "100%", pointerEvents: "none" },
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={styles.mobileMenu}
      >
        <div className={styles.mobileMenuContent}>
          <div className={styles.mobileNavLinks}>
            <a href="#home" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.home")}</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.about")}</a>
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.features")}</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.pricing")}</a>
            <a href="#why" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.why")}</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.faq")}</a>
          </div>

          <div className={styles.mobileAuthActions}>
            {isAuthenticated ? (
              <Link
                href={`/${locale}/inventory/dashboard`}
                className={styles.mobileAuthLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  className={styles.mobileAuthLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href={`/${locale}/auth/signup`}
                  className={styles.mobileJoinBtn}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("cta.start")}
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <BackgroundRain />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 sm:pb-32 flex flex-col items-center text-center"
        >
          <motion.div
            variants={itemVariants}
            className={`${styles.heroLogoBox}`}
            style={{ background: "transparent", boxShadow: "none" }}
          >
            <div className="relative w-28 h-28 mx-auto">
              {/* <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full" /> */}
              <Image
                src="/logo/Invexix Logo - Dark Mode.svg"
                alt="Invexix Logo"
                fill
                className="object-contain relative z-10"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.featureBadge}>
            <Star className="w-3 h-3 text-orange-500" fill="currentColor" />
            <span>{t("hero.badge")}</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className={styles.heroTitle}>
            {t.rich("hero.title", {
              br: () => <br />,
              spanClassName: (chunks) => <span className={styles.gradientText}>{chunks}</span>
            })}
          </motion.h1>

          <motion.p variants={itemVariants} className={styles.heroSubtitle}>
            {t("hero.subtitle")}
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href={isAuthenticated ? `/${locale}/inventory/dashboard` : `/${locale}/auth/signup`}
              className={styles.joinWaitlist}
              style={{
                padding: "1.25rem 3rem",
                fontSize: "1.125rem",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
              }}
            >
              {isAuthenticated ? t("cta.dashboard") : t("cta.startBtn")}
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <Users className="w-4 h-4 text-gray-400" />
              <span>
                {t("trust.heading")}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className={styles.featureSection}>
        <div className={styles.aboutGrid}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={styles.aboutText}
          >
            <div className={styles.featureBadge}>{t("about.badge")}</div>
            <h2 className={styles.aboutTitle}>
              {t.rich("about.title", {
                spanClassName: (chunks) => <span className={styles.gradientText}>{chunks}</span>
              })}
            </h2>
            <p className={styles.aboutParagraph}>
              {t("about.desc")}
            </p>
            <div className="space-y-4 mt-8">
              {Object.keys(t.raw("about.points")).map((key, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 size={18} className="text-orange-500" />
                  <span className="font-semibold">{t(`about.points.${key}`)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center p-4"
          >
            <div className="relative w-full aspect-square max-w-[600px] min-h-[400px]">
              <Image
                src="/images/tobeUsed.png"
                alt="Invexix Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className={styles.howSection}>
        <div className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.featureBadge + " mx-auto"}
          >
            {t("how.badge")}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={styles.featureTitle}
          >
            {t("how.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={styles.featureSubtitle + " mx-auto"}
          >
            {t("how.subtitle")}
          </motion.p>
        </div>

        <div className={styles.howGrid}>
          {[
            {
              key: "s1",
              icon: <Layout size={32} />,
            },
            {
              key: "s2",
              icon: <Package size={32} />,
            },
            {
              key: "s3",
              icon: <Zap size={32} />,
            },
            {
              key: "s4",
              icon: <Database size={32} />,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={styles.howCard}
            >
              <div className={styles.howStepNumber}>{i + 1}</div>
              <div className={styles.howIconWrapper}>{item.icon}</div>
              <div className={styles.howStepTag}>{`Step 0${i + 1}`}</div>
              <h4 className={styles.howCardTitle}>
                {t(`how.steps.${item.key}.title`)}
              </h4>
              <p className={styles.howCardDesc}>
                {t(`how.steps.${item.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featureSection}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.featureBadge}
          >
            {t("features.title")}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={styles.featureTitle}
          >
            {t("features.subtitle")}
          </motion.h2>
        </div>

        <div className={styles.featureGrid}>
          {[
            {
              key: "inventory",
              icon: <Database />,
            },
            {
              key: "sales",
              icon: <Zap />,
            },
            {
              key: "debts",
              icon: <Database />,
            },
            {
              key: "payments",
              icon: <Shield />,
            },
            {
              key: "analytics",
              icon: <Layout />,
            },
            {
              key: "notifications",
              icon: <Zap />,
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={styles.featureItem}
            >
              <div className={styles.featureIconBox}>{feature.icon}</div>
              <h4 className="text-xl font-bold mb-3">{t(`features.items.${feature.key}.title`)}</h4>
              <p className="text-gray-500 leading-relaxed text-sm">
                {t(`features.items.${feature.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.featureSection}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.featureBadge}
          >
            {t("pricing.badge")}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={styles.featureTitle}
          >
            {t("pricing.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={styles.featureSubtitle + " mx-auto"}
          >
            {t("pricing.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={styles.pricingToggle}
          >
            <button
              className={`${styles.toggleBtn} ${billing === "monthly" ? styles.toggleBtnActive : ""
                }`}
              onClick={() => setBilling("monthly")}
            >
              {t("pricing.toggle.monthly")}
            </button>
            <button
              className={`${styles.toggleBtn} ${billing === "yearly" ? styles.toggleBtnActive : ""
                }`}
              onClick={() => setBilling("yearly")}
            >
              {t("pricing.toggle.yearly")}
            </button>
          </motion.div>
        </div>

        <div className={styles.pricingGrid}>
          {[
            {
              key: "onboarding",
              featured: false,
            },
            {
              key: "standard",
              featured: true,
            },
            {
              key: "pro",
              featured: false,
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${styles.priceCard} ${plan.featured ? styles.priceCardFeatured : ""
                }`}
            >
              {plan.featured && (
                <div className={styles.bestValue}>{t(`pricing.plans.${plan.key}.popular`)}</div>
              )}
              <h4 className="text-xl font-bold">{t(`pricing.plans.${plan.key}.title`)}</h4>
              <div className={styles.priceValue}>{t(`pricing.plans.${plan.key}.price`)}</div>
              <p className={styles.priceSub}>{t(`pricing.plans.${plan.key}.sub`)}</p>
              <ul className={styles.checkList}>
                {Object.keys(t.raw(`pricing.plans.${plan.key}.features`)).map((fKey, j) => (
                  <li key={j} className={styles.checkItem}>
                    <CheckCircle2 size={16} className="text-orange-500" />
                    <span>{t(`pricing.plans.${plan.key}.features.${fKey}`)}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`${styles.priceBtn} ${!plan.featured ? styles.priceBtnSecondary : ""
                  }`}
              >
                {t(`pricing.plans.${plan.key}.btn`)}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Stunning Comparison Table */}
        <div className="mt-40">
          <div className="text-center mb-16">
            <div className={styles.featureBadge}>Detailed Breakdown</div>
            <h3 className="text-4xl font-bold">Pricing Comparison</h3>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.comparisonTableContainer}
          >
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Feature Hierarchy</th>
                  <th>Starter</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Global Dashboard", starter: true, enterprise: true },
                  {
                    name: "Automated Reporting",
                    starter: true,
                    enterprise: true,
                  },
                  { name: "AI Assistant", starter: false, enterprise: true },
                  { name: "Offline Mode", starter: false, enterprise: true },
                  {
                    name: "24/7 Priority Support",
                    starter: false,
                    enterprise: true,
                  },
                  {
                    name: "Advanced Security",
                    starter: true,
                    enterprise: true,
                  },
                ].map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td>
                      {row.starter ? (
                        <CheckCircle2
                          className={styles.checkIcon + " w-5 h-5"}
                        />
                      ) : (
                        <Box className={styles.crossIcon + " w-5 h-5"} />
                      )}
                    </td>
                    <td>
                      {row.enterprise ? (
                        <CheckCircle2
                          className={styles.checkIcon + " w-5 h-5"}
                        />
                      ) : (
                        <Box className={styles.crossIcon + " w-5 h-5"} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Why Use Invexix Section */}
      <section id="why" className={styles.featureSection}>
        <div className="text-center mb-16">
          <div className={styles.featureBadge}>
            {t("why.badge")}
          </div>
          <h2 className={styles.featureTitle}>
            {t.rich("why.title", {
              spanClassName: (chunks) => <span className={styles.gradientText}>{chunks}</span>
            })}
          </h2>
        </div>

        <div className={styles.whyUsGrid}>
          {[
            {
              key: "ops",
              icon: <Zap />,
            },
            {
              key: "allinone",
              icon: <Layout />,
            },
            {
              key: "control",
              icon: <Globe />,
            },
            {
              key: "secure",
              icon: <Shield />,
            },
            {
              key: "scales",
              icon: <ArrowRight />,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={styles.whyUsCard}
            >
              <div className={styles.benefitIcon}>{item.icon}</div>
              <h4 className="text-xl font-bold mb-4">{t(`why.items.${item.key}.title`)}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t(`why.items.${item.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={styles.featureSection}>
        <div className="text-center mb-16">
          <div className={styles.featureBadge}>{t("faq.badge")}</div>
          <h2 className={styles.featureTitle}>{t("faq.title")}</h2>
        </div>

        <div className={styles.faqContainer}>
          {Object.keys(t.raw("faq.items")).map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={styles.faqItem}
            >
              <button
                className={styles.faqHeader}
                onClick={() => setExpandedFaq(expandedFaq === key ? null : key)}
              >
                <span>{t(`faq.items.${key}.q`)}</span>
                <motion.div
                  animate={{ rotate: expandedFaq === key ? 45 : 0 }}
                  className="text-orange-500"
                >
                  <Plus size={20} />
                </motion.div>
              </button>
              {expandedFaq === key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className={styles.faqBody}
                >
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {t(`faq.items.${key}.a`)}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.ctaCard}
        >
          <h2 className={styles.ctaTitle}>
            {t("cta.final.title")}
          </h2>
          <p className={styles.ctaSubtext}>
            {t("cta.final.subtitle")}
          </p>
          <div className={styles.ctaBtns}>
            <Link
              href={isAuthenticated ? `/${locale}/inventory/dashboard` : `/${locale}/auth/signup`}
              className={styles.ctaPrimary}
            >
              {isAuthenticated ? t("cta.final.openDashboard") : t("cta.final.startTrial")}
            </Link>
            <Link href="#contact" className={styles.ctaSecondary}>
              {t("cta.demo")}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Waitlist Section */}
      <section className={styles.waitlistSection}>
        <div className={styles.waitlistContainer}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={styles.waitlistContent}
          >
            <div className={styles.featureBadge}>{t("waitlist.badge")}</div>
            <h2 className={styles.waitlistTitle}>
              {t.rich("waitlist.title", {
                spanClassName: (chunks) => <span className={styles.gradientText}>{chunks}</span>
              })}
            </h2>
            <p className={styles.waitlistSubtitle}>
              {t("waitlist.subtitle")}
            </p>
            <div className={styles.waitlistForm}>
              <input
                type="email"
                placeholder={t("waitlist.placeholder")}
                className={styles.waitlistInput}
              />
              <button className={styles.waitlistSubmit}>{t("waitlist.button")}</button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 hidden lg:block"
          >
            <div
              className={styles.glassCard}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <div className="space-y-6 p-10 rounded-2xl">
                <div className="flex justify-between items-center text-white">
                  <div className="font-bold">{t("waitlist.metrics.capacity")}</div>
                  <div className="text-orange-500 font-black">
                    {t("waitlist.metrics.full", { percentage: 84 })}
                  </div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "84%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-linear-to-r from-orange-500 to-amber-500"
                  />
                </div>
                <div className="flex -space-x-2">
                  {["#f97316", "#fbbf24", "#3b82f6", "#10b981", "#ef4444"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-[#081422] flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
                        style={{ backgroundColor: color }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    )
                  )}
                  <div className="w-8 h-8 rounded-full border-2 border-[#081422] bg-gray-700 flex items-center justify-center text-[10px] font-bold text-white">
                    +150
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {t("waitlist.metrics.trust")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className={styles.premiumFooter}>
        <div className={styles.footerWrapper}>
          <div className={styles.footerMain}>
            <div className={styles.footerBrand}>
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/logo/Invexix Logo - Dark Mode.svg"
                  alt="Logo"
                  width={38}
                  height={38}
                  className="brightness-0 invert"
                />
                <span className="text-2xl font-black tracking-tighter">
                  INVEXIX
                </span>
              </div>
              <p>
                {t("footer.desc")}
              </p>
              <div className={styles.socialGrid}>
                {[Globe, Star, Database, Shield].map((Icon, i) => (
                  <Link key={i} href="#" className={styles.socialIcon}>
                    <Icon size={18} />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className={styles.footerHeading}>{t("footer.links.title")}</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="#home">{t("footer.links.home")}</a>
                </li>
                <li>
                  <a href="#about">{t("footer.links.about")}</a>
                </li>
                <li>
                  <a href="#features">{t("footer.links.features")}</a>
                </li>
                <li>
                  <a href="#pricing">{t("footer.links.pricing")}</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerHeading}>{t("footer.company.title")}</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="#why">{t("footer.company.why")}</Link>
                </li>
                <li>
                  <Link href="#faq">{t("footer.company.faq")}</Link>
                </li>
                <li>
                  <Link href="#">{t("footer.company.privacy")}</Link>
                </li>
                <li>
                  <Link href="#">{t("footer.company.terms")}</Link>
                </li>
              </ul>
            </div>

            <div className={styles.footerNewsletter}>
              <h4>{t("footer.newsletter.title")}</h4>
              <p>
                {t("footer.newsletter.desc")}
              </p>
              <form
                className={styles.newsletterForm}
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder={t("footer.newsletter.placeholder")}
                  className={styles.newsletterInput}
                />
                <button className={styles.newsletterSubmit}>
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>{t("footer.bottom.copy")}</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">
                {t("footer.bottom.docs")}
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                {t("footer.bottom.support")}
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                {t("footer.bottom.status")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
      {/* Back to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={styles.scrollTop}
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </div>
  );
}


export default HomePageContent;
