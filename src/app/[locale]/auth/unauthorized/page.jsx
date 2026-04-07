"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { HiOutlineShieldExclamation, HiArrowRight } from "react-icons/hi";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  const locale = useLocale();
  const t = useTranslations("auth");

  return (
    <div className="w-screen h-screen flex text-sm flex-col md:flex-row bg-white dark:bg-[#1a1a1a] overflow-hidden">
      {/* Left Side - Image (Hidden on mobile) */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex md:w-1/2 md:h-full items-center justify-center relative"
      >
        <Image
          src="/images/login.jpg"
          alt="Unauthorized Illustration"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-orange-900/10 backdrop-blur-[2px]"></div>
      </motion.div>

      {/* Right Side - Unauthorized Message with Animations */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center sm:p-6 md:p-10 overflow-y-auto relative bg-white dark:bg-[#1a1a1a]">
        <div className="w-full max-w-md flex flex-col items-center text-center">
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
            className="relative mb-8"
          >
            {/* Glowing background ring */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.5, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 bg-orange-500 rounded-full blur-xl"
            ></motion.div>
            
            <div className="relative w-24 h-24 bg-linear-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-[#1a1a1a]">
              <HiOutlineShieldExclamation className="w-12 h-12" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight font-metropolis"
          >
            Access Denied
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-4 mb-10"
          >
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              We couldn't find an existing account matching your Google email address. Invexis uses a verified-access system to protect organizational data.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              If you belong to an organization already using Invexis, please contact your administrator. Otherwise, you can request to register your business below.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full space-y-3"
          >
            <a
              href={`/${locale}/#contact`}
              className="group flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Request Registration
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <Link
              href={`/${locale}/auth/login`}
              className="flex items-center justify-center w-full py-3.5 px-6 bg-gray-50 hover:bg-gray-100 dark:bg-[#252525] dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
            >
              Back to Login
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
