"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Download,
  ShieldCheck,
  ArrowLeft,
  QrCode,
  Sparkles,
  ExternalLink,
  Zap,
  Lock,
  Cpu,
  CheckCircle2
} from "lucide-react";

export default function DownloadAppContent({ locale }) {
  const [activeTab, setActiveTab] = useState("android");
  const [detectedOS, setDetectedOS] = useState("detecting");
  const [downloadStatus, setDownloadStatus] = useState("idle"); // "idle" | "downloading" | "completed"
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStats, setDownloadStats] = useState({ loadedMB: "0.0", totalMB: "119.0" });
  const xhrRef = React.useRef(null);

  // Detect platform on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        setDetectedOS("ios");
        setActiveTab("ios");
      } else if (/android/i.test(userAgent)) {
        setDetectedOS("android");
        setActiveTab("android");
      } else {
        setDetectedOS("desktop");
        setActiveTab("android");
      }
    }
  }, []);

  const handleDownload = () => {
    if (downloadStatus === "downloading") return;

    setDownloadStatus("downloading");
    setDownloadProgress(0);
    setDownloadStats({ loadedMB: "0.0", totalMB: "119.0" });

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("GET", "/invexis_stock.apk", true);
    xhr.responseType = "blob";

    xhr.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const percent = Math.round((event.loaded / event.total) * 100);
        const loadedMB = (event.loaded / (1024 * 1024)).toFixed(1);
        const totalMB = (event.total / (1024 * 1024)).toFixed(1);
        setDownloadProgress(percent);
        setDownloadStats({ loadedMB, totalMB });
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "invexis_stock.apk";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setDownloadStatus("completed");
        setDownloadProgress(100);

        setTimeout(() => {
          setDownloadStatus("idle");
          setDownloadProgress(0);
        }, 5000);
      } else {
        fallbackDirectDownload();
      }
    };

    xhr.onerror = () => {
      fallbackDirectDownload();
    };

    xhr.send();
  };

  const fallbackDirectDownload = () => {
    const link = document.createElement("a");
    link.href = "/invexis_stock.apk";
    link.download = "invexis_stock.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadStatus("completed");
    setDownloadProgress(100);
    setTimeout(() => {
      setDownloadStatus("idle");
      setDownloadProgress(0);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Header Bar - Clean & Shadowless, Logo hidden on small screens */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={18} />
              <span>Back to Home</span>
            </Link>

            {/* Logo and App Title - Hidden on small mobile screens */}
            <div className="h-5 w-px bg-slate-200 hidden md:block" />
            <div className="hidden md:flex items-center gap-2.5">
              <Image
                src="/logo/Invexix Logo - Dark Mode.svg"
                alt="Invexix Logo"
                width={30}
                height={30}
                className="object-contain"
              />
              <span className="font-bold text-base text-slate-900 tracking-tight">
                Invexix <span className="text-orange-600 font-medium text-sm ml-1">QR Scanner App</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Direct Download
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex-1 w-full">
        {/* Intro Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold mb-4">
            <QrCode size={14} className="text-orange-500" />
            <span>Dedicated Mobile Phone Companion</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Download Invexix <span className="bg-linear-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">QR Code Scanner</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Scan product QR codes on your mobile phone, manage instant stock-outs, and track inventory movements seamlessly.
          </p>

          {/* Device Detection Banner */}
          {detectedOS !== "detecting" && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700">
              <Smartphone size={16} className="text-orange-500" />
              <span>
                Detected device: <strong className="font-semibold text-slate-900 capitalize">{detectedOS}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-200/70 p-1.5 rounded-2xl flex gap-2 max-w-md w-full border border-slate-300">
            <button
              onClick={() => setActiveTab("android")}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "android"
                  ? "bg-white text-slate-900 border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Cpu size={18} className={activeTab === "android" ? "text-orange-600" : "text-slate-500"} />
              <span>Android (APK)</span>
            </button>

            <button
              onClick={() => setActiveTab("ios")}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "ios"
                  ? "bg-white text-slate-900 border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Smartphone size={18} className={activeTab === "ios" ? "text-orange-600" : "text-slate-500"} />
              <span>iOS (Apple)</span>
            </button>
          </div>
        </div>

        {/* Tab Content Cards - Clean & Shadowless */}
        <AnimatePresence mode="wait">
          {activeTab === "android" ? (
            <motion.div
              key="android"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Primary Download Card (Shadow Removed) */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                      <ShieldCheck size={14} />
                      <span>Verified Package • Security Checked</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      Invexix QR Code Scanner for Android
                    </h2>

                    <p className="text-sm sm:text-base text-slate-600 max-w-xl">
                      Direct APK installer for Android smartphones to scan product QR codes instantly.
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-500 pt-2">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg font-mono border border-slate-200">Version 1.0.0</span>
                      <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">Size: ~119 MB</span>
                      <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">Android 8.0 or Higher</span>
                    </div>
                  </div>

                  {/* Download Action Box with Real-Time Progress Bar */}
                  <div className="flex flex-col items-center gap-3 w-full md:w-auto min-w-[280px]">
                    {downloadStatus === "idle" && (
                      <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto min-w-[260px] px-8 py-4 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer"
                      >
                        <Download size={22} />
                        <span>Download APK File</span>
                      </button>
                    )}

                    {downloadStatus === "downloading" && (
                      <div className="w-full min-w-[280px] sm:min-w-[320px] bg-slate-50 border border-orange-200 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span className="flex items-center gap-2 text-orange-600">
                            <Download size={16} className="animate-bounce" />
                            <span>Downloading APK...</span>
                          </span>
                          <span className="font-mono text-orange-600 font-extrabold text-sm">{downloadProgress}%</span>
                        </div>

                        {/* Progress Bar Track */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-linear-to-r from-orange-500 to-amber-500 h-full transition-all duration-200 rounded-full"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>{downloadStats.loadedMB} MB / {downloadStats.totalMB} MB</span>
                          <button
                            onClick={() => {
                              if (xhrRef.current) xhrRef.current.abort();
                              setDownloadStatus("idle");
                              setDownloadProgress(0);
                            }}
                            className="text-xs text-slate-400 hover:text-red-500 font-sans transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {downloadStatus === "completed" && (
                      <div className="w-full min-w-[280px] sm:min-w-[320px] bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-center gap-2.5 text-emerald-800 text-sm font-bold animate-in fade-in duration-300">
                        <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                        <span>Download Complete! File Saved.</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 text-center">
                      Safe & Direct Stream Download
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by Step Installation Guide */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Installation Guide for Android</h3>
                    <p className="text-sm text-slate-500">Follow these 4 simple steps to install the APK on your phone</p>
                  </div>
                  <Zap size={24} className="text-orange-500 hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Step 1 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center">
                        1
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">Download the File</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed pl-11">
                      Tap the <strong className="text-slate-900 font-semibold">"Download APK File"</strong> button above to save <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">invexis_stock.apk</code> to your mobile phone.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center">
                        2
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">Allow Unknown Sources</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed pl-11">
                      When prompted by your browser, tap <strong className="text-slate-900 font-semibold">Settings</strong> and toggle on <strong className="text-slate-900 font-semibold">"Allow from this source"</strong>.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center">
                        3
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">Install the Application</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed pl-11">
                      Open your <strong className="text-slate-900 font-semibold">Downloads</strong> notification or file manager, select the APK, and tap <strong className="text-slate-900 font-semibold">Install</strong>.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center">
                        4
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">Launch & Start QR Scanning</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed pl-11">
                      Open the app icon on your mobile phone, log in with your company credentials, and begin scanning product QR codes immediately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ios"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* iOS Guide Card (Shadow Removed) */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      <Smartphone size={14} />
                      <span>iOS Web App Companion</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      Invexix QR Code Scanner for iPhone & iPad
                    </h2>

                    <p className="text-sm sm:text-base text-slate-600 max-w-xl">
                      Install Invexix on your iOS home screen to scan product QR codes directly from your camera.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3 w-full md:w-auto">
                    <Link
                      href={`/${locale}/auth/login`}
                      className="w-full sm:w-auto min-w-[240px] px-8 py-4 bg-slate-900 hover:bg-black active:scale-98 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-3 transition-all"
                    >
                      <ExternalLink size={20} />
                      <span>Open Scanner in Safari</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* iOS Installation Steps */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Installation Guide for iOS</h3>
                    <p className="text-sm text-slate-500">How to add Invexix QR Scanner to your iPhone Home Screen</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-center sm:text-left">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
                      1
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">Open in Safari</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Open <strong className="text-slate-900 font-semibold">Safari</strong> on your iPhone or iPad and navigate to your Invexix workspace URL.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-center sm:text-left">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
                      2
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">Tap Share Icon</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Tap the <strong className="text-slate-900 font-semibold">Share button</strong> (box with up arrow) at the bottom of the Safari screen.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-center sm:text-left">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
                      3
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">Add to Home Screen</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Scroll down and select <strong className="text-slate-900 font-semibold">"Add to Home Screen"</strong> to install the QR code scanner app icon.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Highlights Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <QrCode size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Instant QR Code Scanning</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan product QR codes using your phone camera for real-time item lookup.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Secure Encrypted Token</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                End-to-end encrypted connection with your company backend.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Zap size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Real-Time Stock Updates</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instantly syncs scanned QR code transactions directly to your dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Invexix Inventory Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
