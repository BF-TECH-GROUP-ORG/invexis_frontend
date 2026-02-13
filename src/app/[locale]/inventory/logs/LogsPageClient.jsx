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
                    <button
                        onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + "Event Type,User,Entity,Source,Severity,Date\n"
                                + logs.map(e => `"${e.event_type}","${e.userId}","${e.entityType}","${e.source_service}","${e.severity}","${e.occurred_at}"`).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `audit_logs_${companyId}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="bg-white text-[#FF6D00] border-2 border-[#FF6D00] px-6 py-2.5 rounded-2xl font-black hover:bg-orange-50 transition-all shadow-none flex items-center gap-2 group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t("export") || "Export Logs"}
                    </button>
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
