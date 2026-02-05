"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect, Suspense } from "react";
import styles from "@/styles/landing.module.css";
import {
  ArrowRight,
  Box,
  Zap,
  Shield,
  Database,
  Layout,
  Users,
  CheckCircle2,
  Globe,
  Star,
  ChevronRight,
  ChevronDown,
  Plus,
  ArrowUp,
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

function HomePageContent() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const [billing, setBilling] = useState("monthly");
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Smart Navbar State
  const [navVisible, setNavVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const threshold = window.innerHeight * 0.7;

      // Hiding/Showing logic
      if (currentScrollY > threshold) {
        if (!navScrolled) {
          // Just entered the sticky zone, show the nav
          setNavVisible(true);
        } else {
          if (currentScrollY > lastScrollY + 10) {
            // Tiny buffer to prevent flickering
            setNavVisible(false); // Scrolling down
          } else if (currentScrollY < lastScrollY - 10) {
            setNavVisible(true); // Scrolling up
          }
        }
        setNavScrolled(true);
      } else {
        setNavVisible(true);
        setNavScrolled(false);
      }

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
          <Link href="#home">Home</Link>
          <Link href="#about">About</Link>
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="#why">Why Us</Link>
          <Link href="#faq">FAQ</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/auth/login`}
            className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
          >
            Login
          </Link>
          <Link href={`/${locale}/welcome`} className={styles.joinWaitlist}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
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
            <span>Futuristic Business Intelligence</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className={styles.heroTitle}>
            Powerhouse for your <br />
            <span className={styles.gradientText}>modern business</span>
          </motion.h1>

          <motion.p variants={itemVariants} className={styles.heroSubtitle}>
            Experience the next generation of business management. Smart,
            automated, and built for high-performance teams.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href={`/${locale}/auth/signup`}
              className={styles.joinWaitlist}
              style={{
                padding: "1.25rem 3rem",
                fontSize: "1.125rem",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
              }}
            >
              Get Started Now
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <Users className="w-4 h-4 text-gray-400" />
              <span>
                Used by <CountingNumber value={150} />+ businesses
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
            <div className={styles.featureBadge}>About Invexix</div>
            <h2 className={styles.aboutTitle}>
              One Dashboard. <br />
              <span className={styles.gradientText}>
                Total Business Control.
              </span>
            </h2>
            <p className={styles.aboutParagraph}>
              Invexix helps you manage inventory, sales, staff, debts, reports,
              and payments in one powerful platform—so you always know what’s
              happening in your business, in real time.
            </p>
            <div className="space-y-4 mt-8">
              {[
                "Centralized business management",
                "Real-time data and insights",
                "Built for growing businesses",
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 size={18} className="text-orange-500" />
                  <span className="font-semibold">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={styles.dashboardPreviewContainer}
          >
            <div className={styles.dashboardMockup}>
              <Image
                src="/images/dashboard-hero.png"
                alt="Invexix Dashboard Preview"
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081422]/60 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featureSection}>
        <div className="text-center mb-20">
          <div className={styles.featureBadge}>Innovative Features</div>
          <h2 className={styles.featureTitle}>
            Everything Your Business <br />
            <span className={styles.gradientText}>Needs—In One Place</span>
          </h2>
        </div>

        <div className={styles.featureList}>
          {[
            {
              title: "Inventory Management",
              desc: "Track stock levels, movement, and value in real time. Never run out or overstock again.",
              icon: <Box />,
            },
            {
              title: "Sales & Revenue Tracking",
              desc: "Monitor daily sales, trends, and performance across your entire business.",
              icon: <Zap />,
            },
            {
              title: "Debts & Receivables",
              desc: "Know exactly who owes you, how much, and when—without manual tracking.",
              icon: <Database />,
            },
            {
              title: "Billing & Payments",
              desc: "Create invoices, track payments, and keep finances organized.",
              icon: <Shield />,
            },
            {
              title: "Reports & Analytics",
              desc: "Download professional reports and view clear dashboards that support smarter decisions.",
              icon: <Layout />,
            },
            {
              title: "Notifications & Alerts",
              desc: "Get instant alerts for low stock, overdue debts, and critical activity.",
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
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.desc}
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
            Plans That Grow With You
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={styles.featureTitle}
          >
            Pricing Options
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={styles.featureSubtitle + " mx-auto"}
          >
            Choose the subscription plan that suits your needs
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
              Monthly
            </button>
            <button
              className={`${styles.toggleBtn} ${billing === "yearly" ? styles.toggleBtnActive : ""
                }`}
              onClick={() => setBilling("yearly")}
            >
              Yearly
            </button>
          </motion.div>
        </div>

        <div className={styles.pricingGrid}>
          {[
            {
              title: "Onboarding Fee",
              price: "Variable",
              sub: "One-time setup fee",
              features: [
                "System configuration",
                "Team training",
                "Data migration assist",
              ],
              btn: "Contact Us",
              featured: false,
            },
            {
              title: "Standard Plan",
              price: "$29.99",
              sub: "Billed monthly",
              features: [
                "Full Dashboard access",
                "Basic Reports",
                "Team Collaboration",
                "Mobile Sync",
              ],
              btn: "Get Started",
              featured: true,
            },
            {
              title: "Pro Plan",
              price: "$59.99",
              sub: "Billed monthly",
              features: [
                "AI Integration",
                "Offline Mode",
                "Priority Support",
                "Advanced Analytics",
              ],
              btn: "Get Started",
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
                <div className={styles.bestValue}>Most Popular</div>
              )}
              <h4 className="text-xl font-bold">{plan.title}</h4>
              <div className={styles.priceValue}>{plan.price}</div>
              <p className={styles.priceSub}>{plan.sub}</p>
              <ul className={styles.checkList}>
                {plan.features.map((feature, j) => (
                  <li key={j} className={styles.checkItem}>
                    <CheckCircle2 size={16} className="text-orange-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`${styles.priceBtn} ${!plan.featured ? styles.priceBtnSecondary : ""
                  }`}
              >
                {plan.btn}
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
            Why Businesses Choose Invexix
          </div>
          <h2 className={styles.featureTitle}>
            Built for{" "}
            <span className={styles.gradientText}>Real Operations</span>
          </h2>
        </div>

        <div className={styles.whyUsGrid}>
          {[
            {
              icon: <Zap />,
              title: "Built for Real Operations",
              desc: "Designed around real business workflows—not spreadsheets or guesswork.",
            },
            {
              icon: <Layout />,
              title: "All-in-One Platform",
              desc: "Replace multiple tools with a single, reliable system.",
            },
            {
              icon: <Globe />,
              title: "Real-Time Control",
              desc: "Make decisions using live data, not outdated reports.",
            },
            {
              icon: <Shield />,
              title: "Secure & Reliable",
              desc: "Role-based access, audit logs, and data protection built in.",
            },
            {
              icon: <ArrowRight />,
              title: "Scales With You",
              desc: "From one store to multiple branches—Invexix grows as you grow.",
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
              <h4 className="text-xl font-bold mb-4">{item.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={styles.featureSection}>
        <div className="text-center mb-16">
          <div className={styles.featureBadge}>FAQ</div>
          <h2 className={styles.featureTitle}>Frequently Asked Questions</h2>
        </div>

        <div className={styles.faqContainer}>
          {[
            {
              q: "Who is Invexix for?",
              a: "Small businesses, growing companies, and multi-branch operations.",
            },
            {
              q: "Is Invexix easy to use?",
              a: "Yes. It’s designed to be simple, intuitive, and fast to learn.",
            },
            {
              q: "Can I access it on mobile?",
              a: "Yes. Access your business anytime, anywhere.",
            },
            {
              q: "Can I download reports?",
              a: "Yes. Generate and download professional PDF reports.",
            },
            {
              q: "Is my data secure?",
              a: "Absolutely. Invexix includes secure authentication, permissions, and audit logs.",
            },
          ].map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={styles.faqItem}
            >
              <button
                className={styles.faqHeader}
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                <motion.div
                  animate={{ rotate: expandedFaq === i ? 45 : 0 }}
                  className="text-orange-500"
                >
                  <Plus size={20} />
                </motion.div>
              </button>
              {expandedFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className={styles.faqBody}
                >
                  {faq.a}
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
            Run Your Business Smarter—Starting Today
          </h2>
          <p className={styles.ctaSubtext}>
            Get full control, real-time insights, and peace of mind with
            Invexix.
          </p>
          <div className={styles.ctaBtns}>
            <Link href={`/${locale}/auth/signup`} className={styles.ctaPrimary}>
              Start Free Trial
            </Link>
            <Link href="#contact" className={styles.ctaSecondary}>
              Request a Demo
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
            <div className={styles.featureBadge}>Get Started</div>
            <h2 className={styles.waitlistTitle}>
              Ready to{" "}
              <span className={styles.gradientText}>revolutionize</span> <br />{" "}
              your business?
            </h2>
            <p className={styles.waitlistSubtitle}>
              Join the growing number of businesses scaling with real-time
              control. Secure your spot in the future of management.
            </p>
            <div className={styles.waitlistForm}>
              <input
                type="email"
                placeholder="Enter your business email"
                className={styles.waitlistInput}
              />
              <button className={styles.waitlistSubmit}>Join Now</button>
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
                  <div className="font-bold">Beta Capacity</div>
                  <div className="text-orange-500 font-black">84% Full</div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "84%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
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
                  Trusted by businesses across 12 countries.
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
                The future of business intelligence. Manage inventory, sales,
                and operations with real-time clarity.
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
              <h4 className={styles.footerHeading}>Navigation</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="#home">Home</Link>
                </li>
                <li>
                  <Link href="#about">About</Link>
                </li>
                <li>
                  <Link href="#features">Features</Link>
                </li>
                <li>
                  <Link href="#pricing">Pricing</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerHeading}>Company</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="#">Why Us</Link>
                </li>
                <li>
                  <Link href="#faq">FAQ</Link>
                </li>
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#">Terms of Service</Link>
                </li>
              </ul>
            </div>

            <div className={styles.footerNewsletter}>
              <h4>Join our insights</h4>
              <p>
                Get the latest updates and business tips directly to your inbox.
              </p>
              <form
                className={styles.newsletterForm}
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="name@company.com"
                  className={styles.newsletterInput}
                />
                <button className={styles.newsletterSubmit}>
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2026 Invexix. Engineered with precision.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Support
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Status
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
