"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { 
  Package, 
  ShoppingCart, 
  LayoutDashboard, 
  Search,
  UserCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Bell,
  Wallet,
  Receipt,
  Files,
  History,
  Users
} from "lucide-react";

export default function UserGuide() {
  const t = useTranslations("userGuide");

  // Steps reference the actual IDs dynamically injected into NavBar and SideBar
  const tourSteps = [
    { targetId: "tour-dashboard", title: t("steps.dashboard.title"), description: t("steps.dashboard.desc"), icon: LayoutDashboard },
    { targetId: "tour-search", title: t("steps.search.title"), description: t("steps.search.desc"), icon: Search },
    { targetId: "tour-notifications-sidebar", title: t("steps.notifications.title"), description: t("steps.notifications.desc"), icon: Bell },
    { targetId: "tour-management", title: t("steps.management.title"), description: t("steps.management.desc"), icon: Users },
    { targetId: "tour-inventory", title: t("steps.inventory.title"), description: t("steps.inventory.desc"), icon: Package },
    { targetId: "tour-sales", title: t("steps.sales.title"), description: t("steps.sales.desc"), icon: ShoppingCart },
    { targetId: "tour-debts", title: t("steps.debts.title"), description: t("steps.debts.desc"), icon: Wallet },
    { targetId: "tour-billing", title: t("steps.billing.title"), description: t("steps.billing.desc"), icon: Receipt },
    { targetId: "tour-documents", title: t("steps.documents.title"), description: t("steps.documents.desc"), icon: Files },
    { targetId: "tour-logs", title: t("steps.logs.title"), description: t("steps.logs.desc"), icon: History },
    { targetId: "tour-profile", title: t("steps.profile.title"), description: t("steps.profile.desc"), icon: UserCircle },
  ];

  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 0, height: typeof window !== 'undefined' ? window.innerHeight : 0 });

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const userId = session.user._id || session.user.id;
    const storageKey = `invexis_user_guide_seen_${userId}`;
    const hasSeen = localStorage.getItem(storageKey);
    
    // Only show if the user hasn't seen the guide before
    if (!hasSeen) {
      // Delay initialization slightly to wait for layout shifts to settle
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [status, session]);

  // Window resize handler
  useEffect(() => {
    if (!isVisible) return;
    
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isVisible]);

  // Update target bounding box when step or window changes
  useEffect(() => {
    if (!isVisible) return;

    const calculateRect = () => {
      const targetId = tourSteps[currentStep].targetId;
      const el = document.querySelector(`[data-tour="${targetId}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Only update if it actually changed to prevent infinite loops or jitter
        setTargetRect((prev) => {
          if (!prev || prev.top !== rect.top || prev.left !== rect.left || prev.width !== rect.width || prev.height !== rect.height) {
             return {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              right: rect.right,
              bottom: rect.bottom,
            };
          }
          return prev;
        });
      } else {
        setTargetRect(null); 
      }
    };

    calculateRect();
    
    // Some elements animate, recalculate shortly after initial render
    const timer = setTimeout(calculateRect, 400);
    return () => clearTimeout(timer);

  }, [currentStep, isVisible, windowSize, tourSteps]);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (session?.user) {
      const userId = session.user._id || session.user.id;
      localStorage.setItem(`invexis_user_guide_seen_${userId}`, "true");
    }
  };

  const currentFeature = tourSteps[currentStep];
  const Icon = currentFeature.icon;
  const isLastStep = currentStep === tourSteps.length - 1;

  // Tooltip Placement Logic
  let tooltipStyle = {};
  
  if (targetRect) {
    const PADDING = 20;
    const TOOLTIP_WIDTH = 340; 
    
    if (targetRect.right + TOOLTIP_WIDTH + PADDING < windowSize.width) {
      // Place on Right
      tooltipStyle = { top: Math.max(PADDING, targetRect.top - 20), left: targetRect.right + PADDING };
    } else if (targetRect.left - TOOLTIP_WIDTH - PADDING > 0) {
      // Place on Left
      tooltipStyle = { top: Math.max(PADDING, targetRect.top - 20), left: targetRect.left - TOOLTIP_WIDTH - PADDING };
    } else if (targetRect.bottom + PADDING + 200 < windowSize.height) {
      // Place Bottom (Toolbox is below the target)
      tooltipStyle = { top: targetRect.bottom + PADDING, left: Math.max(PADDING, targetRect.left - (TOOLTIP_WIDTH / 2) + (targetRect.width / 2)) };
      if (tooltipStyle.left + TOOLTIP_WIDTH > windowSize.width - PADDING) tooltipStyle.left = windowSize.width - TOOLTIP_WIDTH - PADDING;
    } else {
      // Place Top
      tooltipStyle = { bottom: windowSize.height - targetRect.top + PADDING, left: Math.max(PADDING, targetRect.left - (TOOLTIP_WIDTH / 2) + (targetRect.width / 2)) };
      if (tooltipStyle.left + TOOLTIP_WIDTH > windowSize.width - PADDING) tooltipStyle.left = windowSize.width - TOOLTIP_WIDTH - PADDING;
    }
  } else {
    // Fallback if target not found: Center the tooltip
    tooltipStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  // Calculate SVG mask properties including slightly expanded dimensions
  const maskX = targetRect ? Math.max(0, targetRect.left - 6) : 0;
  const maskY = targetRect ? Math.max(0, targetRect.top - 6) : 0;
  const maskW = targetRect ? targetRect.width + 12 : 0;
  const maskH = targetRect ? targetRect.height + 12 : 0;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark overlay with SVG Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-300">
        <defs>
          <mask id="guide-hole">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect 
                x={maskX} 
                y={maskY} 
                width={maskW} 
                height={maskH} 
                rx="6" 
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Fill color defines the dark overlay intensity */}
        <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.75)" mask="url(#guide-hole)" />
      </svg>

      {/* The Tooltip Card (Horizontal Rectangle) */}
      <div 
        className={`w-full max-w-[340px] bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 pointer-events-auto flex flex-col`}
        style={{
          position: "absolute",
          ...tooltipStyle,
          translate: targetRect ? '0 0' : '-50% -50%',
          // CSS transitions to smoothly animate between targets
          transition: "top 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1), bottom 0.4s cubic-bezier(0.25, 1, 0.5, 1)"
        }}
      >
        <div className="flex bg-gray-50 dark:bg-gray-800 rounded-t-xl px-4 py-2.5 items-center justify-between border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
            {t("step", { current: currentStep + 1, total: tourSteps.length })}
          </span>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition"
            aria-label="End Tour"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 md:p-5 flex gap-4">
          <div className="shrink-0 mt-1">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shadow-sm">
              <Icon size={22} />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-1.5 leading-snug">
              {currentFeature.title}
            </h3>
            <p className="text-[14px] text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {currentFeature.description}
            </p>

            <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex gap-2 w-full justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="px-3 py-1.5 hover:text-gray-500 text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition text-sm font-medium"
                >
                  {t("back")}
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition shadow flex items-center gap-1"
                >
                  {isLastStep ? t("finish") : t("next")} {!isLastStep && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
