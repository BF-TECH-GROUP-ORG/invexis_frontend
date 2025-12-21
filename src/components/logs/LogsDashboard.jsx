import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Drawer,
    IconButton,
    Typography,
    CircularProgress,
    Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
    fetchLogs,
    setFilters,
    setPage,
    setLimit,
    openLogDetail,
    closeLogDetail,
    fetchLogDetail
} from '@/features/logs/logsSlice';

import LogsFilterPanel from './LogsFilterPanel';
import LogsTable from './LogsTable';
import LogDetailDrawer from './LogDetailDrawer';

const LogsDashboard = () => {
    const dispatch = useDispatch();


    const {
        items,
        total,
        page,
        limit,
        filters,
        loading,
        error,
        selectedLog
    } = useSelector((state) => state.logs);

    // Initial fetch and fetch on dependencies change
    useEffect(() => {
        dispatch(fetchLogs({ page, limit, ...filters }));
    }, [dispatch, page, limit, filters]);

    const handleApplyFilters = (newFilters) => {
        dispatch(setFilters(newFilters));
    };



    const handleChangePage = (event, newPage) => {
        dispatch(setPage(newPage + 1));
    };

    const handleChangeRowsPerPage = (event) => {
        dispatch(setLimit(parseInt(event.target.value, 10)));
        dispatch(setPage(1));
    };

    const handleLogSelect = (id) => {
        dispatch(openLogDetail(id));
        dispatch(fetchLogDetail(id));
    };

    const handleCloseDrawer = () => {
        dispatch(closeLogDetail());
    };

    return (
        <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header Area */}
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Logs & Audits
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Track system activity, user actions, and security events.
                </Typography>
            </Box>

            {/* Filters */}
            {/* Filters */}
            <LogsFilterPanel
                filters={filters}
                onApply={handleApplyFilters}
            />

            {/* Content Area */}
            <Box sx={{ p: 3, flexGrow: 1, backgroundColor: '#fff' }}>
                {loading && (!items || items.length === 0) ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                        <CircularProgress sx={{ color: '#ff6600' }} />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="error" variant="body1">{error}</Typography>
                    </Box>
                ) : (
                    <Fade in={!loading}>
                        <Box>
                            <LogsTable
                                items={items}
                                total={total}
                                page={page}
                                limit={limit}
                                loading={loading}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                onSelectLog={handleLogSelect}
                            />
                        </Box>
                    </Fade>
                )}
            </Box>

            {/* Detail Drawer */}
            <Drawer
                anchor="right"
                open={!!selectedLog}
                onClose={handleCloseDrawer}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', md: 600 },
                        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
                        borderLeft: '1px solid #eee'
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
                    <IconButton onClick={handleCloseDrawer} sx={{ color: '#888' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <LogDetailDrawer />
            </Drawer>
        </Box>
    );
};

export default LogsDashboard;
