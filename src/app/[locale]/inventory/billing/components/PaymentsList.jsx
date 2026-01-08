"use client";

import React, { useState, useMemo } from "react";
import {
    Smartphone,
    CreditCard,
    Banknote,
    Landmark,
    CheckCircle,
    Clock,
    FileDown,
    Download,
    Filter,
    Calendar as CalendarIcon,
    Store,
    Users,
    Hash
} from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
    Button,
    Menu,
    MenuItem,
    TextField,
    InputAdornment,
    Box,
    Typography,
    Stack,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import DataTable from "@/components/shared/EcommerceDataTable";
import jsPDF from "jspdf";
import "jspdf-autotable";

dayjs.extend(isBetween);

const methodIcons = {
    Momo: <Smartphone className="text-yellow-600" size={18} />,
    Card: <CreditCard className="text-purple-600" size={18} />,
    Cash: <Banknote className="text-green-600" size={18} />,
    Bank: <Landmark className="text-blue-600" size={18} />,
};

const statusStyles = {
    Paid: "bg-green-50 text-green-700 border-green-100",
    Pending: "bg-orange-50 text-orange-700 border-orange-100",
};

export default function PaymentsList({ invoices }) {
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [selectedShop, setSelectedShop] = useState("All");
    const [selectedWorker, setSelectedWorker] = useState("All");
    const [selectedType, setSelectedType] = useState("All"); // Income / Expense
    const [exportAnchorEl, setExportAnchorEl] = useState(null);

    // Dynamic Options extraction
    const shops = useMemo(() => ["All", ...new Set((invoices || []).map(inv => inv.shopName || "Default Shop"))], [invoices]);
    const workers = useMemo(() => ["All", ...new Set((invoices || []).map(inv => inv.workerName || "System"))], [invoices]);

    const filteredInvoices = useMemo(() => {
        return (invoices || []).filter(inv => {
            const dateMatch = (!dateRange.start || dayjs(inv.date).isAfter(dayjs(dateRange.start).subtract(1, 'day'))) &&
                (!dateRange.end || dayjs(inv.date).isBefore(dayjs(dateRange.end).add(1, 'day')));
            const shopMatch = selectedShop === "All" || (inv.shopName || "Default Shop") === selectedShop;
            const workerMatch = selectedWorker === "All" || (inv.workerName || "System") === selectedWorker;
            const typeMatch = selectedType === "All" || (inv.type || "Income") === selectedType;
            return dateMatch && shopMatch && workerMatch && typeMatch;
        });
    }, [invoices, dateRange, selectedShop, selectedWorker, selectedType]);

    // Export Logic
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Payment Transactions Report", 14, 15);
        const tableData = filteredInvoices.map(inv => [
            inv.customer.name,
            inv.paymentMethod,
            `${Number(inv.totalAmount).toLocaleString()} FRW`,
            dayjs(inv.date).format("MMM DD, YYYY"),
            inv.status
        ]);
        doc.autoTable({
            head: [['Customer', 'Method', 'Amount', 'Date', 'Status']],
            body: tableData,
            startY: 20,
        });
        doc.save(`payments_${dayjs().format('YYYYMMDD')}.pdf`);
        setExportAnchorEl(null);
    };

    const handleExportCSV = () => {
        const headers = ["Customer,Method,Amount,Date,Status"];
        const rows = filteredInvoices.map(inv =>
            `"${inv.customer.name}","${inv.paymentMethod}",${inv.totalAmount},"${dayjs(inv.date).format('YYYY-MM-DD')}","${inv.status}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payments_${dayjs().format('YYYYMMDD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportAnchorEl(null);
    };

    const columns = [
        {
            id: "customer",
            label: "Customer",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-sm">{row.customer.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{row.id}</span>
                </div>
            )
        },
        {
            id: "method",
            label: "Method",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        {methodIcons[row.paymentMethod] || <Banknote size={16} />}
                    </div>
                    <span className="text-xs text-slate-600 font-bold uppercase tracking-tight">{row.paymentMethod}</span>
                </div>
            )
        },
        {
            id: "amount",
            label: "Amount",
            render: (row) => (
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {Number(row.totalAmount).toLocaleString()} <span className="text-[10px] text-slate-400">FRW</span>
                </span>
            )
        },
        {
            id: "date",
            label: "Date",
            render: (row) => (
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Clock size={12} className="text-slate-300" />
                    {dayjs(row.date).format("MMM DD, HH:mm")}
                </div>
            )
        },
        {
            id: "type",
            label: "Type",
            render: (row) => (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${row.type === 'Expense' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                    {row.type || 'Income'}
                </span>
            )
        },
        {
            id: "status",
            label: "Status",
            render: (row) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusStyles[row.status] || statusStyles.Pending}`}>
                    {row.status === 'Paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                    {row.status}
                </span>
            )
        }
    ];

    const FilterBar = (
        <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Shop Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}><Store size={14} className="inline mr-1" /> Shop</InputLabel>
                <Select
                    label="Shop"
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    {shops.map(shop => <MenuItem key={shop} value={shop} sx={{ fontSize: '0.75rem' }}>{shop}</MenuItem>)}
                </Select>
            </FormControl>

            {/* Worker Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}><Users size={14} className="inline mr-1" /> Worker</InputLabel>
                <Select
                    label="Worker"
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    {workers.map(worker => <MenuItem key={worker} value={worker} sx={{ fontSize: '0.75rem' }}>{worker}</MenuItem>)}
                </Select>
            </FormControl>

            {/* Type Filter (Income/Expense) */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}><Hash size={14} className="inline mr-1" /> Type</InputLabel>
                <Select
                    label="Type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Types</MenuItem>
                    <MenuItem value="Income" sx={{ fontSize: '0.75rem' }}>Income</MenuItem>
                    <MenuItem value="Expense" sx={{ fontSize: '0.75rem' }}>Expense</MenuItem>
                </Select>
            </FormControl>

            {/* Date Picker Start */}
            <TextField
                size="small"
                type="date"
                label="From"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 140, "& .MuiInputBase-input": { fontSize: '0.75rem' }, "& .MuiOutlinedInput-root": { borderRadius: '8px' } }}
            />

            {/* Date Picker End */}
            <TextField
                size="small"
                type="date"
                label="To"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 140, "& .MuiInputBase-input": { fontSize: '0.75rem' }, "& .MuiOutlinedInput-root": { borderRadius: '8px' } }}
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
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Ledger</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">Real-time payment audit stream</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                rows={filteredInvoices}
                keyField="id"
                initialRowsPerPage={10}
                showSearch={true}
                filters={FilterBar}
                actions={ExportActions}
            />
        </div>
    );
}
