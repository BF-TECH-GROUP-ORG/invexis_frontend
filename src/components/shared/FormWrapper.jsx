"use client";

import React, { useState } from "react";
import {
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  HiArrowRight,
  HiCog6Tooth,
  HiEye,
} from "react-icons/hi2";
import { HiEyeOff } from "react-icons/hi";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import SettingsDropdown from "./SettingsDropdown";

// Official Google SVG logo
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

function FormField({ field }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = field.type === "password";

  return (
    <div className="flex flex-col gap-3">
      {field.before && <section>{field.before}</section>}
      <TextField
        name={field.name}
        label={field.label}
        type={isPasswordField ? (showPassword ? "text" : "password") : field.type}
        value={field.value}
        onChange={field.onChange}
        required={field.required}
        placeholder={field.placeholder}
        fullWidth
        disabled={field.disabled}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
          },
          "& .MuiInputLabel-root": {
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
          },
        }}
        InputProps={{
          ...field.InputProps,
          endAdornment: field.InputProps?.endAdornment ? (
            field.InputProps.endAdornment
          ) : isPasswordField ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
              >
                {showPassword ? <HiEyeOff /> : <HiEye />}
              </IconButton>
            </InputAdornment>
          ) : (
            null
          ),
        }}
      />
      {field.after && <section>{field.after}</section>}
    </div>
  );
}

export default function FormWrapper({
  title,
  desc,
  fields = [],
  onSubmit,
  submitLabel = "Submit",
  submitIcon = <HiArrowRight />,
  oauthOptions = [],
  extraLinks = [],
  showDivider = true,
  isLoading = false,
  error = null,
  success = null,
}) {
  const t = useTranslations("form");
  const locale = useLocale();
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setSettingsAnchor(null);
  };

  return (
    <div className="w-full max-w-2xl p-8 rounded-2xl bg-white dark:bg-zinc-900">
      {/* Header + Help */}
      <div className="fixed top-10 right-10 flex items-center justify-center gap-8">
        <Link href="#" className="hover:underline text-sm text-gray-500">
          {t("needHelp")}
        </Link>
        <IconButton
          onClick={(e) => {
            setSettingsAnchor(e.currentTarget);
          }}
          sx={{
            borderRadius: "50%",
            border: "1px solid #e0e0e0",
            width: "50px",
            height: "50px",
          }}
        >
          <HiCog6Tooth />
        </IconButton>
        <SettingsDropdown
          anchor={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={() => setSettingsAnchor(null)}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
        />
      </div>

      {/* Title & Description */}
      {title && (
        <h2 className="text-3xl font-extrabold text-center mb-2 text-zinc-800 dark:text-zinc-100">
          {title}
        </h2>
      )}
      {desc && <p className="text-center text-gray-500 mb-6 text-sm">{desc}</p>}

      {/* Error & Success Messages */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 text-center border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md mb-4 text-center border border-green-200">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((field, idx) => {
          if (field.hidden) return null;
          const colSpan = field.colSpan || 2;

          return (
            <div key={idx} className={colSpan === 1 ? "col-span-1" : "col-span-1 md:col-span-2"}>
              <FormField field={field} />
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="col-span-1 md:col-span-2">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            fullWidth
            className="flex items-center justify-center mt-2"
            endIcon={!isLoading && submitIcon}
            sx={{
              borderRadius: "12px",
              height: "50px",
              fontFamily: "Metropolis, sans-serif",
              fontSize: "14px",
              textTransform: "none",
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>

      {/* Divider */}
      {showDivider && (
        <div className="col-span-1 md:col-span-2 flex items-center my-10">
          <Divider className="flex-grow" />
          <span className="px-4 text-gray-500 font-medium">{t("or")}</span>
          <Divider className="flex-grow" />
        </div>
      )}

      {/* OAuth Buttons */}
      {oauthOptions.includes("google") && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.invexix.com/api";
              window.location.href = `${apiBase}/auth/google/signin`;
            }}
            className="flex items-center justify-center gap-3 w-full max-w-sm h-[52px] rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-sm font-semibold text-gray-700 dark:text-zinc-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
        </div>
      )}

      {/* Extra Links */}
      {extraLinks.length > 0 && (
        <div className="flex flex-col items-center mt-8 space-y-2">
          {extraLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="flex items-center justify-center text-blue-600 dark:text-blue-800 gap-2 hover:underline font-metropolis text-sm"
            >
              {link.icon && <span className="text-xl">{link.icon}</span>}
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
