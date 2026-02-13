"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  TextField,
  Box,
  Menu,
  MenuItem,
  Popover,
  Select,
  InputLabel,
  FormControl,
  TablePagination,
  Chip,
  InputAdornment,
} from "@mui/material";

// Icons
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
import SearchIcon from "@mui/icons-material/Search";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// =======================================
// STATUS CHIP COMPONENT
// =======================================
const StatusChip = ({ status }) => {
  const statusConfig = {
    completed: { bg: "#d1fae5", color: "#065f46", label: "Completed" },
    succeeded: { bg: "#d1fae5", color: "#065f46", label: "Succeeded" },
    pending: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
    failed: { bg: "#fee2e2", color: "#991b1b", label: "Failed" },
    processing: { bg: "#dbeafe", color: "#0c4a6e", label: "Processing" },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: "6px",
        height: "28px",
        textTransform: "capitalize",
      }}
    />
  );
};

// =======================================
// PAYMENT METHOD BADGE COMPONENT
// =======================================
const PaymentMethodBadge = ({ method }) => {
  const methodConfig = {
    'MTN Mobile Money': { bg: "#FFF9E6", color: "#B8860B", icon: "📱" },
    'Airtel Money': { bg: "#FFE6E6", color: "#C41E3A", icon: "📱" },
    'M-Pesa': { bg: "#E6F7ED", color: "#00703C", icon: "💰" },
    'Cash': { bg: "#F3F4F6", color: "#4B5563", icon: "💵" },
    'Bank Transfer': { bg: "#EFF6FF", color: "#1E40AF", icon: "🏦" },
    'Stripe': { bg: "#F5F3FF", color: "#5B21B6", icon: "💳" },
  };

  const config = methodConfig[method] || {
    bg: "#F3F4F6",
    color: "#4B5563",
    icon: "💸",
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 0.75,
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      <span>{config.icon}</span>
      {method}
    </Box>
  );
};

const PaymentTable = ({
  payments = [],
  shops = [],
  isLoading = false,
  filteredPayments = [],
  search,
  startDate,
  endDate,
  selectedShop,
  selectedPaymentMethod,
  selectedStatus,
  pagination,
  updateFilters
}) => {
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  const page = pagination?.page || 0;
  const rowsPerPage = pagination?.limit || 10;

  const handleChangePage = (event, newPage) => {
    updateFilters({ page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    updateFilters({ limit: parseInt(event.target.value, 10), page: 0 });
  };

  const handleOpenFilter = (e) => setFilterAnchor(e.currentTarget);
  const handleCloseFilter = () => setFilterAnchor(null);
  const handleExportMenuOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportMenuClose = () => setExportAnchor(null);

  // Clear all filters
  const handleClearFilters = () => {
    updateFilters({
      startDate: null,
      endDate: null,
      shop: "",
      method: "",
      status: "",
      search: ""
    });
  };

  // Generate dynamic filter options from payment data
  const filterOptions = useMemo(() => {
    const shopIds = [...new Set(payments.map(p => p.shop_id).filter(Boolean))];
    const methods = [...new Set(payments.map(p => p.method || p.paymentMethod).filter(Boolean))];
    const statuses = [...new Set(payments.map(p => p.status).filter(Boolean))];

    return {
      shops: shopIds.map(id => {
        const shop = shops.find(s => (s._id || s.id) === id);
        return { id, name: shop?.name || id };
      }),
      methods,
      statuses
    };
  }, [payments, shops]);

  // Export Functions
  const exportCSV = (rows) => {
    let csv = "Transaction ID,Date,Payer,Phone,Shop,Payment Method,Amount,Status\n";
    rows.forEach((r) => {
      csv += `${r.payment_id || r.transactionId},${new Date(r.created_at || r.date).toLocaleDateString()},${r.customer?.name || r.payer},${r.customer?.phone || r.payerPhone || '-'},${getShopName(r.shop_id || r.shop)},${r.method || r.paymentMethod},${r.amount},${r.status}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payment_history_export.csv";
    link.click();
  };

  const exportPDF = (rows) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor("#FF6D00");
    doc.text("INVEXIS", 180, 15, { align: "right" });
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Payment History Report", 14, 20);

    const tableColumn = ["Transaction ID", "Date", "Payer", "Phone", "Shop", "Method", "Amount", "Status"];
    const tableRows = rows.map((r) => [
      r.payment_id || r.transactionId,
      new Date(r.created_at || r.date).toLocaleDateString(),
      r.customer?.name || r.payer,
      r.customer?.phone || r.payerPhone || '-',
      getShopName(r.shop_id || r.shop),
      r.method || r.paymentMethod,
      `${parseFloat(r.amount).toLocaleString()} ${r.currency || 'RWF'}`,
      r.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: "#FF6D00", textColor: 255 },
      alternateRowStyles: { fillColor: [255, 243, 230] },
      margin: { left: 14, right: 14 },
    });

    doc.save("payment_history_report.pdf");
  };

  const paginatedPayments = useMemo(() => {
    return filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredPayments, page, rowsPerPage]);

  // Format currency
  const formatCurrency = (amount, currency = "RWF") => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get shop name from ID
  const getShopName = (shopId) => {
    if (!shopId) return 'N/A';
    const shop = shops.find(s => (s._id || s.id) === shopId);
    return shop?.name || shopId;
  };

  const hasActiveFilters = startDate || endDate || selectedShop || selectedPaymentMethod || selectedStatus || search;

  return (
    <Paper
      sx={{
        width: "100%",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          bgcolor: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ color: "#111827", letterSpacing: "-0.5px" }}>
              Payment History
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              View and analyze all payment transactions
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", md: "auto" } }}>
            <TextField
              size="small"
              placeholder="Search payments..."
              value={search}
              onChange={(e) => updateFilters({ search: e.target.value, page: 0 })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "gray" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: "100%", md: 320 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f9fafb",
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#d1d5db" },
                  "&.Mui-focused fieldset": { borderColor: "#FF6D00" },
                },
              }}
            />
            <IconButton
              onClick={handleOpenFilter}
              sx={{
                bgcolor: (startDate || endDate) ? "#FFF3E0" : "#f3f4f6",
                color: (startDate || endDate) ? "#FF6D00" : "#4b5563",
                borderRadius: "8px",
                p: 1,
                "&:hover": { bgcolor: (startDate || endDate) ? "#FFE0B2" : "#e5e7eb" },
              }}
            >
              <FilterAltRoundedIcon />
            </IconButton>
            <IconButton
              onClick={handleExportMenuOpen}
              sx={{
                bgcolor: "#f3f4f6",
                color: "#4b5563",
                borderRadius: "8px",
                p: 1,
                "&:hover": { bgcolor: "#e5e7eb" },
              }}
            >
              <CloudDownloadRoundedIcon />
            </IconButton>
            <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={handleExportMenuClose}>
              <MenuItem
                onClick={() => {
                  exportCSV(filteredPayments);
                  handleExportMenuClose();
                }}
              >
                Export CSV
              </MenuItem>
              <MenuItem
                onClick={() => {
                  exportPDF(filteredPayments);
                  handleExportMenuClose();
                }}
              >
                Export PDF
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
          }}
        >
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              minWidth: { xs: "100%", md: 180 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#f9fafb",
              },
            }}
          >
            <InputLabel id="shop-filter-label">Filter by Shop</InputLabel>
            <Select
              labelId="shop-filter-label"
              value={selectedShop}
              label="Filter by Shop"
              onChange={(e) => updateFilters({ shop: e.target.value, page: 0 })}
            >
              <MenuItem value="">
                <em>All Shops</em>
              </MenuItem>
              {filterOptions.shops.map((shop) => (
                <MenuItem key={shop.id} value={shop.id}>
                  {shop.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            variant="outlined"
            size="small"
            sx={{
              minWidth: { xs: "100%", md: 200 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#f9fafb",
              },
            }}
          >
            <InputLabel id="method-filter-label">Payment Method</InputLabel>
            <Select
              labelId="method-filter-label"
              value={selectedPaymentMethod}
              label="Payment Method"
              onChange={(e) => updateFilters({ method: e.target.value, page: 0 })}
            >
              <MenuItem value="">
                <em>All Methods</em>
              </MenuItem>
              {filterOptions.methods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            variant="outlined"
            size="small"
            sx={{
              minWidth: { xs: "100%", md: 150 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#f9fafb",
              },
            }}
          >
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={selectedStatus}
              label="Status"
              onChange={(e) => updateFilters({ status: e.target.value, page: 0 })}
            >
              <MenuItem value="">
                <em>All Status</em>
              </MenuItem>
              {filterOptions.statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasActiveFilters && (
            <Box
              onClick={handleClearFilters}
              sx={{
                cursor: "pointer",
                color: "#FF6D00",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "underline",
                "&:hover": { color: "#E65100" },
                alignSelf: "center",
              }}
            >
              Clear Filters
            </Box>
          )}
        </Box>
      </Box>

      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={handleCloseFilter}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 3, width: 280 }}>
          <Typography fontWeight="bold" gutterBottom>
            Filter by Date Range
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From"
              value={startDate}
              onChange={(val) => updateFilters({ startDate: val, page: 0 })}
              sx={{ mt: 2, width: "100%" }}
            />
            <DatePicker
              label="To"
              value={endDate}
              onChange={(val) => updateFilters({ endDate: val, page: 0 })}
              sx={{ mt: 2, width: "100%" }}
            />
          </LocalizationProvider>
        </Box>
      </Popover>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb" }}>
              <TableCell sx={{ fontWeight: 700, color: "#374151", bgcolor: "#f9fafb" }}>Transaction ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151", bgcolor: "#f9fafb" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151", bgcolor: "#f9fafb" }}>Payer</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151", bgcolor: "#f9fafb" }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151", bgcolor: "#f9fafb" }}>Shop</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151", bgcolor: "#f9fafb" }}>Payment Method</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: "#374151", bgcolor: "#f9fafb" }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151", bgcolor: "#f9fafb" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPayments.length > 0 ? (
              paginatedPayments.map((payment) => (
                <TableRow
                  key={payment.payment_id || payment.transactionId}
                  sx={{
                    borderBottom: "1px solid #e5e7eb",
                    "&:hover": { backgroundColor: "#f9fafb" },
                    transition: "background-color 0.2s",
                  }}
                >
                  <TableCell sx={{ fontFamily: "monospace", fontSize: "12px", color: "#111827", fontWeight: 600 }}>
                    {payment.payment_id || payment.transactionId}
                  </TableCell>
                  <TableCell sx={{ color: "#6b7280", fontSize: "13px" }}>
                    {formatDate(payment.created_at || payment.date)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: "#111827" }}>
                    {payment.customer?.name || payment.payer}
                  </TableCell>
                  <TableCell sx={{ color: "#6b7280", fontFamily: "monospace", fontSize: "13px" }}>
                    {payment.customer?.phone || payment.payerPhone || '-'}
                  </TableCell>
                  <TableCell sx={{ color: "#6b7280" }}>{getShopName(payment.shop_id || payment.shop)}</TableCell>
                  <TableCell>
                    <PaymentMethodBadge method={payment.method || payment.paymentMethod} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={payment.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No payments found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredPayments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}
      />
    </Paper>
  );
};

export default PaymentTable;
