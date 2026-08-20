"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export default function GlobalLoader({
  visible = false,
  text = "Loading...",
  forceLight = false
}) {
  const premiumEase = [0.16, 1, 0.3, 1];

  // Ambient floating background particles
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: (i * 37) % 100,
      y: (i * 53) % 100,
      size: (i % 3) * 3 + 4,
      duration: 3 + (i % 4) * 1.5,
      delay: (i % 5) * 0.4
    }));
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.5, ease: premiumEase }
          }}
          transition={{ duration: 0.4, ease: premiumEase }}
          className={`fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden ${
            forceLight
              ? "bg-[#0b0f17] text-white"
              : "bg-[#0b0f17] text-white"
          }`}
        >
          {/* Ambient Floating Particle Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-orange-500/30"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.6, 0.2]
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: premiumEase }}
            className="relative flex flex-col items-center justify-center gap-8 z-10"
          >
            {/* HUD Concentric Orbit Spinner */}
            <div className="relative flex items-center justify-center w-56 h-56 md:w-64 md:h-64">
              {/* Outer Ring Arc (Clockwise) */}
              <motion.svg
                className="absolute w-full h-full"
                viewBox="0 0 200 200"
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              >
                {/* Background Ring Track */}
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  stroke="#FF6D00"
                  strokeWidth="1.5"
                  strokeOpacity="0.15"
                  fill="none"
                />
                {/* Outer Arc Segment 1 */}
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  stroke="#FF6D00"
                  strokeWidth="3"
                  strokeDasharray="140 410"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Outer Arc Segment 2 */}
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeDasharray="60 490"
                  strokeDashoffset="-200"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.svg>

              {/* Middle Ring Arc (Counter-Clockwise) */}
              <motion.svg
                className="absolute w-40 h-40 md:w-48 md:h-48"
                viewBox="0 0 160 160"
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                {/* Background Ring Track */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#FF6D00"
                  strokeWidth="1.5"
                  strokeOpacity="0.15"
                  fill="none"
                />
                {/* Middle Arc Segment 1 */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeDasharray="110 330"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Middle Arc Segment 2 */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#FF6D00"
                  strokeWidth="3"
                  strokeDasharray="45 395"
                  strokeDashoffset="-150"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.svg>

              {/* Inner Ring Arc (Clockwise) */}
              <motion.svg
                className="absolute w-28 h-28 md:w-32 md:h-32"
                viewBox="0 0 120 120"
                animate={{ rotate: 360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              >
                {/* Background Ring Track */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#FF6D00"
                  strokeWidth="1.5"
                  strokeOpacity="0.15"
                  fill="none"
                />
                {/* Inner Arc Segment */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#FF6D00"
                  strokeWidth="3"
                  strokeDasharray="85 230"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.svg>

              {/* Center Core (No Logo - Minimal Glowing Pulse Dot) */}
              <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full border border-orange-500/20 bg-orange-500/5">
                <motion.div
                  animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-4 h-4 rounded-full bg-orange-500"
                />
              </div>
            </div>

            {/* Title & Status Indicator */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  INVEX<span className="text-orange-500">IX</span>
                </span>
              </div>

              {text && (
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="text-xs md:text-sm font-semibold tracking-widest text-slate-300 uppercase"
                >
                  {text}
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
