"use client";

import React, { useState, useMemo } from "react";
import DataTable from "@/components/shared/EcommerceDataTable";
import {
    User,
    Phone,
    Mail,
    MapPin,
    FileDown,
    Download,
    Store,
    Users,
    Clock,
    UserCircle,
    Hash
} from "lucide-react";
import dayjs from "dayjs";
import {
    Button,
    Menu,
    MenuItem,
    Box,
    Stack,
    FormControl,
    InputLabel,
    Select,
    Typography,
    Avatar,
    TextField
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function CustomerList({ invoices }) {
    const [selectedShop, setSelectedShop] = useState("All");
    const [selectedWorker, setSelectedWorker] = useState("All");
    const [selectedType, setSelectedType] = useState("All");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [exportAnchorEl, setExportAnchorEl] = useState(null);

    // Derive unique customers from invoices
    const customers = useMemo(() => {
        const raw = (invoices || []).reduce((acc, inv) => {
            const customerKey = inv.customer.name;
            const existing = acc.find(c => c.name === customerKey);

            // Check filters at invoice level for aggregation
            const dateMatch = (!dateRange.start || dayjs(inv.date).isAfter(dayjs(dateRange.start).subtract(1, 'day'))) &&
                (!dateRange.end || dayjs(inv.date).isBefore(dayjs(dateRange.end).add(1, 'day')));
            const shopMatch = selectedShop === "All" || (inv.shopName || "Default Shop") === selectedShop;
            const workerMatch = selectedWorker === "All" || (inv.workerName || "System") === selectedWorker;
            const typeMatch = selectedType === "All" || (inv.type || "Income") === selectedType;

            if (dateMatch && shopMatch && workerMatch && typeMatch) {
                if (!existing) {
                    acc.push({
                        ...inv.customer,
                        totalSpent: inv.totalAmount,
                        invoiceCount: 1,
                        lastActive: inv.date,
                        shops: new Set([inv.shopName || "Default Shop"]),
                        workers: new Set([inv.workerName || "System"]),
                        types: new Set([inv.type || "Income"])
                    });
                } else {
                    existing.totalSpent += inv.totalAmount;
                    existing.invoiceCount += 1;
                    existing.shops.add(inv.shopName || "Default Shop");
                    existing.workers.add(inv.workerName || "System");
                    existing.types.add(inv.type || "Income");
                    if (new Date(inv.date) > new Date(existing.lastActive)) {
                        existing.lastActive = inv.date;
                    }
                }
            }
            return acc;
        }, []);

        return raw;
    }, [invoices, selectedShop, selectedWorker, selectedType, dateRange]);

    const shops = useMemo(() => ["All", ...new Set((invoices || []).map(inv => inv.shopName || "Default Shop"))], [invoices]);
    const workers = useMemo(() => ["All", ...new Set((invoices || []).map(inv => inv.workerName || "System"))], [invoices]);

    // Export Logic
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Customer Directory Report", 14, 15);
        const tableData = customers.map(c => [
            c.name,
            c.phone,
            `${Number(c.totalSpent).toLocaleString()} FRW`,
            c.invoiceCount,
            dayjs(c.lastActive).format("MMM DD, YYYY")
        ]);
        doc.autoTable({
            head: [['Name', 'Phone', 'Total Spent', 'Invoices', 'Last Active']],
            body: tableData,
            startY: 20,
        });
        doc.save(`customers_${dayjs().format('YYYYMMDD')}.pdf`);
        setExportAnchorEl(null);
    };

    const handleExportCSV = () => {
        const headers = ["Name,Phone,Email,Total Spent,Invoices,Last Active"];
        const rows = customers.map(c =>
            `"${c.name}","${c.phone}","${c.email}",${c.totalSpent},${c.invoiceCount},"${dayjs(c.lastActive).format('YYYY-MM-DD')}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `customers_${dayjs().format('YYYYMMDD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportAnchorEl(null);
    };

    const columns = [
        {
            id: "name",
            label: "Client Profile",
            render: (row) => (
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontSize: '0.875rem', fontWeight: 800 }}>
                        {row.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm leading-tight">{row.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">ID: {row.id || 'N/A'}</span>
                    </div>
                </Stack>
            )
        },
        {
            id: "contact",
            label: "Communication",
            render: (row) => (
                <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-300" />
                        {row.phone}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Mail size={11} className="text-slate-300" />
                        {row.email}
                    </div>
                </div>
            )
        },
        {
            id: "spent",
            label: "Lifetime Value",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-extrabold text-slate-900 text-sm font-mono">{Number(row.totalSpent).toLocaleString()} <span className="text-[10px] text-slate-400">FRW</span></span>
                    <div className="flex items-center gap-1 mt-1">
                        {[...row.types].map(t => (
                            <span key={t} className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${t === 'Expense' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'}`}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "activity",
            label: "Engagement",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="bg-slate-50 border border-slate-100 px-2 py-1 rounded flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-300" />
                        <span className="text-[10px] text-slate-600 font-bold uppercase">{dayjs(row.lastActive).format("MMM DD, YYYY")}</span>
                    </div>
                </div>
            )
        }
    ];

    const CustomerFilters = (
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

            {/* Type Filter */}
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

            {/* Date Range */}
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

    const CustomerActions = (
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
                Export Matrix
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
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Users className="text-indigo-500" size={24} />
                        CRM Directory
                    </h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">Centralized customer relationship database</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                rows={customers}
                keyField="name"
                initialRowsPerPage={10}
                showSearch={true}
                filters={CustomerFilters}
                actions={CustomerActions}
            />
        </div>
    );
}
