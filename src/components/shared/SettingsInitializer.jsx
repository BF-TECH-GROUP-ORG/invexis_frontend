// src/components/shared/SettingsInitializer.jsx
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { initializeSettings, setLocale } from "@/features/settings/settingsSlice";

/**
 * Component to initialize settings from localStorage
 * and sync with the current locale
 */
export default function SettingsInitializer() {
  const dispatch = useDispatch();
  const router = useRouter();
  const currentLocale = useLocale();

  useEffect(() => {
    // Initialize settings from localStorage
    dispatch(initializeSettings());

    // Sync Redux locale with Next-intl locale
    dispatch(setLocale(currentLocale));
  }, [dispatch, currentLocale]);

  return null; // This component doesn't render anything
}