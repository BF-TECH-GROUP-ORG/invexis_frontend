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

const LogDetailDrawer = ({ workers = [] }) => {
    const { selectedLogDetail, detailLoading, detailError } = useSelector((state) => state.logs);
    const [showTechnical, setShowTechnical] = useState(false);

    const getWorkerName = (userId) => {
        if (!userId) return 'System';
        const worker = workers.find(w => (w._id || w.id) === userId);
        if (worker) {
            return `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || worker.email || userId;
        }
        return userId;
    };

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
        payload,
        metadata
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
                        sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, borderRadius: '6px' }}
                    />
                    <Chip {...statusProps} size="small" />
                </Stack>

                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
                    {action}
                </Typography>
                <Typography variant="body1" sx={{ color: '#4b5563', lineHeight: 1.5 }}>
                    {description}
                </Typography>

                <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                    <Box>
                        <Typography variant="caption" color="textSecondary" display="block">TIMESTAMP</Typography>
                        <Typography variant="body2" fontWeight={600}>{new Date(timestamp).toLocaleString()}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="textSecondary" display="block">LOG ID</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>{id}</Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Actor & Entity Info */}
            <Box sx={{ p: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="overline" color="textSecondary" fontWeight={600} sx={{ letterSpacing: 1.2 }}>
                            ACTOR INFORMATION
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: '12px', bgcolor: '#f9fafb', borderStyle: 'dashed' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#fff', border: '1px solid #e5e7eb' }}>
                                    <PersonIcon sx={{ color: '#6b7280' }} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700}>{getWorkerName(user?.name)}</Typography>
                                    <Typography variant="caption" color="textSecondary">{actorType || 'System'}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* State Changes Section - Matching Image */}
                    <Grid item xs={12}>
                        <Typography variant="overline" color="textSecondary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 1.2 }}>
                            <CompareArrowsIcon fontSize="small" /> STATE CHANGES
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="#C62828" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#C62828' }} /> PREVIOUS STATE
                                </Typography>
                                <Paper variant="outlined" sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    minHeight: 120,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#fff',
                                    border: '1px solid #FFEBEE'
                                }}>
                                    {!before || Object.keys(before).length === 0 ? (
                                        <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                            No previous data available
                                        </Typography>
                                    ) : (
                                        <Box sx={{ width: '100%' }}>
                                            {Object.entries(before).map(([key, val]) => (
                                                <Box key={key} sx={{ mb: 1.5 }}>
                                                    <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>{key.replace(/_/g, ' ')}</Typography>
                                                    <Typography variant="body2" fontWeight={700} color="#111827">{String(val)}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="#2E7D32" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2E7D32' }} /> NEW STATE
                                </Typography>
                                <Paper variant="outlined" sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    minHeight: 120,
                                    backgroundColor: '#fff',
                                    border: '1px solid #E8F5E9'
                                }}>
                                    {!after || Object.keys(after).length === 0 ? (
                                        <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                            No data recorded
                                        </Typography>
                                    ) : (
                                        <Box sx={{ width: '100%' }}>
                                            {Object.entries(after).map(([key, val]) => (
                                                <Box key={key} sx={{ mb: 1.5 }}>
                                                    <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>{key.replace(/_/g, ' ')}</Typography>
                                                    <Typography variant="body2" fontWeight={700} color="#111827">{String(val)}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Relevant Business Data Section - Matching Image */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Typography variant="overline" color="textSecondary" fontWeight={600} sx={{ letterSpacing: 1.2 }}>
                            RELEVANT BUSINESS DATA
                        </Typography>
                        <Paper variant="outlined" sx={{
                            p: 3,
                            mt: 1,
                            borderRadius: '20px',
                            bgcolor: '#f9fafb',
                            border: '1px dashed #e5e7eb'
                        }}>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700, display: 'block', mb: 0.5 }}>PRIMARY TARGET</Typography>
                                    <Typography variant="body2" fontWeight={700} color="#111827">{target || entityType || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700, display: 'block', mb: 0.5 }}>ACTION CONTEXT</Typography>
                                    <Typography variant="body2" fontWeight={700} color="#111827">{action}</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                            <Box>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700, display: 'block', mb: 1 }}>AUDIT SUMMARY</Typography>
                                <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.6 }}>
                                    This {entityType || 'system'} event was initiated by <strong>{getWorkerName(user?.name)}</strong>.
                                    The action <strong>{action}</strong> was performed on <strong>{target || entityId || 'the target entity'}</strong>.
                                    The status of this operation is recorded as <strong>{status}</strong>.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Technical Data Toggle */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                            fullWidth
                            onClick={() => setShowTechnical(!showTechnical)}
                            endIcon={showTechnical ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            sx={{ justifyContent: 'space-between', color: '#6b7280', textTransform: 'none', py: 1, fontWeight: 600 }}
                        >
                            Technical Details (Raw JSON)
                        </Button>
                        <Collapse in={showTechnical}>
                            <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: '12px', bgcolor: '#111827', color: '#fff' }}>
                                <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 1 }}>RAW PAYLOAD</Typography>
                                <Box component="pre" sx={{ m: 0, fontSize: '0.75rem', overflow: 'auto', maxHeight: 300, fontFamily: 'monospace' }}>
                                    {JSON.stringify(payload || {}, null, 2)}
                                </Box>
                                {metadata && (
                                    <>
                                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 2, mb: 1 }}>METADATA</Typography>
                                        <Box component="pre" sx={{ m: 0, fontSize: '0.75rem', overflow: 'auto', maxHeight: 300, fontFamily: 'monospace' }}>
                                            {JSON.stringify(metadata, null, 2)}
                                        </Box>
                                    </>
                                )}
                            </Paper>
                        </Collapse>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default LogDetailDrawer;
