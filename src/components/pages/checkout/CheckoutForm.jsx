"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, User, Mail, Phone, CreditCard, ShieldCheck, MapPin } from "lucide-react";
import styles from "@/styles/checkout.module.css";

export default function CheckoutForm({ plan, billing }) {
    const t = useTranslations("checkout");
    const [formData, setFormData] = useState({
        businessName: "",
        businessType: "",
        location: "",
        address: "",
        ownerName: "",
        email: "",
        phone: "",
        whatsapp: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("momo");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.formCard}>
            {/* Business Info Section */}
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                    <Building2 size={24} className="text-orange-500" />
                    {t("form.business.title")}
                </h3>
                <div className={styles.inputGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t("form.business.name")}</label>
                        <input
                            type="text"
                            name="businessName"
                            className={styles.input}
                            placeholder="e.g. Invexix Corp"
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t("form.business.type")}</label>
                        <input
                            type="text"
                            name="businessType"
                            className={styles.input}
                            placeholder="e.g. Retail, Pharmacy"
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t("form.business.location")}</label>
                        <input
                            type="text"
                            name="location"
                            className={styles.input}
                            placeholder="e.g. Kigali, Rwanda"
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t("form.business.owner")}</label>
                        <input
                            type="text"
                            name="ownerName"
                            className={styles.input}
                            placeholder="Full Name"
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* Contact Info Section */}
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                    <Mail size={24} className="text-orange-500" />
                    {t("form.contact.title")}
                </h3>
                <div className={styles.inputGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t("form.contact.email")}</label>
                        <input
                            type="email"
                            name="email"
                            className={styles.input}
                            placeholder="email@example.com"
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t("form.contact.phone")}</label>
                        <input
                            type="tel"
                            name="phone"
                            className={styles.input}
                            placeholder="+250 7XX XXX XXX"
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* Payment Method Section */}
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                    <CreditCard size={24} className="text-orange-500" />
                    {t("form.payment.title")}
                </h3>
                <div className={styles.paymentGrid}>
                    <div
                        className={`${styles.paymentOption} ${paymentMethod === 'momo' ? styles.paymentSelected : ''}`}
                        onClick={() => setPaymentMethod('momo')}
                    >
                        <ShieldCheck className={styles.paymentIcon} />
                        <span className="font-semibold">{t("form.payment.momo")}</span>
                    </div>
                    <div
                        className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.paymentSelected : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <CreditCard className={styles.paymentIcon} />
                        <span className="font-semibold">{t("form.payment.card")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
