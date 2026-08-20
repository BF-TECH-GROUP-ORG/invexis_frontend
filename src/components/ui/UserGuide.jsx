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
  Users,
  Sparkles
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
  const [windowSize, setWindowSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1024, 
    height: typeof window !== 'undefined' ? window.innerHeight : 768 
  });

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const userId = session.user._id || session.user.id;
    const storageKey = `invexis_user_guide_seen_${userId}`;
    const hasSeen = localStorage.getItem(storageKey);
    
    // Only show if the user hasn't seen the guide before
    if (!hasSeen) {
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
        // Check if element is actually visible on screen
        if (rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth) {
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom,
          });
          return;
        }
      }
      setTargetRect(null);
    };

    calculateRect();
    const timer = setTimeout(calculateRect, 350);
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
  const isMobile = windowSize.width < 768;

  // Responsive Tooltip Positioning Logic
  let tooltipStyle = {};
  const PADDING = 16;
  const CARD_WIDTH = Math.min(360, windowSize.width - 32);

  if (isMobile) {
    // Mobile View: Anchor cleanly to bottom of screen (never clips or overflows edges)
    tooltipStyle = {
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      width: `${CARD_WIDTH}px`,
      maxWidth: "calc(100vw - 32px)",
      zIndex: 101,
    };
  } else if (targetRect) {
    // Desktop View: Calculate 4-directional placement with strict bounds
    let left = targetRect.right + PADDING;
    let top = targetRect.top;

    if (left + CARD_WIDTH + PADDING > windowSize.width) {
      // Place Left
      left = targetRect.left - CARD_WIDTH - PADDING;
    }
    
    if (left < PADDING || left + CARD_WIDTH > windowSize.width - PADDING) {
      // Place Bottom
      left = Math.max(PADDING, Math.min(targetRect.left + targetRect.width / 2 - CARD_WIDTH / 2, windowSize.width - CARD_WIDTH - PADDING));
      top = targetRect.bottom + PADDING;
      if (top + 220 > windowSize.height) {
        top = Math.max(PADDING, targetRect.top - 220 - PADDING);
      }
    }

    // Clamp values inside screen boundary
    left = Math.max(PADDING, Math.min(left, windowSize.width - CARD_WIDTH - PADDING));
    top = Math.max(PADDING, Math.min(top, windowSize.height - 240 - PADDING));

    tooltipStyle = {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${CARD_WIDTH}px`,
      zIndex: 101,
    };
  } else {
    // Desktop Center Fallback
    tooltipStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: `${CARD_WIDTH}px`,
      zIndex: 101,
    };
  }

  // Calculate SVG mask properties
  const maskX = targetRect ? Math.max(0, targetRect.left - 6) : 0;
  const maskY = targetRect ? Math.max(0, targetRect.top - 6) : 0;
  const maskW = targetRect ? targetRect.width + 12 : 0;
  const maskH = targetRect ? targetRect.height + 12 : 0;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none">
      {/* Dark Overlay with Spotlight Hole */}
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
                rx="8" 
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.7)" mask="url(#guide-hole)" />
      </svg>

      {/* The Responsive Tooltip Card */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-out"
        style={tooltipStyle}
      >
        {/* Progress Bar Indicator */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
          <div 
            className="bg-orange-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        {/* Card Header */}
        <div className="flex bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-orange-500" />
            {t("step", { current: currentStep + 1, total: tourSteps.length })}
          </span>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Tour"
          >
            <X size={16} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 flex gap-3.5 items-start">
          <div className="shrink-0 mt-0.5">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl border border-orange-200/50">
              <Icon size={20} />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 leading-snug">
              {currentFeature.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {currentFeature.description}
            </p>

            {/* Step Navigation Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30 transition-all cursor-pointer"
              >
                {t("back")}
              </button>
              
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isLastStep ? t("finish") : t("next")}</span>
                {!isLastStep && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
