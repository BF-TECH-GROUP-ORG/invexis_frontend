"use client";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, IconButton, Typography, TextField, Box, Select, InputLabel, FormControl, MenuItem, CircularProgress, Autocomplete
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState, useMemo } from "react";
import { HiSearch } from "react-icons/hi";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { InputAdornment } from "@mui/material";
import Skeleton from "@/components/shared/Skeleton";

const DataTable = ({
    logsData = [],
    workers = [],
    selectedWorkerId,
    setSelectedWorkerId,
    selectedType,
    setSelectedType,
    isLoading
}) => {
    const [search, setSearch] = useState("");

    const rows = useMemo(() => {
        if (!logsData || !Array.isArray(logsData)) return [];
        return logsData.map((log) => ({
            id: log._id,
            eventType: log.event_type,
            source: log.source_service,
            entityType: log.entityType,
            userId: log.userId,
            userName: workers.find(w => (w._id || w.id) === log.userId)?.name || "System",
            occurredAt: log.occurred_at ? new Date(log.occurred_at).toLocaleString() : "N/A",
            severity: log.severity,
            payload: log.payload
        }));
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

    return (
        <Paper sx={{
            width: "100%",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            bgcolor: "white",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 2, px: 2, gap: 2, flexWrap: "wrap", borderBottom: "1px solid #eee" }}>
                <Box sx={{ display: "flex", gap: 2, flexGrow: 1, flexWrap: "wrap" }}>
                    <TextField
                        size="small"
                        placeholder="Search logs..."
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
                        getOptionLabel={(option) => option.name || ""}
                        value={workers.find(w => (w._id || w.id) === selectedWorkerId) || null}
                        onChange={(event, newValue) => {
                            setSelectedWorkerId(newValue ? (newValue._id || newValue.id) : "");
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Filter by Worker" sx={{ width: 200 }} />
                        )}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    />

                    <FormControl size="small" sx={{ width: 200 }}>
                        <InputLabel>Event Type</InputLabel>
                        <Select
                            value={selectedType}
                            label="Event Type"
                            onChange={(e) => setSelectedType(e.target.value)}
                            sx={{
                                borderRadius: '12px',
                                backgroundColor: '#f9fafb'
                            }}
                        >
                            <MenuItem value="">All Types</MenuItem>
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
                <Table stickyHeader sx={{ minWidth: 1000 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Event Type</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Worker</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Entity</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Source</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Severity</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Action</TableCell>
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
                        ) : filteredRows.length > 0 ? (
                            filteredRows.map((row) => (
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
                                    <TableCell>{row.occurredAt}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleRedirectToSlug(row.id)} size="small">
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <Typography variant="body1" color="textSecondary">No logs found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default DataTable;
