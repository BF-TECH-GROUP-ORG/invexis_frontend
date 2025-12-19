"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDebtHistory, recordRepayment, markDebtAsPaid, cancelDebt } from "@/services/debts";
import { getShopById } from "@/services/shopService";
import { useSession } from "next-auth/react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    Chip,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Breadcrumbs,
    Link,
    Card,
    CardContent,
    Stack,
    Alert,
    Snackbar,
    Skeleton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StoreIcon from "@mui/icons-material/Store";
import HistoryIcon from "@mui/icons-material/History";
import dayjs from "dayjs";
import { useState } from "react";

// Reuse the RepayDialog from table.jsx if possible, but for now I'll implement a simplified version or just use the actions.
// Actually, I'll implement the actions directly on this page for better UX.

const DebtDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("debtsPage");
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const debtId = params.id;
    const companyObj = session?.user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    // Fetch debt history
    const { data: historyData, isLoading, error } = useQuery({
        queryKey: ["debtHistory", debtId],
        queryFn: () => getDebtHistory(companyId, debtId),
        enabled: !!companyId && !!debtId,
    });

    const debt = historyData?.debt;

    // Fetch shop details
    const { data: shop } = useQuery({
        queryKey: ["shop", debt?.shopId],
        queryFn: () => getShopById(debt?.shopId),
        enabled: !!debt?.shopId,
    });

    // Mutations with Optimistic Updates
    const markAsPaidMutation = useMutation({
        mutationFn: ({ id, payload }) => markDebtAsPaid(id, payload),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["debtHistory", debtId] });
            const previousHistory = queryClient.getQueryData(["debtHistory", debtId]);

            queryClient.setQueryData(["debtHistory", debtId], (old) => {
                if (!old || !old.debt) return old;
                return {
                    ...old,
                    debt: {
                        ...old.debt,
                        balance: 0,
                        status: "PAID",
                    },
                };
            });

            return { previousHistory };
        },
        onError: (err, variables, context) => {
            if (context?.previousHistory) {
                queryClient.setQueryData(["debtHistory", debtId], context.previousHistory);
            }
            setSnackbar({ open: true, message: "Failed to mark as paid.", severity: "error" });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["debtHistory", debtId] });
            queryClient.invalidateQueries({ queryKey: ["debts"] });
        },
        onSuccess: () => {
            setSnackbar({ open: true, message: "Debt marked as paid!", severity: "success" });
        },
    });

    const cancelDebtMutation = useMutation({
        mutationFn: ({ id, payload }) => cancelDebt(id, payload),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["debtHistory", debtId] });
            const previousHistory = queryClient.getQueryData(["debtHistory", debtId]);

            queryClient.setQueryData(["debtHistory", debtId], (old) => {
                if (!old || !old.debt) return old;
                return {
                    ...old,
                    debt: {
                        ...old.debt,
                        status: "CANCELLED",
                    },
                };
            });

            return { previousHistory };
        },
        onError: (err, variables, context) => {
            if (context?.previousHistory) {
                queryClient.setQueryData(["debtHistory", debtId], context.previousHistory);
            }
            setSnackbar({ open: true, message: "Failed to cancel debt.", severity: "error" });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["debtHistory", debtId] });
            queryClient.invalidateQueries({ queryKey: ["debts"] });
        },
        onSuccess: () => {
            setSnackbar({ open: true, message: "Debt cancelled!", severity: "success" });
        },
    });

    if (isLoading) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>
                <Skeleton variant="text" width={200} height={30} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 3, borderRadius: 2 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3, borderRadius: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" width="100%" height={150} sx={{ mb: 3, borderRadius: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (error || !debt) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Failed to load debt details. Please try again later.</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "PAID": return "success";
            case "PARTIALLY_PAID": return "warning";
            case "UNPAID": return "error";
            case "CANCELLED": return "default";
            default: return "primary";
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>
            {/* Header & Breadcrumbs */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link underline="hover" color="inherit" href={`/${locale}/inventory/debts`} onClick={(e) => { e.preventDefault(); router.push(`/${locale}/inventory/debts`); }}>
                            Debts
                        </Link>
                        <Typography color="text.primary">Debt Details</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight="bold">
                        Debt #{debt._id?.slice(-6)}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push(`/${locale}/inventory/debts`)}
                >
                    Back to List
                </Button>
            </Stack>

            <Grid container spacing={3}>
                {/* Left Column: Debt Info */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">Customer Information</Typography>
                                <Chip
                                    label={debt.status}
                                    color={getStatusColor(debt.status)}
                                    sx={{ fontWeight: "bold" }}
                                />
                            </Stack>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ bgcolor: "#fff3e0", p: 1, borderRadius: 1 }}>
                                            <PersonIcon sx={{ color: "#FF6D00" }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Customer Name</Typography>
                                            <Typography variant="body1" fontWeight="medium">{debt.customer?.name}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ bgcolor: "#fff3e0", p: 1, borderRadius: 1 }}>
                                            <PhoneIcon sx={{ color: "#FF6D00" }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                                            <Typography variant="body1" fontWeight="medium">{debt.customer?.phone}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ bgcolor: "#fff3e0", p: 1, borderRadius: 1 }}>
                                            <StoreIcon sx={{ color: "#FF6D00" }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Shop</Typography>
                                            <Typography variant="body1" fontWeight="medium">{shop?.name || debt.shopId}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ bgcolor: "#fff3e0", p: 1, borderRadius: 1 }}>
                                            <CalendarTodayIcon sx={{ color: "#FF6D00" }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Due Date</Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                {debt.dueDate ? dayjs(debt.dueDate).format("MMMM DD, YYYY") : "N/A"}
                                                {debt.overdueDays > 0 && (
                                                    <Typography component="span" color="error" variant="caption" sx={{ ml: 1, fontWeight: "bold" }}>
                                                        ({debt.overdueDays} days overdue)
                                                    </Typography>
                                                )}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Items Table */}
                    <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Items in this Debt</Typography>
                            <TableContainer component={Box}>
                                <Table>
                                    <TableHead sx={{ bgcolor: "#f9fafb" }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: "bold" }}>Item Name</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Unit Price</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {debt.items?.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.itemName}</TableCell>
                                                <TableCell align="center">{item.quantity}</TableCell>
                                                <TableCell align="right">{item.unitPrice?.toLocaleString()} FRW</TableCell>
                                                <TableCell align="right">{item.totalPrice?.toLocaleString()} FRW</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    {/* Repayments History */}
                    <Card sx={{ mt: 3, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <HistoryIcon color="primary" />
                                <Typography variant="h6" fontWeight="bold">Repayment History</Typography>
                            </Stack>
                            {debt.repayments?.length > 0 ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: "#f9fafb" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Method</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: "bold" }}>Amount Paid</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Reference</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {debt.repayments.map((rep, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{dayjs(rep.paidAt).format("DD/MM/YYYY HH:mm")}</TableCell>
                                                    <TableCell><Chip label={rep.paymentMethod} size="small" variant="outlined" /></TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>
                                                        +{rep.amountPaid?.toLocaleString()} FRW
                                                    </TableCell>
                                                    <TableCell variant="caption">{rep.paymentReference}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ py: 4, textAlign: "center", bgcolor: "#f9fafb", borderRadius: 2 }}>
                                    <Typography color="text.secondary">No repayments recorded yet.</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column: Summary & Actions */}
                <Grid item xs={12} md={4}>
                    <div className="ring mb-5 ring-red-100 p-4 rounded-lg">
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ opacity: 0.8 }} color="#000">Payment Summary</Typography>
                            <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }} />

                            <Stack spacing={2}>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography sx={{ opacity: 0.8 }} color="#000">Total Amount:</Typography>
                                    <Typography fontWeight="bold" color="#000">{debt.totalAmount?.toLocaleString()} FRW</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography sx={{ opacity: 0.8 }} color="#000">Total Paid:</Typography>
                                    <Typography fontWeight="bold" color="#4caf50">{historyData.paymentSummary?.totalPaidAmount?.toLocaleString()} FRW</Typography>
                                </Box>
                                <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1 }}>
                                    <Typography variant="h6">Remaining:</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="#ff5252">
                                        {debt.balance?.toLocaleString()} FRW
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </div>

                    {/* Actions */}
                    <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Actions</Typography>
                            <Stack spacing={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    startIcon={<CheckCircleIcon />}
                                    disabled={debt.status === "PAID" || debt.status === "CANCELLED" || markAsPaidMutation.isPending}
                                    onClick={() => markAsPaidMutation.mutate({
                                        id: debt._id,
                                        payload: {
                                            companyId: debt.companyId,
                                            paymentMethod: "CASH",
                                            paymentReference: `MARK-PAID-DETAIL-${Date.now()}`,
                                            createdBy: session?.user?._id || "temp-user-id"
                                        }
                                    })}
                                >
                                    Mark as Fully Paid
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="error"
                                    size="large"
                                    startIcon={<CancelIcon />}
                                    disabled={debt.status === "PAID" || debt.status === "CANCELLED" || cancelDebtMutation.isPending}
                                    onClick={() => cancelDebtMutation.mutate({
                                        id: debt._id,
                                        payload: {
                                            companyId: debt.companyId,
                                            reason: "customer_requested",
                                            performedBy: session?.user?._id || "temp-user-id"
                                        }
                                    })}
                                >
                                    Cancel Debt
                                </Button>
                            </Stack>

                            {debt.status === "PAID" && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    This debt has been fully cleared.
                                </Alert>
                            )}
                            {debt.status === "CANCELLED" && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    This debt has been cancelled.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DebtDetailPage;