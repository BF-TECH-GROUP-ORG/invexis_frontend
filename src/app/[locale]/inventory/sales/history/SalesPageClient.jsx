"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import DataTable from "./table";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import SalesCards from "./cards";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getSalesHistory } from "@/services/salesService";

const SalesPageClient = ({ initialData }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations("sales");
    const tHistory = useTranslations("salesHistory");

    const {
        companyId,
        shops = [],
        workers = [],
        soldBy: initialSoldBy,
        shopId: initialShopId,
        month: initialMonth
    } = initialData;

    const currentSoldBy = searchParams.get('soldBy') || initialSoldBy || "";
    const currentShopId = searchParams.get('shopId') || initialShopId || "";
    const currentMonth = searchParams.get('month') || initialMonth || "";

    // Stale-while-revalidate: show cached data instantly, background refetch on every visit.
    // staleTime: Infinity → data never auto-stales, prevents races with delete/return optimistic updates
    // refetchOnMount: 'always' → always background-refetch on every page visit regardless of staleTime
    // refetchOnWindowFocus: 'always' → also refresh when switching back to this tab
    const { data: sales = [], isLoading: isSalesLoading } = useQuery({
        queryKey: ["salesHistory", companyId, currentSoldBy, currentShopId],
        queryFn: () => getSalesHistory(
            companyId,
            { soldBy: currentSoldBy, shopId: currentShopId },
        ),
        enabled: !!companyId,
        staleTime: Infinity,            // Never auto-stale → no races with optimistic updates
        gcTime: 5 * 60 * 1000,         // Keep cache for 5 min so navigating back is always instant
        refetchOnMount: 'always',       // Always background-refetch on every page visit
        refetchOnWindowFocus: 'always', // Refetch when user switches back to this tab
    });

    // Sync filter updates with the URL
    const updateFilters = (newSoldBy, newShopId, newMonth) => {
        const params = new URLSearchParams(searchParams);
        if (newSoldBy !== null) {
            if (newSoldBy) params.set('soldBy', newSoldBy);
            else params.delete('soldBy');
        }
        if (newShopId !== null) {
            if (newShopId) params.set('shopId', newShopId);
            else params.delete('shopId');
        }
        if (newMonth !== null) {
            if (newMonth) params.set('month', newMonth);
            else params.delete('month');
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Filter workers based on selected shop for the dropdown
    const filteredWorkers = currentShopId
        ? workers.filter(worker => {
            const workerShops = worker.shops || [];
            return workerShops.some(shop => {
                const shopId = typeof shop === 'string' ? shop : (shop.id || shop._id);
                return shopId === currentShopId;
            });
        })
        : workers;

    const user = session?.user;
    const userRole = user?.role;
    const assignedDepartments = user?.assignedDepartments || [];
    const isWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";

    return (
        <section className="w-full">
            <div className="space-y-6 w-full">
                <SalesCards sales={sales} isLoading={isSalesLoading} />
                <div className="space-y-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-medium ">{tHistory("title")}</h1>
                        <p className="space-x-4 md:space-x-10 font-light">
                            <span>{t("dashboard")}</span>
                            <span>.</span>
                            <span>{t("products")}</span>
                            <span>.</span>
                            <span className="text-gray-500">{t("list")}</span>
                        </p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Link href={`/${locale}/inventory/sales/sellProduct/sale`} className="w-full md:w-auto">
                            <button className="px-8 py-3 rounded-lg bg-[#1F1F1F] text-white cursor-pointer w-full md:w-auto">
                                {t("stockOut")}
                            </button>
                        </Link>
                    </div>
                </div>
                <DataTable
                    salesData={sales}
                    workers={filteredWorkers}
                    selectedWorkerId={currentSoldBy}
                    setSelectedWorkerId={(id) => updateFilters(id, null, null)}
                    shops={shops}
                    selectedShopId={currentShopId}
                    setSelectedShopId={(id) => updateFilters(null, id, null)}
                    selectedMonth={currentMonth}
                    setSelectedMonth={(m) => updateFilters(null, null, m)}
                    isWorker={isWorker}
                    isLoading={isSalesLoading}
                />
            </div>
        </section>
    );
};

export default SalesPageClient;
