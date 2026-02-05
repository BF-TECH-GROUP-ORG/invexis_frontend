"use client";

import React, { useState, useMemo } from "react";
import {
    Smartphone,
    CreditCard,
    Banknote,
    Landmark,
    CheckCircle,
    Clock,
    XCircle,
    FileDown,
    Download,
    Filter,
    Store,
    Hash,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import dayjs from "dayjs";
import {
    Button,
    Menu,
    MenuItem,
    TextField,
    Box,
    Typography,
    Stack,
    Select,
    FormControl,
    InputLabel,
    Tooltip,
    Chip
} from "@mui/material";
import DataTable from "@/components/shared/EcommerceDataTable";
import jsPDF from "jspdf";
import "jspdf-autotable";

const methodIcons = {
    mobile_money: <Smartphone size={18} className="text-yellow-600" />,
    cash: <Banknote size={18} className="text-green-600" />,
    card: <CreditCard size={18} className="text-purple-600" />,
    bank_transfer: <Landmark size={18} className="text-blue-600" />,
};

const gatewayColors = {
    mtn_momo: "bg-yellow-100 text-yellow-800",
    stripe: "bg-indigo-100 text-indigo-800",
    manual: "bg-gray-100 text-gray-800",
};

export default function TransactionsList({ transactions, shops = [], workers = [] }) {
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedMethod, setSelectedMethod] = useState("All");
    const [selectedShop, setSelectedShop] = useState("All");
    const [selectedWorker, setSelectedWorker] = useState("All");
    const [exportAnchorEl, setExportAnchorEl] = useState(null);

    // Helpers for name resolution
    const getShopName = (id) => {
        if (!id) return "N/A";
        const targetId = String(id);
        // Primary check: Shops
        const shop = shops?.find(s => String(s.id || s._id) === targetId);
        if (shop) return shop.name || shop.shopName || "Unnamed Shop";

        // Secondary check: Workers (in case of field mixup)
        const worker = workers?.find(w => String(w.id || w._id) === targetId);
        if (worker) return worker.fullName || `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || "Worker";

        return `Shop ${targetId.slice(0, 6)}...`;
    };

    const getWorkerName = (id) => {
        if (!id) return "System";
        const targetId = String(id);
        // Primary check: Workers
        const worker = workers?.find(w => String(w.id || w._id) === targetId);
        if (worker) return worker.fullName || `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || worker.email || "Worker";

        // Secondary check: Shops (in case of field mixup)
        const shop = shops?.find(s => String(s.id || s._id) === targetId);
        if (shop) return shop.name || shop.shopName || "Shop";

        return `Worker ${targetId.slice(0, 6)}...`;
    };

    // Normalize raw prop: handle array vs wrapped response structure
    const dataArray = useMemo(() => {
        let arr = [];
        if (!transactions) arr = [];
        else if (Array.isArray(transactions)) arr = transactions;
        else if (transactions.data && Array.isArray(transactions.data)) arr = transactions.data;

        return arr;
    }, [transactions]);

    // Debug Data Structure
    React.useEffect(() => {
        if (dataArray.length > 0) {
            console.log("[TransactionsList] Resolution Audit:", {
                txCount: dataArray.length,
                shopsSample: shops?.map(s => ({ id: s.id || s._id, name: s.name })),
                workersSample: workers?.map(w => ({ id: w.id || w._id, name: w.fullName })),
                firstTx: dataArray[0]
            });
        }
    }, [dataArray, shops, workers]);

    const filteredTransactions = useMemo(() => {
        return dataArray.filter(tx => {
            const dateMatch = (!dateRange.start || dayjs(tx.created_at).isAfter(dayjs(dateRange.start).subtract(1, 'day'))) &&
                (!dateRange.end || dayjs(tx.created_at).isBefore(dayjs(dateRange.end).add(1, 'day')));
            const statusMatch = selectedStatus === "All" || tx.status === selectedStatus;
            const methodMatch = selectedMethod === "All" || tx.payment_method === selectedMethod;

            const rowShopId = tx.shop_id || tx.shop || tx.metadata?.shop_id;
            const rowWorkerId = tx.seller_id || tx.seller || tx.metadata?.initiatedBy || tx.added_by;

            const shopMatch = selectedShop === "All" || String(rowShopId) === String(selectedShop);
            const workerMatch = selectedWorker === "All" || String(rowWorkerId) === String(selectedWorker);

            return dateMatch && statusMatch && methodMatch && shopMatch && workerMatch;
        });
    }, [dataArray, dateRange, selectedStatus, selectedMethod, selectedShop, selectedWorker]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Company Transactions Report", 14, 15);
        const tableData = filteredTransactions.map(tx => [
            tx.transaction_id.slice(0, 8).toUpperCase(),
            tx.type,
            `${tx.amount} ${tx.currency}`,
            tx.payment_method,
            dayjs(tx.created_at).format("MMM DD, YYYY"),
            tx.status
        ]);
        doc.autoTable({
            head: [['ID', 'Type', 'Amount', 'Method', 'Date', 'Status']],
            body: tableData,
            startY: 20,
        });
        doc.save(`transactions_${dayjs().format('YYYYMMDD')}.pdf`);
        setExportAnchorEl(null);
    };

    const handleExportCSV = () => {
        const headers = ["ID,Type,Amount,Currency,Method,Date,Status"];
        const rows = filteredTransactions.map(tx =>
            `"${tx.transaction_id}","${tx.type}",${tx.amount},"${tx.currency}","${tx.payment_method}","${dayjs(tx.created_at).format('YYYY-MM-DD')}","${tx.status}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transactions_${dayjs().format('YYYYMMDD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportAnchorEl(null);
    };

    const columns = [
        {
            id: "details",
            label: "Transaction ID",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-tighter">
                        {row.transaction_id?.split('-')[0] || row.id?.slice(0, 8)}...
                    </span>
                    <span className="text-[10px] text-slate-400">
                        Ref: {row.gateway_transaction_id || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            id: "type",
            label: "Type",
            render: (row) => (
                <Chip
                    label={row.type}
                    size="small"
                    variant="outlined"
                    sx={{
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        fontWeight: 700,
                        borderColor: row.type === 'charge' ? '#e2e8f0' : '#fee2e2',
                        color: row.type === 'charge' ? '#64748b' : '#ef4444'
                    }}
                />
            )
        },
        {
            id: "amount",
            label: "Amount",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {Number(row.amount).toLocaleString()} <span className="text-[10px] text-slate-400">{row.currency}</span>
                    </span>
                </div>
            )
        },
        {
            id: "method",
            label: "Method & Gateway",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        {methodIcons[row.payment_method] || <Banknote size={16} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{row.payment_method.replace('_', ' ')}</span>
                        <span className={`text-[9px] font-medium px-1.5 rounded-full ${gatewayColors[row.gateway] || 'bg-slate-100 text-slate-600'}`}>
                            {row.gateway}
                        </span>
                    </div>
                </div>
            )
        },
        {
            id: "processed_date",
            label: "Date",
            render: (row) => (
                <div className="flex flex-col text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-300" />
                        {dayjs(row.created_at).format("MMM DD, YYYY")}
                    </div>
                </div>
            )
        },
        {
            id: "shop",
            label: "Shop",
            render: (row) => {
                const shopId = row.shop_id || row.shop || row.metadata?.shop_id;
                return (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <div className="p-1.5 rounded-lg bg-orange-50/50">
                            <Store size={14} className="text-orange-600" />
                        </div>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {getShopName(shopId)}
                        </Typography>
                    </Stack>
                );
            }
        },
        {
            id: "worker",
            label: "Worker",
            render: (row) => {
                const workerId = row.seller_id || row.seller || row.metadata?.initiatedBy;
                return (
                    <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ShieldCheck size={14} className="text-blue-500" />
                        {getWorkerName(workerId)}
                    </Typography>
                );
            }
        },
        {
            id: "status",
            label: "Status",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide
                        ${row.status === 'succeeded' ? 'bg-green-50 text-green-700 border-green-100' :
                            row.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-orange-50 text-orange-700 border-orange-100'}`}
                    >
                        {row.status === 'succeeded' ? <CheckCircle size={10} /> :
                            row.status === 'failed' ? <XCircle size={10} /> : <Clock size={10} />}
                        {row.status}
                    </span>
                </div>
            )
        }
    ];

    const FilterBar = (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Status</InputLabel>
                <Select
                    label="Status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Statuses</MenuItem>
                    <MenuItem value="succeeded" sx={{ fontSize: '0.75rem' }}>Succeeded</MenuItem>
                    <MenuItem value="failed" sx={{ fontSize: '0.75rem' }}>Failed</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Method</InputLabel>
                <Select
                    label="Method"
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Methods</MenuItem>
                    <MenuItem value="cash" sx={{ fontSize: '0.75rem' }}>Cash</MenuItem>
                    <MenuItem value="mobile_money" sx={{ fontSize: '0.75rem' }}>Mobile Money</MenuItem>
                    <MenuItem value="bank_transfer" sx={{ fontSize: '0.75rem' }}>Bank Transfer</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Shop</InputLabel>
                <Select
                    label="Shop"
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Shops</MenuItem>
                    {shops.map(shop => (
                        <MenuItem key={shop.id || shop._id} value={shop.id || shop._id} sx={{ fontSize: '0.75rem' }}>
                            {shop.name || shop.shopName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Worker</InputLabel>
                <Select
                    label="Worker"
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Workers</MenuItem>
                    {workers.map(worker => (
                        <MenuItem key={worker.id || worker._id} value={worker.id || worker._id} sx={{ fontSize: '0.75rem' }}>
                            {worker.fullName || `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || worker.email}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                size="small"
                type="date"
                label="From"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 130, "& .MuiInputBase-input": { fontSize: '0.75rem' }, "& .MuiOutlinedInput-root": { borderRadius: '8px' } }}
            />

            <TextField
                size="small"
                type="date"
                label="To"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 130, "& .MuiInputBase-input": { fontSize: '0.75rem' }, "& .MuiOutlinedInput-root": { borderRadius: '8px' } }}
            />
        </Stack>
    );

    const ExportActions = (
        <Box>
            <Button
                variant="contained"
                disableElevation
                onClick={(e) => setExportAnchorEl(e.currentTarget)}
                startIcon={<FileDown size={16} />}
                sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    backgroundColor: '#1e293b',
                    "&:hover": { backgroundColor: '#0f172a' }
                }}
            >
                Export
            </Button>
            <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={() => setExportAnchorEl(null)}
                PaperProps={{
                    sx: { mt: 1, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
                }}
            >
                <MenuItem onClick={handleExportPDF} sx={{ fontSize: '0.875rem', fontWeight: 600, gap: 1.5 }}>
                    <Download size={16} className="text-red-500" /> Export to PDF
                </MenuItem>
                <MenuItem onClick={handleExportCSV} sx={{ fontSize: '0.875rem', fontWeight: 600, gap: 1.5 }}>
                    <Download size={16} className="text-green-500" /> Export to CSV
                </MenuItem>
            </Menu>
        </Box>
    );

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Audit Log</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">Comprehensive transaction history</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                rows={filteredTransactions}
                keyField="id"
                initialRowsPerPage={10}
                showSearch={true}
                filters={FilterBar}
                actions={ExportActions}
            />
        </div>
    );
}
