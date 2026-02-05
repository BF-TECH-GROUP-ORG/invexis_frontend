"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    Chip,
    Avatar,
    Stack,
    Button,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import {
    ArrowRight,
    User,
    Calendar,
    Package,
    MapPin,
    ClipboardList,
    ChevronLeft,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    History,
} from "lucide-react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import InventoryService from "@/services/inventoryService";
import { getAllShops } from "@/services/shopService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getCompanyDetails, getAllCompanies } from "@/services/stockService";

function TransferDetailPageContent() {
    const navigate = useRouter();
    const params = useParams();
    const transferId = params.id;
    const { data: session } = useSession();
    const companyObj = session?.user?.companies?.[0];
    const companyId = typeof companyObj === "string" ? companyObj : companyObj?.id || companyObj?._id;

    const [loading, setLoading] = useState(true);
    const [transfer, setTransfer] = useState(null);
    const [allCompanies, setAllCompanies] = useState([]);
    const [companyInfo, setCompanyInfo] = useState(null);

    useEffect(() => {
        if (!companyId || !transferId) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const options = session?.accessToken ? {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`
                    }
                } : {};

                // Fetch transfer details, shops, workers and company in parallel for mapping
                const [transferData, shopsData, workersData, orgData, allCompaniesData] = await Promise.all([

                    InventoryService.getTransferById(companyId, transferId, options),
                    getAllShops(companyId, options),
                    getWorkersByCompanyId(companyId, options),
                    getCompanyDetails(companyId, options).catch(() => null),
                    getAllCompanies(options).catch(() => null)
                ]);

                // Extract arrays robustly
                const shops = Array.isArray(shopsData) ? shopsData : (shopsData?.data || shopsData?.shops || []);
                const workers = Array.isArray(workersData) ? workersData : (workersData?.data || workersData?.workers || []);
                const extractedAllCompanies = Array.isArray(allCompaniesData) ? allCompaniesData : (allCompaniesData?.data || []);

                setAllCompanies(extractedAllCompanies);
                setCompanyInfo(orgData?.data || orgData);

                if (transferData) {
                    const sId = transferData.sourceShopId || transferData.shopId;
                    const dId = transferData.destinationShopId || transferData.destShopId;
                    // Extract worker ID from performedBy.userId
                    const uId = transferData.performedBy?.userId;

                    const sourceShop = shops?.find(s => s._id === sId || s.id === sId);
                    const destShop = shops?.find(s => s._id === dId || s.id === dId);
                    const worker = workers?.find(w => w._id === uId || w.id === uId);

                    const companyNameLabel = transferData.transferType === 'intra_company' ? "Us" : (orgData?.data?.name || orgData?.name || "Us");
                    const targetCompany = transferData.toCompanyId ? extractedAllCompanies.find(c => c._id === transferData.toCompanyId || c.id === transferData.toCompanyId) : null;

                    // Build worker name from firstName and lastName
                    const resolvedWorkerName = worker
                        ? `${worker.firstName} ${worker.lastName}`.trim()
                        : "N/A";

                    setTransfer({
                        ...transferData,
                        sourceShopName: sourceShop?.name || sourceShop?.shopName || transferData.sourceShopName || "Unknown Shop",
                        destShopName: destShop?.name || destShop?.shopName || transferData.destShopName || "Unknown Shop",
                        workerName: resolvedWorkerName,
                        destCompanyName: targetCompany?.name || targetCompany?.companyName || transferData.destCompanyName,
                        companyName: companyNameLabel
                    });
                }
            } catch (error) {
                console.error("Failed to fetch transfer details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [companyId, transferId]);

    const getStatusConfig = (status) => {
        switch (status) {
            case "completed":
                return { color: "#10b981", bg: "#ecfdf5", icon: <CheckCircle2 size={18} />, label: "Completed" };
            case "pending":
                return { color: "#f59e0b", bg: "#fffbeb", icon: <Clock size={18} />, label: "In Progress" };
            case "cancelled":
                return { color: "#ef4444", bg: "#fef2f2", icon: <XCircle size={18} />, label: "Cancelled" };
            default:
                return { color: "#6b7280", bg: "#f3f4f6", icon: <Clock size={18} />, label: status };
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
                <CircularProgress sx={{ color: "#ff782d" }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Fetching audit details...</Typography>
            </Box>
        );
    }

    if (!transfer) return null;

    const statusConfig = getStatusConfig(transfer.status);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <Box sx={{ maxWidth: "1100px", mx: "auto", px: { xs: 2, sm: 4 } }}>
            {/* Navigation Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4, mt: 2 }}>
                <Button
                    onClick={() => navigate.back()}
                    startIcon={<ChevronLeft size={20} />}
                    sx={{
                        color: "#6b7280",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "12px",
                        px: 2,
                        py: 1,
                        "&:hover": { bgcolor: "#f3f4f6", color: "#111827" }
                    }}
                >
                    Back to History
                </Button>
            </Stack>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Grid container spacing={4}>
                    {/* CORE INFO AREA */}
                    <Grid item xs={12} lg={8}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, md: 5 },
                                borderRadius: "32px",
                                border: "1px solid #e5e7eb",
                                background: "#fff",
                                position: "relative",
                                overflow: "hidden",
                                boxShadow: "none",
                                mb: 4
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ letterSpacing: "2px" }}>
                                    TRANSFER ID: {transfer.transferId?.split("-").pop() || transfer._id?.substring(0, 8) || "N/A"}
                                </Typography>
                                <Chip
                                    icon={statusConfig?.icon}
                                    label={statusConfig?.label || transfer.status}
                                    sx={{
                                        bgcolor: statusConfig?.bg || "#f3f4f6",
                                        color: statusConfig?.color || "#6b7280",
                                        fontWeight: 800,
                                        borderRadius: "12px",
                                        px: 1,
                                        height: "28px",
                                        "& .MuiChip-icon": { color: "inherit" }
                                    }}
                                />
                            </Stack>

                            <Typography variant="h2" fontWeight={900} color="#111827" sx={{ mb: 1, letterSpacing: "-1px" }}>
                                {transfer.quantity} Units Released
                            </Typography>

                            <Typography variant="body1" color="#6b7280" fontWeight={600} sx={{ mb: 4 }}>
                                Initiated on {dayjs(transfer.initiatedAt).format("MMMM D, YYYY")} • {transfer.transferType?.replace("_", " ")}
                            </Typography>

                            <Divider sx={{ mb: 4, borderStyle: "dashed" }} />

                            {/* Logistics Map Visualization */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={800} color="#374151" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                                    <MapPin size={18} className="text-gray-400" /> LOGISTICAL MOVEMENT
                                </Typography>

                                <Box sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    alignItems: "stretch", // Ensures Source and Destination cards have same height
                                    gap: 3,
                                    position: "relative"
                                }}>
                                    {/* Source */}
                                    <Box sx={{
                                        p: 3,
                                        bgcolor: "#f9fafb",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "24px",
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center"
                                    }}>
                                        <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ letterSpacing: "1px" }}>SOURCE</Typography>
                                        <Typography variant="h6" fontWeight={800} color="#111827" sx={{ mt: 0.5 }}>{transfer.sourceShopName || "Unknown Source"}</Typography>
                                        <Typography variant="body2" color="text.secondary">Main Distribution Center</Typography>
                                    </Box>

                                    {/* Animated Connector */}
                                    <Box sx={{
                                        display: { xs: "none", md: "flex" },
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 80,
                                        position: "relative"
                                    }}>
                                        <Box sx={{
                                            position: "absolute",
                                            top: "50%",
                                            left: -10,
                                            right: -10,
                                            height: "2px",
                                            background: "repeating-linear-gradient(90deg, #e5e7eb, #e5e7eb 4px, transparent 4px, transparent 8px)"
                                        }} />
                                        <motion.div
                                            animate={{ x: [0, 40, 0] }}
                                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                            style={{ zIndex: 1, background: "#fff", padding: 8 }}
                                        >
                                            <Package size={28} style={{ color: "#ff782d" }} />
                                        </motion.div>
                                    </Box>

                                    {/* Destination */}
                                    <Box sx={{
                                        p: 3,
                                        bgcolor: "#f9fafb",
                                        border: (transfer.transferType === "intra_company") ? "1px solid #ff782d" : "1px solid #e5e7eb",
                                        borderRadius: "24px",
                                        flex: 2, // Destination usually has more text
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center"
                                    }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography variant="caption" color="secondary.main" fontWeight={800} sx={{ letterSpacing: "1px", color: (transfer.transferType === "intra_company") ? "#ff782d" : "#10b981" }}>DESTINATION</Typography>
                                                <Typography variant="h6" fontWeight={800} color="#111827" sx={{ mt: 0.5, lineHeight: 1.2 }}>{transfer.destShopName}</Typography>
                                            </Box>
                                            <Chip
                                                label={transfer.transferType === "cross_company" ? (transfer.destCompanyName || "External") : (transfer.companyName || "Us")}
                                                size="small"
                                                sx={{
                                                    bgcolor: (transfer.transferType === "intra_company") ? "#fff7ed" : "#f0fdf4",
                                                    color: (transfer.transferType === "intra_company") ? "#ff782d" : "#10b981",
                                                    fontWeight: 800,
                                                    borderRadius: "10px",
                                                    ml: 2,
                                                    height: "24px"
                                                }}
                                            />
                                        </Stack>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Inventory Impact Details - Enlarged & Aligned */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 5, borderRadius: "32px", border: "1px solid #e5e7eb", boxShadow: "none" }}>
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                                        <Avatar sx={{ bgcolor: "#fef2f2", color: "#ef4444", width: 44, height: 44 }}>
                                            <ArrowDownRight size={24} />
                                        </Avatar>
                                        <Typography variant="subtitle1" fontWeight={900} color="#374151" sx={{ letterSpacing: "0.5px" }}>SOURCE DEPLETION</Typography>
                                    </Stack>

                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
                                        <Box>
                                            <Typography variant="h2" fontWeight={900} color="#111827" sx={{ lineHeight: 1 }}>{transfer.sourceStockAfter}</Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mt: 1 }}>REMAINING STOCK</Typography>
                                        </Box>
                                        <Typography variant="h4" fontWeight={900} color="#ef4444">-{transfer.quantity}</Typography>
                                    </Stack>

                                    <Box sx={{ width: "100%", height: 12, bgcolor: "#f3f4f6", borderRadius: 6, overflow: "hidden", mt: 4 }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(transfer.sourceStockAfter / (transfer.sourceStockBefore || 1)) * 100}%` }}
                                            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                                            style={{ height: "100%", background: "#ef4444", borderRadius: 6 }}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 5, borderRadius: "32px", border: "1px solid #e5e7eb", boxShadow: "none" }}>
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                                        <Avatar sx={{ bgcolor: "#f0fdf4", color: "#10b981", width: 44, height: 44 }}>
                                            <ArrowUpRight size={24} />
                                        </Avatar>
                                        <Typography variant="subtitle1" fontWeight={900} color="#374151" sx={{ letterSpacing: "0.5px" }}>DESTINATION GAIN</Typography>
                                    </Stack>

                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
                                        <Box>
                                            <Typography variant="h2" fontWeight={900} color="#111827" sx={{ lineHeight: 1 }}>{transfer.destinationStockAfter}</Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mt: 1 }}>FINAL STOCK</Typography>
                                        </Box>
                                        <Typography variant="h4" fontWeight={900} color="#10b981">+{transfer.quantity}</Typography>
                                    </Stack>

                                    <Box sx={{ width: "100%", height: 12, bgcolor: "#f3f4f6", borderRadius: 6, overflow: "hidden", mt: 4 }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                                            style={{ height: "100%", background: "#10b981", borderRadius: 6 }}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* SIDEBAR AREA */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={4}>
                            {/* Product Card */}
                            <Paper elevation={0} sx={{ p: 5, borderRadius: "32px", border: "1px solid #e5e7eb", boxShadow: "none", minHeight: "360px", display: "flex", flexDirection: "column", justifyContent: "center", bgcolor: "#fff" }}>
                                <Box sx={{ textAlign: "center", mb: 4 }}>
                                    <Avatar variant="rounded" sx={{ width: 120, height: 120, bgcolor: "#f9fafb", border: "1px solid #e5e7eb", mx: "auto", mb: 3 }}>
                                        <Package size={60} className="text-gray-300" />
                                    </Avatar>
                                    <Typography variant="h5" fontWeight={900} color="#111827" sx={{ px: 2 }}>{transfer.productName}</Typography>
                                    <Typography variant="body2" color="#6b7280" sx={{ mt: 1, fontFamily: "monospace", letterSpacing: "1px", fontWeight: 600 }}>{transfer.productSku}</Typography>
                                </Box>

                                <Box sx={{ p: 2.5, bgcolor: "#f9fafb", borderRadius: "20px", border: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ letterSpacing: "1px" }}>CATEGORY</Typography>
                                    <Chip label="Electronics" size="small" sx={{ fontWeight: 800, bgcolor: "#fff", border: "1px solid #e5e7eb" }} />
                                </Box>
                            </Paper>

                            {/* Audit Trail Card */}
                            <Paper elevation={0} sx={{ p: 5, borderRadius: "32px", border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#fff" }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ letterSpacing: "1px", mb: 4, display: "block" }}>
                                    AUDIT INFORMATION
                                </Typography>

                                <Stack spacing={4}>
                                    <Stack direction="row" spacing={2.5} alignItems="center">
                                        <Avatar sx={{ bgcolor: "#f3f4f6", color: "#374151", width: 48, height: 48 }}>
                                            <User size={24} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ letterSpacing: "0.5px" }}>PERFORMED BY</Typography>
                                            <Typography variant="body1" fontWeight={900} color="#111827">{transfer.workerName}</Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={2.5} alignItems="center">
                                        <Avatar sx={{ bgcolor: "#f3f4f6", color: "#374151", width: 48, height: 48 }}>
                                            <Calendar size={24} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ letterSpacing: "0.5px" }}>DATE</Typography>
                                            <Typography variant="body1" fontWeight={900} color="#111827">{dayjs(transfer.initiatedAt).format("MMM DD, YYYY")}</Typography>
                                        </Box>
                                    </Stack>

                                    {transfer.reason && (
                                        <Box sx={{ mt: 2, p: 3, bgcolor: "#fff7ed", border: "1px dashed #fed7aa", borderRadius: "20px" }}>
                                            <Typography variant="caption" color="#c2410c" fontWeight={900} sx={{ display: "block", mb: 1, letterSpacing: "1px" }}>REASON</Typography>
                                            <Typography variant="body2" color="#4b5563" fontWeight={600} sx={{ fontStyle: "italic", lineHeight: 1.6 }}>
                                                "{transfer.reason}"
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
}


export default function TransferDetailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">Loading...</div></div>}>
            <TransferDetailPageContent />
        </Suspense>
    );
}

