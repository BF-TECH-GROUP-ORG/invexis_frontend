"use client";

import { Button } from "@mui/material";
import { useTranslations } from "next-intl";

export default function TermsAndPrivacyPopup({ open, onAgree, onClose }) {
  const tPopup = useTranslations("termsPopup");
  const tButtons = useTranslations("buttons");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose} // clicking the background closes the popup
    >
      <div
        className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 max-w-lg w-full shadow-lg"
        onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside the popup
      >
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          {tPopup("title")}
        </h2>
        <p className="text-gray-700 dark:text-gray-400 mb-4 text-sm">
          {tPopup("description")}
        </p>
        <div className="flex justify-end gap-4">
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              textTransform: "none",
              boxShadow: "none",
              fontWeight: 500,
              // background
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "#e5e7eb",
              // text colour
              color: (theme) =>
                theme.palette.mode === "dark" ? "grey.200" : "#081422",
              // hover
              "&:hover": {
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "grey.700" : "#d1d5db",
              },
            }}
          >
            {tButtons("cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={onAgree}
            sx={{
              backgroundColor: "#ff782d",
              boxShadow: "none",
              textTransform: "none",
              ":hover": { opacity: 0.9 },
            }}
          >
            {tButtons("agree")}
          </Button>
        </div>
      </div>
    </div>
  );
}
