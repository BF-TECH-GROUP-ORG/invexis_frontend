import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    IconButton,
    Tooltip,
    TablePagination
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import Skeleton from '@mui/material/Skeleton';

const ReportTable = ({
    title,
    columns = [],
    data = [],
    onExport,
    onPrint,
    maxHeight = 800,
    loading = false
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedRows = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                borderRadius: { xs: 0, sm: "20px" },
                border: "1px solid #e5e7eb",
                borderLeft: { xs: "none", sm: "1px solid #e5e7eb" },
                borderRight: { xs: "none", sm: "1px solid #e5e7eb" },
                overflow: "hidden",
                bgcolor: "white",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)"
            }}
        >
            <Box sx={{
                p: 2.5,
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "white"
            }}>
                <Typography variant="h6" fontWeight="700" sx={{ color: "#111827", fontSize: "1.125rem" }}>
                    {title}
                </Typography>
                <Box>
                    {onExport && (
                        <Tooltip title="Export CSV">
                            <IconButton size="small" onClick={onExport} sx={{ color: "#FF6D00", mr: 1 }}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onPrint && (
                        <Tooltip title="Print">
                            <IconButton size="small" onClick={onPrint} sx={{ color: "#374151" }}>
                                <PrintIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            <TableContainer sx={{
                maxHeight: maxHeight,
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
                <Table stickyHeader size="medium" sx={{ minWidth: 800, width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((col, index) => (
                                <TableCell
                                    key={index}
                                    align={col.align || 'left'}
                                    sx={{
                                        bgcolor: "#f9fafb",
                                        fontWeight: "700",
                                        color: "#374151",
                                        borderBottom: "1px solid #e5e7eb",
                                        whiteSpace: "nowrap",
                                        py: 2
                                    }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={`skeleton-${index}`}>
                                    {columns.map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data.length > 0 ? (
                            paginatedRows.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    hover
                                    sx={{
                                        "&:hover": { backgroundColor: "#f9fafb" },
                                        transition: "all 0.2s ease",
                                        "&:last-child td, &:last-child th": { border: 0 }
                                    }}
                                >
                                    {columns.map((col, colIndex) => (
                                        <TableCell
                                            key={colIndex}
                                            align={col.align || 'left'}
                                            sx={{ py: 1.5 }}
                                        >
                                            {col.render ? col.render(row) : (
                                                <Typography variant="body2" color="text.primary">
                                                    {row[col.field]}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No data available
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination Footer */}
            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                py: 2,
                borderTop: "1px solid #e5e7eb",
                bgcolor: "white"
            }}>
                <Typography variant="body2" color="text.secondary">
                    Showing {data.length > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, data.length)} of {data.length} results
                </Typography>
                <TablePagination
                    component="div"
                    count={data.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                        border: "none",
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                            margin: 0,
                            display: { xs: 'none', sm: 'block' }
                        },
                        '.MuiTablePagination-toolbar': {
                            minHeight: 'auto',
                            padding: 0
                        }
                    }}
                />
            </Box>
        </Paper>
    );
};

export default ReportTable;
