import React, { useMemo, useState } from 'react';
import { Receipt, CreditCard, Package, RefreshCw, AlertTriangle, Target, User, Settings, Archive, Trash2, CheckCircle, Clock, DollarSign } from 'lucide-react';
import PaymentsCustomersIcon from '@/components/announcements/PaymentsCustomersIcon';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    TextField,
    TablePagination,
    IconButton,
    Tooltip,
    Button
} from '@mui/material';
import toast from 'react-hot-toast';

const TypeIcon = ({ type }) => {
    switch (type) {
        case 'sale': return <Receipt className="w-4 h-4 text-green-600 inline-block" />;
        case 'payment': return <CreditCard className="w-4 h-4 text-blue-600 inline-block" />;
        case 'inventory': return <Package className="w-4 h-4 text-orange-600 inline-block" />;
        // map `update` to a refresh/update icon for clarity
        case 'update': return <RefreshCw className="w-4 h-4 text-blue-600 inline-block" />;
        case 'alert': return <AlertTriangle className="w-4 h-4 text-red-600 inline-block" />;
        // map `promotion` to sales icon
        case 'promotion': return <Receipt className="w-4 h-4 text-purple-600 inline-block" />;
        // social should show payments + customers icons with subtle backgrounds for clarity
        case 'social': return <PaymentsCustomersIcon size={18} />;
        case 'user': return <User className="w-4 h-4 text-indigo-600 inline-block" />;
        // debt and other fallbacks
        case 'debt': return (
            <span className="p-2 rounded-full bg-red-50 inline-flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-red-600" />
            </span>
        );
        case 'other': return <AlertTriangle className="w-4 h-4 text-yellow-600 inline-block" />;
        default: return <Settings className="w-4 h-4 text-gray-500 inline-block" />;
    }
};

const typeLabel = (type) => {
    switch (type) {
        case 'sale': return 'Sales';
        case 'payment': return 'Payments';
        case 'inventory': return 'Inventory';
        case 'update': return 'Inventory';
        case 'alert': return 'Alerts';
        case 'promotion': return 'Sales';
        case 'social': return 'Payments / Customers';
        case 'user': return 'Customers';
        case 'debt': return 'Debt';
        case 'other': return 'Other';
        default: return String(type || '').replace(/(^|_)([a-z])/g, (_, __, c) => c ? c.toUpperCase() : '').replace(/_/g, ' ') || 'General';
    }
};

const AnnouncementList = ({ announcements = [], onAction = () => { }, isLoading, className = '' }) => {
    const [selected, setSelected] = useState([]);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(16);
    const [hoveredId, setHoveredId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    // compute filtered rows and visible page before any early returns
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return announcements;
        return announcements.filter(a => {
            return (
                String(a.title || '').toLowerCase().includes(q) ||
                String(a.context || '').toLowerCase().includes(q) ||
                String(a.type || '').toLowerCase().includes(q)
            );
        });
    }, [announcements, query]);

    const visible = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center py-20 text-gray-400 ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                <p>Loading updates...</p>
            </div>
        );
    }

    if (!announcements || announcements.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center py-20 text-gray-400 text-center ${className}`}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-gray-100">
                    <Settings className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-600 font-medium mb-1">All caught up!</h3>
                <p className="text-sm text-gray-400 max-w-xs">There are no new announcements in this section right now.</p>
            </div>
        );
    }

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelected(visible.map(r => r.id));
        else setSelected([]);
    };

    const toggleRow = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <Box className={`bg-white overflow-hidden ${className}`}>
            <div className="p-3 h-full flex flex-col">
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} className="flex-none">
                    <TextField size="small" placeholder="Search announcements..." value={query} onChange={(e) => setQuery(e.target.value)} sx={{ width: 360 }} />
                    <div className="text-sm text-gray-500">{filtered.length} results</div>
                </Box>

                <TableContainer className="flex-1 overflow-auto min-h-0 bg-white border rounded">
                    <Table sx={{ minWidth: 900 }} stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" sx={{ px: 2, backgroundColor: '#f9fafb' }}>
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < visible.length}
                                        checked={visible.length > 0 && selected.length === visible.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ px: 2, backgroundColor: '#f9fafb' }}>Title</TableCell>
                                <TableCell sx={{ px: 2, backgroundColor: '#f9fafb' }}>Type</TableCell>
                                <TableCell sx={{ px: 2, backgroundColor: '#f9fafb' }}>Received</TableCell>
                                <TableCell sx={{ px: 2, width: 140, textAlign: 'center', backgroundColor: '#f9fafb' }} />
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {visible.map((row) => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    selected={selected.includes(row.id)}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => toggleRow(row.id)}
                                    onDoubleClick={() => onAction('view', row.id)}
                                    onMouseEnter={() => setHoveredId(row.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()} sx={{ px: 2 }}>
                                        <Checkbox checked={selected.includes(row.id)} onChange={() => toggleRow(row.id)} />
                                    </TableCell>

                                    <TableCell sx={{ px: 2 }}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${row.isRead ? 'bg-gray-50' : 'bg-white'}`}>
                                                <TypeIcon type={row.type} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`${!row.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{row.title}</span>
                                                <span className="text-xs text-gray-400 hidden sm:inline-block truncate">{row.context}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell sx={{ px: 2 }}>
                                        <span className="text-sm text-gray-600">{typeLabel(row.type)}</span>
                                    </TableCell>

                                    <TableCell sx={{ px: 2 }}>
                                        <span className={`${!row.isRead ? 'text-orange-600 font-medium' : 'text-gray-400 text-xs'}`}>{dayjs(row.timestamp).fromNow()}</span>
                                    </TableCell>

                                    <TableCell align="center" sx={{ px: 2 }} onClick={(e) => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', opacity: hoveredId === row.id ? 1 : 0, transition: 'opacity 150ms' }}>
                                            <Tooltip title="Mark as read">
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onAction('mark_read', row.id); }}>
                                                    <CheckCircle className="w-4 h-4" />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Snooze">
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onAction('snooze', row.id); }}>
                                                    <Clock className="w-4 h-4" />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Archive">
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onAction('archive', row.id); }}>
                                                    <Archive className="w-4 h-4" />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={(e) => {
                                                    e.stopPropagation(); setConfirmId(row.id);
                                                    // show confirmation toast
                                                    toast((t) => (
                                                        <div className="p-3">
                                                            <div className="font-medium mb-2">Delete notification?</div>
                                                            <div className="text-sm text-gray-600 mb-3">Are you sure you want to delete this notification? This action cannot be undone.</div>
                                                            <div className="flex gap-2 justify-end">
                                                                <button className="px-3 py-1 rounded bg-gray-100" onClick={() => toast.dismiss(t.id)}>Cancel</button>
                                                                <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => { onAction('delete', row.id); toast.dismiss(t.id); }}>Delete</button>
                                                            </div>
                                                        </div>
                                                    ));
                                                }}>
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} className="flex-none">
                    <TablePagination
                        component="div"
                        count={filtered.length}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                        rowsPerPageOptions={[8, 16, 25]}
                    />
                    <div className="text-sm text-gray-500">{selected.length ? `${selected.length} selected` : ''}</div>
                </Box>
            </div>
        </Box>
    );
};

export default AnnouncementList;
