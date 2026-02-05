"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import CompaniesTable from "./table";
import CompanyCards from "./cards";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "@/services/branches";
import { HiPlus } from "react-icons/hi";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { useSession } from "next-auth/react";

const CompaniesPageClient = () => {
    const locale = useLocale();
    const { data: session } = useSession();
    const companyObj = session?.user?.companies?.[0];
    const companyId =
        typeof companyObj === "string"
            ? companyObj
            : companyObj?.id || companyObj?._id;

    const { data: shops = [] } = useQuery({
        queryKey: ["branches", companyId],
        queryFn: () => getBranches(companyId),
        enabled: !!companyId,
        select: (data) => {
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.data)) return data.data;
            if (data && Array.isArray(data.shops)) return data.shops;
            return [];
        },
    });

    const stats = useMemo(() => {
        const totalBranches = shops.length;
        const activeBranches = shops.filter((s) => s.status === "open").length;
        const totalCapacity = shops.reduce((sum, s) => sum + (s.capacity || 0), 0);

        return {
            totalBranches,
            activeBranches,
            totalCapacity,
        };
    }, [shops]);

    return (
        <ProtectedRoute allowedRoles={["company_admin"]} allowedDepartments={["management"]}>
            <>
                <section className="w-full inline-grid">
                    <div className="space-y-10">
                        <CompanyCards stats={stats} />
                        <div className="mb-5 space-y-2 font-[Metropolis,sans-serif]">
                            {/* === Breadcrumbs === */}
                            <nav
                                aria-label="breadcrumb"
                                className="flex items-center text-sm text-[#7a7a7a] space-x-2"
                            >
                                <Link
                                    href={`/${locale}/dashboard`}
                                    className="font-medium hover:text-[#081422] transition"
                                >
                                    Dashboard
                                </Link>

                                <span>›</span>

                                <Link
                                    href={`/${locale}/inventory`}
                                    className="font-medium hover:text-[#081422] transition"
                                >
                                    Staff & Shops
                                </Link>

                                <span>›</span>

                                <span className="font-semibold text-[#081422]">Shops</span>
                            </nav>

                            {/* === Title + Button Row === */}
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-semibold text-[#081422]">
                                    Shops Management
                                </h1>

                                <Link href={`/${locale}/inventory/companies/new`}>
                                    <button
                                        className="
          flex items-center gap-2
          bg-[#081422] hover:bg-[#0b2036]
          text-white
          px-5 py-2.5
          rounded-xl
          transition
          text-sm
          font-bold
        "
                                    >
                                        <HiPlus size={20} />
                                        Add Shop
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <CompaniesTable initialRows={shops} />
                    </div>
                </section>
            </>
        </ProtectedRoute>
    );
};

export default CompaniesPageClient;
