"use client"
import { useState, useEffect, useMemo } from "react";
import DataTable from "./table";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getAuditLogs } from "@/services/auditService";
import { getWorkersByCompanyId } from "@/services/workersService";
import Skeleton from "@/components/shared/Skeleton";

const LogsPageClient = ({ initialData }) => {
    const { data: session } = useSession();

    // Stabilize initial render state by using passed props
    const user = initialData?.user || session?.user;
    const companyId = initialData?.companyId || (user?.companies?.[0] ? (typeof user.companies[0] === 'string' ? user.companies[0] : (user.companies[0].id || user.companies[0]._id)) : null);

    const userRole = user?.role;
    const assignedDepartments = user?.assignedDepartments || [];
    const isWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";

    const [selectedWorkerId, setSelectedWorkerId] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Reset to first page when filters change
    useEffect(() => {
        setPage(0);
    }, [selectedWorkerId, selectedType]);

    const options = session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {};

    // Fetch workers for the filter
    const { data: workers = [] } = useQuery({
        queryKey: ["workers", companyId],
        queryFn: () => getWorkersByCompanyId(companyId, options),
        enabled: !!companyId,
    });

    const { data: logsRes, isLoading: isLogsLoading } = useQuery({
        queryKey: ["auditLogs", companyId, selectedWorkerId, selectedType, page, rowsPerPage],
        queryFn: () => getAuditLogs(companyId, {
            userId: selectedWorkerId,
            event_type: selectedType,
            page: page + 1, // API is 1-indexed
            limit: rowsPerPage
        }, options),
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000,
    });

    const logs = useMemo(() => {
        if (!logsRes) return [];
        return logsRes.data || (Array.isArray(logsRes) ? logsRes : []);
    }, [logsRes]);

    const totalCount = logsRes?.pagination?.total || (Array.isArray(logsRes) ? logsRes.length : 0);

    const t = useTranslations("logs");

    return (
        <section className="w-full inline-grid">
            <div className="space-y-10 w-full">
                <div className="space-y-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-medium ">{t("title")}</h1>
                        <p className="space-x-10 font-light">
                            <span>{t("inventory")}</span>
                            <span>.</span>
                            <span className="text-gray-500">{t("logs")}</span>
                        </p>
                    </div>
                </div>
                <DataTable
                    logsData={logs}
                    workers={workers}
                    selectedWorkerId={selectedWorkerId}
                    setSelectedWorkerId={setSelectedWorkerId}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    isLoading={isLogsLoading}
                    page={page}
                    setPage={setPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    totalCount={totalCount}
                />
            </div>
        </section>
    );
};

export default LogsPageClient;
