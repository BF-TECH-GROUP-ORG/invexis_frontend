"use client"
import { useState, useEffect, useMemo } from "react";
import DataTable from "./table";
import Link from "next/link";
import { Button } from "@/components/shared/button";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import SalesCards from "./cards";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getSalesHistory } from "@/services/salesService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getBranches } from "@/services/branches.js";
import Skeleton from "@/components/shared/Skeleton";

const SalesPageClient = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);
    const userRole = user?.role;
    const assignedDepartments = user?.assignedDepartments || [];
    const isWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";

    const [selectedWorkerId, setSelectedWorkerId] = useState("");
    const [selectedShopId, setSelectedShopId] = useState("");

    const options = session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {};

    // Set default worker ID for all roles (Admin/Manager start with their own sales)
    useEffect(() => {
        if (user?._id || user?.id) {
            setSelectedWorkerId(user?._id || user?.id);
        }
    }, [user?._id, user?.id]);

    // Fetch workers for the filter (only for admins/managers)
    const { data: workers = [] } = useQuery({
        queryKey: ["workers", companyId],
        queryFn: () => getWorkersByCompanyId(companyId, options),
        enabled: !!companyId && !isWorker,
    });

    // Filter workers based on selected shop
    const filteredWorkers = useMemo(() => {
        if (!selectedShopId) return workers;
        return workers.filter(worker => {
            const workerShops = worker.shops || [];
            return workerShops.some(shop => {
                const shopId = typeof shop === 'string' ? shop : (shop.id || shop._id);
                return shopId === selectedShopId;
            });
        });
    }, [workers, selectedShopId]);

    // Reset worker selection if they don't belong to the selected shop
    useEffect(() => {
        if (selectedShopId && selectedWorkerId) {
            const currentUserId = user?._id || user?.id;
            if (selectedWorkerId === currentUserId) return;

            const isWorkerInShop = filteredWorkers.some(w => (w._id || w.id) === selectedWorkerId);
            if (!isWorkerInShop) {
                setSelectedWorkerId("");
            }
        }
    }, [selectedShopId, filteredWorkers, selectedWorkerId, user]);

    // Fetch shops for the filter (only for admins/managers)
    const { data: shopsData = null } = useQuery({
        queryKey: ["shops", companyId],
        queryFn: () => getBranches(companyId, options),
        enabled: !!companyId && !isWorker,
    });

    const shops = shopsData?.data || [];

    const { data: sales = [], isLoading: isSalesLoading } = useQuery({
        queryKey: ["salesHistory", companyId, selectedWorkerId, selectedShopId],
        queryFn: () => getSalesHistory(companyId, {
            soldBy: selectedWorkerId,
            shopId: selectedShopId
        }, options),
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000,
    });

    const locale = useLocale();
    const t = useTranslations("sales");

    return (
        <>
            <section className="w-full inline-grid">
                <div className="space-y-10 w-full">
                    <SalesCards sales={sales} isLoading={isSalesLoading} />
                    <div className="space-y-5 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-medium ">{t("title")}</h1>
                            <p className="space-x-10 font-light">
                                <span>{t("dashboard")}</span>
                                <span>.</span>
                                <span>{t("products")}</span>
                                <span>.</span>
                                <span className="text-gray-500">{t("list")}</span>
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Link href={`/${locale}/inventory/sales/sellProduct/sale`}>
                                <button className="px-8 py-3 rounded-lg bg-[#1F1F1F] text-white cursor-pointer">
                                    {t("stockOut")}
                                </button>
                            </Link>
                        </div>
                    </div>
                    <DataTable
                        salesData={sales}
                        workers={filteredWorkers}
                        selectedWorkerId={selectedWorkerId}
                        setSelectedWorkerId={setSelectedWorkerId}
                        shops={shops}
                        selectedShopId={selectedShopId}
                        setSelectedShopId={setSelectedShopId}
                        isWorker={isWorker}
                        isLoading={isSalesLoading}
                    />
                </div>
            </section>
        </>
    );
};

export default SalesPageClient;
