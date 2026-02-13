"use client";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, IconButton, Typography, TextField, Box, Select, InputLabel, FormControl, MenuItem, CircularProgress, Autocomplete, TablePagination
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState, useMemo, useEffect } from "react";
import { HiSearch } from "react-icons/hi";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { InputAdornment } from "@mui/material";
import Skeleton from "@/components/shared/Skeleton";
import { useTranslations } from "next-intl";

const DataTable = ({
    logsData = [],
    workers = [],
    selectedWorkerId,
    setSelectedWorkerId,
    selectedType,
    setSelectedType,
    isLoading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalCount
}) => {
    const t = useTranslations("logs");
    const [search, setSearch] = useState("");
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const rows = useMemo(() => {
        if (!logsData || !Array.isArray(logsData)) return [];
        return logsData.map((log) => {
            const worker = workers.find(w => (w._id || w.id) === log.userId);
            const userName = worker ? (worker.name || `${worker.firstName || ""} ${worker.lastName || ""}`.trim() || worker.username) : "System";

            return {
                id: log._id,
                eventType: log.event_type,
                source: log.source_service,
                entityType: log.entityType,
                userId: log.userId,
                userName: userName || "System",
                occurredAt: log.occurred_at, // Keep as date string for now
                severity: log.severity || "low",
                payload: log.payload
            };
        });
    }, [logsData, workers]);

    const navigate = useRouter();
    const locale = useLocale();

    const handleRedirectToSlug = (logId) => {
        navigate.push(`/${locale}/inventory/logs/${logId}`);
    };

    const uniqueEventTypes = useMemo(() => {
        if (!logsData || !Array.isArray(logsData)) return [""];
        const types = logsData.map(log => log.event_type);
        return ["", ...new Set(types)];
    }, [logsData]);

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const matchesSearch = row.eventType.toLowerCase().includes(search.toLowerCase()) ||
                row.userName.toLowerCase().includes(search.toLowerCase()) ||
                row.entityType.toLowerCase().includes(search.toLowerCase());
            return matchesSearch;
        });
    }, [rows, search]);

    const paginatedRows = useMemo(() => {
        return filteredRows; // Data is already paginated by the server
    }, [filteredRows]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (!hasMounted) {
        return (
            <Paper
                suppressHydrationWarning
                sx={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    bgcolor: "white",
                    minHeight: "400px"
                }}
            />
        );
    }

    return (
        <Paper
            suppressHydrationWarning
            sx={{
                width: "100%",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                bgcolor: "white",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 2, px: 2, gap: 2, flexWrap: "wrap", borderBottom: "1px solid #eee" }}>
                <Box sx={{ display: "flex", gap: 2, flexGrow: 1, flexWrap: "wrap" }}>
                    <TextField
                        size="small"
                        placeholder={t("search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <HiSearch />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: 300,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    />

                    <Autocomplete
                        size="small"
                        options={workers}
                        getOptionLabel={(option) => option.name || `${option.firstName || ""} ${option.lastName || ""}`.trim() || option.username || ""}
                        isOptionEqualToValue={(option, value) => (option._id || option.id) === (value._id || value.id)}
                        getOptionKey={(option) => option._id || option.id || option.name || option.username || JSON.stringify(option)}
                        value={workers.find(w => (w._id || w.id) === selectedWorkerId) || null}
                        onChange={(event, newValue) => {
                            setSelectedWorkerId(newValue ? (newValue._id || newValue.id) : "");
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label={t("filterWorker")} sx={{ width: 200 }} />
                        )}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    />

                    <FormControl size="small" sx={{ width: 200 }}>
                        <InputLabel>{t("eventType")}</InputLabel>
                        <Select
                            value={selectedType}
                            label={t("eventType")}
                            onChange={(e) => setSelectedType(e.target.value)}
                            sx={{
                                borderRadius: '12px',
                                backgroundColor: '#f9fafb'
                            }}
                        >
                            <MenuItem value="">{t("allTypes")}</MenuItem>
                            {uniqueEventTypes.filter(t => t).map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Toolbar>

            <TableContainer sx={{
                maxHeight: 800,
                width: '100%',
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                    height: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#e5e7eb',
                    borderRadius: '10px',
                },
            }}>
                <Table stickyHeader sx={{ minWidth: 1000, width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", width: '25%' }}>{t("table.eventType")}</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", width: '15%' }}>{t("table.worker")}</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", width: '15%' }}>{t("table.entity")}</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", width: '15%' }}>{t("table.source")}</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", width: '10%' }}>{t("table.severity")}</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", width: '20%' }}>{t("table.date")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton width={150} height={20} /></TableCell>
                                    <TableCell><Skeleton width={100} height={20} /></TableCell>
                                    <TableCell><Skeleton width={100} height={20} /></TableCell>
                                    <TableCell><Skeleton width={100} height={20} /></TableCell>
                                    <TableCell><Skeleton width={80} height={20} /></TableCell>
                                    <TableCell><Skeleton width={150} height={20} /></TableCell>
                                </TableRow>
                            ))
                        ) : paginatedRows.length > 0 ? (
                            paginatedRows.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.eventType}</Typography>
                                    </TableCell>
                                    <TableCell>{row.userName}</TableCell>
                                    <TableCell>{row.entityType}</TableCell>
                                    <TableCell>{row.source}</TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: '6px',
                                            display: 'inline-block',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: row.severity === 'high' ? '#FEE2E2' : row.severity === 'medium' ? '#FEF3C7' : '#E0F2FE',
                                            color: row.severity === 'high' ? '#991B1B' : row.severity === 'medium' ? '#92400E' : '#075985'
                                        }}>
                                            {row.severity.toUpperCase()}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box component="span" sx={{ fontSize: '0.875rem' }} suppressHydrationWarning>
                                            {row.occurredAt ? new Date(row.occurredAt).toLocaleString() : "N/A"}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <Typography variant="body1" color="textSecondary">{t("table.noLogs")}</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 2,
                borderTop: '1px solid #eee',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Typography variant="body2" color="textSecondary">
                    Showing {totalCount > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount} results
                </Typography>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                        border: 'none',
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            margin: 0,
                            display: { xs: 'none', sm: 'block' }
                        },
                        '& .MuiTablePagination-toolbar': {
                            minHeight: 'auto',
                            padding: 0
                        }
                    }}
                />
            </Box>
        </Paper>
    );
};

export default DataTable;
