"use client";
import React from "react";
import { Breadcrumbs, Link, Button } from "@mui/material";
import { HiUserAdd } from "react-icons/hi";
import { useLocale, useTranslations } from "next-intl";

export default function UsersPageHeader({ onAddUser }) {
  const locale = useLocale();
  const t = useTranslations("management.workers");
  const navT = useTranslations("nav");

  return (
    <div className="space-y-4 mb-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs md:text-sm text-[#7a7a7a] space-x-2 font-medium">
        <Link href={`/${locale}/dashboard`} underline="none" className="hover:text-[#081422] transition text-[#7a7a7a]">
          {navT("dashboard") || "Dashboard"}
        </Link>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[#081422] font-bold">
          {t("directoryTitle") || "Personnel Directory"}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-[#081422] tracking-tight">
            {t("directoryTitle") || "Personnel Directory"}
          </h1>
          <p className="text-[#6b7280] text-sm md:text-base font-medium mt-1">
            {t("directoryDesc") || "Manage your company staff, assignments, and roles across all branches."}
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<HiUserAdd size={20} />}
          onClick={onAddUser}
          sx={{
            backgroundColor: "#081422",
            color: "#fff",
            textTransform: "none",
            borderRadius: "16px",
            fontWeight: 700,
            px: 4,
            py: 1.5,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            "&:hover": {
              backgroundColor: "#0b2036",
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            },
            width: { xs: '100%', md: 'auto' }
          }}
        >
          {t("addStaffMember") || "Add Staff Member"}
        </Button>
      </div>
    </div>
  );
}
