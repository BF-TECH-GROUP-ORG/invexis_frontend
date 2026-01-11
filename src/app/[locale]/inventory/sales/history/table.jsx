"use client";
import { useRouter } from "next/navigation";
import { Coins, TrendingUp, Undo2, Percent } from "lucide-react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, IconButton, Typography, TextField, Box, Menu, MenuItem, ListItemIcon, ListItemText, Popover, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, CircularProgress, Checkbox, Autocomplete, TablePagination, Chip, Avatar, Stack
} from "@mui/material";
import { useLocale } from "next-intl";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { deleteSale, getSingleSale, createReturn } from "@/services/salesService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { InputAdornment } from "@mui/material";
import { HiSearch } from "react-icons/hi";
import Skeleton from "@/components/shared/Skeleton";

// Placeholder for rows, will be managed by state in DataTable
const rows = [];

// Small local confirmation dialog to avoid external prop mismatches
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => (
  <Dialog
    open={open}
    onClose={onCancel}
    PaperProps={{
      sx: {
        borderRadius: 3,
        p: 1,
        minWidth: 320
      }
    }}
  >
    <DialogTitle sx={{ fontWeight: 700, color: "#111827" }}>{title || "Confirm"}</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary">{message || "Are you sure?"}</Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2, gap: 1 }}>
      <Button
        onClick={onCancel}
        variant="outlined"
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          borderColor: "#e5e7eb",
          color: "#374151",
          "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" }
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": { boxShadow: "none", bgcolor: "#dc2626" }
        }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

// ----------------------------------------------------------------------
// Return Modal Component
// ----------------------------------------------------------------------

const ReturnModal = ({ open, onClose, saleId, companyId, selectedWorkerId, selectedShopId }) => {
  const t = useTranslations("sales");
  const [selectedItems, setSelectedItems] = useState({});
  const [returnReason, setReturnReason] = useState("");
  const [submitError, setSubmitError] = useState("");
  const queryClient = useQueryClient();

  const { data: sale, isLoading } = useQuery({
    queryKey: ["sale", saleId],
    queryFn: () => getSingleSale(saleId),
    enabled: !!saleId && open,
  });

  const returnMutation = useMutation({
    mutationFn: createReturn,
    onMutate: async (payload) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({
        queryKey: ["salesHistory", companyId, selectedWorkerId, selectedShopId],
      });

      // Return context for rollback
      return {
        previousSales: queryClient.getQueryData([
          "salesHistory",
          companyId,
          selectedWorkerId,
          selectedShopId,
        ]),
      };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["salesHistory", companyId],
      });
      onClose();
      setSelectedItems({});
      setReturnReason("");
    },
    onError: (err, payload, context) => {
      // Rollback on error if needed
      if (context?.previousSales) {
        queryClient.setQueryData(
          ["salesHistory", companyId, selectedWorkerId, selectedShopId],
          context.previousSales
        );
      }
      setSubmitError(err.message || "Failed to create return");
    },
  });

  const handleCheckboxChange = (item) => {
    if (selectedItems[item.saleItemId]) {
      const newItems = { ...selectedItems };
      delete newItems[item.saleItemId];
      setSelectedItems(newItems);
    } else {
      setSelectedItems({
        ...selectedItems,
        [item.saleItemId]: {
          productId: item.productId,
          quantity: 1,
          maxQuantity: item.quantity,
          unitPrice: item.unitPrice,
          productName: item.productName,
        },
      });
    }
  };

  const handleQuantityChange = (saleItemId, newQty) => {
    const qty = parseInt(newQty) || 0;
    const item = selectedItems[saleItemId];
    if (!item) return;
    if (qty < 1) return;
    if (qty > item.maxQuantity) return;

    setSelectedItems({
      ...selectedItems,
      [saleItemId]: {
        ...item,
        quantity: qty,
      },
    });
  };

  const totalRefundAmount = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, item) => {
      return sum + item.quantity * parseFloat(item.unitPrice);
    }, 0);
  }, [selectedItems]);

  const handleSubmit = () => {
    if (Object.keys(selectedItems).length === 0) {
      setSubmitError("Please select at least one item to return.");
      return;
    }

    const items = Object.values(selectedItems).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      refundAmount: item.quantity * parseFloat(item.unitPrice),
    }));

    const payload = {
      saleId: saleId,
      reason: returnReason,
      refundAmount: totalRefundAmount,
      items,
    };

    returnMutation.mutate(payload);
  };

  // Reset state when modal closes or opens
  useEffect(() => {
    if (open) {
      setSelectedItems({});
      setReturnReason("");
      setSubmitError("");
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden" }
      }}
    >
      <DialogTitle sx={{
        bgcolor: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
        px: 3,
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Typography variant="h6" fontWeight="700">Return Products - Sale #{saleId}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress size={40} thickness={4} sx={{ color: "#FF6D00" }} />
          </Box>
        ) : sale ? (
          <Box sx={{ mt: 1 }}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, color: "#374151" }}>
              Select Items to Return
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{
              mb: 3,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              boxShadow: "none",
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
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fafb" }}>
                    <TableCell padding="checkbox">Select</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sold Qty</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Return Qty</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Refund Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items.map((item) => {
                    const isSelected = !!selectedItems[item.saleItemId];
                    const selectedItem = selectedItems[item.saleItemId];

                    return (
                      <TableRow key={item.saleItemId} selected={isSelected} sx={{ "&.Mui-selected": { bgcolor: "#FFF3E0" } }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleCheckboxChange(item)}
                            sx={{ color: "#d1d5db", "&.Mui-checked": { color: "#FF6D00" } }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">{item.productName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>{item.productId}</Typography>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            disabled={!isSelected}
                            value={selectedItem ? selectedItem.quantity : ""}
                            onChange={(e) => handleQuantityChange(item.saleItemId, e.target.value)}
                            inputProps={{ min: 1, max: item.quantity }}
                            sx={{
                              width: 80,
                              "& .MuiOutlinedInput-root": { borderRadius: "6px" }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: isSelected ? "#E65100" : "inherit" }}>
                          {isSelected
                            ? (selectedItem.quantity * parseFloat(item.unitPrice)).toLocaleString()
                            : "0"}{" "}
                          FRW
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TextField
              label="Reason for Return (Optional)"
              multiline
              rows={2}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              fullWidth
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": { borderRadius: "8px" }
              }}
            />

            <Box sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              p: 2,
              bgcolor: "#f9fafb",
              borderRadius: 2
            }}>
              <Typography variant="h6" fontWeight="800" color="primary">
                Total Refund: {totalRefundAmount.toLocaleString()} FRW
              </Typography>
            </Box>
          </Box>
        ) : (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>Sale not found</Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e7eb" }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 600, color: "#6b7280" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "#FF6D00",
            "&:hover": { bgcolor: "#E65100" },
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            borderRadius: "8px",
            boxShadow: "none"
          }}
          disabled={returnMutation.isPending || isLoading}
        >
          {returnMutation.isPending ? "Processing..." : "Confirm Return"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Custom Component for the Action Menu (RowActionsMenu)
// onDeleteRequest should be a curried function: (id) => (open:boolean) => void
const RowActionsMenu = ({ rowId, productId, onRedirect, onDeleteRequest, onReturnRequest }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const t = useTranslations("sales");

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = (event) => {
    event.stopPropagation();
    onRedirect(rowId, productId);
    handleClose();
  };

  const navigate = useRouter();
  const locale = useLocale();
  const handleEdit = (event) => {
    event.stopPropagation();
    navigate.push(`/${locale}/inventory/sales/history/${rowId}/${rowId}`);
    handleClose();
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleClose();
    if (typeof onDeleteRequest === "function") {
      onDeleteRequest(rowId)(true); // open modal for this id
    }
  };

  const handleReturn = (event) => {
    event.stopPropagation();
    handleClose();
    if (onReturnRequest) {
      onReturnRequest(rowId);
    }
  };

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
          sx: {
            padding: 0,
            "& .MuiMenuItem-root": {
              paddingY: 1,
            },
          },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            color: "#333",
            minWidth: 160,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
          },
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon><VisibilityIcon sx={{ color: "#333" }} /></ListItemIcon>
          <ListItemText primary={`${t('view')}`} />
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon><EditIcon sx={{ color: "#333" }} /></ListItemIcon>
          <ListItemText primary={`${t('Edit')}`} />
        </MenuItem>
        <MenuItem onClick={handleReturn}>
          <ListItemIcon><Undo2 sx={{ color: "#333" }} size={20} /></ListItemIcon>
          <ListItemText primary="Return" />
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon><DeleteIcon sx={{ color: "error.main" }} /></ListItemIcon>
          <ListItemText primary={`${t('Delete')}`} />
        </MenuItem>
      </Menu>
    </>
  );
};

// ----------------------------------------------------------------------
// Custom Component for the Filter Popover (FilterPopover)
// ----------------------------------------------------------------------

const FilterPopover = ({ anchorEl, onClose, onFilterChange, currentFilter, rows }) => {
  const open = Boolean(anchorEl);
  const [filterCriteria, setFilterCriteria] = useState(currentFilter);

  useEffect(() => {
    setFilterCriteria(currentFilter);
  }, [currentFilter]);

  const uniqueCategories = useMemo(() => {
    const categories = rows.map(row => row.Category);
    return ["", ...new Set(categories)];
  }, []);

  const availableColumns = [
    { label: 'Category', value: 'Category', type: 'text' },
    { label: 'Unit Price (FRW)', value: 'UnitPrice', type: 'number' },
    { label: 'Status', value: 'Status', type: 'status' },
  ];

  const statusOptions = ['Debt', 'Transfer', 'Returned', 'Completed'];

  const getOperators = (columnType) => {
    if (columnType === 'number') {
      return [
        { label: 'is greater than', value: '>' },
        { label: 'is less than', value: '<' },
        { label: 'equals', value: '==' },
      ];
    }
    if (columnType === 'status') {
      return [{ label: 'is', value: '==' }];
    }
    return [
      { label: 'contains', value: 'contains' },
      { label: 'equals', value: '==' },
    ];
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    let newCriteria = { ...filterCriteria, [name]: value };

    if (name === 'column') {
      const newColumnType = availableColumns.find(col => col.value === value)?.type || 'text';
      newCriteria = {
        ...newCriteria,
        operator: getOperators(newColumnType)[0].value,
        value: '',
      };
    }

    setFilterCriteria(newCriteria);
    onFilterChange(newCriteria);
  };

  const handleValueChange = (event) => {
    const { value } = event.target;
    const newCriteria = { ...filterCriteria, value };

    setFilterCriteria(newCriteria);
    onFilterChange(newCriteria);
  };

  const handleClearFilter = () => {
    const defaultFilter = { column: 'Category', operator: 'contains', value: '' };
    onFilterChange(defaultFilter);
    setFilterCriteria(defaultFilter);
    onClose();
  };

  const selectedColumnType = availableColumns.find(
    col => col.value === filterCriteria.column
  )?.type || 'text';

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          padding: 3,
          borderRadius: 3,
          boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
          background: '#fff',
          minWidth: { xs: "100%", sm: 500 },
          mt: 1,
        }
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight="700">Filter Sales</Typography>
        <IconButton onClick={handleClearFilter} size="small"><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: { xs: "stretch", sm: "center" } }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Column</InputLabel>
          <Select
            label="Column"
            name="column"
            value={filterCriteria.column}
            onChange={handleSelectChange}
            sx={{ borderRadius: "8px" }}
          >
            {availableColumns.map(col => (
              <MenuItem key={col.value} value={col.value}>{col.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Operator</InputLabel>
          <Select
            label="Operator"
            name="operator"
            value={filterCriteria.operator}
            onChange={handleSelectChange}
            sx={{ borderRadius: "8px" }}
          >
            {getOperators(selectedColumnType).map(op => (
              <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }}>
          {selectedColumnType === 'number' ? (
            <TextField
              size="small"
              variant="outlined"
              name="value"
              value={filterCriteria.value}
              onChange={handleValueChange}
              type="number"
              fullWidth
              label="Amount"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
          ) : selectedColumnType === 'status' ? (
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="value"
                value={filterCriteria.value}
                onChange={handleValueChange}
                sx={{ borderRadius: "8px" }}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel>Value</InputLabel>
              <Select
                label="Value"
                name="value"
                value={filterCriteria.value}
                onChange={handleValueChange}
                sx={{ borderRadius: "8px" }}
              >
                {uniqueCategories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat || "All Categories"}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 1 }}>
        <Button
          onClick={handleClearFilter}
          variant="outlined"
          size="small"
          sx={{ borderRadius: "6px", textTransform: "none" }}
        >
          Clear
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          size="small"
          sx={{ borderRadius: "6px", textTransform: "none", bgcolor: "#FF6D00", "&:hover": { bgcolor: "#E65100" } }}
        >
          Apply
        </Button>
      </Box>
    </Popover>
  );
};

// ----------------------------------------------------------------------
// Main DataTable Component
// ----------------------------------------------------------------------

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { useSession } from "next-auth/react";

const DataTable = ({
  salesData,
  workers = [],
  selectedWorkerId,
  setSelectedWorkerId,
  shops = [],
  selectedShopId,
  setSelectedShopId,
  isWorker,
  isLoading: isSalesLoading
}) => {
  const t = useTranslations("sales");
  const navigation = useRouter();
  const [search, setSearch] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const companyObj = session?.user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  console.log("Sales Table Debug:", {
    sessionUser: session?.user,
    companyObj,
    companyId,
    typeOfCompanyObj: typeof companyObj
  });

  // Get current month and year for default filtering
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  const rows = useMemo(() => {
    if (!salesData || !Array.isArray(salesData)) return [];
    return salesData.map((sale) => {
      const items = sale.items || [];
      const firstItem = items[0] || {};

      return {
        id: sale.saleId,
        productId: firstItem.productId || null,
        ProductName: firstItem.productName || "Unknown",
        isDebt: sale.isDebt,
        Category: sale.isTransfer,
        UnitPrice: firstItem.unitPrice || 0,
        SoldQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        originalQuantity: items.reduce((sum, item) => sum + (item.originalQuantity || 0), 0),
        returned: `${sale.isReturned}`,
        returnedValue: items.reduce((sum, item) => sum + (item.returnedQuantity || 0), 0),
        Discount: sale.discountTotal || 0,
        Date: sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "N/A",
        rawDate: sale.createdAt,
        TotalValue: sale.totalAmount || 0,
        shopId: sale.shopId,
        soldBy: sale.soldBy,
        ShopName: shops.find(s => (s._id || s.id) === sale.shopId)?.name || "N/A",
        action: "more"
      };
    });
  }, [salesData, shops]);

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: (saleId) => deleteSale(saleId),
    onMutate: async (saleId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["salesHistory", companyId, selectedWorkerId, selectedShopId],
      });

      // Snapshot the previous value
      const previousSales = queryClient.getQueryData([
        "salesHistory",
        companyId,
        selectedWorkerId,
        selectedShopId,
      ]);

      // Optimistically update to the new value
      if (previousSales) {
        queryClient.setQueryData(
          ["salesHistory", companyId, selectedWorkerId, selectedShopId],
          previousSales.filter((sale) => sale.saleId !== saleId)
        );
      }

      // Return a context object with the snapshotted value
      return { previousSales };
    },
    onSuccess: () => {
      // Success - the optimistic update stays
      queryClient.invalidateQueries({
        queryKey: ["salesHistory", companyId],
      });
      console.log("Sale deleted successfully with optimistic update");
    },
    onError: (error, saleId, context) => {
      // Rollback to previous value on error
      if (context?.previousSales) {
        queryClient.setQueryData(
          ["salesHistory", companyId, selectedWorkerId, selectedShopId],
          context.previousSales
        );
      }
      console.error("Failed to delete sale:", error);
      alert("Failed to delete sale. Please try again.");
    },
  });

  // Set default filter to current month
  const [activeFilter, setActiveFilter] = useState({
    column: 'UnitPrice',
    operator: '>',
    value: '',
  });

  const [selectedMonth, setSelectedMonth] = useState(`${currentYear}-${String(currentMonth).padStart(2, '0')}`);
  const [selectedYear, setSelectedYear] = useState(currentYear);

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


  // Delete modal state owned by DataTable
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [returnModal, setReturnModal] = useState({ open: false, id: null });

  // Curried toggler: (id) => (open) => void
  const toggleDeleteModalFor = (id) => (open) => {
    setDeleteModal({ open: Boolean(open), id: open ? id : null });
  };

  const handleOpenReturnModal = (id) => {
    setReturnModal({ open: true, id });
  };

  const handleCloseReturnModal = () => {
    setReturnModal({ open: false, id: null });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.id) {
      try {
        await deleteMutation.mutateAsync(deleteModal.id);
        setDeleteModal({ open: false, id: null });
      } catch (error) {
        // Error already handled in onError
        setDeleteModal({ open: false, id: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ open: false, id: null });
  };
  const locale = useLocale();

  const handleRedirectToSlug = (saleId, productId) => {
    navigation.push(`/${locale}/inventory/sales/history/${saleId}`);
  };

  const handleOpenFilter = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleExportMenuOpen = (event) => {
    setExportAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportAnchor(null);
  };

  // Export Functions
  const exportCSV = (rows) => {
    let csv = "Sale ID,Product Name,Shop,Status,Unit Price (FRW),Original Qty,Sold Qty,Returned Qty,Discount,Date,Total Value (FRW)\n";
    rows.forEach(r => {
      let status = "Completed";
      if (r.isDebt) status = "Debt";
      else if (r.Category) status = "Transfer";
      else if (r.returned !== "false") status = "Returned";

      csv += `${r.id},${r.ProductName},${r.ShopName},${status},${r.UnitPrice},${r.originalQuantity},${r.SoldQuantity},${r.returnedValue},${r.Discount},${r.Date},${r.TotalValue}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sales_export.csv";
    link.click();
  };

  const exportPDF = (rows) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor("#FF6D00");
    doc.text("INVEXIS", 180, 15, { align: "right" });
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Sales Report", 14, 20);

    const tableColumn = ["Sale ID", "Product", "Shop", "Status", "Unit Price", "Orig Qty", "Sold Qty", "Ret Qty", "Discount", "Date", "Total"];
    const tableRows = rows.map(r => {
      let status = "Completed";
      if (r.isDebt) status = "Debt";
      else if (r.Category) status = "Transfer";
      else if (r.returned !== "false") status = "Returned";

      return [
        r.id,
        r.ProductName,
        r.ShopName,
        status,
        r.UnitPrice.toLocaleString(),
        r.originalQuantity,
        r.SoldQuantity,
        r.returnedValue,
        r.Discount,
        r.Date,
        r.TotalValue.toLocaleString()
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: "#FF6D00", textColor: 255 },
      alternateRowStyles: { fillColor: [255, 243, 230] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 } // Smaller font to fit more columns
    });

    doc.save("sales_report.pdf");
  };

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
  };

  const filteredRows = useMemo(() => {
    let currentRows = rows;

    // Filter by selected month (default: current month)
    if (selectedMonth) {
      currentRows = currentRows.filter((row) => {
        const rowDate = new Date(row.rawDate);
        const rowMonth = rowDate.getMonth() + 1;
        const rowYear = rowDate.getFullYear();
        const [filterYear, filterMonth] = selectedMonth.split('-').map(Number);
        return rowMonth === filterMonth && rowYear === filterYear;
      });
    }

    // Search filter
    if (search) {
      currentRows = currentRows.filter((row) =>
        row.ProductName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Advanced filter
    const { column, operator, value } = activeFilter;

    if (column && value) {
      if (column === 'UnitPrice') {
        const numValue = Number(value);
        if (isNaN(numValue)) return currentRows;

        currentRows = currentRows.filter((row) => {
          const rowPrice = row.UnitPrice;
          if (operator === '>') return rowPrice > numValue;
          if (operator === '<') return rowPrice < numValue;
          if (operator === '==') return rowPrice === numValue;
          return true;
        });
      } else if (column === 'Category') {
        currentRows = currentRows.filter((row) => {
          const rowValue = String(row[column]).toLowerCase();
          const filterValue = String(value).toLowerCase();

          if (operator === 'contains') return rowValue.includes(filterValue);
          if (operator === '==') return rowValue === filterValue;
          return true;
        });
      } else if (column === 'Status') {
        currentRows = currentRows.filter((row) => {
          if (value === 'Debt') return row.isDebt;
          if (value === 'Transfer') return !!row.Category;
          if (value === 'Returned') return row.returned !== "false";
          if (value === 'Completed') return !row.isDebt && !row.Category && row.returned === "false";
          return true;
        });
      }
    }

    // Client-side fallback for Worker and Shop filters
    if (selectedWorkerId) {
      currentRows = currentRows.filter(row => row.soldBy === selectedWorkerId);
    }

    if (selectedShopId) {
      currentRows = currentRows.filter(row => row.shopId === selectedShopId);
    }

    return currentRows;
  }, [search, activeFilter, rows, selectedMonth, selectedWorkerId, selectedShopId]);

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
      <FilterPopover
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        onFilterChange={handleFilterChange}
        currentFilter={activeFilter}
        rows={rows}
      />

      <ConfirmDialog
        open={deleteModal.open}
        title="Delete sale"
        message={deleteModal.id ? `Are you sure you want to delete sale #${deleteModal.id}?` : "Are you sure?"}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ReturnModal
        open={returnModal.open}
        onClose={handleCloseReturnModal}
        saleId={returnModal.id}
        companyId={companyId}
        selectedWorkerId={selectedWorkerId}
        selectedShopId={selectedShopId}
      />

      {/* Consolidated Header */}
      <Box sx={{
        p: 3,
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        bgcolor: "#fff"
      }}>
        {/* Top Row: Title & Search */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: "#111827", letterSpacing: "-0.5px" }}>
                {t("stockOutHistory")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                View and manage all past sales transactions, returns, and debts.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", md: "auto" } }}>
            <TextField
              size="small"
              placeholder="Search sales..."
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
                bgcolor: activeFilter.value ? "#FFF3E0" : "#f3f4f6",
                color: activeFilter.value ? "#FF6D00" : "#4b5563",
                borderRadius: "8px",
                p: 1,
                "&:hover": { bgcolor: activeFilter.value ? "#FFE0B2" : "#e5e7eb" }
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
        </Box>

        {/* Bottom Row: Filters & Date Selector */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" }, gap: 2, width: { xs: "100%", md: "auto" } }}>
            {!isWorker && (
              <>
                <Autocomplete
                  size="small"
                  sx={{
                    minWidth: { xs: "100%", md: 250 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#f9fafb",
                    }
                  }}
                  options={workers}
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName} (${option.username})`
                  }
                  value={workers.find((w) => (w._id || w.id) === selectedWorkerId) || null}
                  onChange={(event, newValue) => {
                    setSelectedWorkerId(newValue ? (newValue._id || newValue.id) : "");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Filter by Worker" variant="outlined" />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    (option._id || option.id) === (value._id || value.id)
                  }
                />

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
                    <MenuItem value="">All Shops</MenuItem>
                    {shops.map((shop) => (
                      <MenuItem key={shop._id || shop.id} value={shop._id || shop.id}>
                        {shop.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              type="month"
              size="small"
              label="Select Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f9fafb",
                }
              }}
            />
          </Box>
        </Box>
      </Box>

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
        <Table stickyHeader sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                {t("sale")}
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                {t("productName")}
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                Shop
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                Status
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                {t("unitPrice")} (FRW)
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                Original Qty
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                Sold Qty
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                Returned Qty
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                {t("Discount")}
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                {t("date")}
              </TableCell>
              <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                {t("totalValue")}
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                {t("action")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isSalesLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : (
              paginatedRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#f9fafb" },
                    transition: "all 0.2s ease",
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="primary">
                      #{row.id}
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
                        {row.ProductName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight="500">
                        {row.ProductName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.ShopName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {row.isDebt && (
                        <Chip
                          label="Debt"
                          size="small"
                          sx={{ bgcolor: "#FEF2F2", color: "#DC2626", fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      )}
                      {row.Category && (
                        <Chip
                          label="Transfer"
                          size="small"
                          sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      )}
                      {row.returned !== "false" && (
                        <Chip
                          label="Returned"
                          size="small"
                          sx={{ bgcolor: "#F5F3FF", color: "#7C3AED", fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      )}
                      {!row.isDebt && !row.Category && row.returned === "false" && (
                        <Chip
                          label="Completed"
                          size="small"
                          sx={{ bgcolor: "#ECFDF5", color: "#059669", fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {row.UnitPrice.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.originalQuantity}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.SoldQuantity}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: row.returnedValue > 0 ? "error.main" : "inherit", fontWeight: row.returnedValue > 0 ? 700 : 400 }}>
                      {row.returnedValue}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={row.Discount > 0 ? "error" : "text.secondary"}>
                      {row.Discount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.Date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="700" color="primary">
                      {row.TotalValue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <RowActionsMenu
                      rowId={row.id}
                      productId={row.productId}
                      onRedirect={handleRedirectToSlug}
                      onDeleteRequest={toggleDeleteModalFor}
                      onReturnRequest={handleOpenReturnModal}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 mt-0 bg-white border-x border-b border-gray-200">
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
    </Paper>
  );
};

// ----------------------------------------------------------------------
// MultiProductSalesTable Component
// ----------------------------------------------------------------------

export const MultiProductSalesTable = ({ products = [], onSell }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [priceModal, setPriceModal] = useState({ open: false, product: null });
  const [tempPrice, setTempPrice] = useState("");
  const [priceError, setPriceError] = useState("");

  // Handle checkbox toggle
  const handleCheckboxChange = (product) => {
    const productId = product.id;

    if (selectedItems[productId]) {
      // Remove from selection
      const newItems = { ...selectedItems };
      delete newItems[productId];
      setSelectedItems(newItems);
    } else {
      // Add to selection with defaults
      setSelectedItems({
        ...selectedItems,
        [productId]: {
          productId,
          name: product.ProductName,
          qty: 1,
          minPrice: product.Price,
          price: product.Price
        }
      });
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId, newQty) => {
    const qty = Math.max(1, parseInt(newQty) || 1);
    setSelectedItems({
      ...selectedItems,
      [productId]: {
        ...selectedItems[productId],
        qty
      }
    });
  };

  // Open price modal
  const handleOpenPriceModal = (product) => {
    const item = selectedItems[product.id];
    setPriceModal({ open: true, product });
    setTempPrice(item?.price || product.Price);
    setPriceError("");
  };

  // Close price modal
  const handleClosePriceModal = () => {
    setPriceModal({ open: false, product: null });
    setTempPrice("");
    setPriceError("");
  };

  // Validate and save price
  const handleSavePrice = () => {
    const product = priceModal.product;
    const price = parseFloat(tempPrice);
    const minPrice = product.Price;

    if (isNaN(price) || price < minPrice) {
      setPriceError(`Price cannot be less than ${minPrice} FRW`);
      return;
    }

    setSelectedItems({
      ...selectedItems,
      [product.id]: {
        ...selectedItems[product.id],
        price
      }
    });

    handleClosePriceModal();
  };

  const { data: session } = useSession();

  // Handle sell button
  const handleSellSelected = () => {
    const items = Object.values(selectedItems).map(item => ({
      productId: item.productId,
      quantity: item.qty,
      sellingPrice: item.price
    }));

    const payload = {
      soldBy: session?.user?._id || "",
      shopId: session?.user?.shops?.[0] || "",
      items
    };

    if (onSell) {
      onSell(payload);
    } else {
      console.log("Sell payload:", payload);
      // You can call your API here
      // sellProducts(payload);
    }

    // Clear selection after sell
    setSelectedItems({});
  };

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Header with Sell Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
          Multi-Product Sale
        </Typography>
        <Button
          variant="contained"
          disabled={selectedCount === 0}
          onClick={handleSellSelected}
          sx={{
            bgcolor: "#FF6D00",
            color: "white",
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(255, 109, 0, 0.3)",
            "&:hover": {
              bgcolor: "#E65100",
              boxShadow: "0 6px 16px rgba(255, 109, 0, 0.4)",
            },
            "&:disabled": {
              bgcolor: "#ccc",
              color: "#666"
            }
          }}
        >
          SELL SELECTED ({selectedCount})
        </Button>
      </Box>

      {/* Products Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          width: '100%',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#e5e7eb',
            borderRadius: '10px',
          },
        }}
      >
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#FF6D00" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Select</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Min Price (FRW)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Selling Price (FRW)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Quantity</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const isSelected = !!selectedItems[product.id];
              const item = selectedItems[product.id];

              return (
                <TableRow
                  key={product.id}
                  sx={{
                    bgcolor: isSelected ? "#FFF3E0" : "white",
                    "&:hover": { bgcolor: isSelected ? "#FFE0B2" : "#f5f5f5" },
                    transition: "all 0.2s ease"
                  }}
                >
                  {/* Checkbox */}
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(product)}
                      className="w-5 h-5 cursor-pointer accent-orange-500"
                    />
                  </TableCell>

                  {/* Product Name */}
                  <TableCell sx={{ fontWeight: isSelected ? "600" : "400" }}>
                    {product.ProductName}
                  </TableCell>

                  {/* Min Price */}
                  <TableCell sx={{ color: "#666" }}>
                    {product.Price.toLocaleString()}
                  </TableCell>

                  {/* Selling Price */}
                  <TableCell sx={{ fontWeight: "bold", color: "#FF6D00" }}>
                    {isSelected ? item.price.toLocaleString() : "-"}
                  </TableCell>

                  {/* Quantity Controls */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        disabled={!isSelected}
                        onClick={() => handleQuantityChange(product.id, (item?.qty || 1) - 1)}
                        sx={{
                          bgcolor: isSelected ? "#FF6D00" : "#ccc",
                          color: "white",
                          width: 28,
                          height: 28,
                          "&:hover": { bgcolor: isSelected ? "#E65100" : "#ccc" },
                          "&:disabled": { bgcolor: "#eee", color: "#999" }
                        }}
                      >
                        -
                      </IconButton>
                      <TextField
                        size="small"
                        type="number"
                        value={isSelected ? item.qty : 1}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        disabled={!isSelected}
                        sx={{
                          width: 60,
                          "& input": { textAlign: "center", fontWeight: "bold" }
                        }}
                        inputProps={{ min: 1 }}
                      />
                      <IconButton
                        size="small"
                        disabled={!isSelected}
                        onClick={() => handleQuantityChange(product.id, (item?.qty || 1) + 1)}
                        sx={{
                          bgcolor: isSelected ? "#FF6D00" : "#ccc",
                          color: "white",
                          width: 28,
                          height: 28,
                          "&:hover": { bgcolor: isSelected ? "#E65100" : "#ccc" },
                          "&:disabled": { bgcolor: "#eee", color: "#999" }
                        }}
                      >
                        +
                      </IconButton>
                    </Box>
                  </TableCell>

                  {/* Set Price Button */}
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={!isSelected}
                      onClick={() => handleOpenPriceModal(product)}
                      sx={{
                        borderColor: "#FF6D00",
                        color: "#FF6D00",
                        fontWeight: "bold",
                        "&:hover": {
                          borderColor: "#E65100",
                          bgcolor: "#FFF3E0"
                        },
                        "&:disabled": {
                          borderColor: "#ddd",
                          color: "#999"
                        }
                      }}
                    >
                      Set Price
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Price Setting Modal */}
      <Dialog
        open={priceModal.open}
        onClose={handleClosePriceModal}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
            boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)"
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: "#FF6D00",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.25rem"
        }}>
          Set Price - {priceModal.product?.ProductName}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Minimum Price: <strong>{priceModal.product?.Price} FRW</strong>
            </Typography>
          </Box>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label="Selling Price (FRW)"
            value={tempPrice}
            onChange={(e) => {
              setTempPrice(e.target.value);
              setPriceError("");
            }}
            error={!!priceError}
            helperText={priceError}
            inputProps={{
              min: priceModal.product?.Price,
              step: "0.01"
            }}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClosePriceModal}
            sx={{ color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePrice}
            variant="contained"
            sx={{
              bgcolor: "#FF6D00",
              "&:hover": { bgcolor: "#E65100" }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataTable;