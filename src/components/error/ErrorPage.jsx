"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";

export default function ErrorPage({
  errorCode,
  title,
  message,
  illustration,
  showRetry = false,
  onRetry,
}) {
  const router = useRouter();
  const locale = useLocale();

  const handleBack = () => {
    router.back();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Error Code */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 hidden">
            {errorCode}
          </h1>
        </motion.div>

        {/* Illustration */}
        {illustration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-full max-w-md">
              <Image
                src={illustration}
                alt={`Error ${errorCode}`}
                width={400}
                height={400}
                className="w-full h-auto"
                priority
              />
            </div>
          </motion.div>
        )}

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
        >
          {title}
        </motion.h2>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto"
        >
          {message}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleBack}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Back
          </button>

          {showRetry && (
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition-all duration-200 border-2 border-gray-300 dark:border-gray-600 transform hover:scale-105"
            >
              Try Again
            </button>
          )}
        </motion.div>

        {/* Brand Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            INVEX<span className="text-orange-500 font-extrabold">iS</span>
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
