"use client";
import React, { useMemo, useCallback } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import CompaniesTable from "./table";
import CompanyCards from "./cards";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "@/services/branches";
import { HiPlus } from "react-icons/hi";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const CompaniesPageClient = ({ initialParams = {} }) => {
    const locale = useLocale();
    const t = useTranslations("management.companies");
    const navT = useTranslations("nav");
    const sidebarT = useTranslations("sidebar");

    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const companyObj = session?.user?.companies?.[0];
    const companyId =
        typeof companyObj === "string"
            ? companyObj
            : companyObj?.id || companyObj?._id;

    const options = useMemo(() => session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {}, [session?.accessToken]);

    const { data: shopsRes = [] } = useQuery({
        queryKey: ["branches", companyId],
        queryFn: () => getBranches(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 5 * 60 * 1000,
    });

    const shops = useMemo(() => {
        const data = shopsRes;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.shops)) return data.shops;
        return [];
    }, [shopsRes]);

    const stats = useMemo(() => {
        const totalBranches = shops.length;
        const activeBranches = shops.filter((s) => s.status === "open").length;
        const totalCapacity = shops.reduce((sum, s) => sum + (Number(s.capacity) || 0), 0);

        return {
            totalBranches,
            activeBranches,
            totalCapacity,
        };
    }, [shops]);

    const updateFilters = useCallback((updates) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "" || value === "All") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    return (
        <ProtectedRoute allowedRoles={["company_admin"]} allowedDepartments={["management"]}>
            <div className="mx-auto space-y-8 md:space-y-12">

                {/* === Header Section === */}
                <div className="space-y-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center text-xs md:text-sm text-[#7a7a7a] space-x-2 font-medium">
                        <Link href={`/${locale}/dashboard`} className="hover:text-[#081422] transition">{navT("dashboard") || "Dashboard"}</Link>
                        <span className="text-[#d1d5db]">/</span>
                        <Link href={`/${locale}/inventory`} className="hover:text-[#081422] transition">{sidebarT("staffAndShops") || "Staff & Shops"}</Link>
                        <span className="text-[#d1d5db]">/</span>
                        <span className="text-[#081422] font-bold">{sidebarT("shops") || "Shops"}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-[#081422] tracking-tight">
                                {t("hubTitle") || "Management Hub"}
                            </h1>
                            <p className="text-[#6b7280] text-sm md:text-base font-medium mt-1">
                                {t("hubDesc") || "High-level overview of all your business branches and operational capacity."}
                            </p>
                        </div>

                        <Link href={`/${locale}/inventory/companies/new`}>
                            <button className="flex items-center justify-center gap-2 bg-[#081422] hover:bg-[#0b2036] text-white px-6 py-3.5 rounded-2xl transition shadow-lg shadow-gray-200/50 w-full md:w-auto font-bold text-sm">
                                <HiPlus size={20} />
                                {t("addNewBranch") || "Add New Branch"}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* === Stats Section === */}
                <CompanyCards stats={stats} />

                {/* === Table Section === */}
                <CompaniesTable
                    initialRows={shops}
                    initialParams={{ ...initialParams, companyId }}
                    updateFilters={updateFilters}
                />
            </div>
        </ProtectedRoute>
    );
};

export default CompaniesPageClient;
