"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Building2, ShieldCheck,
  CheckCircle2, X, ChevronLeft, ArrowRight, Send, Shield, Info, ClipboardCheck
} from "lucide-react";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

const STEPS = [
  {
    id: 1, field: "full_name",      type: "text",
    Icon: User,       question: "What's your full name?",
    placeholder: "Type your full name…",   inputType: "text",
  },
  {
    id: 2, field: "business_email", type: "text",
    Icon: Mail,       question: "Your business email address?",
    placeholder: "name@company.com",       inputType: "email",
  },
  {
    id: 3, field: "phone_number",   type: "text",
    Icon: Phone,      question: "What is your phone number?",
    placeholder: "+250 7xx xxx xxx",       inputType: "tel",
  },
  {
    id: 4, field: "company_name",   type: "text",
    Icon: Building2,  question: "Which company or branch do you represent?",
    placeholder: "Company or branch name…", inputType: "text",
  },
  {
    id: 5, field: "desired_role",   type: "select",
    Icon: ShieldCheck, question: "What will be your primary role?",
    options: ["Company Admin", "Manager", "Seller (Sales Manager)", "Viewer"],
  },
];

const TOTAL = STEPS.length;

export default function RegistrationForm({ onComplete, onCancel }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [stepIndex, setStepIndex]   = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [formData, setFormData]     = useState({
    full_name:       "",
    business_email:  "",
    phone_number:    "",
    company_name:    "",
    desired_role:    "",
    extra_info:      "I would like to join Invexix to streamline my business operations.",
    admin_recipient: "jehovahjules@gmail.com",
  });

  const inputRef   = useRef(null);
  const step       = STEPS[stepIndex];
  const isTextStep = step ? step.type === "text" : false;
  const isLastStep = stepIndex === TOTAL - 1;
  const progress   = Math.round((stepIndex / TOTAL) * 100);

  useEffect(() => {
    if (!hasStarted) return;
    setInputValue(formData[step.field] || "");
    if (isTextStep) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [stepIndex, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const onKey = (e) => {
      if (e.key === "Escape") { onCancel(); return; }
      if (e.key === "Enter" && isTextStep && !e.shiftKey) {
        e.preventDefault();
        commitText();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepIndex, inputValue, isTextStep, hasStarted]);

  const advance = () =>
    isLastStep ? handleSubmit() : setStepIndex((i) => i + 1);

  const retreat = () =>
    stepIndex === 0 ? onCancel() : setStepIndex((i) => i - 1);

  const commitText = () => {
    const val = inputValue.trim();
    if (!val) {
      toast.error(`Please enter your ${step.field.replace(/_/g, " ")}`);
      return;
    }
    if (step.field === "business_email" && !/\S+@\S+\.\S+/.test(val)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setFormData((p) => ({ ...p, [step.field]: val }));
    setInputValue("");
    advance();
  };

  const commitSelect = (option) => {
    setFormData((p) => ({ ...p, [step.field]: option }));
    setTimeout(advance, 160);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Precise mapping of requested variables
      const emailPayload = {
        full_name: formData.full_name,
        business_email: formData.business_email,
        phone_number: formData.phone_number,
        company_name: formData.company_name,
        desired_role: formData.desired_role,
        extra_info: formData.extra_info,
        to_email: "jehovahjules@gmail.com",
        subject: "New Assistant Registration Request"
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  || "service_inara",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_onboarding",
        emailPayload,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  || "your_public_key"
      );
      
      toast.success("Registration request sent!");
      setSubmitted(true);
      setTimeout(() => onComplete(formData), 2600);
    } catch (err) {
      console.error("EmailJS Error:", err);
      toast.error("Failed to send request. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success banner ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-1 py-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-2"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 ml-3">
          <CheckCircle2 size={20} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-slate-800 leading-tight">
            Request Sent Successfully!
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            We'll contact you at <span className="font-bold">{formData.business_email}</span> soon.
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Initial Confirmation Step ──────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xl mb-4"
      >
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff782d]/10 flex items-center justify-center text-[#ff782d]">
              <ClipboardCheck size={22} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800">Registration Request</h3>
              <p className="text-[12px] text-slate-500">Provide your details to get started with Invexix.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <button 
              onClick={() => setHasStarted(true)}
              className="flex-1 bg-[#081422] text-white py-2.5 rounded-xl text-[12px] font-black hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
            >
              Provide Info
            </button>
            <button 
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[12px] font-bold hover:bg-slate-100 hover:text-slate-600 transition-all uppercase tracking-widest"
            >
              Not Now
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Main Multi-step Render ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">

      {/* STEP CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        >
          {/* Progress bar */}
          <div className="h-[2px] bg-slate-100">
            <motion.div
              className="h-full bg-[#ff782d]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-2.5">
            <div className="flex items-start gap-2.5">
              {/* Icon */}
              <div className="w-7 h-7 rounded-lg bg-[#081422] flex items-center justify-center shrink-0 mt-px">
                <step.Icon size={13} className="text-[#ff782d]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                  Step {stepIndex + 1} of {TOTAL}
                </p>
                <p className="text-[14px] font-semibold text-slate-800 leading-snug">
                  {step.question}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-0.5 shrink-0 mt-px">
              {stepIndex > 0 && (
                <button
                  onClick={retreat}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              <button
                onClick={onCancel}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Select options — only on type="select" steps */}
          {step.type === "select" && (
            <div className="px-3 pb-3 flex flex-col gap-1.5">
              {step.options.map((option, idx) => {
                const sel = formData[step.field] === option;
                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => commitSelect(option)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                      transition-all duration-150 active:scale-[0.985]
                      ${sel
                        ? "bg-[#081422] text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }
                    `}
                  >
                    <span className={`
                      w-5 h-5 rounded-md flex items-center justify-center
                      text-[10px] font-bold shrink-0
                      ${sel ? "bg-white/10 text-white/60" : "bg-slate-200 text-slate-500"}
                    `}>
                      {idx + 1}
                    </span>
                    <span className="text-[13px] font-medium flex-1">{option}</span>
                    {sel && <CheckCircle2 size={14} className="text-[#ff782d] shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* PROMPT PILL — text steps only */}
      {isTextStep && (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1 bg-slate-50 rounded-[2rem] px-1">

            {stepIndex > 0 && (
              <button
                onClick={retreat}
                tabIndex={-1}
                className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <input
              ref={inputRef}
              type={step.inputType}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commitText(); }
              }}
              placeholder={step.placeholder}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              style={{ outline: "none", boxShadow: "none" }}
              className="
                flex-1 bg-transparent border-none
                text-[14px] font-medium text-slate-800
                placeholder:text-slate-400
                py-3 px-1
              "
            />

            <motion.button
              whileHover={inputValue.trim() ? { scale: 1.06 } : {}}
              whileTap={inputValue.trim() ? { scale: 0.94 } : {}}
              onClick={commitText}
              disabled={!inputValue.trim() || loading}
              className={`
                w-9 h-9 rounded-full flex items-center justify-center mr-1 shrink-0
                transition-colors duration-150
                ${inputValue.trim() && !loading
                  ? "bg-[#081422] text-white"
                  : "bg-slate-100 text-slate-300 cursor-default"
                }
              `}
            >
              {loading
                ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : isLastStep ? <Send size={14} /> : <ArrowRight size={14} />
              }
            </motion.button>
          </div>
        </div>
      )}

      {/* HINT BAR */}
      <div className="flex items-center justify-between px-1 mt-0.5">
        <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-medium">
          {isTextStep && (
            <>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-px bg-slate-100 rounded text-[9px] font-semibold text-slate-500">
                  Enter
                </kbd>
                confirm
              </span>
              <span className="text-slate-300">·</span>
            </>
          )}
          {step?.type === "select" && (
            <>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-px bg-slate-100 rounded text-[9px] font-semibold text-slate-500">
                  1–{step.options.length}
                </kbd>
                select
              </span>
              <span className="text-slate-300">·</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-px bg-slate-100 rounded text-[9px] font-semibold text-slate-500">
              Esc
            </kbd>
            cancel
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Shield size={9} />
          <span>Secure &amp; private</span>
        </div>
      </div>

    </div>
  );
}