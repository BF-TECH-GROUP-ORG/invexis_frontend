import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Divider,
    CircularProgress,
    Grid,
    Chip,
    Paper,
    Stack,
    Collapse,
    Button,
    IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const LogDetailDrawer = () => {
    const { selectedLogDetail, detailLoading, detailError } = useSelector((state) => state.logs);
    const [showTechnical, setShowTechnical] = useState(false);

    if (detailLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={30} sx={{ color: '#ff6600' }} />
            </Box>
        );
    }

    if (detailError) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">{detailError}</Typography>
            </Box>
        );
    }

    if (!selectedLogDetail) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', color: '#888' }}>
                <Typography>Select a log entry to view details.</Typography>
            </Box>
        );
    }

    const {
        id,
        category,
        action,
        description,
        actorType,
        target,
        user,
        company,
        timestamp,
        status,
        before,
        after,
        // Technical fields
        eventType,
        source,
        entityType,
        entityId,
    } = selectedLogDetail;

    const getStatusChipProps = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'SUCCESS') return {
            sx: { bgcolor: '#E8F5E9', color: '#2E7D32', border: 'none', fontWeight: 600, borderRadius: '16px', height: 24, fontSize: '0.75rem' },
            icon: <CheckCircleOutlineIcon style={{ color: '#2E7D32', fontSize: 16 }} />,
            label: 'Success'
        };
        if (s === 'FAILURE') return {
            sx: { bgcolor: '#FFEBEE', color: '#C62828', border: 'none', fontWeight: 600, borderRadius: '16px', height: 24, fontSize: '0.75rem' },
            icon: <ErrorOutlineIcon style={{ color: '#C62828', fontSize: 16 }} />,
            label: 'Failed'
        };
        if (s === 'WARNING') return {
            sx: { bgcolor: '#FFF3E0', color: '#EF6C00', border: 'none', fontWeight: 600, borderRadius: '16px', height: 24, fontSize: '0.75rem' },
            icon: <ErrorOutlineIcon style={{ color: '#EF6C00', fontSize: 16 }} />,
            label: 'Warning'
        };
        return { label: s || 'INFO', variant: 'outlined' };
    };

    const statusProps = getStatusChipProps(status);

    return (
        <Box sx={{ p: 0 }}>
            {/* Business Header */}
            <Box sx={{ p: 4, borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                        label={category}
                        size="small"
                        sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 600, borderRadius: '6px', fontSize: '0.75rem' }}
                    />
                    <Typography variant="caption" color="textSecondary">•</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {new Date(timestamp).toLocaleString()}
                    </Typography>
                </Stack>

                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111', mb: 1, lineHeight: 1.3 }}>
                    {description}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                    <Chip
                        {...statusProps}
                        size="small"
                    />
                </Stack>
            </Box>

            <Box sx={{ p: 4, overflowY: 'auto', flex: 1 }}>

                {/* Context Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <Typography variant="overline" color="textSecondary" fontWeight={600}>ACTOR</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                            <Box sx={{ bgcolor: '#fff0e0', p: 1, borderRadius: '50%', color: '#ff6600' }}>
                                <PersonIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600}>{user?.name || 'System'}</Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                    {user?.role || actorType}
                                </Typography>
                                {user?.email && (
                                    <Typography variant="caption" sx={{ color: '#ff6600', display: 'block' }}>{user.email}</Typography>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="overline" color="textSecondary" fontWeight={600}>COMPANY</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: '50%', color: '#666' }}>
                                <BusinessIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600}>{company?.name || 'N/A'}</Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>ID: {company?.id}</Typography>
                                {company?.location && (
                                    <Typography variant="caption" color="textSecondary">{company.location}</Typography>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* State Changes (Human Readable) */}
                {(before || after) && (
                    <Box sx={{ mb: 5 }}>
                        <Typography
                            variant="overline"
                            sx={{
                                color: '#6b7280',
                                mb: 2,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                letterSpacing: '0.05em'
                            }}
                        >
                            <CompareArrowsIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
                            STATE CHANGES
                        </Typography>

                        <Grid container spacing={3}>
                            {/* BEFORE CARD */}
                            <Grid item xs={6}>
                                <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                                    <Typography variant="overline" sx={{ fontWeight: 800, color: '#ef4444' }}>PREVIOUS STATE</Typography>
                                </Box>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        backgroundColor: '#fff',
                                        border: '1px solid #fee2e2',
                                        borderRadius: '12px',
                                        minHeight: 120,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                        position: 'relative',
                                    }}
                                >
                                    {before ? (
                                        <Stack spacing={2}>
                                            {Object.entries(before).map(([key, val]) => (
                                                <Box key={key} sx={{ borderBottom: '1px solid #f9fafb', pb: 1, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                                                    <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem' }}>
                                                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500, mt: 0.2 }}>
                                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Box sx={{ py: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', opacity: 0.6 }}>No previous data available</Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>

                            {/* AFTER CARD */}
                            <Grid item xs={6}>
                                <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                                    <Typography variant="overline" sx={{ fontWeight: 800, color: '#10b981' }}>NEW STATE</Typography>
                                </Box>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        backgroundColor: '#fff',
                                        border: '1px solid #dcfce7',
                                        borderRadius: '12px',
                                        minHeight: 120,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                        position: 'relative',
                                    }}
                                >
                                    {after ? (
                                        <Stack spacing={2}>
                                            {Object.entries(after).map(([key, val]) => (
                                                <Box key={key} sx={{ borderBottom: '1px solid #f9fafb', pb: 1, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                                                    <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem' }}>
                                                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, mt: 0.2 }}>
                                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Box sx={{ py: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', opacity: 0.6 }}>Record Finalized / Deleted</Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Additional Client/Business Context */}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="overline" color="textSecondary" fontWeight={600} sx={{ letterSpacing: '0.05em' }}>RELEVANT BUSINESS DATA</Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            mt: 1.5,
                            borderRadius: '12px',
                            bgcolor: '#fbfbfb',
                            borderStyle: 'dashed',
                            borderColor: '#e5e7eb'
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }} display="block">Primary Target</Typography>
                                <Typography variant="body2" fontWeight={700} color="#111" sx={{ mt: 0.5 }}>{target || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }} display="block">Action Context</Typography>
                                <Typography variant="body2" fontWeight={700} color="#111" sx={{ mt: 0.5 }}>{action}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2, opacity: 0.5 }} />
                                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }} display="block">Audit Summary</Typography>
                                <Typography variant="body2" sx={{ color: '#4b5563', mt: 1, lineHeight: 1.6 }}>
                                    This {category.toLowerCase()} event was initiated by <strong>{user?.name || 'the system'}</strong> for <strong>{company?.name || 'the organization'}</strong>.
                                    The status of this operation is recorded as <strong>{status}</strong>.
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default LogDetailDrawer;
