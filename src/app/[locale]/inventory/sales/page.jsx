"use client"
import { useState, useEffect } from "react";
import DataTable from "./table";
import Link from "next/link";
import { Button } from "@/components/shared/button";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import SalesCards from "./cards";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getSalesHistory, getSalesByWorker } from "@/services/salesService";
import { getWorkersByCompanyId } from "@/services/workersService";

const SalesPage = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const companyObj = user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);
  const userRole = user?.role;
  const assignedDepartments = user?.assignedDepartments || [];
  const isWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";

  const [selectedWorkerId, setSelectedWorkerId] = useState("");

  // Set default worker ID if the user is a worker
  useEffect(() => {
    if (isWorker && (user?._id || user?.id)) {
      setSelectedWorkerId(user?._id || user?.id);
    }
  }, [isWorker, user?._id, user?.id]);

  // Fetch workers for the filter (only for admins/managers)
  const { data: workers = [] } = useQuery({
    queryKey: ["workers", companyId],
    queryFn: () => getWorkersByCompanyId(companyId),
    enabled: !!companyId && !isWorker,
  });

  const { data: sales = [], isLoading: isSalesLoading } = useQuery({
    queryKey: ["salesHistory", companyId, selectedWorkerId],
    queryFn: () => {
      if (selectedWorkerId) {
        return getSalesByWorker(selectedWorkerId, companyId);
      }
      return getSalesHistory(companyId);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  const locale = useLocale();
  const t = useTranslations("sales");

  return (
    <>
      <section className="w-full inline-grid">
        <div className="space-y-10 w-full">
          <SalesCards sales={sales} />
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
            workers={workers}
            selectedWorkerId={selectedWorkerId}
            setSelectedWorkerId={setSelectedWorkerId}
            isWorker={isWorker}
            isLoading={isSalesLoading}
          />
        </div>
      </section>
    </>
  );
};

export default SalesPage;













