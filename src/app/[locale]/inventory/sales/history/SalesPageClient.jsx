"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import DataTable from "./table";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import SalesCards from "./cards";
import { getSalesHistory } from "@/services/salesService";
import { useState, useMemo } from "react";
import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

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
    const currentDate = searchParams.get('date') || initialMonth || "";

    const [timeRange, setTimeRange] = useState("daily");

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

    // Client-side filtering by time range
    const filteredSalesByTime = useMemo(() => {
        if (!sales || !Array.isArray(sales)) return [];
        
        const now = dayjs();
        
        return sales.filter(sale => {
            const createdAt = dayjs(sale.createdAt);
            
            switch (timeRange) {
                case "daily":
                    return createdAt.isSame(now, "day");
                case "weekly":
                    return createdAt.isAfter(now.subtract(7, "day"));
                case "monthly":
                    return createdAt.isSame(now, "month");
                case "yearly":
                    return createdAt.isSame(now, "year");
                default:
                    return true;
            }
        });
    }, [sales, timeRange]);

    // Sync filter updates with the URL
    const updateFilters = (newSoldBy, newShopId, newDate) => {
        const params = new URLSearchParams(searchParams);
        if (newSoldBy !== null) {
            if (newSoldBy) params.set('soldBy', newSoldBy);
            else params.delete('soldBy');
        }
        if (newShopId !== null) {
            if (newShopId) params.set('shopId', newShopId);
            else params.delete('shopId');
        }
        if (newDate !== null) {
            if (newDate) params.set('date', newDate);
            else params.delete('date');
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
                <Box sx={{ 
                    display: "flex", 
                    flexDirection: { xs: "column", sm: "row" }, 
                    justifyContent: "space-between", 
                    alignItems: { xs: "flex-start", sm: "center" },
                    mb: 1,
                    gap: 2
                }}>
                    <SalesCards sales={filteredSalesByTime} isLoading={isSalesLoading} />
                    
                    <Box sx={{ alignSelf: { xs: "flex-end", sm: "flex-start" }, mt: { xs: 0, sm: -1 } }}>
                        <ToggleButtonGroup
                            value={timeRange}
                            exclusive
                            onChange={(e, next) => next && setTimeRange(next)}
                            size="small"
                            sx={{
                                "& .MuiToggleButton-root": {
                                    px: 2,
                                    py: 0.75,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "8px !important",
                                    border: "1px solid #e5e7eb",
                                    mr: 1,
                                    "&.Mui-selected": {
                                        bgcolor: "#FF6D00",
                                        color: "white",
                                        "&:hover": { bgcolor: "#E65100" }
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="daily">{tHistory('filters.daily') || "Daily"}</ToggleButton>
                            <ToggleButton value="weekly">{tHistory('filters.weekly') || "Weekly"}</ToggleButton>
                            <ToggleButton value="monthly">{tHistory('filters.monthly') || "Monthly"}</ToggleButton>
                            <ToggleButton value="yearly">{tHistory('filters.yearly') || "Yearly"}</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

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
                    salesData={filteredSalesByTime}
                    workers={filteredWorkers}
                    selectedWorkerId={currentSoldBy}
                    setSelectedWorkerId={(id) => updateFilters(id, null, null)}
                    shops={shops}
                    selectedShopId={currentShopId}
                    setSelectedShopId={(id) => updateFilters(null, id, null)}
                    selectedMonth={currentDate}
                    setSelectedMonth={(d) => updateFilters(null, null, d)}
                    isWorker={isWorker}
                    isLoading={isSalesLoading}
                />
            </div>
        </section>
    );
};

export default SalesPageClient;
