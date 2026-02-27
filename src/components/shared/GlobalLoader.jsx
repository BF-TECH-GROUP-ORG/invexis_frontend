"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function GlobalLoader({
  visible = false,
  text = "Loading...",
  forceLight = false
}) {
  const premiumEase = [0.16, 1, 0.3, 1];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(15px)",
            transition: { duration: 0.8, ease: premiumEase }
          }}
          transition={{ duration: 0.6, ease: premiumEase }}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-3xl ${forceLight
              ? "bg-white/70"
              : "bg-white/70 dark:bg-[#081422]/70"
            }`}
        >
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.15 } }
            }}
            className="relative flex flex-col items-center gap-12"
          >
            {/* Liquid Wave Container */}
            <motion.div
              variants={{
                initial: { scale: 0.8, opacity: 0 },
                animate: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: premiumEase } }
              }}
              className="relative w-40 h-40 rounded-[3rem] overflow-hidden flex items-center justify-center bg-white dark:bg-gray-950 shadow-[0_20px_50px_-20px_rgba(249,115,22,0.3)] border border-white/20"
            >
              {/* Layered Liquid Waves */}
              <div className="absolute inset-0 z-0 opacity-40">
                <motion.svg
                  viewBox="0 0 100 20"
                  className="absolute bottom-0 left-[-100%] w-[200%] h-32 fill-orange-500/20"
                  animate={{ x: ["0%", "50%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <path d="M0 10 Q25 0 50 10 T100 10 V20 H0 Z" />
                </motion.svg>
                <motion.svg
                  viewBox="0 0 100 20"
                  className="absolute bottom-0 left-[-100%] w-[200%] h-24 fill-orange-500/40"
                  animate={{ x: ["0%", "50%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <path d="M0 10 Q25 20 50 10 T100 10 V20 H0 Z" />
                </motion.svg>
              </div>

              {/* Logo Box */}
              <motion.div
                className="w-24 h-24 bg-[#111827] rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden"
              >
                <motion.div
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-tr from-orange-500/30 to-transparent"
                />
                <Image
                  src="/logo/Invexix Logo - Dark Mode.svg"
                  alt="Invexix"
                  width={48}
                  height={48}
                  priority
                  className="relative z-20"
                />
              </motion.div>

              {/* Top Highlight Rim */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </motion.div>

            {/* Brand Title Area */}
            <motion.div
              variants={{
                initial: { opacity: 0, y: 15 },
                animate: { opacity: 1, y: 0, transition: { duration: 1, ease: premiumEase } }
              }}
              className="flex flex-col items-center gap-3"
            >
              <h2 className={`text-4xl font-black tracking-tighter ${forceLight ? "text-gray-900" : "text-gray-900 dark:text-white"
                }`}>
                INVEX<span className="text-orange-500">iS</span>
              </h2>
              {text && (
                <motion.p
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={`text-[10px] font-black tracking-[0.5em] uppercase ${forceLight ? "text-gray-500/60" : "text-gray-400/50"
                    }`}
                >
                  {text}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
