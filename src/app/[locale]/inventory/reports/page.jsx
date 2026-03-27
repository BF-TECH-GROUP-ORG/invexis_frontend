"use client";

import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import dayjs from 'dayjs';
import { useTranslations } from "next-intl";
import { exportExecutivePDF, exportToExcel, prepareExcelWorkbook } from './exportUtils';
import { toast } from 'react-hot-toast';

// OPTIMIZATION: Lazy load tab components to reduce initial page load time
// This defers compilation of heavy tab components until they're actually needed
const InventoryTab = lazy(() => import('./components/InventoryTab'));
const SalesTab = lazy(() => import('./components/SalesTab'));
const DebtsTab = lazy(() => import('./components/DebtsTab'));
const PaymentsTab = lazy(() => import('./components/PaymentsTab'));
// const StaffTab = lazy(() => import('./components/StaffTab'));
const GeneralTab = lazy(() => import('./components/GeneralTab'));
const VisualizeTab = lazy(() => import('./components/VisualizeTab'));

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
                    <Typography color="error">
                        {this.props.errorMessage || 'Error loading tab content. Please try again.'}
                    </Typography>
                </Box>
            );
        }

        return this.props.children;
    }
}

const ReportsPage = () => {
    const t = useTranslations("reports");
    const [currentTab, setCurrentTab] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportScope, setExportScope] = useState('current'); // 'current' or 'all'
    const [reportView, setReportView] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const [dateRange, setDateRange] = useState({
        startDate: dayjs().startOf('day'),
        endDate: dayjs().endOf('day'),
        filter: 'daily'
    });

    // Sync dateRange with reportView and selectedDate
    useEffect(() => {
        let start, end;
        const now = dayjs();

        switch (reportView) {
            case 'daily':
                start = selectedDate.startOf('day');
                end = selectedDate.endOf('day');
                break;
            case 'weekly':
                start = selectedDate.startOf('week');
                end = selectedDate.endOf('week');
                break;
            case 'monthly':
                start = selectedDate.startOf('month');
                end = selectedDate.endOf('month');
                break;
            case 'yearly':
                start = selectedDate.startOf('year');
                end = selectedDate.endOf('year');
                break;
            default:
                start = now.startOf('day');
                end = now.endOf('day');
        }

        setDateRange({ startDate: start, endDate: end, filter: reportView });
    }, [reportView, selectedDate]);

    const tabKeys = ['general', 'inventory', 'sales', 'debts', 'payments', /* 'staff', 'visualize'*/ ];
    const tabNames = tabKeys.map(key => t(`tabs.${key}`));
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

    const handleExportDialogOpen = () => {
        setExportDialogOpen(true);
    };

    const handleExportDialogClose = () => {
        setExportDialogOpen(false);
    };

    // Extract structured data from tab container
    const extractTabData = (tabContainer) => {
        const tabData = {
            tables: [],
            kpis: []
        };

        // 1. Extract KPI cards (mimic GeneralTab structure)
        const kpiElements = tabContainer.querySelectorAll('.MuiPaper-root'); // KPI cards are Papers in GeneralTab
        kpiElements.forEach(el => {
            const titleEl = el.querySelector('span') || el.querySelector('.MuiTypography-caption');
            const valueEl = el.querySelector('h5') || el.querySelector('.MuiTypography-h5');
            if (titleEl && valueEl && titleEl.textContent && valueEl.textContent) {
                // Check if it's actually a KPI card (small text above large text)
                if (titleEl.textContent.trim().length < 50 && valueEl.textContent.trim().length < 50) {
                    tabData.kpis.push({
                        title: titleEl.textContent.trim(),
                        value: valueEl.textContent.trim()
                    });
                }
            }
        });

        // 2. Extract tables with multi-level header support
        const tables = tabContainer.querySelectorAll('table');
        tables.forEach(table => {
            const tableObj = { head: [], body: [] };
            
            // Get all header rows (support multi-level)
            table.querySelectorAll('thead tr').forEach(tr => {
                const headerRow = [];
                tr.querySelectorAll('th').forEach(th => {
                    headerRow.push({
                        content: th.textContent.trim(),
                        colSpan: th.colSpan || 1,
                        rowSpan: th.rowSpan || 1,
                        styles: { halign: 'center' }
                    });
                });
                if (headerRow.length > 0) tableObj.head.push(headerRow);
            });

            // Get body rows
            table.querySelectorAll('tbody tr').forEach(tr => {
                const rowData = [];
                tr.querySelectorAll('td').forEach(td => {
                    rowData.push({
                        content: td.textContent.trim(),
                        colSpan: td.colSpan || 1,
                        rowSpan: td.rowSpan || 1,
                        styles: td.colSpan > 1 ? { fontStyle: 'bold' } : {}
                    });
                });

                // Detect special rows by background color
                const bgColor = window.getComputedStyle(tr).backgroundColor;
                const isOrange = bgColor.includes('255, 247, 237') || bgColor.includes('fed7aa') || bgColor.includes('rgb(255, 247, 237)');
                const isDark = bgColor.includes('17, 24, 39') || bgColor.includes('31, 41, 55') || bgColor.includes('rgb(17, 24, 39)');

                if (rowData.length > 0) {
                    // We use an array for the row, and attach metadata to it
                    const rowArr = rowData;
                    rowArr.isSubtotal = isOrange;
                    rowArr.isTotal = isDark;
                    tableObj.body.push(rowArr);
                }
            });

            if (tableObj.body.length > 0) {
                tabData.tables.push(tableObj);
            }
        });

        return tabData;
    };

    const handleExportPDF = () => {
        try {
            toast.loading(t('common.generatingPDF') || 'Generating PDF...', { id: 'export-toast' });
            const periodStr = `${dateRange.startDate.format('MM/DD/YYYY')} - ${dateRange.endDate.format('MM/DD/YYYY')}`;

            if (exportScope === 'current') {
                const tabContainer = tabRefs.current[currentTab];
                if (!tabContainer) throw new Error("Tab content not found");
                
                const data = extractTabData(tabContainer);
                exportExecutivePDF({
                    title: `${tabNames[currentTab].toUpperCase()} REPORT`,
                    period: periodStr,
                    kpis: data.kpis,
                    tables: data.tables,
                    filename: `${tabNames[currentTab].toLowerCase()}-report.pdf`
                });
            } else {
                const allKpis = [];
                const allTables = [];
                
                for (let i = 0; i < tabNames.length; i++) {
                    const container = tabRefs.current[i];
                    if (container) {
                        const data = extractTabData(container);
                        if (data.tables.length > 0) {
                            allTables.push({
                                head: [[{ content: tabNames[i].toUpperCase(), colSpan: (data.tables[0].head[0]?.length || 10), styles: { fillColor: [249, 115, 22], textColor: [255, 255, 255] } }]],
                                body: []
                            });
                            allTables.push(...data.tables);
                        }
                        if (allKpis.length === 0) allKpis.push(...data.kpis);
                    }
                }

                exportExecutivePDF({
                    title: "SUMMARY SYSTEM REPORT",
                    period: periodStr,
                    kpis: allKpis,
                    tables: allTables,
                    filename: "full-system-report.pdf"
                });
            }
            toast.success(t('common.exportSuccess') || 'Export Successful', { id: 'export-toast' });
            handleExportDialogClose();
        } catch (error) {
            console.error("PDF Export failed:", error);
            toast.error(t('common.exportError') || 'Export Failed', { id: 'export-toast' });
        }
    };

    const handleExportExcel = () => {
        try {
            toast.loading(t('common.generatingExcel') || 'Generating Excel...', { id: 'export-toast' });
            if (exportScope === 'current') {
                const tabContainer = tabRefs.current[currentTab];
                if (!tabContainer) throw new Error("Tab content not found");
                
                const data = extractTabData(tabContainer);
                const rows = [];
                data.tables.forEach(table => {
                    table.head.forEach(hRow => rows.push(hRow.map(h => h.content || h)));
                    table.body.forEach(bRow => {
                        const cleanRow = [];
                        bRow.forEach(cell => {
                            cleanRow.push(cell.content || '');
                            // Fill in empty cells for colspan to maintain alignment in Excel
                            for (let i = 1; i < (cell.colSpan || 1); i++) {
                                cleanRow.push('');
                            }
                        });
                        rows.push(cleanRow);
                    });
                    rows.push([]);
                });

                if (rows.length === 0) throw new Error("No table data found to export");
                exportToExcel(rows, `${tabNames[currentTab].toLowerCase()}-report.xlsx`);
            } else {
                const allTabData = [];
                for (let i = 0; i < tabNames.length; i++) {
                    const container = tabRefs.current[i];
                    if (container) {
                        const data = extractTabData(container);
                        const rows = [];
                        data.tables.forEach(table => {
                            table.head.forEach(hRow => rows.push(hRow.map(h => h.content || h)));
                            table.body.forEach(bRow => {
                                const cleanRow = [];
                                bRow.forEach(cell => {
                                    cleanRow.push(cell.content || '');
                                    for (let i = 1; i < (cell.colSpan || 1); i++) {
                                        cleanRow.push('');
                                    }
                                });
                                rows.push(cleanRow);
                            });
                        });
                        if (rows.length > 0) {
                            allTabData.push({ name: tabNames[i], rows: rows });
                        }
                    }
                }
                if (allTabData.length === 0) throw new Error("No data found to export");
                exportToExcel(allTabData, "full-system-report.xlsx");
            }
            toast.success(t('common.exportSuccess') || 'Export Successful', { id: 'export-toast' });
            handleExportDialogClose();
        } catch (error) {
            console.error("Excel Export failed:", error);
            toast.error(t('common.exportError') || 'Export Failed', { id: 'export-toast' });
        }
    };

    const handlePrint = () => {
        try {
            toast.loading(t('common.preparingPrint') || 'Preparing for print...', { id: 'print-toast' });
            const periodStr = `${dateRange.startDate.format('MM/DD/YYYY')} - ${dateRange.endDate.format('MM/DD/YYYY')}`;
            const printWindow = window.open('', '', 'height=800,width=1100');
            
            const renderReportHTML = (title, data) => {
                const kpiHTML = data.kpis.map((kpi, index) => {
                    const letters = ['S', 'C', 'P', 'D'];
                    const bgs = ['#eff6ff', '#fef3c7', '#ecfdf5', '#fee2e2'];
                    const texts = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];
                    
                    // Map common titles to specific icons/colors
                    const titleUpper = kpi.title.toUpperCase();
                    let colorIdx = index % 4;
                    let letter = kpi.title.charAt(0).toUpperCase();

                    if (titleUpper.includes('REVENUE') || titleUpper.includes('SALES')) { colorIdx = 0; letter = 'S'; }
                    else if (titleUpper.includes('COST')) { colorIdx = 1; letter = 'C'; }
                    else if (titleUpper.includes('PROFIT')) { colorIdx = 2; letter = 'P'; }
                    else if (titleUpper.includes('DEBT')) { colorIdx = 3; letter = 'D'; }

                    return `
                        <div class="kpi-card">
                            <div class="kpi-icon" style="background: ${bgs[colorIdx]}; color: ${texts[colorIdx]}">${letter}</div>
                            <div class="kpi-label">${kpi.title}</div>
                            <div class="kpi-value">${kpi.value}</div>
                        </div>
                    `;
                }).join('');

                const tablesHTML = data.tables.map(table => {
                    const headRow = table.head.map(hLevel => {
                        return `<tr>${hLevel.map(h => `<th colspan="${h.colSpan || 1}" rowspan="${h.rowSpan || 1}">${h.content}</th>`).join('')}</tr>`;
                    }).join('');

                    const bodyRows = table.body.map(row => {
                        const cellHTML = row.map(c => `
                            <td colspan="${c.colSpan || 1}" rowspan="${c.rowSpan || 1}">${c.content}</td>
                        `).join('');
                        let rowClass = "";
                        if (row.isSubtotal) rowClass = "subtotal-row";
                        if (row.isTotal) rowClass = "total-row";
                        return `<tr class="${rowClass}">${cellHTML}</tr>`;
                    }).join('');

                    return `<table><thead>${headRow}</thead><tbody>${bodyRows}</tbody></table>`;
                }).join('');

                return `
                    <div class="report-page">
                        <header>
                            <div class="brand">INVEXIX</div>
                            <div class="report-title">
                                <h2>${title.toUpperCase()}</h2>
                                <p>Period: ${periodStr}</p>
                            </div>
                        </header>
                        <div class="kpi-container">${kpiHTML}</div>
                        ${tablesHTML}
                        <div class="footer-info">
                            <p>Powered by invexix.com - Business Intelligence Solutions</p>
                        </div>
                    </div>
                `;
            };

            let fullHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Report - ${periodStr}</title>
                    <style>
                        @page { size: landscape; margin: 10mm; }
                        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #fff; }
                        .report-page { page-break-after: always; padding: 10px; }
                        header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 1px solid #f3f4f6; padding-bottom: 15px; }
                        .brand { color: #f97316; font-size: 32px; font-weight: 800; letter-spacing: -1px; }
                        .report-title { text-align: right; }
                        .report-title h2 { margin: 0; color: #111827; font-size: 16px; letter-spacing: 0.5px; }
                        .report-title p { margin: 4px 0 0; color: #6b7280; font-size: 10px; }
                        .kpi-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
                        .kpi-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                        .kpi-icon { position: absolute; right: 12px; top: 12px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
                        .kpi-label { font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 6px; }
                        .kpi-value { font-size: 22px; font-weight: 800; color: #111827; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 10.5px; }
                        th { background: #111827; color: #fff; padding: 10px 8px; text-align: center; border: 1px solid #374151; font-weight: 600; }
                        td { padding: 8px; border: 1px solid #e5e7eb; text-align: left; color: #374151; }
                        tr:nth-child(even) { background: #f9fafb; }
                        .subtotal-row td { background: #fff7ed !important; color: #9a3412; font-weight: 700; border-top: 1px solid #ffedd5; border-bottom: 1px solid #ffedd5; }
                        .total-row td { background: #111827 !important; color: #fff; font-weight: 700; border: 1px solid #111827; }
                        /* Profit cell highlighting */
                        .subtotal-row td:nth-last-child(2) { background: #f97316 !important; color: #fff; border: none; }
                        .total-row td:nth-last-child(2) { background: #10b981 !important; color: #fff; border: none; }
                        .footer-info { border-top: 1px solid #f3f4f6; padding-top: 15px; text-align: center; color: #9ca3af; font-size: 9px; }
                    </style>
                </head>
                <body>
            `;

            if (exportScope === 'current') {
                const tabContainer = tabRefs.current[currentTab];
                if (tabContainer) {
                    const data = extractTabData(tabContainer);
                    fullHTML += renderReportHTML(tabNames[currentTab], data);
                }
            } else {
                for (let i = 0; i < tabNames.length; i++) {
                    const container = tabRefs.current[i];
                    if (container) {
                        const data = extractTabData(container);
                        if (data.tables.length > 0) {
                            fullHTML += renderReportHTML(tabNames[i], data);
                        }
                    }
                }
            }

            fullHTML += "</body></html>";
            printWindow.document.write(fullHTML);
            printWindow.document.close();
            
            setTimeout(() => {
                printWindow.print();
                toast.success(t('common.printReady') || 'Print Ready', { id: 'print-toast' });
            }, 500);
            
            handleExportDialogClose();
        } catch (error) {
            console.error("Print failed:", error);
            toast.error(t('common.printError') || 'Print Failed', { id: 'print-toast' });
        }
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
                        {t('header.title')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
                        {t('header.subtitle')}
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
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, width: { xs: '100%', md: 'auto' } }}>
                        <Box sx={{ maxWidth: '100vw', overflowX: 'auto', pb: { xs: 1, md: 0 } }}>
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
                            <ToggleButton value="daily">{t('controls.daily')}</ToggleButton>
                            <ToggleButton value="weekly">{t('controls.weekly')}</ToggleButton>
                            <ToggleButton value="monthly">{t('controls.monthly')}</ToggleButton>
                            <ToggleButton value="yearly">{t('controls.yearly')}</ToggleButton>
                        </ToggleButtonGroup>
                        </Box>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label={t('controls.selectDate')}
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
                        onClick={handleExportDialogOpen}
                    >
                        {t('controls.exportOptions')}
                    </Button>
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
                    {tabNames.map((name, index) => (
                        <Tab key={index} label={name} />
                    ))}
                </Tabs>
            </Paper>

            {/* Tab Content - Using Suspense boundaries for lazy-loaded components */}
            <Box sx={{ width: '100%', px: { xs: 0, sm: 0 } }}>
                <ErrorBoundary errorMessage={t('common.error')}>
                    {/* Lazy load each tab to reduce initial page size and compile time */}
                    <Box ref={(el) => (tabRefs.current[0] = el)} sx={{ display: currentTab === 0 ? 'block' : 'none' }}>
                        <Suspense fallback={<TabSkeleton />}>
                            <GeneralTab dateRange={dateRange} reportView={reportView} />
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
                    {/* <Box ref={(el) => (tabRefs.current[5] = el)} sx={{ display: currentTab === 5 ? 'block' : 'none' }}>
                        <Suspense fallback={<TabSkeleton />}>
                            <StaffTab dateRange={dateRange} />
                        </Suspense>
                    </Box> */}
                    <Box ref={(el) => (tabRefs.current[5] = el)} sx={{ display: currentTab === 5 ? 'block' : 'none' }}>
                        <Suspense fallback={<TabSkeleton />}>
                            <VisualizeTab dateRange={dateRange} reportView={reportView} />
                        </Suspense>
                    </Box>
                </ErrorBoundary>
            </Box>

            {/* Export Scope Dialog */}
            <Dialog open={exportDialogOpen} onClose={handleExportDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: '700', color: '#333', borderBottom: '1px solid #e5e7eb' }}>
                    {t('export.scopeTitle')}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                        {t('export.scopeSubtitle')}
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
                                        {t('export.currentTab')}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                        {t('export.currentTabDesc', { tab: tabNames[currentTab] })}
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
                                        {t('export.allTabs')}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                        {t('export.allTabsDesc', { count: tabKeys.length })}
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
                        {t('common.cancel')}
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
                        {t('controls.exportPDF')}
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
                        {t('controls.exportExcel')}
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
                        {t('controls.printReport')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportsPage;
