"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Box,
    Typography,
    IconButton,
    Skeleton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Divider,
} from "@mui/material";
import {
    MoreVertical,
    ArrowRight,
    Eye,
    FileText,
    Printer,
    Trash2,
    Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

export default function TransferTable({
    transfers = [],
    loading = false
}) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("transfers.table");
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const handleOpenMenu = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleNavigate = (id) => {
        router.push(`/${locale}/inventory/transfer/${id}`);
    };

    const handleViewDetails = () => {
        if (selectedRow) handleNavigate(selectedRow._id || selectedRow.id);
        handleCloseMenu();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    overflow: "auto", // Allow both scrollbars if needed, specifically horizontal
                    backgroundColor: "#fff",
                    boxShadow: "none"
                }}
            >
                <Table sx={{ minWidth: 1200 }}><TableHead>
                    <TableRow sx={{ backgroundColor: "#f9fafb", "& .MuiTableCell-root": { whiteSpace: "nowrap" } }}>
                        <TableCell sx={{ fontWeight: 700, color: "#374151", py: 2 }}>{t("product")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151" }}>{t("destCompany")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151" }}>{t("destShop")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151" }}>{t("transferType")}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#374151" }}>{t("qty")}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#374151" }}>{t("remainedQty")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151" }}>{t("performedBy")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151" }}>{t("status")}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#374151" }}>{t("date")}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#374151", pr: 3 }}>{t("actions")}</TableCell>
                    </TableRow>
                </TableHead><TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                                            <Box><Skeleton variant="text" width={120} /><Skeleton variant="text" width={80} /></Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                    <TableCell><Skeleton variant="text" width={40} sx={{ mx: "auto" }} /></TableCell>
                                    <TableCell><Skeleton variant="text" width={40} sx={{ mx: "auto" }} /></TableCell>
                                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                    <TableCell><Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                    <TableCell align="right" sx={{ pr: 3 }}><Skeleton variant="circular" width={32} height={32} sx={{ ml: "auto" }} /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            transfers.map((item, index) => (
                                <TableRow
                                    key={item._id || item.id || index}
                                    component={motion.tr}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ delay: index * 0.05 }}
                                    hover
                                    onClick={() => handleNavigate(item._id || item.id)}
                                    sx={{
                                        cursor: "pointer",
                                        "&:hover": { backgroundColor: "#f9fafb" },
                                        "& .MuiTableCell-root": {
                                            borderBottom: "1px solid #f3f4f6",
                                            whiteSpace: "nowrap"
                                        }
                                    }}
                                >
                                    <TableCell sx={{ py: 2.5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                                                <Package size={20} className="text-gray-400" />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700} color="#111827">
                                                    {item.productName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.productSku}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={700} color={item.transferType === "intra_company" ? "#ff782d" : "#111827"}>
                                            {item.transferType === "cross_company"
                                                ? (item.destCompanyName || t("unknown"))
                                                : t("us")}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600} color="#4b5563">
                                            {item.destShopName || "Shop"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ textTransform: "capitalize", color: "#4b5563", fontWeight: 500 }}>
                                            {item.transferType?.replace("_", " ")}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            bgcolor: "#f3f4f6",
                                            borderRadius: "8px",
                                            display: "inline-block",
                                            minWidth: "40px"
                                        }}>
                                            <Typography variant="body2" fontWeight={800} color="#111827">
                                                {item.quantity}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" fontWeight={700} color={item.sourceStockAfter < 5 ? "error.main" : "text.secondary"}>
                                            {item.sourceStockAfter}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600} color="#374151">
                                            {item.workerName || "N/A"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.status}
                                            size="small"
                                            sx={{
                                                backgroundColor: item.status === "completed" ? "#ECFDF5" : "#FFF7ED",
                                                color: item.status === "completed" ? "#065F46" : "#C2410C",
                                                fontWeight: 700,
                                                fontSize: "0.7rem",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                                height: "24px"
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="#6b7280" fontWeight={500}>
                                            {dayjs(item.initiatedAt).format("MMM D, YYYY")}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 2 }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenMenu(e, item);
                                            }}
                                            sx={{ color: "#9ca3af", "&:hover": { color: "#111827", bgcolor: "#f3f4f6" } }}
                                        >
                                            <MoreVertical size={20} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        mt: 0.5,
                        borderRadius: "12px",
                        minWidth: 180,
                        boxShadow: "none",
                        border: "1px solid #f3f4f6"
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleViewDetails} sx={{ py: 1.2 }}>
                    <ListItemIcon><Eye size={18} className="text-gray-500" /></ListItemIcon>
                    <ListItemText primary={t("viewDetails")} primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={handleCloseMenu} sx={{ py: 1.2 }}>
                    <ListItemIcon><Printer size={18} className="text-gray-500" /></ListItemIcon>
                    <ListItemText primary={t("printReceipt")} primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={handleCloseMenu} sx={{ py: 1.2 }}>
                    <ListItemIcon><FileText size={18} className="text-gray-500" /></ListItemIcon>
                    <ListItemText primary={t("downloadCsv")} primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleCloseMenu} sx={{ py: 1.2, color: "error.main" }}>
                    <ListItemIcon><Trash2 size={18} className="text-red-500" /></ListItemIcon>
                    <ListItemText primary={t("cancelTransfer")} primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
                </MenuItem>
            </Menu>
        </motion.div>
    );
}
