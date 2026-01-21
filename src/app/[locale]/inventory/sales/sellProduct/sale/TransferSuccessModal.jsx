"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

import { useTranslations } from "next-intl";

export default function TransferSuccessModal({ isOpen, onClose, targetName, mode }) {
    const t = useTranslations('sellProduct.modals.transferSuccess');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center overflow-hidden"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50" />

                <div className="relative z-10">
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={32} strokeWidth={3} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('title')}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {t.rich('message', {
                            targetName: targetName,
                            span: (chunks) => <span className="font-semibold text-gray-900">{chunks}</span>
                        })}
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={onClose}
                            className="block w-full py-3 px-4 bg-[#FF6D00] hover:bg-[#E65100] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
