import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import CheckoutForm from "@/components/pages/checkout/CheckoutForm";
import styles from "@/styles/checkout.module.css";

export default async function CheckoutPage({ params, searchParams }) {
    const { locale, plan } = await params;
    const { billing = "monthly" } = await searchParams;
    setRequestLocale(locale);

    const t = await getTranslations({ locale });

    // Get plan details based on selected slug
    const planDetails = {
        basic: { title: "Basic Plan", prices: { monthly: 30000, "3months": 85000, "6months": 170000, yearly: 345000 } },
        mid: { title: "Mid Plan", prices: { monthly: 40000, "3months": 110000, "6months": 235000, yearly: 460000 } },
        pro: { title: "Pro Plan", prices: { monthly: 50000, "3months": 140000, "6months": 280000, yearly: 570000 } },
    };

    const currentPlan = planDetails[plan] || planDetails.mid;
    const priceValue = currentPlan.prices[billing];

    return (
        <div className={styles.checkoutContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.headerSection}>
                    <Link href="/" className="inline-flex items-center gap-2 text-orange-500 font-semibold mb-8 hover:translate-x-1 transition-transform">
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>
                    <h1 className={styles.title}>
                        {t.rich("checkout.title", {
                            spanClassName: (chunks) => <span className={styles.gradientText}>{chunks}</span>,
                        })}
                    </h1>
                    <p className={styles.subtitle}>{t("checkout.subtitle")}</p>
                </div>

                {/* Main Checkout Form */}
                <CheckoutForm plan={plan} billing={billing} />

                {/* Order Summary Sidebar */}
                <aside className={styles.summaryCard}>
                    <h3 className={styles.summaryTitle}>{t("checkout.summary.title")}</h3>

                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>{t("checkout.summary.plan")}</span>
                        <span className={styles.summaryValue}>{currentPlan.title}</span>
                    </div>

                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>{t("checkout.summary.billing")}</span>
                        <span className={styles.summaryValue}>{t(`pricing.toggle.${billing}`)}</span>
                    </div>

                    <div className={styles.totalSection}>
                        <span className={styles.totalLabel}>{t("checkout.summary.total")}</span>
                        <div className={styles.totalAmount}>
                            <span className="text-sm align-top mr-1">Rwf</span>
                            {priceValue.toLocaleString()}
                        </div>
                    </div>

                    <button className={styles.payButton}>
                        {t("checkout.form.payment.button")}
                    </button>

                    <div className={styles.secureText}>
                        <ShieldCheck size={16} />
                        {t("checkout.form.payment.secure")}
                    </div>

                    <Link href="/#pricing" className="block text-center mt-6 text-sm text-gray-400 hover:text-white transition-colors">
                        {t("checkout.summary.change")}
                    </Link>
                </aside>
            </div>
        </div>
    );
}
