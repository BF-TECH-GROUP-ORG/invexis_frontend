"use client"
import { useState, useEffect, useMemo } from "react";
import DataTable from "./table";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getAuditLogs } from "@/services/auditService";
import { getWorkersByCompanyId } from "@/services/workersService";
import Skeleton from "@/components/shared/Skeleton";

const LogsPageClient = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);
    const userRole = user?.role;
    const assignedDepartments = user?.assignedDepartments || [];
    const isWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";

    const [selectedWorkerId, setSelectedWorkerId] = useState("");
    const [selectedType, setSelectedType] = useState("");

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

    const { data: logs = [], isLoading: isLogsLoading } = useQuery({
        queryKey: ["auditLogs", companyId, selectedWorkerId, selectedType],
        queryFn: () => getAuditLogs(companyId, {
            userId: selectedWorkerId,
            event_type: selectedType
        }, options),
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000,
    });

    const t = useTranslations("inventory"); // Using inventory translations for general labels

    return (
        <section className="w-full inline-grid">
            <div className="space-y-10 w-full">
                <div className="space-y-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-medium ">Audit Logs</h1>
                        <p className="space-x-10 font-light">
                            <span>Inventory</span>
                            <span>.</span>
                            <span className="text-gray-500">Logs</span>
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
                />
            </div>
        </section>
    );
};

export default LogsPageClient;
