"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HiArrowLeft, HiArrowRight, HiCog6Tooth } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations, useLocale } from "next-intl";
import { IconButton } from "@mui/material";
import {
  completeOnboarding,
  loadOnboarding,
  setActiveStep,
} from "@/features/onboarding/onboardingSlice";
import { redirect } from "next/navigation";
import SettingsDropdown from "../shared/SettingsDropdown";

export default function OnBoardingScreens({ steps }) {
  const dispatch = useDispatch();
  const { activeStep, completed } = useSelector((s) => s.onboarding);
    const locale = useLocale();
    const t = useTranslations("onboarding");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState(null);

  useEffect(() => {
    setMounted(true);
    dispatch(loadOnboarding());
  }, [dispatch]);

  if (!mounted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
        <div className="flex flex-col md:flex-row w-3/4 h-1/2 space-y-6 md:space-y-0 md:space-x-6">
          <div className="flex-1 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return redirect(`/${locale}/auth/login`);
  }

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      dispatch(setActiveStep(activeStep + 1));
      setLoading(false);
    }, 600);
  };

  const handleBack = () => {
    dispatch(setActiveStep(activeStep - 1));
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-[#1a1a1a] overflow-hidden">
      {/* Top Navigation Buttons */}
      <div className="fixed top-6 left-[52%] right-6 flex justify-between z-50">
        {/* Skip Button - Left Side */}
        <button
          onClick={() => dispatch(completeOnboarding())}
          className="px-5 py-2 rounded-full font-medium text-sm
                     bg-white/20 backdrop-blur hover:bg-white/30
                     dark:bg-black/20 dark:hover:bg-black/30
                     border border-white/30 dark:border-white/10"
        >
          {t("skip")}
        </button>

        {/* Settings Button - Right Side */}
        <IconButton
          onClick={(e) => setSettingsAnchor(e.currentTarget)}
          sx={{
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.3)",
            width: "40px",
            height: "40px",
            color: "inherit",
          }}
        >
          <HiCog6Tooth />
        </IconButton>

        <SettingsDropdown
          anchor={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={() => setSettingsAnchor(null)}
        />
      </div>

      {/* Image Section */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-br from-orange-50 to-orange-100
                    dark:from-[#2d1b0f] dark:to-[#1a0f0a] flex items-center justify-center p-8">
        {loading ? (
          <div className="w-[560px] h-[560px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
        ) : (
          <Image
            src={steps[activeStep].image}
            alt={steps[activeStep].title}
            width={560}
            height={560}
            className="object-contain max-w-full max-h-full"
            priority
          />
        )}
      </div>

      {/* Content Section */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-between p-8 md:p-16">
        <div className="flex-1 flex flex-col justify-center space-y-6 text-center md:text-left">
          {loading ? (
            <>
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-4" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-[#081422] dark:text-[#e5e7eb]">
                {t(steps[activeStep].key + "Title")}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg mx-auto md:mx-0">
                {t(steps[activeStep].key + "Desc")}
              </p>
            </>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeStep
                  ? "bg-[#ff782d] w-10"
                  : "bg-gray-300 dark:bg-gray-600 w-2"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          {activeStep > 0 && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium
                       bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
                       disabled:opacity-40"
            >
              <HiArrowLeft /> {t("back")}
            </button>
          )}

          {activeStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white
                         bg-[#081422] hover:bg-[#0a1626] dark:bg-[#ff782d] dark:hover:bg-[#e66a24]
                         disabled:opacity-40 ml-auto"
            >
              {loading ? "Loading..." : t("next")} <HiArrowRight />
            </button>
          ) : (
            <button
              onClick={() => dispatch(completeOnboarding())}
              disabled={loading}
              className="w-4/5 py-3 rounded-xl font-bold text-white bg-[#ff782d] hover:bg-[#e66a24]
                         shadow-lg hover:shadow-xl transition disabled:opacity-40"
            >
              {t("getStarted")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}