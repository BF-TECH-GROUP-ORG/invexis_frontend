"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function TopProgressBar({ isNavigating }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval;
        if (isNavigating) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev < 30) return prev + 10;
                    if (prev < 60) return prev + 5;
                    if (prev < 90) return prev + 1;
                    return prev;
                });
            }, 100);
        } else {
            setProgress(100);
            const timer = setTimeout(() => {
                setProgress(0);
            }, 300);
            return () => clearTimeout(timer);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isNavigating]);

    return (
        <AnimatePresence>
            {(isNavigating || progress === 100) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[10000] h-1 pointer-events-none"
                >
                    <motion.div
                        className="h-full bg-linear-to-r from-orange-400 to-orange-600 rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{
                            width: { type: "tween", duration: 0.3 },
                            opacity: { duration: 0.2 }
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
