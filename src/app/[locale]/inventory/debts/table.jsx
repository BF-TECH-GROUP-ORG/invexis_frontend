"use client";

import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Toolbar, IconButton, Typography, TextField, Box,
  Menu, MenuItem, ListItemIcon, ListItemText, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Popover,
  ToggleButton, ToggleButtonGroup, InputAdornment
} from "@mui/material";

// Icons
import CheckIcon from '@mui/icons-material/Check';
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import CancelIcon from "@mui/icons-material/Cancel";
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";

// =======================================
// SAMPLE DATA
// =======================================
const debtRows = [
  { id: 1, debtorName: "John Mutabazi", contact: "+250 781 234 567", totalDebt: 450000, amountPaid: 200000, remainingDebt: 250000, dueDate: "25/12/2025", isDebtCleared: false },
  { id: 2, debtorName: "Aline Umutesi", contact: "+250 788 999 111", totalDebt: 1200000, amountPaid: 1200000, remainingDebt: 0, dueDate: "10/11/2025", isDebtCleared: true },
  { id: 3, debtorName: "Eric Niyonsenga", contact: "+250 790 123 456", totalDebt: 800000, amountPaid: 300000, remainingDebt: 500000, dueDate: "05/01/2026", isDebtCleared: false },
  { id: 4, debtorName: "Grace Uwase", contact: "+250 783 555 777", totalDebt: 300000, amountPaid: 0, remainingDebt: 300000, dueDate: "30/11/2025", isDebtCleared: false },
];

// =======================================
// CONFIRM DIALOG (Cancel Debt)
// =======================================
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, t }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} variant="outlined">{t("cancel")}</Button>
      <Button onClick={onConfirm} color="error" variant="contained">{t("confirm")}</Button>
    </DialogActions>
  </Dialog>
);

// =======================================
// REPAYMENT DIALOG (Beautiful Popup)
// =======================================
const RepayDialog = ({ open, onClose, debtorName, contact, remainingDebt, t }) => {
  const [paymentMode, setPaymentMode] = useState("amount"); // "amount" or "phone"
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState(contact.replace(/\s/g, ""));

  const handleConfirm = () => {
    if (paymentMode === "amount") {
      alert(`Recorded payment of ${parseInt(amount).toLocaleString()} FRW for ${debtorName}`);
    } else {
      alert(`MoMo payment request sent to ${phone} for ${debtorName}`);
    }
    onClose();
    setAmount("");
    setPaymentMode("amount");
  };

  const isAmountValid = amount && parseInt(amount) > 0 && parseInt(amount) <= remainingDebt;
  const isPhoneValid = phone.length >= 12;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#FF6D00", color: "white", py: 2.5, fontWeight: "bold" }}>
        <PaymentIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: 28 }} />
        Repay Debt — {debtorName}
      </DialogTitle>

      <DialogContent sx={{ pt: 4 }}>
        <Typography variant="body1" fontWeight="medium" gutterBottom>
          Remaining Amount: <strong style={{ color: "#d32f2f" }}>{remainingDebt.toLocaleString()} FRW</strong>
        </Typography>

        {/* Toggle Buttons */}
        <ToggleButtonGroup
          value={paymentMode}
          exclusive
          onChange={(e, newMode) => newMode && setPaymentMode(newMode)}
          fullWidth
          sx={{ mt: 3, mb: 3 }}
        >
          <ToggleButton value="amount" sx={{ py: 1.5 }}>
            <MonetizationOnIcon sx={{ mr: 1 }} />
            Pay by Amount
          </ToggleButton>
          <ToggleButton value="phone" sx={{ py: 1.5 }}>
            <LocalPhoneIcon sx={{ mr: 1 }} />
            Pay via Mobile Money
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Dynamic Input Field */}
        {paymentMode === "amount" ? (
          <TextField
            autoFocus
            label="Amount to Record"
            type="text"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            InputProps={{
              startAdornment: <InputAdornment position="start">FRW</InputAdornment>,
            }}
            helperText={
              amount && parseInt(amount) > remainingDebt
                ? "⚠️ Amount exceeds remaining debt"
                : `Maximum: ${remainingDebt.toLocaleString()} FRW`
            }
            error={amount && parseInt(amount) > remainingDebt}
            sx={{ mt: 1 }}
          />
        ) : (
          <TextField
            autoFocus
            label="Phone Number"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
            InputProps={{
              startAdornment: <InputAdornment position="start">+250</InputAdornment>,
            }}
            helperText="Payment request will be sent via MTN MoMo or Airtel Money"
            sx={{ mt: 1 }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          size="large"
          disabled={paymentMode === "amount" ? !isAmountValid : !isPhoneValid}
          startIcon={<PaymentIcon />}
          sx={{ minWidth: 180 }}
        >
          {paymentMode === "amount" ? "Record Payment" : "Send MoMo Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =======================================
// ACTION MENU + REPAY DIALOG
// =======================================
const DebtActionsMenu = ({ rowId, debtorName, contact, remainingDebt }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("debtsPage");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setAnchorEl(null); router.push(`/${locale}/inventory/debts/${rowId}`); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t("actionView") || "View Details"}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { setRepayOpen(true); setAnchorEl(null); }}>
          <ListItemIcon><PaymentIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>{t("repay") || "Repay"}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { setAnchorEl(null); router.push(`/${locale}/debts/repay/${rowId}`); }}>
          <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>{t("markPayed") || "Mark as Paid"}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { setCancelDialogOpen(true); setAnchorEl(null); }}>
          <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t("cancelDebt") || "Cancel Debt"}</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={cancelDialogOpen}
        t={t}
        title={t("confirmCancelTitle") || "Cancel Debt?"}
        message={t("confirmCancelMessage") || "This action cannot be undone."}
        onConfirm={() => setCancelDialogOpen(false)}
        onCancel={() => setCancelDialogOpen(false)}
      />

      <RepayDialog
        open={repayOpen}
        onClose={() => setRepayOpen(false)}
        debtorName={debtorName}
        contact={contact}
        remainingDebt={remainingDebt}
        t={t}
      />
    </>
  );
};

// =======================================
// MAIN TABLE COMPONENT
// ==================  ====  ===  ===  ===
const DebtsTable = () => {
  const tTable = useTranslations("Debtstable");
  const tPage = useTranslations("debtsPage");

  const [search, setSearch] = useState("");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  const handleOpenFilter = (e) => setFilterAnchor(e.currentTarget);
  const handleCloseFilter = () => setFilterAnchor(null);
  const handleExportMenuOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportMenuClose = () => setExportAnchor(null);

  // Export Functions
  const exportCSV = (rows) => {
    let csv = "ID,Debtor,Contact,TotalDebt,AmountPaid,RemainingDebt,DueDate,Cleared\n";
    rows.forEach(r => {
      csv += `${r.id},${r.debtorName},${r.contact},${r.totalDebt},${r.amountPaid},${r.remainingDebt},${r.dueDate},${r.isDebtCleared}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "debts_export.csv";
    link.click();
  };

  const exportPDF = (rows) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor("#FF6D00");
    doc.text("INVEXIS", 180, 15, { align: "right" });
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Debts Report", 14, 20);

    const tableColumn = ["ID", "Debtor", "Contact", "Total", "Paid", "Remaining", "Due Date", "Status"];
    const tableRows = rows.map(r => [
      r.id,
      r.debtorName,
      r.contact,
      r.totalDebt.toLocaleString(),
      r.amountPaid.toLocaleString(),
      r.remainingDebt.toLocaleString(),
      r.dueDate,
      r.isDebtCleared ? "Cleared" : "Pending"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: "#FF6D00", textColor: 255 },
      alternateRowStyles: { fillColor: [255, 243, 230] },
      margin: { left: 14, right: 14 }
    });

    doc.save("debts_report.pdf");
  };

  const filteredRows = useMemo(() => {
    let rows = debtRows;

    if (search) {
      rows = rows.filter(r =>
        r.debtorName.toLowerCase().includes(search.toLowerCase()) ||
        r.contact.includes(search)
      );
    }

    if (startDate) {
      rows = rows.filter(r => dayjs(r.dueDate, "DD/MM/YYYY").isAfter(dayjs(startDate).subtract(1, "day")));
    }
    if (endDate) {
      rows = rows.filter(r => dayjs(r.dueDate, "DD/MM/YYYY").isBefore(dayjs(endDate).add(1, "day")));
    }

    return rows;
  }, [search, startDate, endDate]);

  return (
    <Paper sx={{ background: "transparent", boxShadow: "none" }}>
      {/* Toolbar */}
      <Toolbar sx={{ justifyContent: "space-between", py: 2, borderBottom: "1px solid #eee" }}>
        <TextField
          size="small"
          placeholder={tPage("searchPlaceholder") || "Search debtor or phone..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }}
          sx={{ width: 320, bgcolor: "white", borderRadius: 2 }}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <IconButton onClick={handleOpenFilter}>
            <FilterAltRoundedIcon />
            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: "bold" }}>Filter</Typography>
          </IconButton>

          <IconButton onClick={handleExportMenuOpen}>
            <CloudDownloadRoundedIcon />
            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: "bold" }}>Download</Typography>
          </IconButton>

          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={handleExportMenuClose}>
            <MenuItem onClick={() => { exportCSV(filteredRows); handleExportMenuClose(); }}>Export CSV</MenuItem>
            <MenuItem onClick={() => { exportPDF(filteredRows); handleExportMenuClose(); }}>Export PDF</MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Filter Popover */}
      <Popover open={Boolean(filterAnchor)} anchorEl={filterAnchor} onClose={handleCloseFilter}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Box sx={{ p: 3, width: 280 }}>
          <Typography fontWeight="bold" gutterBottom>Filter by Due Date</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="From" value={startDate} onChange={setStartDate} sx={{ mt: 2, width: "100%" }} />
            <DatePicker label="To" value={endDate} onChange={setEndDate} sx={{ mt: 2, width: "100%" }} />
          </LocalizationProvider>
          <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={() => { setStartDate(null); setEndDate(null); }}>
            Clear Filters
          </Button>
        </Box>
      </Popover>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 650, bgcolor: "white" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "#e3f2fd" }}>
              <TableCell>{tTable("no") || "No"}</TableCell>
              <TableCell>{tTable("debtorName") || "Debtor Name"}</TableCell>
              <TableCell>{tTable("contact") || "Contact"}</TableCell>
              <TableCell align="right">{tTable("totalDebt") || "Total Debt"}</TableCell>
              <TableCell align="right">{tTable("amountPaid") || "Paid"}</TableCell>
              <TableCell align="right">{tTable("remainingDebt") || "Remaining"}</TableCell>
              <TableCell>{tTable("dueDate") || "Due Date"}</TableCell>
              <TableCell>{tTable("isDebtCleared") || "Status"}</TableCell>
              <TableCell>{tTable("action") || "Actions"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.debtorName}</TableCell>
                <TableCell>{row.contact}</TableCell>
                <TableCell align="right">{row.totalDebt.toLocaleString()} FRW</TableCell>
                <TableCell align="right">{row.amountPaid.toLocaleString()} FRW</TableCell>
                <TableCell align="right" sx={{ color: row.remainingDebt > 0 ? "#d32f2f" : "green", fontWeight: "bold" }}>
                  {row.remainingDebt.toLocaleString()} FRW
                </TableCell>
                <TableCell>{row.dueDate}</TableCell>
                <TableCell>
                  {row.isDebtCleared ? (
                    <Typography color="success" fontWeight="bold">✓ Cleared</Typography>
                  ) : (
                    <Typography color="error" fontWeight="bold">Pending</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <DebtActionsMenu
                    rowId={row.id}
                    debtorName={row.debtorName}
                    contact={row.contact}
                    remainingDebt={row.remainingDebt}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DebtsTable;