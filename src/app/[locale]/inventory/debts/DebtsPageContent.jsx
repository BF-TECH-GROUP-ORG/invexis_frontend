"use client";

import DebtCards from "./cards";
import DataTable from "./table";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getDebts } from "@/services/debts";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getBranches } from "@/services/branches.js";
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Skeleton,
    Grid
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const DebtsPageContent = ({ initialParams = {} }) => {
    const t = useTranslations("debtsPage");
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const { data: session } = useSession();

    const {
        soldBy: initialSoldBy = "",
        shopId: initialShopId = "",
        companyId: initialCompanyId
    } = initialParams;

    // Sync filters with URL params
    const selectedWorkerId = searchParams.get("soldBy") ?? initialSoldBy;
    const selectedShopId = searchParams.get("shopId") ?? initialShopId;

    const user = session?.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);
    const userRole = user?.role;
    const assignedDepartments = user?.assignedDepartments || [];
    const isWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";

    // Helper to update filters in URL
    const updateFilters = useCallback((updates) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [router, pathname, searchParams]);

    // Fetch workers for the filter (only for admins/managers)
    const { data: workers = [] } = useQuery({
        queryKey: ["workers", companyId || initialCompanyId],
        queryFn: () => getWorkersByCompanyId(companyId || initialCompanyId),
        enabled: !!(companyId || initialCompanyId) && !isWorker,
    });

    // Fetch shops for the filter (only for admins/managers)
    const { data: shopsData = null } = useQuery({
        queryKey: ["shops", companyId || initialCompanyId],
        queryFn: () => getBranches(companyId || initialCompanyId),
        enabled: !!(companyId || initialCompanyId) && !isWorker,
    });

    // Handle both array and object response structures from getBranches
    const shops = Array.isArray(shopsData) ? shopsData : (shopsData?.data || []);

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

    // Fetch debts data from backend
    const { data: debtsData = [], isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["debts", companyId || initialCompanyId, selectedWorkerId, selectedShopId],
        queryFn: () => getDebts(companyId || initialCompanyId, {
            soldBy: selectedWorkerId,
            shopId: selectedShopId
        }),
        enabled: !!(companyId || initialCompanyId),
        select: (response) => {
            // API returns paginated data: { items: [...], total: N, page: N, limit: N }
            if (response?.items && Array.isArray(response.items)) return response.items;
            if (Array.isArray(response)) return response;
            if (response?.data?.items && Array.isArray(response.data.items)) return response.data.items;
            if (response?.data && Array.isArray(response.data)) return response.data;
            if (response?.debts && Array.isArray(response.debts)) return response.debts;
            return [];
        },
        onError: () => {
            setErrorDialogOpen(true);
        },
        retry: 1, // Only retry once on failure
    });

    const handleRetry = () => {
        setErrorDialogOpen(false);
        refetch();
    };

    if (isLoading || (isFetching && (!debtsData || debtsData.length === 0))) {
        return (
            <Box sx={{ p: 4 }}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[1, 2, 3].map((i) => (
                        <Grid item xs={12} sm={4} key={i}>
                            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={300} height={20} sx={{ mb: 4 }} />
                <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
            </Box>
        );
    }

    return (
        <>
            <DebtCards debts={debtsData} />
            <div className="pt-10 pl-3 pb-5">
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-gray-700">{t('subtitle')}</p>
            </div>
            <DataTable
                debts={debtsData}
                workers={filteredWorkers}
                selectedWorkerId={selectedWorkerId}
                setSelectedWorkerId={(id) => updateFilters({ soldBy: id })}
                shops={shops}
                selectedShopId={selectedShopId}
                setSelectedShopId={(id) => updateFilters({ shopId: id, soldBy: "" })}
                isWorker={isWorker}
            />

            {/* Error Dialog */}
            <Dialog
                open={errorDialogOpen}
                onClose={() => setErrorDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: "#d32f2f", color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                    <ErrorOutlineIcon />
                    Network Error
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Failed to load debts data. Please check your internet connection and try again.
                    </Typography>
                    {error?.message && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Error details: {error.message}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setErrorDialogOpen(false)} variant="outlined">
                        Close
                    </Button>
                    <Button
                        onClick={handleRetry}
                        variant="contained"
                        sx={{ bgcolor: "#FF6D00", "&:hover": { bgcolor: "#E65100" } }}
                    >
                        Retry
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DebtsPageContent;
