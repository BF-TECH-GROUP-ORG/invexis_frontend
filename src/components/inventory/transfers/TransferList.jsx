"use client";

import React, { useState, useEffect } from "react";
import TransferStats from "./TransferStats";
import TransferTable from "./TransferTable";
import TransferFilters from "./TransferFilters";
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
import InventoryService from "@/services/inventoryService";
import { getAllShops } from "@/services/shopService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getCompanyDetails, getAllCompanies } from "@/services/stockService";

export default function TransferList() {
    const { data: session } = useSession();
    const companyObj = session?.user?.companies?.[0];
    const companyId = typeof companyObj === "string" ? companyObj : companyObj?.id || companyObj?._id;

    const [loading, setLoading] = useState(true);
    const [transfers, setTransfers] = useState([]);
    const [shops, setShops] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [allCompanies, setAllCompanies] = useState([]);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activeFilters, setActiveFilters] = useState({
        search: "",
        direction: "all",
        status: "all",
        type: "all",
        shop: "all",
        worker: "all",
        startDate: "",
        endDate: ""
    });

    // Fetch shops and workers for mapping
    useEffect(() => {
        if (!companyId) return;

        const loadMetadata = async () => {
            const options = session?.accessToken ? {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`
                }
            } : {};

            try {
                const [shopsData, workersData, orgData, allCompaniesData] = await Promise.all([
                    getAllShops(companyId, options),
                    getWorkersByCompanyId(companyId, options),
                    getCompanyDetails(companyId, options).catch(() => null),
                    getAllCompanies(options).catch(() => null)
                ]);

                // Extract arrays robustly
                const extractedShops = Array.isArray(shopsData) ? shopsData : (shopsData?.data || shopsData?.shops || []);
                const extractedWorkers = Array.isArray(workersData) ? workersData : (workersData?.data || workersData?.workers || []);
                const extractedCompanies = Array.isArray(allCompaniesData) ? allCompaniesData : (allCompaniesData?.data || []);

                setShops(extractedShops);
                setWorkers(extractedWorkers);
                setAllCompanies(extractedCompanies);
                setCompanyInfo(orgData?.data || orgData);
            } catch (error) {
                console.error("Failed to load metadata:", error);
            }
        };

        loadMetadata();
    }, [companyId]);

    // Fetch transfers with filtering and pagination
    useEffect(() => {
        if (!companyId) return;

        const fetchData = async () => {
            const options = session?.accessToken ? {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`
                }
            } : {};

            setLoading(true);
            try {
                const params = {
                    page: page + 1,
                    limit: rowsPerPage,
                    search: activeFilters.search || undefined,
                    status: activeFilters.status !== "all" ? activeFilters.status : undefined,
                    transferType: activeFilters.type !== "all" ? activeFilters.type : undefined,
                    destinationShopId: activeFilters.shop !== "all" ? activeFilters.shop : undefined,
                    performedBy: activeFilters.worker !== "all" ? activeFilters.worker : undefined,
                    startDate: activeFilters.startDate || undefined,
                    endDate: activeFilters.endDate || undefined,
                    direction: activeFilters.direction !== "all" ? activeFilters.direction : undefined
                };

                const response = await InventoryService.getTransfers(companyId, params, options);

                // Handle various API response structures
                const data = response.data || response.transfers || (Array.isArray(response) ? response : []);
                const total = response.pagination?.total || response.total || (Array.isArray(data) ? data.length : 0);

                setTransfers(Array.isArray(data) ? data : []);
                setTotalCount(total);
            } catch (error) {
                console.error("Failed to fetch transfers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyId, page, rowsPerPage, activeFilters]);

    // Map raw IDs to display names for High-Fidelity UI
    const mappedTransfers = React.useMemo(() => {
        return transfers.map(item => {
            const sId = item.sourceShopId || item.shopId;
            const dId = item.destinationShopId || item.destShopId;
            // Extremely robust worker ID detection
            const uId = (typeof item.performedBy === 'string' ? item.performedBy : (item.performedBy?._id || item.performedBy?.id || item.performedBy?.userId)) || item.userId || item.workerId;

            const sourceShop = shops.find(s => s._id === sId || s.id === sId);
            const destShop = shops.find(s => s._id === dId || s.id === dId);
            const worker = workers.find(w => w._id === uId || w.id === uId);

            // If intra-company, the destination company is effectively "Us"
            const companyNameLabel = item.transferType === 'intra_company' ? "Us" : (companyInfo?.name || "Us");
            const targetCompany = item.toCompanyId ? allCompanies.find(c => c._id === item.toCompanyId || c.id === item.toCompanyId) : null;

            // Robust worker name resolution matching Sales module patterns
            const resolvedWorkerName = worker?.fullName ||
                (worker?.firstName ? `${worker.firstName} ${worker.lastName || ""}`.trim() : worker?.name) ||
                // Fallback to object properties if worker not found in list
                (typeof item.performedBy === 'object' ? (item.performedBy?.fullName || item.performedBy?.name) : null) ||
                item.workerName ||
                "System";

            return {
                ...item,
                sourceShopName: sourceShop?.name || sourceShop?.shopName || item.sourceShopName || "Unknown Shop",
                destShopName: destShop?.name || destShop?.shopName || item.destShopName || "Unknown Shop",
                workerName: resolvedWorkerName,
                destCompanyName: targetCompany?.name || targetCompany?.companyName || item.destCompanyName,
                companyName: companyNameLabel // Carry formatted company name for display
            };
        });
    }, [transfers, shops, workers, companyInfo, allCompanies]);

    const stats = {
        total: totalCount,
        completed: transfers.filter(d => d.status === "completed").length, // Proxied for now
        totalQuantity: transfers.reduce((sum, d) => sum + (d.quantity || 0), 0),
        latestDay: 1 // Could be calculated from initiatedAt
    };

    const handleFilterChange = (newFilters) => {
        setActiveFilters(prev => ({ ...prev, ...newFilters }));
        setPage(0); // Reset to first page on filter
    };

    // Final data for table is mappedTransfers, which are already filtered/paginated by server

    return (
        <Box sx={{ mx: "auto" }}>
            {/* Page Header */}
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
                        Inventory Transfers
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Master log of all product movements across your company ecosystem.
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
                        Add Transfer
                    </Button>
                </motion.div>
            </Stack>

            {/* Stats Section */}
            <Box sx={{ mb: 6 }}>
                <TransferStats stats={stats} />
            </Box>

            {/* Filters Section */}
            <TransferFilters
                onFilterChange={handleFilterChange}
                shops={shops}
                workers={workers}
            />

            {/* Table Section */}
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
