import React from 'react';
import {
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    Chip,
    Typography,
    Box,
    Skeleton,
    Tooltip,
    TableContainer,
    Checkbox
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const LogsTable = ({
    items,
    total,
    page,
    limit,
    loading,
    selectedIds = [],
    onSelectIds,
    onPageChange,
    onRowsPerPageChange,
    onSelectLog
}) => {

    // Status Logic - Matching ProductList "Active/Inactive" style
    const getStatusChip = (status) => {
        const s = (status || '').toUpperCase();
        let sx = {};
        let icon = null;
        let label = s;

        if (s === 'SUCCESS') {
            sx = { backgroundColor: "#E8F5E9", color: "#2E9D32" };
            icon = <CheckCircleOutlineIcon style={{ fontSize: 16 }} />;
            label = "Success";
        } else if (s === 'FAILURE') {
            sx = { backgroundColor: "#FFEBEE", color: "#C62828" };
            icon = <ErrorOutlineIcon style={{ fontSize: 16 }} />;
            label = "Failed";
        } else if (s === 'WARNING') {
            sx = { backgroundColor: "#FFF3E0", color: "#EF6C00" };
            icon = <WarningAmberIcon style={{ fontSize: 16 }} />;
            label = "Warning";
        } else {
            sx = { backgroundColor: "#F3F4F6", color: "#4B5563" };
            label = s;
        }

        return (
            <Chip
                icon={icon}
                label={label}
                size="small"
                sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    borderRadius: '16px',
                    height: 24,
                    '& .MuiChip-icon': { color: 'inherit', marginLeft: '8px' },
                    ...sx
                }}
            />
        );
    };

    // Selection Handlers
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allIds = items.map(i => i.id);
            onSelectIds(allIds);
        } else {
            onSelectIds([]);
        }
    };

    const handleSelectOne = (event, id) => {
        event.stopPropagation(); // Prevent row click
        const selectedIndex = selectedIds.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedIds, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedIds.slice(1));
        } else if (selectedIndex === selectedIds.length - 1) {
            newSelected = newSelected.concat(selectedIds.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedIds.slice(0, selectedIndex),
                selectedIds.slice(selectedIndex + 1),
            );
        }
        onSelectIds(newSelected);
    };

    const isSelected = (id) => selectedIds.indexOf(id) !== -1;

    if (loading && (!items || items.length === 0)) {
        return (
            <Paper elevation={0} sx={{ width: '100%', p: 2, border: "1px solid #e5e7eb", borderRadius: "0px " }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Skeleton variant="rectangular" width={100} height={20} />
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="20%" />
                    </Box>
                ))}
            </Paper>
        );
    }

    if (!items || items.length === 0) {
        return (
            <Box sx={{ p: 6, textAlign: 'center', color: '#666', bgcolor: '#fff', borderRadius: 2, border: "1px solid #e5e7eb" }}>
                <Typography variant="h6">No activities found</Typography>
                <Typography variant="body2">Try adjusting your filters to see more results.</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 0,
                    boxShadow: 'none',
                }}
            >
                <Table size="medium">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                            <TableCell sx={{ fontWeight: 600, color: "#4b5563" }} width="15%">Time</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#4b5563" }} width="12%">Category</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#4b5563" }} width="12%">Action</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#4b5563" }} width="35%">Description</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#4b5563" }} width="12%">Actor</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#4b5563" }} width="14%" align="right">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((log) => {
                            const isItemSelected = isSelected(log.id);

                            return (
                                <TableRow
                                    key={log.id}
                                    hover
                                    onClick={() => onSelectLog(log.id)}
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    selected={isItemSelected}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: "#f4f6f8" },
                                    }}
                                >

                                    <TableCell sx={{ verticalAlign: 'middle' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: "#111827" }}>
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "#6B7280" }}>
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell sx={{ verticalAlign: 'middle' }}>
                                        <Chip
                                            label={log.category || 'System'}
                                            size="small"
                                            sx={{
                                                backgroundColor: "#E0F2FE", // Light Blue
                                                color: "#0369A1",          // Dark Blue
                                                fontWeight: 600,
                                                fontSize: "0.75rem",
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </TableCell>

                                    <TableCell sx={{ verticalAlign: 'middle' }}>
                                        <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500 }}>
                                            {log.action}
                                        </Typography>
                                    </TableCell>

                                    <TableCell sx={{ verticalAlign: 'middle' }}>
                                        <Tooltip title={log.description} arrow placement="top">
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 400, color: "#111827" }}>
                                                {log.description}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell sx={{ verticalAlign: 'middle' }}>
                                        <Box>
                                            <Typography variant="body2" fontWeight={500} color="#1F2937">
                                                {log.user?.name || 'System'}
                                            </Typography>
                                            <Typography variant="caption" color="#6B7280">
                                                {log.actorType}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
                                        {getStatusChip(log.status)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination Footer matching ProductList style */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 mt-0 bg-white border-x border-b border-gray-200">
                <Typography variant="body2" color="text.secondary">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
                </Typography>
                <TablePagination
                    component="div"
                    count={total}
                    page={page - 1}
                    onPageChange={onPageChange}
                    rowsPerPage={limit}
                    onRowsPerPageChange={onRowsPerPageChange}
                    rowsPerPageOptions={[10, 20, 50]}
                    sx={{ border: "none", '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { margin: 0 } }}
                />
            </div>
        </Box>
    );
};

export default LogsTable;
