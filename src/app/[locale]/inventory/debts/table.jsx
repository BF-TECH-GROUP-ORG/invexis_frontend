"use client";

import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Toolbar, IconButton, Typography, TextField, Box,
  Menu, MenuItem, ListItemIcon, ListItemText, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Popover,
  ToggleButton, ToggleButtonGroup, InputAdornment, Select,
  FormControl, InputLabel
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { recordRepayment, markDebtAsPaid, cancelDebt, getDebtHistory } from "@/services/debts";
import { getAllShops } from "@/services/shopService";
import { useSession } from "next-auth/react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// =======================================
// DataTable Component - Uses debts prop from parent
// =======================================

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
// REPAYMENT DIALOG (Beautiful Popup WITH API INTEGRATION)
// =======================================
const RepayDialog = ({ open, onClose, debt, t, onRepaymentSuccess }) => {
  const { data: session } = useSession();
  const [paymentMode, setPaymentMode] = useState("amount"); // "amount" or "phone"
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState(debt?.customer?.phone?.replace(/\s/g, "") || "");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const handleConfirm = () => {
    if (paymentMode === "amount") {
      // Build the repayment payload
      const repaymentPayload = {
        companyId: debt.companyId,
        shopId: debt.shopId,
        debtId: debt._id,
        customer: {
          name: debt.customer.name,
          phone: debt.customer.phone
        },
        amountPaid: parseInt(amount),
        paymentMethod: paymentMethod,
        paymentReference: `${paymentMethod}-${Date.now()}`,
        paidAt: new Date().toISOString(),
        createdBy: session?.user?._id || "temp-user-id"
      };

      // Call the mutation with the payload
      onRepaymentSuccess(repaymentPayload);
    } else {
      // Mobile money payment - would need additional integration
      alert(`MoMo payment request functionality coming soon for ${phone}`);
    }

    // Reset form and close
    onClose();
    setAmount("");
    setPaymentMode("amount");
    setPaymentMethod("CASH");
  };

  const isAmountValid = amount && parseInt(amount) > 0 && parseInt(amount) <= (debt?.balance || 0);
  const isPhoneValid = phone.length >= 12;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#FF6D00", color: "white", py: 2.5, fontWeight: "bold" }}>
        <PaymentIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: 28 }} />
        Repay Debt — {debt?.customer?.name}
      </DialogTitle>

      <DialogContent sx={{ pt: 4 }}>
        <Typography variant="body1" fontWeight="medium" gutterBottom>
          Remaining Amount: <strong style={{ color: "#d32f2f" }}>{debt?.balance?.toLocaleString() || 0} FRW</strong>
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
          <>
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
                amount && parseInt(amount) > (debt?.balance || 0)
                  ? "⚠️ Amount exceeds remaining debt"
                  : `Maximum: ${debt?.balance?.toLocaleString() || 0} FRW`
              }
              error={amount && parseInt(amount) > (debt?.balance || 0)}
              sx={{ mt: 1 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
                <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </>
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
const DebtActionsMenu = ({ debt, onRepaymentSuccess, onMarkAsPaid, onCancelDebt }) => {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("debtsPage");
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);

  const companyObj = session?.user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  // Prefetch debt history on hover
  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["debtHistory", debt._id],
      queryFn: () => getDebtHistory(companyId, debt._id),
      staleTime: 60000,
    });
  };

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onMouseEnter={handlePrefetch}
          onClick={() => { setAnchorEl(null); router.push(`/${locale}/inventory/debts/${debt._id}`); }}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t("actionView") || "View Details"}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { setRepayOpen(true); setAnchorEl(null); }}>
          <ListItemIcon><PaymentIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>{t("repay") || "Repay"}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { setMarkPaidDialogOpen(true); setAnchorEl(null); }}>
          <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>{t("markPayed") || "Mark as Paid"}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { setCancelDialogOpen(true); setAnchorEl(null); }}>
          <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t("cancelDebt") || "Cancel Debt"}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Cancel Debt Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle sx={{ bgcolor: "#d32f2f", color: "white", fontWeight: "bold" }}>
          <CancelIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Cancel This Debt?
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel this debt?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Debtor: <strong>{debt.customer?.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Remaining Balance: <strong style={{ color: "#d32f2f" }}>{debt.balance?.toLocaleString()} FRW</strong>
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: "600" }}>
            ⚠️ This action will mark the debt as CANCELLED and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setCancelDialogOpen(false)} variant="outlined">
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            onClick={() => {
              setCancelDialogOpen(false);
              onCancelDebt(debt._id, {
                companyId: debt.companyId,
                reason: "customer_requested",
                performedBy: session?.user?._id || "temp-user-id"
              });
            }}
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
          >
            {t("confirm") || "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark as Paid Confirmation Dialog */}
      <Dialog open={markPaidDialogOpen} onClose={() => setMarkPaidDialogOpen(false)}>
        <DialogTitle sx={{ bgcolor: "#2e7d32", color: "white", fontWeight: "bold" }}>
          <CheckIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Mark Debt as Paid?
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to mark this debt as fully paid?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Debtor: <strong>{debt.customer?.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Remaining Balance: <strong style={{ color: "#d32f2f" }}>{debt.balance?.toLocaleString()} FRW</strong>
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 2, fontStyle: "italic" }}>
            This will create a payment record for the remaining balance and mark the debt as PAID.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setMarkPaidDialogOpen(false)} variant="outlined">
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            onClick={() => {
              setMarkPaidDialogOpen(false);
              onMarkAsPaid(debt._id, {
                companyId: debt.companyId,
                paymentMethod: "CASH",
                paymentReference: `MARK-PAID-${Date.now()}`,
                createdBy: session?.user?._id || "temp-user-id"
              });
            }}
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
          >
            {t("confirm") || "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <RepayDialog
        open={repayOpen}
        onClose={() => setRepayOpen(false)}
        debt={debt}
        t={t}
        onRepaymentSuccess={onRepaymentSuccess}
      />
    </>
  );
};

// =======================================
// MAIN TABLE COMPONENT
// =======================================
const DebtsTable = ({ debts = [] }) => {
  const { data: session } = useSession();
  const tTable = useTranslations("Debtstable");
  const tPage = useTranslations("debtsPage");
  const queryClient = useQueryClient();

  const companyObj = session?.user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  // Fetch shops to resolve names
  const { data: shops = [] } = useQuery({
    queryKey: ["shops", companyId],
    queryFn: () => getAllShops(companyId),
    enabled: !!companyId
  });

  const shopMap = useMemo(() => {
    const map = {};
    shops.forEach(shop => {
      map[shop._id || shop.id] = shop.name;
    });
    return map;
  }, [shops]);

  const [search, setSearch] = useState("");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: "",
    error: null,
    pendingPayload: null
  });

  // Repayment mutation with Optimistic Updates
  const repaymentMutation = useMutation({
    mutationFn: recordRepayment,
    onMutate: async (newRepayment) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["debts", companyId] });

      // Snapshot the previous value
      const previousDebts = queryClient.getQueryData(["debts", companyId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["debts", companyId], (old) => {
        if (!old) return old;
        const items = Array.isArray(old) ? old : (old.items || []);
        const updatedItems = items.map((debt) => {
          if (debt._id === newRepayment.debtId) {
            const newBalance = debt.balance - newRepayment.amountPaid;
            return {
              ...debt,
              balance: newBalance,
              amountPaidNow: (debt.amountPaidNow || 0) + newRepayment.amountPaid,
              status: newBalance <= 0 ? "PAID" : "PARTIALLY_PAID",
            };
          }
          return debt;
        });
        return Array.isArray(old) ? updatedItems : { ...old, items: updatedItems };
      });

      return { previousDebts };
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value if mutation fails
      if (context?.previousDebts) {
        queryClient.setQueryData(["debts", companyId], context.previousDebts);
      }

      console.error("Repayment error:", error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to record payment. Please check your connection and try again.";

      setErrorDialog({
        open: true,
        message: errorMessage,
        error: error,
        pendingPayload: variables
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ["debts", companyId] });
    },
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Payment recorded successfully!",
        severity: "success"
      });
    },
  });

  const handleRepayment = async (repaymentPayload) => {
    await repaymentMutation.mutateAsync(repaymentPayload);
  };

  const handleRetryRepayment = () => {
    if (errorDialog.pendingPayload) {
      setErrorDialog({ open: false, message: "", error: null, pendingPayload: null });
      handleRepayment(errorDialog.pendingPayload);
    }
  };

  // Mark as Paid mutation with Optimistic Updates
  const markAsPaidMutation = useMutation({
    mutationFn: ({ debtId, payload }) => markDebtAsPaid(debtId, payload),
    onMutate: async ({ debtId }) => {
      await queryClient.cancelQueries({ queryKey: ["debts", companyId] });
      const previousDebts = queryClient.getQueryData(["debts", companyId]);

      queryClient.setQueryData(["debts", companyId], (old) => {
        if (!old) return old;
        const items = Array.isArray(old) ? old : (old.items || []);
        const updatedItems = items.map((debt) => {
          if (debt._id === debtId) {
            return {
              ...debt,
              balance: 0,
              status: "PAID",
            };
          }
          return debt;
        });
        return Array.isArray(old) ? updatedItems : { ...old, items: updatedItems };
      });

      return { previousDebts };
    },
    onError: (error, variables, context) => {
      if (context?.previousDebts) {
        queryClient.setQueryData(["debts", companyId], context.previousDebts);
      }
      console.error("Mark as paid error:", error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to mark debt as paid. Please try again.";

      setErrorDialog({
        open: true,
        message: errorMessage,
        error: error,
        pendingPayload: null
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", companyId] });
    },
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Debt marked as paid successfully!",
        severity: "success"
      });
    },
  });

  const handleMarkAsPaid = async (debtId, payload) => {
    await markAsPaidMutation.mutateAsync({ debtId, payload });
  };

  // Cancel Debt mutation with Optimistic Updates
  const cancelDebtMutation = useMutation({
    mutationFn: ({ debtId, payload }) => cancelDebt(debtId, payload),
    onMutate: async ({ debtId }) => {
      await queryClient.cancelQueries({ queryKey: ["debts", companyId] });
      const previousDebts = queryClient.getQueryData(["debts", companyId]);

      queryClient.setQueryData(["debts", companyId], (old) => {
        if (!old) return old;
        const items = Array.isArray(old) ? old : (old.items || []);
        const updatedItems = items.map((debt) => {
          if (debt._id === debtId) {
            return {
              ...debt,
              status: "CANCELLED",
            };
          }
          return debt;
        });
        return Array.isArray(old) ? updatedItems : { ...old, items: updatedItems };
      });

      return { previousDebts };
    },
    onError: (error, variables, context) => {
      if (context?.previousDebts) {
        queryClient.setQueryData(["debts", companyId], context.previousDebts);
      }
      console.error("Cancel debt error:", error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to cancel debt. Please try again.";

      setErrorDialog({
        open: true,
        message: errorMessage,
        error: error,
        pendingPayload: null
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", companyId] });
    },
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Debt cancelled successfully!",
        severity: "success"
      });
    },
  });

  const handleCancelDebt = async (debtId, payload) => {
    await cancelDebtMutation.mutateAsync({ debtId, payload });
  };

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
    let rows = debts;

    if (search) {
      rows = rows.filter(r =>
        r.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.customer?.phone?.includes(search)
      );
    }

    if (startDate) {
      rows = rows.filter(r => dayjs(r.dueDate).isAfter(dayjs(startDate).subtract(1, "day")));
    }
    if (endDate) {
      rows = rows.filter(r => dayjs(r.dueDate).isBefore(dayjs(endDate).add(1, "day")));
    }

    return rows;
  }, [search, startDate, endDate, debts]);

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
              <TableCell>Shop</TableCell>
              <TableCell align="right">{tTable("totalDebt") || "Total Debt"}</TableCell>
              <TableCell align="right">{tTable("amountPaid") || "Paid"}</TableCell>
              <TableCell align="right">{tTable("remainingDebt") || "Remaining"}</TableCell>
              <TableCell>{tTable("dueDate") || "Due Date"}</TableCell>
              <TableCell>{tTable("isDebtCleared") || "Status"}</TableCell>
              <TableCell>{tTable("action") || "Actions"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((debt) => (
              <TableRow key={debt._id} hover>
                <TableCell>{debt._id?.slice(-6)}</TableCell>
                <TableCell>{debt.customer?.name}</TableCell>
                <TableCell>{debt.customer?.phone}</TableCell>
                <TableCell>{shopMap[debt.shopId] || debt.shopId || "N/A"}</TableCell>
                <TableCell align="right">{debt.totalAmount?.toLocaleString()} FRW</TableCell>
                <TableCell align="right">{debt.amountPaidNow?.toLocaleString()} FRW</TableCell>
                <TableCell align="right" sx={{ color: debt.balance > 0 ? "#d32f2f" : "green", fontWeight: "bold" }}>
                  {debt.balance?.toLocaleString()} FRW
                </TableCell>
                <TableCell>{debt.dueDate ? dayjs(debt.dueDate).format("DD/MM/YYYY") : "N/A"}</TableCell>
                <TableCell>
                  <span
                  className={`px-2 py-1 rounded text-sm font-bold ${
                  debt.status === 'PAID'
                  ? 'bg-green-200 text-green-700 rounded-xl '
                  : debt.status === 'CANCELLED'
                  ? 'bg-red-200 text-red-700 rounded-xl'
                  : debt.status === 'PARTIALLY_PAID rounded-xl'
                   ? 'bg-yellow-200 text-yellow-700 rounded-xl' 
                   : 'bg-red-200 text-red-700 rounded-xl'
                   }`}
                  >
  {debt.status.replace('_', ' ')}
</span>
                </TableCell>
                <TableCell>
                  <DebtActionsMenu
                    debt={debt}
                    onRepaymentSuccess={handleRepayment}
                    onMarkAsPaid={handleMarkAsPaid}
                    onCancelDebt={handleCancelDebt}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Error Dialog */}
      <Dialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ open: false, message: "", error: null, pendingPayload: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#d32f2f", color: "white", display: "flex", alignItems: "center", gap: 1 }}>
          <CancelIcon />
          Payment Error
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            {errorDialog.message}
          </Typography>
          {errorDialog.error?.response?.status && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Status: {errorDialog.error.response.status}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setErrorDialog({ open: false, message: "", error: null, pendingPayload: null })}
            variant="outlined"
          >
            Close
          </Button>
          <Button
            onClick={handleRetryRepayment}
            variant="contained"
            sx={{ bgcolor: "#FF6D00", "&:hover": { bgcolor: "#E65100" } }}
          >
            Retry Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DebtsTable;