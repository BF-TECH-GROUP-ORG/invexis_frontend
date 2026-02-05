"use client";

import React, { useState, useMemo } from "react";
import TransferStats from "./TransferStats";
import TransferTable from "./TransferTable";
import TransferFilters from "./TransferFilters";
import { useTranslations } from "next-intl";
import {
    Box,
    Typography,
    TablePagination,
    Paper,
    Divider,
    Stack,
    Button,
} from "@mui/material";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import InventoryService from "@/services/inventoryService";
import { getAllShops } from "@/services/shopService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getCompanyDetails, getAllCompanies } from "@/services/stockService";

export default function TransferList() {
    const t = useTranslations("transfers");
    const { data: session } = useSession();
    const companyObj = session?.user?.companies?.[0];
    const companyId = typeof companyObj === "string" ? companyObj : companyObj?.id || companyObj?._id;

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activeFilters, setActiveFilters] = useState({
        search: "",
        direction: "all",
        type: "all",
        shop: "all",
        worker: "all",
        startDate: "",
        endDate: ""
    });

    const options = useMemo(() => (session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {}), [session?.accessToken]);

    // Fetch Metadata
    const { data: shopsData } = useQuery({
        queryKey: ['shops', companyId],
        queryFn: () => getAllShops(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 60 * 60 * 1000,
    });

    const { data: workersData } = useQuery({
        queryKey: ['companyWorkers', companyId],
        queryFn: () => getWorkersByCompanyId(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 300000,
    });

    const { data: orgData } = useQuery({
        queryKey: ['companyDetails', companyId],
        queryFn: () => getCompanyDetails(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 3600000,
    });

    const { data: allCompaniesData } = useQuery({
        queryKey: ['allCompanies'],
        queryFn: () => getAllCompanies(options),
        enabled: !!session?.accessToken,
        staleTime: 3600000,
    });

    const shops = useMemo(() => Array.isArray(shopsData) ? shopsData : (shopsData?.data || shopsData?.shops || []), [shopsData]);
    const workers = useMemo(() => Array.isArray(workersData) ? workersData : (workersData?.data || workersData?.workers || []), [workersData]);
    const allCompanies = useMemo(() => Array.isArray(allCompaniesData) ? allCompaniesData : (allCompaniesData?.data || []), [allCompaniesData]);
    const companyInfo = useMemo(() => orgData?.data || orgData, [orgData]);

    // Fetch Transfers
    const fetchParams = useMemo(() => {
        const params = {
            page: page + 1,
            limit: rowsPerPage,
            search: activeFilters.search || undefined,
            transferType: activeFilters.type !== "all" ? activeFilters.type : undefined,
            performedBy: activeFilters.worker !== "all" ? activeFilters.worker : undefined,
            startDate: activeFilters.startDate || undefined,
            endDate: activeFilters.endDate || undefined,
        };

        if (activeFilters.shop !== "all") {
            if (activeFilters.direction === "outbound") {
                params.sourceShopId = activeFilters.shop;
            } else {
                params.destinationShopId = activeFilters.shop;
            }
        } else if (activeFilters.direction !== "all") {
            params.direction = activeFilters.direction;
        }
        return params;
    }, [page, rowsPerPage, activeFilters]);

    const { data: transfersResponse, isLoading: loading } = useQuery({
        queryKey: ['transfers', companyId, fetchParams],
        queryFn: () => InventoryService.getTransfers(companyId, fetchParams, options),
        enabled: !!companyId && !!session?.accessToken,
    });

    const transfers = useMemo(() => {
        const data = transfersResponse?.data || transfersResponse?.transfers || (Array.isArray(transfersResponse) ? transfersResponse : []);
        return Array.isArray(data) ? data : [];
    }, [transfersResponse]);

    const totalCount = useMemo(() => transfersResponse?.pagination?.total || transfersResponse?.total || transfers.length, [transfersResponse, transfers]);

    // Map raw IDs to display names
    const mappedTransfers = useMemo(() => {
        return transfers.map(item => {
            const sId = item.sourceShopId || item.shopId;
            const dId = item.destinationShopId || item.destShopId;

            let uId = null;
            if (item.performedBy) {
                if (typeof item.performedBy === 'string') {
                    uId = item.performedBy;
                } else {
                    uId = item.performedBy.userId || item.performedBy._id || item.performedBy.id;
                }
            }
            if (!uId) uId = item.userId || item.workerId;

            const sourceShop = shops.find(s => s._id === sId || s.id === sId);
            const destShop = shops.find(s => s._id === dId || s.id === dId);
            const worker = workers.find(w => w._id === uId || w.id === uId);

            const companyNameLabel = item.transferType === 'intra_company' ? t("table.us") : (companyInfo?.name || t("table.us"));
            const targetCompany = item.toCompanyId ? allCompanies.find(c => c._id === item.toCompanyId || c.id === item.toCompanyId) : null;

            const resolvedWorkerName = worker
                ? `${worker.firstName} ${worker.lastName}`.trim()
                : "N/A";

            return {
                ...item,
                sourceShopName: sourceShop?.name || sourceShop?.shopName || item.sourceShopName || t("table.unknownShop"),
                destShopName: destShop?.name || destShop?.shopName || item.destShopName || t("table.unknownShop"),
                workerName: resolvedWorkerName,
                destCompanyName: targetCompany?.name || targetCompany?.companyName || item.destCompanyName || t("table.unknown"),
                companyName: companyNameLabel
            };
        });
    }, [transfers, shops, workers, companyInfo, allCompanies, t]);

    const stats = {
        total: totalCount,
        completed: transfers.filter(d => d.status === "completed").length,
        totalQuantity: transfers.reduce((sum, d) => sum + (d.quantity || 0), 0),
        latestDay: 1
    };

    const handleFilterChange = (newFilters) => {
        setActiveFilters(prev => ({ ...prev, ...newFilters }));
        setPage(0);
    };

    return (
        <Box sx={{ mx: "auto" }}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                sx={{ mb: 6 }}
            >
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4" fontWeight={800} sx={{ color: "#111827", letterSpacing: "-0.5px" }}>
                        {t("header.title")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {t("header.subtitle")}
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Button
                        variant="contained"
                        disabled
                        startIcon={<Plus size={20} />}
                        sx={{
                            bgcolor: "#ff782d",
                            "&:hover": { bgcolor: "#ea580c" },
                            borderRadius: "12px",
                            px: 3,
                            py: 1.2,
                            textTransform: "none",
                            fontWeight: 700,
                            boxShadow: "none",
                            "&.Mui-disabled": {
                                bgcolor: "#f3f4f6",
                                color: "#9ca3af"
                            }
                        }}
                    >
                        {t("header.addTransfer")}
                    </Button>
                </motion.div>
            </Stack>

            <Box sx={{ mb: 6 }}>
                <TransferStats stats={stats} />
            </Box>

            <TransferFilters
                onFilterChange={handleFilterChange}
                shops={shops}
                workers={workers}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: "20px",
                        border: "1px solid #e5e7eb",
                        overflow: "hidden",
                        boxShadow: "none",
                    }}
                >
                    <TransferTable
                        transfers={mappedTransfers}
                        loading={loading}
                    />

                    <Divider sx={{ borderColor: "#f3f4f6" }} />

                    <Box sx={{ px: 2, py: 1.5, bgcolor: "#fff" }}>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, p) => setPage(p)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            sx={{
                                border: "none",
                                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                                    color: "#6b7280",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </motion.div>
        </Box>
    );
}
