"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
    Box,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    InputAdornment,
    IconButton,
    Button,
    Stack,
    Popover,
    Typography,
    Divider,
} from "@mui/material";
import {
    Search,
    Filter as FilterIcon,
    X,
    ChevronDown,
    Calendar,
    Users,
    Store,
    RefreshCcw,
} from "lucide-react";

export default function TransferFilters({
    onFilterChange,
    shops = [],
    workers = [],
    activeFilters = {}
}) {
    const t = useTranslations("transfers.filters");
    const [anchorEl, setAnchorEl] = useState(null);

    // Default filters if not provided (should be handled by parent but safe-guarded here)
    const {
        search = "",
        direction = "all",
        type = "all",
        shop = "all",
        worker = "all",
        startDate = "",
        endDate = ""
    } = activeFilters;

    const handleSearchChange = (e) => {
        onFilterChange({ ...activeFilters, search: e.target.value });
    };

    const handleFilterChange = (name, value) => {
        onFilterChange({ ...activeFilters, [name]: value });
    };

    const clearFilters = () => {
        onFilterChange({
            direction: "all",
            type: "all",
            shop: "all",
            worker: "all",
            startDate: "",
            endDate: "",
            search: ""
        });
    };

    const activeAdvancedCount = [
        type !== "all",
        shop !== "all",
        worker !== "all",
        startDate !== "",
        endDate !== ""
    ].filter(Boolean).length;

    return (
        <Box sx={{ mb: 3 }}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{
                    p: 2,
                    bgcolor: "#fff",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
            >
                {/* Search Bar */}
                <TextField
                    placeholder={t("searchPlaceholder")}
                    size="small"
                    value={search}
                    onChange={handleSearchChange}
                    sx={{
                        flexGrow: 1,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            bgcolor: "#f9fafb",
                            "& fieldset": { borderColor: "#e5e7eb" },
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} className="text-gray-400" />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Quick Filters */}
                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                        width: { xs: "100%", sm: "auto" },
                        flexWrap: "wrap",
                        gap: 1.5,
                        "& > *": { flex: { xs: "1 1 140px", sm: "none" } }
                    }}
                >
                    <FormControl size="small">
                        <Select
                            value={direction}
                            onChange={(e) => handleFilterChange("direction", e.target.value)}
                            displayEmpty
                            sx={{ borderRadius: "12px", bgcolor: "#f9fafb" }}
                        >
                            <MenuItem value="all">{t("allDirections")}</MenuItem>
                            <MenuItem value="inbound">{t("inbound")}</MenuItem>
                            <MenuItem value="outbound">{t("outbound")}</MenuItem>
                        </Select>
                    </FormControl>



                    <Button
                        variant="outlined"
                        startIcon={<FilterIcon size={18} />}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            borderColor: activeAdvancedCount > 0 ? "#ff782d" : "#e5e7eb",
                            bgcolor: activeAdvancedCount > 0 ? "#fff5f0" : "transparent",
                            color: activeAdvancedCount > 0 ? "#ff782d" : "#374151",
                            minWidth: "100px",
                            "&:hover": {
                                borderColor: activeAdvancedCount > 0 ? "#ea580c" : "#d1d5db",
                                bgcolor: activeAdvancedCount > 0 ? "#fff5f0" : "#f9fafb"
                            },
                            flex: { xs: "1 1 80px", sm: "none" },
                            fontWeight: activeAdvancedCount > 0 ? 700 : 500
                        }}
                    >
                        {activeAdvancedCount > 0 ? t("activeMore", { count: activeAdvancedCount }) : t("more")}
                    </Button>

                    <IconButton
                        onClick={clearFilters}
                        sx={{
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            width: "42px",
                            height: "42px",
                            flex: "none",
                            "&:hover": { bgcolor: "#fee2e2", borderColor: "#fecaca", color: "#ef4444" }
                        }}
                        title={t("resetFilters")}
                    >
                        <RefreshCcw size={18} />
                    </IconButton>
                </Stack>
            </Stack>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: { p: 3, borderRadius: "16px", minWidth: 320, mt: 1, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }
                }}
            >
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>{t("advancedFilters")}</Typography>

                <Stack spacing={2}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block" }}>{t("transferType")}</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={type}
                                onChange={(e) => handleFilterChange("type", e.target.value)}
                                sx={{ borderRadius: "8px" }}
                            >
                                <MenuItem value="all">{t("allTypes")}</MenuItem>
                                <MenuItem value="intra_company">{t("intraCompany")}</MenuItem>
                                <MenuItem value="cross_company">{t("crossCompany")}</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block" }}>{t("shopLocation")}</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={shop}
                                onChange={(e) => handleFilterChange("shop", e.target.value)}
                                sx={{ borderRadius: "8px" }}
                                startAdornment={<Store size={14} className="mr-2 text-gray-400" />}
                            >
                                <MenuItem value="all">{t("allShops")}</MenuItem>
                                {shops.map(shop => (
                                    <MenuItem key={shop.id || shop._id} value={shop.id || shop._id}>{shop.name || shop.shopName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block" }}>{t("performedBy")}</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={worker}
                                onChange={(e) => handleFilterChange("worker", e.target.value)}
                                sx={{ borderRadius: "8px" }}
                                startAdornment={<Users size={14} className="mr-2 text-gray-400" />}
                            >
                                <MenuItem value="all">{t("allWorkers")}</MenuItem>
                                {workers.map(worker => (
                                    <MenuItem key={worker.id || worker._id} value={worker.id || worker._id}>
                                        {worker.fullName || (worker.firstName ? `${worker.firstName} ${worker.lastName || ""}`.trim() : worker.name)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block" }}>{t("dateRange")}</Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                type="date"
                                size="small"
                                value={startDate}
                                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                            />
                            <TextField
                                type="date"
                                size="small"
                                value={endDate}
                                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                            />
                        </Stack>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setAnchorEl(null)}
                        sx={{
                            mt: 1,
                            borderRadius: "8px",
                            bgcolor: "#ff782d",
                            "&:hover": { bgcolor: "#ea580c" },
                            textTransform: "none",
                            boxShadow: "none"
                        }}
                    >
                        {t("showResults")}
                    </Button>
                </Stack>
            </Popover>
        </Box>
    );
}
