"use client";

import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Toolbar, IconButton, Typography, TextField, Box,
  Menu, MenuItem, ListItemIcon, ListItemText, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Popover,
  ToggleButton, ToggleButtonGroup, InputAdornment, Select,
  FormControl, InputLabel, TablePagination, Chip, Avatar, Stack, Divider
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

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { recordRepayment, markDebtAsPaid, cancelDebt, getDebtHistory } from "@/services/debts";
import { getAllShops } from "@/services/shopService";
import { useSession } from "next-auth/react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import PaymentMethodSelector from "@/components/forms/PaymentMethodSelector";
import { DEBT_PAYMENT_METHODS } from "@/constants/paymentMethods";

// =======================================
// DataTable Component - Uses debts prop from parent
// =======================================

// =======================================
// CONFIRM DIALOG (Cancel Debt / Mark as Paid)
// =======================================
export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, t, type = "error" }) => (
  <Dialog
    open={open}
    onClose={onCancel}
    PaperProps={{
      sx: {
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        width: "100%",
        maxWidth: "400px"
      }
    }}
  >
    <DialogTitle sx={{
      bgcolor: type === "error" ? "#d32f2f" : "#2e7d32",
      color: "white",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      py: 2.5
    }}>
      {type === "error" ? <CancelIcon /> : <CheckIcon />}
      {title}
    </DialogTitle>
    <DialogContent sx={{ pt: 3, pb: 2 }}>
      <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 500 }}>
        {message}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
      <Button
        onClick={onCancel}
        variant="outlined"
        sx={{
          borderRadius: "8px",
          color: "text.secondary",
          borderColor: "#E5E7EB",
          textTransform: "none",
          fontWeight: 600,
          px: 3,
          "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" }
        }}
      >
        {t("cancel") || "Cancel"}
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color={type === "error" ? "error" : "success"}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          px: 3,
          boxShadow: "none"
        }}
      >
        {t("confirm") || "Confirm"}
      </Button>
    </DialogActions>
  </Dialog>
);

// =======================================
// REPAY DIALOG (Premium Split Layout)
// =======================================
export const RepayDialog = ({ open, onClose, debt, t, onRepaymentSuccess }) => {
  const { data: session } = useSession();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [phone, setPhone] = useState("");
  const locale = useLocale();

  // Initialize phone when debt changes
  useEffect(() => {
    if (debt?.customer?.phone) {
      setPhone(debt.customer.phone.replace(/\s/g, ""));
    }
  }, [debt]);

  const handleConfirm = () => {
    const repaymentPayload = {
      companyId: debt.companyId,
      shopId: debt.shopId,
      debtId: debt._id,
      customer: {
        name: debt.customer?.name || "Unknown",
        phone: debt.customer?.phone || "N/A"
      },
      amountPaid: parseInt(amount),
      paymentMethod: paymentMethod,
      paymentReference: `${paymentMethod}-${Date.now()}`,
      paidAt: new Date().toISOString(),
      createdBy: session?.user?._id || "temp-user-id",
      paymentPhoneNumber: ["AIRTEL", "MTN", "MPESA"].includes(paymentMethod) ? phone : undefined
    };

    onRepaymentSuccess(repaymentPayload);
    onClose();
    setAmount("");
    setPaymentMethod("CASH");
  };

  const balance = debt?.balance || 0;
  const numAmount = parseInt(amount) || 0;
  const isOverpaid = numAmount > balance;
  const isAmountValid = numAmount > 0 && !isOverpaid;
  const isPhoneRequired = ["AIRTEL", "MTN", "MPESA"].includes(paymentMethod);
  const isPhoneValid = !isPhoneRequired || (phone && phone.length >= 10);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
          bgcolor: "#FFFFFF",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
          minHeight: { md: "500px" }
        }
      }}
    >
      {/* Left Side: Summary Panel */}
      <Box sx={{
        display: { xs: "none", md: "flex" },
        background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
        p: 4,
        flex: "0 0 35%",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "white"
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, letterSpacing: "-0.5px" }}>
            Record Repayment
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF", lineHeight: 1.6 }}>
            Process a payment for this debt. Ensure the amount and payment method are accurate.
          </Typography>
        </Box>

        <Box sx={{
          bgcolor: "rgba(255, 255, 255, 0.05)",
          p: 3,
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)"
        }}>
          <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", display: "block", mb: 1 }}>
            Remaining Balance
          </Typography>
          <Typography variant="h4" sx={{ color: "#FBBF24", fontWeight: 800, mb: 1.5 }}>
            {balance.toLocaleString()} FRW
          </Typography>
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }} />
          <Typography variant="body2" sx={{ color: "#D1D5DB" }}>
            Debtor: <strong>{debt?.customer?.name}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: "#D1D5DB" }}>
            Ref: <strong>{debt?._id?.slice(-6).toUpperCase()}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Right Side: Form Panel */}
      <DialogContent sx={{ p: { xs: 2.5, md: 5 }, display: "flex", flexDirection: "column" }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 600, mb: 1.2, textTransform: "uppercase", fontSize: "0.75rem" }}>
            Payment Details
          </Typography>
          <TextField
            autoFocus
            label="Amount to Pay"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            error={isOverpaid}
            helperText={isOverpaid ? `⚠️ Cannot exceed ${balance.toLocaleString()} FRW` : `Maximum: ${balance.toLocaleString()} FRW`}
            InputProps={{
              startAdornment: <InputAdornment position="start"><span style={{ color: "#6B7280", fontWeight: 600 }}>FRW</span></InputAdornment>,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                "& fieldset": { borderColor: isOverpaid ? "#EF4444" : "#E5E7EB" },
                "&.Mui-focused fieldset": { borderColor: isOverpaid ? "#EF4444" : "#FF6D00" }
              }
            }}
          />
        </Box>

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          phone={phone}
          onPhoneChange={setPhone}
          type="debt"
          compact={true}
        />

        <Box sx={{ mt: "auto", pt: { xs: 2.5, md: 4 }, display: "flex", gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: "10px", py: 1.5, textTransform: "none", fontWeight: 600, color: "text.secondary", borderColor: "#E5E7EB" }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            disabled={!isAmountValid || !isPhoneValid}
            onClick={handleConfirm}
            sx={{
              borderRadius: "10px",
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#FF6D00",
              boxShadow: "0 4px 14px rgba(255, 109, 0, 0.3)",
              "&:hover": { bgcolor: "#E65100", boxShadow: "0 6px 20px rgba(255, 109, 0, 0.4)" }
            }}
          >
            Authorize Payment
          </Button>
        </Box>
      </DialogContent>
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
      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel This Debt?"
        message={`Are you sure you want to cancel the debt for ${debt.customer?.name}? Remaining balance is ${debt.balance?.toLocaleString()} FRW.`}
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={() => {
          setCancelDialogOpen(false);
          onCancelDebt(debt._id, {
            companyId: debt.companyId,
            reason: "customer_requested",
            performedBy: session?.user?._id || "temp-user-id"
          });
        }}
        t={t}
        type="error"
      />

      {/* Mark as Paid Confirmation Dialog */}
      <ConfirmDialog
        open={markPaidDialogOpen}
        title="Mark Debt as Paid?"
        message={`This will record a final payment for the remaining ${debt.balance?.toLocaleString()} FRW and clear the debt for ${debt.customer?.name}.`}
        onCancel={() => setMarkPaidDialogOpen(false)}
        onConfirm={() => {
          setMarkPaidDialogOpen(false);
          onMarkAsPaid(debt._id, {
            companyId: debt.companyId,
            paymentMethod: "CASH",
            paymentReference: `MARK-PAID-${Date.now()}`,
            createdBy: session?.user?._id || "temp-user-id"
          });
        }}
        t={t}
        type="success"
      />

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
const DebtsTable = ({
  debts = [],
  workers = [],
  selectedWorkerId,
  setSelectedWorkerId,
  shops = [],
  selectedShopId,
  setSelectedShopId,
  isWorker
}) => {
  const { data: session } = useSession();
  const tTable = useTranslations("Debtstable");
  const tPage = useTranslations("debtsPage");
  const queryClient = useQueryClient();

  const companyObj = session?.user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  // Fetch shops to resolve names
  const { data: allShops = [], isLoading: isShopsLoading } = useQuery({
    queryKey: ["allShops", companyId],
    queryFn: () => getAllShops(companyId),
    enabled: !!companyId
  });

  const shopMap = useMemo(() => {
    const map = {};
    if (Array.isArray(allShops)) {
      allShops.forEach(shop => {
        if (shop) map[shop._id || shop.id] = shop.name;
      });
    }
    return map;
  }, [allShops]);

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

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Repayment mutation with Optimistic Updates
  const repaymentMutation = useMutation({
    mutationFn: recordRepayment,
    onMutate: async (newRepayment) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["debts", companyId, selectedWorkerId, selectedShopId] });

      // Snapshot the previous value
      const previousDebts = queryClient.getQueryData(["debts", companyId, selectedWorkerId, selectedShopId]);

      // Optimistically update — balance decreases instantly in the table
      queryClient.setQueryData(["debts", companyId, selectedWorkerId, selectedShopId], (old) => {
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
        queryClient.setQueryData(["debts", companyId, selectedWorkerId, selectedShopId], context.previousDebts);
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
      // Always refetch after error or success to sync with server
      queryClient.invalidateQueries({ queryKey: ["debts"] });
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
      await queryClient.cancelQueries({ queryKey: ["debts", companyId, selectedWorkerId, selectedShopId] });
      const previousDebts = queryClient.getQueryData(["debts", companyId, selectedWorkerId, selectedShopId]);

      // Optimistically mark the debt as PAID — balance goes to 0 instantly
      queryClient.setQueryData(["debts", companyId, selectedWorkerId, selectedShopId], (old) => {
        if (!old) return old;
        const items = Array.isArray(old) ? old : (old.items || []);
        const updatedItems = items.map((debt) => {
          if (debt._id === debtId) {
            return { ...debt, balance: 0, status: "PAID" };
          }
          return debt;
        });
        return Array.isArray(old) ? updatedItems : { ...old, items: updatedItems };
      });

      return { previousDebts };
    },
    onError: (error, variables, context) => {
      if (context?.previousDebts) {
        queryClient.setQueryData(["debts", companyId, selectedWorkerId, selectedShopId], context.previousDebts);
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
      queryClient.invalidateQueries({ queryKey: ["debts"] });
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
      await queryClient.cancelQueries({ queryKey: ["debts", companyId, selectedWorkerId, selectedShopId] });
      const previousDebts = queryClient.getQueryData(["debts", companyId, selectedWorkerId, selectedShopId]);

      // Optimistically mark as CANCELLED instantly
      queryClient.setQueryData(["debts", companyId, selectedWorkerId, selectedShopId], (old) => {
        if (!old) return old;
        const items = Array.isArray(old) ? old : (old.items || []);
        const updatedItems = items.map((debt) => {
          if (debt._id === debtId) {
            return { ...debt, status: "CANCELLED" };
          }
          return debt;
        });
        return Array.isArray(old) ? updatedItems : { ...old, items: updatedItems };
      });

      return { previousDebts };
    },
    onError: (error, variables, context) => {
      if (context?.previousDebts) {
        queryClient.setQueryData(["debts", companyId, selectedWorkerId, selectedShopId], context.previousDebts);
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
      queryClient.invalidateQueries({ queryKey: ["debts"] });
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

    // Client-side filtering removed as backend handles it.
    // Keeping search and date filters as they are local.

    return rows;
  }, [search, startDate, endDate, debts, selectedWorkerId, selectedShopId]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  return (
    <Paper sx={{
      width: "100%",
      overflowY: "auto",
      borderRadius: "16px",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      bgcolor: "white",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    }}>
      {/* Consolidated Header */}
      <Box sx={{
        p: 3,
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", md: "center" },
        gap: 2,
        bgcolor: "#fff"
      }}>
        {/* LEFT: Search & Action Icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", md: "auto" } }}>
          <TextField
            size="small"
            placeholder={tPage("searchPlaceholder") || "Search debtor or phone..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
            }}
            sx={{
              width: { xs: "100%", md: 320 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#f9fafb",
                "& fieldset": { borderColor: "#e5e7eb" },
                "&:hover fieldset": { borderColor: "#d1d5db" },
                "&.Mui-focused fieldset": { borderColor: "#FF6D00" }
              }
            }}
          />
          <IconButton
            onClick={handleOpenFilter}
            sx={{
              bgcolor: (startDate || endDate) ? "#FFF3E0" : "#f3f4f6",
              color: (startDate || endDate) ? "#FF6D00" : "#4b5563",
              borderRadius: "8px",
              p: 1,
              "&:hover": { bgcolor: (startDate || endDate) ? "#FFE0B2" : "#e5e7eb" }
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
              "&:hover": { bgcolor: "#e5e7eb" }
            }}
          >
            <CloudDownloadRoundedIcon />
          </IconButton>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={handleExportMenuClose}>
            <MenuItem onClick={() => { exportCSV(filteredRows); handleExportMenuClose(); }}>Export CSV</MenuItem>
            <MenuItem onClick={() => { exportPDF(filteredRows); handleExportMenuClose(); }}>Export PDF</MenuItem>
          </Menu>
        </Box>

        {/* RIGHT: Dropdown Filters */}
        {!isWorker && (
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" }, gap: 2, width: { xs: "100%", md: "auto" } }}>
            <FormControl variant="outlined" size="small" sx={{
              minWidth: { xs: "100%", md: 200 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#f9fafb",
              }
            }}>
              <InputLabel id="worker-filter-label">Filter by Worker</InputLabel>
              <Select
                labelId="worker-filter-label"
                value={selectedWorkerId}
                label="Filter by Worker"
                onChange={(e) => setSelectedWorkerId(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Workers</em>
                </MenuItem>
                {workers.map((worker) => (
                  <MenuItem key={worker._id || worker.id} value={worker._id || worker.id}>
                    {worker.name || worker.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{
              minWidth: { xs: "100%", md: 200 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#f9fafb",
              }
            }}>
              <InputLabel id="shop-filter-label">Filter by Shop</InputLabel>
              <Select
                labelId="shop-filter-label"
                value={selectedShopId}
                label="Filter by Shop"
                onChange={(e) => setSelectedShopId(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Shops</em>
                </MenuItem>
                {shops.map((shop) => (
                  <MenuItem key={shop.id || shop._id} value={shop.id || shop._id}>
                    {shop.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

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
      <TableContainer sx={{
        maxHeight: 800,
        width: '100%',
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#e5e7eb',
          borderRadius: '10px',
        },
      }}>
        <Table stickyHeader sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable("no") || "No"}</TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable("debtorName") || "Debtor Name"}</TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable("contact") || "Contact"}</TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>Shop</TableCell>
              <TableCell align="right" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable("totalDebt") || "Total Debt"}</TableCell>
              <TableCell align="right" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable("amountPaid") || "Paid"}</TableCell>
              <TableCell align="right" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable("remainingDebt") || "Remaining"}</TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable("dueDate") || "Due Date"}</TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable("isDebtCleared") || "Status"}</TableCell>
              <TableCell align="center" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable("action") || "Actions"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((debt) => {
              const debtorName = debt.customer?.name || debt.knownUser?.customerName || "Unknown";
              const debtorPhone = debt.customer?.phone || debt.knownUser?.customerPhone || "N/A";
              const debtId = debt._id || debt.saleId || "N/A";
              const displayId = typeof debtId === 'string' ? debtId.slice(-6) : debtId;
              const status = (debt.status || "PENDING").toUpperCase();
              const balance = parseFloat(debt.balance || 0);
              const totalAmount = parseFloat(debt.totalAmount || 0);
              const amountPaidNow = parseFloat(debt.amountPaidNow || 0);

              return (
                <TableRow
                  key={debtId}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#f9fafb" },
                    transition: "all 0.2s ease",
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="primary">
                      #{displayId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "orange.50",
                          color: "orange.500",
                          fontSize: "0.875rem"
                        }}
                      >
                        {debtorName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight="500">
                        {debtorName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {debtorPhone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {(() => {
                        const sId = typeof debt.shopId === 'object' && debt.shopId ? (debt.shopId._id || debt.shopId.id) : debt.shopId;
                        const sName = typeof debt.shopId === 'object' && debt.shopId?.name ? debt.shopId.name : null;
                        if (isShopsLoading && !sName) return "Loading...";
                        return shopMap[sId] || sName || sId || "N/A";
                      })()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {totalAmount.toLocaleString()} FRW
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="success.main">
                      {amountPaidNow.toLocaleString()} FRW
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: balance > 0 ? "error.main" : "success.main", fontWeight: "700" }}>
                      {balance.toLocaleString()} FRW
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {debt.dueDate ? dayjs(debt.dueDate).format("DD/MM/YYYY") : "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {status === 'PAID' && (
                      <Chip label="Paid" size="small" sx={{ bgcolor: "#ECFDF5", color: "#059669", fontWeight: 600, fontSize: "0.75rem" }} />
                    )}
                    {status === 'CANCELLED' && (
                      <Chip label="Cancelled" size="small" sx={{ bgcolor: "#FEF2F2", color: "#DC2626", fontWeight: 600, fontSize: "0.75rem" }} />
                    )}
                    {status === 'PARTIALLY_PAID' && (
                      <Chip label="Partial" size="small" sx={{ bgcolor: "#FEF3C7", color: "#D97706", fontWeight: 600, fontSize: "0.75rem" }} />
                    )}
                    {(status === 'PENDING' || !['PAID', 'CANCELLED', 'PARTIALLY_PAID'].includes(status)) && (
                      <Chip label="Pending" size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: "0.75rem" }} />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <DebtActionsMenu
                      debt={{
                        ...debt,
                        _id: debtId,
                        customer: { name: debtorName, phone: debtorPhone },
                        balance: balance
                      }}
                      onRepaymentSuccess={handleRepayment}
                      onMarkAsPaid={handleMarkAsPaid}
                      onCancelDebt={handleCancelDebt}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-4 border border-gray-200 mt-0 bg-white">
        <Typography variant="body2" color="text.secondary">
          Showing {filteredRows.length > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, filteredRows.length)} of {filteredRows.length} results
        </Typography>
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15]}
          sx={{
            border: "none",
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              margin: 0,
              display: { xs: 'none', sm: 'block' }
            },
            '.MuiTablePagination-toolbar': {
              minHeight: 'auto',
              padding: 0
            }
          }}
        />
      </div>

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