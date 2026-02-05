"use client";

import React, { useState, useRef, Suspense, lazy } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Button,
    Menu,
    MenuItem,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    FormControlLabel,
    Radio,
    Skeleton,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

// OPTIMIZATION: Lazy load tab components to reduce initial page load time
// This defers compilation of heavy tab components until they're actually needed
const InventoryTab = lazy(() => import('./components/InventoryTab'));
const SalesTab = lazy(() => import('./components/SalesTab'));
const DebtsTab = lazy(() => import('./components/DebtsTab'));
const PaymentsTab = lazy(() => import('./components/PaymentsTab'));
const StaffTab = lazy(() => import('./components/StaffTab'));
const GeneralTab = lazy(() => import('./components/GeneralTab'));

// Tab loading skeleton for better UX during component load
const TabSkeleton = () => (
    <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
    </Box>
);

// Error Boundary Component to prevent entire page crash
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Tab Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 3, bgcolor: '#fff3cd', border: '1px solid #ffc107', borderRadius: 1 }}>
                    <Typography color="error">Error loading tab content. Please try again.</Typography>
                </Box>
            );
        }

        return this.props.children;
    }
}

const ReportsPage = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [anchorEl, setAnchorEl] = useState(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportScope, setExportScope] = useState('current'); // 'current' or 'all'
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const [reportView, setReportView] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(dayjs());

    // Sync dateRange with reportView and selectedDate
    React.useEffect(() => {
        let start, end;
        if (reportView === 'daily') {
            start = selectedDate.startOf('day');
            end = selectedDate.endOf('day');
        } else if (reportView === 'weekly') {
            start = selectedDate.startOf('week');
            end = selectedDate.endOf('week');
        } else if (reportView === 'monthly') {
            start = selectedDate.startOf('month');
            end = selectedDate.endOf('month');
        } else if (reportView === 'yearly') {
            start = selectedDate.startOf('year');
            end = selectedDate.endOf('year');
        }
        setDateRange({ startDate: start, endDate: end });
    }, [reportView, selectedDate]);

    const tabNames = ['General Overview', 'Inventory Analysis', 'Sales Performance', 'Debts & Credit', 'Payment Methods', 'Staff & Branches'];
    const tabRefs = useRef({});

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleDateMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleDateMenuClose = () => setAnchorEl(null);

    const handlePresetDate = (days) => {
        setDateRange({
            startDate: dayjs().subtract(days, 'day'),
            endDate: dayjs()
        });
        handleDateMenuClose();
    };

    const handleExportMenuOpen = (event) => setExportAnchorEl(event.currentTarget);
    const handleExportMenuClose = () => setExportAnchorEl(null);

    const handleExportDialogOpen = () => {
        setExportDialogOpen(true);
        handleExportMenuClose();
    };

    const handleExportDialogClose = () => {
        setExportDialogOpen(false);
    };

    // Extract table data from tab container
    const extractTabData = (tabContainer) => {
        const tabData = {
            tables: [],
            kpis: []
        };

        // Extract tables
        const tables = tabContainer.querySelectorAll('table');
        tables.forEach(table => {
            const rows = [];
            const headers = [];

            // Get headers
            table.querySelectorAll('thead th').forEach(th => {
                headers.push(th.textContent.trim());
            });
            if (headers.length > 0) rows.push(headers);

            // Get body rows
            table.querySelectorAll('tbody tr').forEach(tr => {
                const rowData = [];
                tr.querySelectorAll('td').forEach(td => {
                    rowData.push(td.textContent.trim());
                });
                if (rowData.length > 0) rows.push(rowData);
            });

            if (rows.length > 0) {
                tabData.tables.push(rows);
            }
        });

        // Extract KPI cards
        const kpiElements = tabContainer.querySelectorAll('[data-kpi-card]');
        const kpiData = [];
        kpiElements.forEach(el => {
            const titleEl = el.querySelector('[data-kpi-title]');
            const valueEl = el.querySelector('[data-kpi-value]');
            if (titleEl && valueEl) {
                kpiData.push({
                    'Metric': titleEl.textContent.trim(),
                    'Value': valueEl.textContent.trim()
                });
            }
        });
        if (kpiData.length > 0) tabData.kpis = kpiData;

        return tabData;
    };

    const handleExportPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        if (exportScope === 'current') {
            // Export current tab
            const tabContainer = tabRefs.current[currentTab];
            if (!tabContainer) return alert('Tab content not found');

            const canvas = await html2canvas(tabContainer, { allowTaint: true, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${tabNames[currentTab]}-Report.pdf`);
        } else {
            // Export all tabs
            const { jsPDF } = await import('jspdf');
            const html2canvas = (await import('html2canvas')).default;

            const pdf = new jsPDF('p', 'mm', 'a4');
            let isFirstPage = true;

            for (let i = 0; i < tabNames.length; i++) {
                const tabContainer = tabRefs.current[i];
                if (!tabContainer) continue;

                if (!isFirstPage) pdf.addPage();
                isFirstPage = false;

                const canvas = await html2canvas(tabContainer, { allowTaint: true, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            }

            pdf.save('System-Wide-Reports.pdf');
        }

        handleExportDialogClose();
    };

    const handleExportExcel = () => {
        const workbook = XLSX.utils.book_new();

        if (exportScope === 'current') {
            // Export current tab
            const tabContainer = tabRefs.current[currentTab];
            if (!tabContainer) return alert('Tab content not found');

            const tabData = extractTabData(tabContainer);

            // Add KPI sheet if available
            if (tabData.kpis.length > 0) {
                const kpiWs = XLSX.utils.json_to_sheet(tabData.kpis);
                XLSX.utils.book_append_sheet(workbook, kpiWs, 'KPIs');
            }

            // Add table sheets
            tabData.tables.forEach((tableData, idx) => {
                const ws = XLSX.utils.aoa_to_sheet(tableData);
                XLSX.utils.book_append_sheet(workbook, ws, `Table${idx + 1}`);
            });

            XLSX.writeFile(workbook, `${tabNames[currentTab]}-Report.xlsx`);
        } else {
            // Export all tabs
            for (let i = 0; i < tabNames.length; i++) {
                const tabContainer = tabRefs.current[i];
                if (!tabContainer) continue;

                const tabData = extractTabData(tabContainer);

                // Add KPI sheet if available
                if (tabData.kpis.length > 0) {
                    const kpiWs = XLSX.utils.json_to_sheet(tabData.kpis);
                    XLSX.utils.book_append_sheet(workbook, kpiWs, `${tabNames[i].substring(0, 20)}-KPIs`.substring(0, 31));
                }

                // Add table sheets
                tabData.tables.forEach((tableData, idx) => {
                    const ws = XLSX.utils.aoa_to_sheet(tableData);
                    XLSX.utils.book_append_sheet(workbook, ws, `${tabNames[i].substring(0, 15)}-T${idx + 1}`.substring(0, 31));
                });
            }

            XLSX.writeFile(workbook, 'System-Wide-Reports.xlsx');
        }

        handleExportDialogClose();
    };

    const handlePrint = () => {
        if (exportScope === 'current') {
            const tabContainer = tabRefs.current[currentTab];
            if (!tabContainer) return alert('Tab content not found');

            const printWindow = window.open('', '', 'height=700,width=900');
            printWindow.document.write('<html><head><title>' + tabNames[currentTab] + ' Report</title>');
            printWindow.document.write(`
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    h1 { border-bottom: 3px solid #FF6D00; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #333; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .kpi-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
                    .kpi-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                    .kpi-value { font-size: 24px; font-weight: bold; color: #FF6D00; }
                    .kpi-title { font-size: 12px; color: #666; margin-top: 5px; }
                    @media print { body { margin: 0; } }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write('<h1>' + tabNames[currentTab] + ' Report</h1>');
            printWindow.document.write(tabContainer.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        } else {
            const printWindow = window.open('', '', 'height=700,width=900');
            printWindow.document.write('<html><head><title>System-Wide Reports</title>');
            printWindow.document.write(`
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    h1 { text-align: center; border-bottom: 3px solid #FF6D00; padding-bottom: 10px; }
                    h2 { border-left: 4px solid #FF6D00; padding-left: 10px; margin-top: 30px; page-break-after: avoid; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #333; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .kpi-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
                    .kpi-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                    .kpi-value { font-size: 24px; font-weight: bold; color: #FF6D00; }
                    .kpi-title { font-size: 12px; color: #666; margin-top: 5px; }
                    .tab-section { page-break-inside: avoid; }
                    @media print { body { margin: 0; } }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write('<h1>System-Wide Reports & Analytics</h1>');

            for (let i = 0; i < tabNames.length; i++) {
                const tabContainer = tabRefs.current[i];
                if (!tabContainer) continue;
                printWindow.document.write('<div class="tab-section">');
                printWindow.document.write('<h2>' + tabNames[i] + '</h2>');
                printWindow.document.write(tabContainer.innerHTML);
                printWindow.document.write('</div>');
            }

            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }

        handleExportDialogClose();
    };

    return (
        <Box sx={{
            width: '100%',
            minHeight: '100vh',
            // bgcolor: "#ffffff"
        }}>
            {/* Header Section */}
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                mb: 4,
                gap: 3,
                px: { xs: 0, sm: 0 },
                pt: { xs: 3, sm: 0 }
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{
                        color: "#111827",
                        letterSpacing: "-1px",
                        fontSize: { xs: "1.75rem", md: "2.25rem" }
                    }}>
                        System-Wide Reports & Analytics
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
                        Consolidated insights across all your business operations
                    </Typography>
                </Box>

                <Box sx={{
                    display: "flex",
                    gap: 2,
                    width: { xs: "100%", sm: "auto" },
                    flexWrap: "wrap",
                    alignItems: "center"
                }}>
                    {/* Centralized Date Pickers and View Toggles */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ToggleButtonGroup
                            value={reportView}
                            exclusive
                            onChange={(event, newView) => {
                                if (newView !== null) setReportView(newView);
                            }}
                            sx={{
                                '& .MuiToggleButton-root': {
                                    textTransform: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    px: 2.5,
                                    py: 0.75,
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    color: '#6B7280',
                                    '&.Mui-selected': {
                                        bgcolor: '#FF6D00',
                                        color: 'white',
                                        borderColor: '#FF6D00',
                                        '&:hover': {
                                            bgcolor: '#E55D00'
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: '#f3f4f6'
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="daily">Daily</ToggleButton>
                            <ToggleButton value="weekly">Weekly</ToggleButton>
                            <ToggleButton value="monthly">Monthly</ToggleButton>
                            <ToggleButton value="yearly">Yearly</ToggleButton>
                        </ToggleButtonGroup>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Select Date"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                views={
                                    reportView === 'daily' ? ['year', 'month', 'day'] :
                                        reportView === 'weekly' ? ['year', 'month', 'day'] :
                                            reportView === 'monthly' ? ['year', 'month'] :
                                                ['year']
                                }
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: {
                                            width: 180,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '24px',
                                                fontWeight: '700',
                                                fontSize: '1.1rem',
                                                '& fieldset': {
                                                    borderColor: '#e5e7eb',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#d1d5db',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#FF6D00',
                                                }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#6B7280',
                                                fontWeight: '500',
                                                '&.Mui-focused': {
                                                    color: '#FF6D00',
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    {/* Export Dropdown Button */}
                    <Button
                        variant="contained"
                        endIcon={<FileDownloadIcon />}
                        sx={{
                            flex: { xs: 1, sm: "none" },
                            bgcolor: "#333",
                            color: "white",
                            fontWeight: "700",
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 3,
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#444", boxShadow: "none" }
                        }}
                        onClick={handleExportMenuOpen}
                    >
                        Export Options
                    </Button>

                    {/* Export Dropdown Menu */}
                    <Menu
                        anchorEl={exportAnchorEl}
                        open={Boolean(exportAnchorEl)}
                        onClose={handleExportMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={handleExportDialogOpen} sx={{ fontWeight: '600' }}>
                            📄 Export as PDF
                        </MenuItem>
                        <MenuItem onClick={handleExportDialogOpen} sx={{ fontWeight: '600' }}>
                            🖨️ Print Report
                        </MenuItem>
                        <MenuItem onClick={handleExportDialogOpen} sx={{ fontWeight: '600' }}>
                            📊 Export to Excel
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    bgcolor: "white",
                    borderRadius: 0,
                    border: "1px solid #e5e7eb",
                    borderLeft: { xs: "none", sm: "1px solid #e5e7eb" },
                    borderRight: { xs: "none", sm: "1px solid #e5e7eb" },
                    boxShadow: "none",
                    overflow: "hidden"
                }}
            >
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 1,
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: "600",
                            fontSize: "0.95rem",
                            color: "#6b7280",
                            minHeight: 60,
                            px: 3,
                            "&.Mui-selected": { color: "#FF6D00" }
                        },
                        "& .MuiTabs-indicator": {
                            bgcolor: "#FF6D00",
                            height: 3,
                            borderRadius: "3px"
                        }
                    }}
                >
                    <Tab label="General Overview" />
                    <Tab label="Inventory Analysis" />
                    <Tab label="Sales Performance" />
                    <Tab label="Debts & Credit" />
                    <Tab label="Payment Methods" />
                    <Tab label="Staff & Branches" />
                </Tabs>
            </Paper>

            {/* Tab Content - Using Suspense boundaries for lazy-loaded components */}
            <Box sx={{ width: '100%', px: { xs: 0, sm: 0 } }}>
                <ErrorBoundary>
                    {/* Lazy load each tab to reduce initial page size and compile time */}
                    <Box ref={(el) => (tabRefs.current[0] = el)} sx={{ display: currentTab === 0 ? 'block' : 'none' }}>
                        <Suspense fallback={<TabSkeleton />}>
                            <GeneralTab dateRange={dateRange} />
                        </Suspense>
                    </Box>
                    <Box ref={(el) => (tabRefs.current[1] = el)} sx={{ display: currentTab === 1 ? 'block' : 'none' }}>
                        <Suspense fallback={<TabSkeleton />}>
                            <InventoryTab dateRange={dateRange} />
                        </Suspense>
                    </Box>
                    <Box ref={(el) => (tabRefs.current[2] = el)} sx={{ display: currentTab === 2 ? 'block' : 'none' }}>
                        <Suspense fallback={<TabSkeleton />}>
                            <SalesTab dateRange={dateRange} />
                        </Suspense>
                    </Box>
                    <Box ref={(el) => (tabRefs.current[3] = el)} sx={{ display: currentTab === 3 ? 'block' : 'none' }}>
                        <Suspense fallback={<TabSkeleton />}>
                            <DebtsTab dateRange={dateRange} />
                        </Suspense>
                    </Box>
                    <Box ref={(el) => (tabRefs.current[4] = el)} sx={{ display: currentTab === 4 ? 'block' : 'none' }}>
                        <Suspense fallback={<TabSkeleton />}>
                            <PaymentsTab dateRange={dateRange} />
                        </Suspense>
                    </Box>
                    <Box ref={(el) => (tabRefs.current[5] = el)} sx={{ display: currentTab === 5 ? 'block' : 'none' }}>
                        <Suspense fallback={<TabSkeleton />}>
                            <StaffTab dateRange={dateRange} />
                        </Suspense>
                    </Box>
                </ErrorBoundary>
            </Box>

            {/* Export Scope Dialog */}
            <Dialog open={exportDialogOpen} onClose={handleExportDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: '700', color: '#333', borderBottom: '1px solid #e5e7eb' }}>
                    Choose Export Scope
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                        Select what you would like to export:
                    </Typography>
                    <RadioGroup
                        value={exportScope}
                        onChange={(e) => setExportScope(e.target.value)}
                    >
                        <FormControlLabel
                            value="current"
                            control={<Radio />}
                            label={
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: '600' }}>
                                        Current Tab Only
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                        Export only the {tabNames[currentTab]} tab
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            value="all"
                            control={<Radio />}
                            label={
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: '600' }}>
                                        All Tabs as Report
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                        Export all 6 tabs as a complete system-wide report
                                    </Typography>
                                </Box>
                            }
                        />
                    </RadioGroup>
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #e5e7eb', p: 2 }}>
                    <Button
                        onClick={handleExportDialogClose}
                        sx={{ color: '#666', textTransform: 'none', fontWeight: '600' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExportPDF}
                        variant="contained"
                        sx={{
                            bgcolor: '#333',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: '600',
                            '&:hover': { bgcolor: '#444' }
                        }}
                    >
                        Export PDF
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        variant="contained"
                        sx={{
                            bgcolor: '#FF6D00',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: '600',
                            '&:hover': { bgcolor: '#E55D00' }
                        }}
                    >
                        Export Excel
                    </Button>
                    <Button
                        onClick={handlePrint}
                        variant="contained"
                        sx={{
                            bgcolor: '#0066cc',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: '600',
                            '&:hover': { bgcolor: '#0052a3' }
                        }}
                    >
                        Print
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportsPage;
