"use client";

import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, IconButton, Typography, TextField, Box, Menu, MenuItem, ListItemIcon, ListItemText, Popover, Select, InputLabel, FormControl, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton, Avatar, TablePagination } from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Button } from "@/components/shared/button";
import { Package } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { getAllProducts, getCustomers } from "@/services/salesService";
import { SellProduct } from "@/services/salesService";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import TransferModal from "./TransferModal";
import { CheckCircle, AlertCircle } from "lucide-react";



// Filter Popover (Category & Price)
const FilterPopover = ({ anchorEl, onClose, onApply, currentFilter }) => {
  const [tempFilter, setTempFilter] = useState(currentFilter);
  const t = useTranslations('sellProduct.filter');

  const handleApply = () => {
    onApply(tempFilter);
    onClose();
  };

  const handleClear = () => {
    setTempFilter({ column: "Category", operator: "contains", value: "" });
    onApply({ column: "Category", operator: "contains", value: "" });
    onClose();
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{ sx: { p: 3, borderRadius: 2, minWidth: { xs: "300px", sm: "400px" } } }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">{t('title')}</Typography>
        <IconButton onClick={handleClear} size="small"><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <FormControl size="small">
          <InputLabel>{t('column')}</InputLabel>
          <Select
            value={tempFilter.column}
            label={t('column')}
            onChange={(e) => setTempFilter({ ...tempFilter, column: e.target.value, value: "" })}
          >
            <MenuItem value="Category">{t('columns.category')}</MenuItem>
            <MenuItem value="Price">{t('columns.price')}</MenuItem>
          </Select>
        </FormControl>

        {tempFilter.column === "Price" ? (
          <>
            <FormControl size="small">
              <InputLabel>{t('operator')}</InputLabel>
              <Select
                value={tempFilter.operator}
                label={t('operator')}
                onChange={(e) => setTempFilter({ ...tempFilter, operator: e.target.value })}
              >
                <MenuItem value=">">{t('operators.greaterThan')}</MenuItem>
                <MenuItem value="<">{t('operators.lessThan')}</MenuItem>
                <MenuItem value="==">{t('operators.equals')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label={t('amount')}
              type="number"
              value={tempFilter.value}
              onChange={(e) => setTempFilter({ ...tempFilter, value: e.target.value })}
            />
          </>
        ) : (
          <TextField
            size="small"
            label={t('searchInCategory')}
            value={tempFilter.value}
            onChange={(e) => setTempFilter({ ...tempFilter, value: e.target.value })}
            placeholder="e.g. Electronics"
          />
        )}

        <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
          <Button variant="outlined" onClick={onClose}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleApply}>{t('apply')}</Button>
        </Box>
      </Box>
    </Popover>
  );
};

const SuccessModal = ({ open, onClose }) => {
  const t = useTranslations('sellProduct.modals.success');
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionProps={{
        timeout: {
          enter: 400,
          exit: 300
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          minWidth: 400,
          textAlign: "center",
          animation: open ? "popIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "popOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "@keyframes popIn": {
            from: {
              opacity: 0,
              transform: "scale(0.8) translateY(-20px)"
            },
            to: {
              opacity: 1,
              transform: "scale(1) translateY(0)"
            }
          },
          "@keyframes popOut": {
            from: {
              opacity: 1,
              transform: "scale(1) translateY(0)"
            },
            to: {
              opacity: 0,
              transform: "scale(0.8) translateY(-20px)"
            }
          }
        }
      }}
    >
      <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 4 }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "#ecfdf5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
          animation: open ? "bounceIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both" : "bounceOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "@keyframes bounceIn": {
            "0%": {
              opacity: 0,
              transform: "scale(0.3)"
            },
            "50%": {
              opacity: 1,
              transform: "scale(1.05)"
            },
            "100%": {
              opacity: 1,
              transform: "scale(1)"
            }
          },
          "@keyframes bounceOut": {
            "0%": {
              opacity: 1,
              transform: "scale(1)"
            },
            "50%": {
              opacity: 1,
              transform: "scale(1.05)"
            },
            "100%": {
              opacity: 0,
              transform: "scale(0.3)"
            }
          }
        }}>
          <CheckCircle size={48} className="text-emerald-500" />
        </Box>
        <Typography variant="h5" fontWeight="bold" color="#081422">
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300 }}>
          {t('message')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 4 }}>
        <MuiButton
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: "#081422",
            color: "white",
            px: 6,
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "#2a2a2a" }
          }}
        >
          {t('done')}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

// Main Component with Multi-Product Sales
const CurrentInventory = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('sellProduct');
  const tAlerts = useTranslations('sellProduct.alerts');
  const tActions = useTranslations('sellProduct.actions');
  const tStatus = useTranslations('sellProduct.status');
  const tTable = useTranslations('sellProduct.table');
  const tPrice = useTranslations('sellProduct.modals.price');
  const tCustomer = useTranslations('sellProduct.modals.customer');
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const companyObj = session?.user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  const [search, setSearch] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState({
    column: "Category",
    operator: "contains",
    value: "",
  });

  // Multi-product sales state
  const [selectedItems, setSelectedItems] = useState({});
  const [priceModal, setPriceModal] = useState({ open: false, product: null });
  const [tempPrice, setTempPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [isDebt, setIsDebt] = useState(false);

  // Customer info modal state
  const [customerModal, setCustomerModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaidNow, setAmountPaidNow] = useState(0);
  const [customerErrors, setCustomerErrors] = useState({});
  const [filteredCustomers, setFilteredCustomers] = useState([]); // For live search results

  // Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferMode, setTransferMode] = useState('company'); // 'company' or 'shop'
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["allProducts", companyId],
    queryFn: () => getAllProducts(companyId),
    staleTime: 5 * 60 * 1000,
    enabled: !!companyId,
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ["customers", companyId],
    queryFn: getCustomers,
    staleTime: 5 * 60 * 1000,
    enabled: !!companyId,
  });

  // Sell mutation
  const sellMutation = useMutation({
    mutationFn: ({ payload, isDebt }) => SellProduct(payload, isDebt),
    onSuccess: () => {
      setSelectedItems({});
      queryClient.invalidateQueries(["allProducts"]);
      setSuccessModalOpen(true);
    },
    onError: (error) => {
      console.error("Sale failed:", error);
      const errMsg = error.response?.data?.message || error.message;
      alert(tAlerts('saleFailed', { error: errMsg }));
    }
  });

  // Filter + Search Logic
  const filteredProducts = useMemo(() => {
    let result = products;

    // Role-based filtering: Sales department workers only see products from their shop
    const userRole = session?.user?.role;
    const assignedDepartments = session?.user?.assignedDepartments || [];
    const isSalesWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";
    const userShopId = session?.user?.shops?.[0];

    if (isSalesWorker && userShopId) {
      result = result.filter(p => p.shopId === userShopId);
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(p =>
        p.ProductName.toLowerCase().includes(term) ||
        p.ProductId.toLowerCase().includes(term)
      );
    }

    if (activeFilter.value) {
      if (activeFilter.column === "Price") {
        const val = Number(activeFilter.value);
        result = result.filter(p => {
          if (activeFilter.operator === ">") return p.Price > val;
          if (activeFilter.operator === "<") return p.Price < val;
          if (activeFilter.operator === "==") return p.Price === val;
          return true;
        });
      } else if (activeFilter.column === "Category") {
        result = result.filter(p =>
          p.Category.toLowerCase().includes(activeFilter.value.toLowerCase())
        );
      }
    }

    return result;
  }, [products, search, activeFilter, session?.user]);

  // Handle checkbox toggle
  const handleCheckboxChange = (product) => {
    const productId = product.id;

    // Don't allow selection of out-of-stock products
    if (!selectedItems[productId] && product.Quantity === 0) {
      alert(tAlerts('outOfStock', { name: product.ProductName }));
      return;
    }

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
          price: product.Price,
          cost: product.Cost || 0,
          shopId: product.shopId
        }
      });
    }
  };


  // Handle quantity change
  const handleQuantityChange = (productId, newQty) => {
    const product = products.find(p => p.id === productId);
    const maxStock = product?.Quantity || 0;

    // Allow empty string for better typing experience
    if (newQty === "") {
      setSelectedItems({
        ...selectedItems,
        [productId]: {
          ...selectedItems[productId],
          qty: ""
        }
      });
      return;
    }

    let qty = parseInt(newQty);

    // If not a number, ignore
    if (isNaN(qty)) return;

    // Validate against stock
    if (qty > maxStock) {
      qty = maxStock;
    }

    setSelectedItems({
      ...selectedItems,
      [productId]: {
        ...selectedItems[productId],
        qty
      }
    });
  };

  // Handle quantity blur (reset to 1 if empty or 0)
  const handleQuantityBlur = (productId) => {
    const item = selectedItems[productId];
    let qty = parseInt(item.qty);

    if (!qty || qty < 1) {
      qty = 1;
      setSelectedItems({
        ...selectedItems,
        [productId]: {
          ...selectedItems[productId],
          qty
        }
      });
    }
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
      setPriceError(tPrice('error', { min: minPrice }));
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

  // Handle sell button - opens customer modal
  const handleSellSelected = () => {
    console.log("Opening customer modal. Customers available:", customers.length, customers);
    setCustomerModal(true);
  };

  // Validate customer info
  const validateCustomerInfo = () => {
    const errors = {};
    const totalSaleAmount = Object.values(selectedItems).reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (!customerName.trim()) {
      errors.customerName = tCustomer('errors.nameRequired');
    }

    if (!customerPhone.trim()) {
      errors.customerPhone = tCustomer('errors.phoneRequired');
    } else if (!/^[0-9+\-\s]{10,20}$/.test(customerPhone.trim())) {
      errors.customerPhone = tCustomer('errors.phoneInvalid');
    }

    if (isDebt && parseFloat(amountPaidNow) > totalSaleAmount) {
      errors.amountPaidNow = tCustomer('errors.paymentExceedsTotal');
    }

    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Confirm sale with customer info
  const handleConfirmSale = () => {
    if (!validateCustomerInfo()) {
      return;
    }

    const items = Object.values(selectedItems).map(item => ({
      productId: item.productId,
      productName: item.name,
      quantity: item.qty,
      unitPrice: item.price,
      totalPrice: item.price * item.qty,
      costPrice: item.cost || 0,
      discount: 0,
      shopId: item.shopId
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const payload = {
      companyId: companyId,
      shopId: items[0]?.shopId || session?.user?.shops?.[0] || "",
      soldBy: session?.user?._id || "",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || "",
      items,
      paymentMethod,
      paymentId: Date.now().toString(),
      totalAmount,
      amountPaidNow: isDebt ? parseFloat(amountPaidNow) || 0 : totalAmount,
      discountAmount: 0,
      isDebt: !!isDebt
    };

    sellMutation.mutate({ payload, isDebt });
    setCustomerModal(false);

    // Reset customer form
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setPaymentMethod("cash");
    setAmountPaidNow(0);
    setCustomerErrors({});
  };

  // Close customer modal
  const handleCloseCustomerModal = () => {
    setCustomerModal(false);
    setAmountPaidNow(0);
    setCustomerErrors({});
  };

  // Matched Customer Logic
  const [matchedCustomer, setMatchedCustomer] = useState(null);

  // Optimized phone change handler with useCallback - prevents re-creation on every render
  const handlePhoneChange = useCallback((e) => {
    const phone = e.target.value;
    setCustomerPhone(phone);
    setCustomerErrors(prev => ({ ...prev, customerPhone: "" }));

    // Clear matched customer and name whenever user types in phone field
    setMatchedCustomer(null);

    // Live search: filter customers that contain the phone number (real-time)
    if (phone.trim().length > 0) {
      const matches = customers.filter(c =>
        c.customerPhone && c.customerPhone.toString().includes(phone.trim())
      );
      console.log("Phone input:", phone, "Customers available:", customers.length, "Matches found:", matches.length);
      setFilteredCustomers(matches);
    } else {
      setFilteredCustomers([]);
    }
  }, [customers]); // Only recreate when customers list changes

  // Optimized customer selection handler
  const handleSelectCustomer = useCallback((customer) => {
    // Auto-fill customer info when selected from recommendations
    setCustomerPhone(customer.customerPhone);
    setCustomerName(customer.customerName);
    setCustomerEmail(customer.customerEmail || "");
    setMatchedCustomer(customer);
    setFilteredCustomers([]); // Hide recommendations after selection
  }, []); // No dependencies needed

  // Optimized clear matched customer handler
  const handleClearMatchedCustomer = useCallback(() => {
    setMatchedCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setFilteredCustomers([]);
  }, []);

  const selectedCount = Object.keys(selectedItems).length;

  const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <section>
      <Paper sx={{

        overflow: "hidden",
        borderRadius: { xs: "0px", md: "16px" },
        border: { xs: "none", md: "1px solid #e5e7eb" },
        boxShadow: { xs: "none", md: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" },
        bgcolor: "white"
      }}>
        <FilterPopover
          anchorEl={filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          onApply={setActiveFilter}
          currentFilter={activeFilter}
        />

        {/* Consolidated Header */}
        <Box sx={{
          p: { xs: 2, md: 3 },
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          bgcolor: "#fff"
        }}>
          {/* Top Row: Title & Search */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: "#111827", letterSpacing: "-0.5px" }}>
                {t('title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('subtitle')}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", md: "auto" } }}>
              <TextField
                size="small"
                placeholder={t('placeholders.search')}
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
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
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
            </Box>
          </Box>

          {/* Bottom Row: Actions & Selection Info */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" }, gap: 2 }}>
              <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                px: 2,
                py: 1,
                bgcolor: selectedCount > 0 ? "#FFF3E0" : "#f9fafb",
                borderRadius: "8px",
                border: `1px solid ${selectedCount > 0 ? "#FFCC80" : "#e5e7eb"}`
              }}>
                <ShoppingCartIcon sx={{ color: selectedCount > 0 ? "#FF6D00" : "#9ca3af", fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="600" color={selectedCount > 0 ? "#E65100" : "#6b7280"}>
                  {tStatus('selected', { count: selectedCount })}
                </Typography>
              </Box>

              {/* Debt Toggle */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 1.5, ml: { xs: 0, sm: 2 } }}>
                <Typography variant="body2" fontWeight="600" color="text.primary">{tStatus('debtSale')}</Typography>
                <button
                  type="button"
                  onClick={() => setIsDebt(!isDebt)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${isDebt ? "bg-orange-500" : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${isDebt ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
              <button
                disabled={selectedCount === 0}
                onClick={() => {
                  setTransferMode("shop");
                  setTransferModalOpen(true);
                }}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 w-full sm:w-auto
                  ${selectedCount === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                  }`}
              >
                {tActions('transferToShop')}
              </button>

              <button
                disabled={selectedCount === 0}
                onClick={() => {
                  setTransferMode("company");
                  setTransferModalOpen(true);
                }}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 w-full sm:w-auto
                  ${selectedCount === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
                  }`}
              >
                {tActions('transferToCompany')}
              </button>

              <button
                disabled={selectedCount === 0 || sellMutation.isPending}
                onClick={handleSellSelected}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto
                  ${selectedCount === 0 || sellMutation.isPending
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
              >
                <ShoppingCartIcon fontSize="small" />
                {sellMutation.isPending ? tActions('processing') : tActions('completeSale')}
              </button>
            </Box>
          </Box>
        </Box>


        {/* Transfer Modal */}
        <TransferModal
          open={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          selectedItems={selectedItems}
          companyId={companyId}
          userId={session?.user?._id}
          mode={transferMode}
          currentShopId={Object.values(selectedItems)[0]?.shopId || session?.user?.shops?.[0]}
        />

        {/* Table Container - Responsive */}
        <Box sx={{
          overflowX: { xs: "auto", md: "visible" },
          width: "100%",
          "&::-webkit-scrollbar": { width: 4, height: 6 },
          "&::-webkit-scrollbar-track": { bgcolor: "#f1f1f1" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#e5e7eb", borderRadius: 4 },
        }}>
          <TableContainer
            sx={{
              maxHeight: 800,
              width: '100%',
              overflowX: 'auto',
            }}
          >

            <Table stickyHeader size="medium" sx={{ paddingX: "15px", minWidth: { xs: 800, md: 1000 } }}>
              <TableHead >
                <TableRow>
                  <TableCell padding="checkbox" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable('no')}</TableCell>
                  <TableCell padding="checkbox" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable('select')}</TableCell>
                  <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}  >{tTable('product')}</TableCell>
                  <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable('sku')}</TableCell>
                  <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable('category')}</TableCell>
                  <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable('stock')}</TableCell>
                  <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable('minPrice')}</TableCell>
                  <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable('sellingPrice')}</TableCell>
                  <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }} >{tTable('quantity')}</TableCell>
                  <TableCell align="center" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{tTable('actions')}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                      <Typography sx={{ mt: 2 }}>{tTable('loading')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 10, color: "gray" }}>
                      <Typography variant="h6">No products found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => {
                    const isSelected = !!selectedItems[product.id];
                    const item = selectedItems[product.id];
                    const index = paginatedProducts.indexOf(product);

                    return (
                      <TableRow
                        key={product.id}
                        hover
                        onClick={() => handleCheckboxChange(product)}
                        sx={{

                          backgroundColor: isSelected ? "#FFF3E0" : "white",
                          "&:hover": { backgroundColor: isSelected ? "#FFE0B2" : "#f4f6f8" },
                          transition: "all 0.2s ease",
                          cursor: product.Quantity === 0 ? "not-allowed" : "pointer",
                          opacity: product.Quantity === 0 ? 0.5 : 1
                        }}
                      >
                        {/* No */}
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <span className="font-bold text-orange-500">#{index + 1}</span>
                        </TableCell>
                        {/* Checkbox */}
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxChange(product)}
                            className="w-5 h-5 cursor-pointer accent-orange-500"
                          />
                        </TableCell>

                        {/* Product */}
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "orange.50",
                                color: "orange.500",
                              }}
                            >
                              <Package size={20} />
                            </Avatar>
                            <Box minWidth={0}>
                              <Typography
                                variant="body2"
                                fontWeight={isSelected ? 600 : 500}
                                color="text.primary"
                                noWrap
                              >
                                {product.ProductName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* SKU */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {product.ProductId}
                          </Typography>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <Chip
                            label={product.Category}
                            size="small"
                            sx={{
                              backgroundColor: "#E0F2FE",
                              color: "#0369A1",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>

                        {/* Stock */}
                        <TableCell>
                          <Chip
                            label={product.Quantity}
                            size="small"
                            sx={{
                              backgroundColor: product.Quantity < 10 ? "#FFEBEE" : product.Quantity < 30 ? "#FFF3E0" : "#E8F5E9",
                              color: product.Quantity < 10 ? "#C62828" : product.Quantity < 30 ? "#E65100" : "#2E7D32",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>

                        {/* Min Price */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {product.Price.toLocaleString()}
                          </Typography>
                        </TableCell>

                        {/* Selling Price */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#FF6D00">
                            {isSelected ? item.price.toLocaleString() : "-"}
                          </Typography>
                        </TableCell>

                        {/* Quantity Controls */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <IconButton
                              size="small"
                              disabled={!isSelected}
                              onClick={() => handleQuantityChange(product.id, (item?.qty || 1) - 1)}
                              sx={{
                                bgcolor: isSelected ? "#FF6D00" : "#eee",
                                color: isSelected ? "white" : "#999",
                                width: 24,
                                height: 24,
                                "&:hover": { bgcolor: isSelected ? "#E65100" : "#eee" },
                              }}
                            >
                              <span style={{ fontSize: '18px', lineHeight: 0 }}>-</span>
                            </IconButton>
                            <TextField
                              size="small"
                              type="number"
                              value={isSelected ? item.qty : 1}
                              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                              onBlur={() => handleQuantityBlur(product.id)}
                              disabled={!isSelected}
                              sx={{
                                width: 50,
                                "& .MuiOutlinedInput-root": {
                                  height: 32,
                                  borderRadius: "8px",
                                },
                                "& input": {
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  fontSize: "0.875rem",
                                  padding: "4px 0"
                                }
                              }}
                              inputProps={{ min: 1 }}
                            />
                            <IconButton
                              size="small"
                              disabled={!isSelected}
                              onClick={() => handleQuantityChange(product.id, (item?.qty || 1) + 1)}
                              sx={{
                                bgcolor: isSelected ? "#FF6D00" : "#eee",
                                color: isSelected ? "white" : "#999",
                                width: 24,
                                height: 24,
                                "&:hover": { bgcolor: isSelected ? "#E65100" : "#eee" },
                              }}
                            >
                              <span style={{ fontSize: '18px', lineHeight: 0 }}>+</span>
                            </IconButton>
                          </Box>
                        </TableCell>

                        {/* Set Price Button */}
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <MuiButton
                            variant="outlined"
                            size="small"
                            disabled={!isSelected}
                            onClick={() => handleOpenPriceModal(product)}
                            sx={{
                              borderColor: "#FF6D00",
                              color: "#FF6D00",
                              fontWeight: 600,
                              borderRadius: "8px",
                              textTransform: "none",
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
                          </MuiButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid #e5e7eb",
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontWeight: 500,
              color: "#374151"
            }
          }}
        />
      </Paper>

      {/* Price Setting Modal */}
      <Dialog
        open={priceModal.open}
        onClose={handleClosePriceModal}
        TransitionProps={{
          timeout: {
            enter: 400,
            exit: 300
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
            boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)",
            animation: priceModal.open ? "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "@keyframes slideUp": {
              from: {
                opacity: 0,
                transform: "translateY(30px)"
              },
              to: {
                opacity: 1,
                transform: "translateY(0)"
              }
            },
            "@keyframes slideDown": {
              from: {
                opacity: 1,
                transform: "translateY(0)"
              },
              to: {
                opacity: 0,
                transform: "translateY(30px)"
              }
            }
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: "#FF6D00",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.25rem"
        }}>
          {tPrice('title', { name: priceModal.product?.ProductName })}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {tPrice('minPriceLabel')}: <strong>{priceModal.product?.Price} FRW</strong>
            </Typography>
          </Box>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label={tPrice('sellingPriceLabel')}
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
          <MuiButton
            onClick={handleClosePriceModal}
            sx={{ color: "#666" }}
          >
            {t('actions.cancel')}
          </MuiButton>
          <MuiButton
            onClick={handleSavePrice}
            variant="contained"
            sx={{
              bgcolor: "#FF6D00",
              "&:hover": { bgcolor: "#E65100" }
            }}
          >
            {t('actions.save')}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Customer Information Modal - Premium Design & Responsive */}
      <Dialog
        open={customerModal}
        onClose={handleCloseCustomerModal}
        maxWidth="lg"
        fullWidth
        TransitionProps={{
          timeout: {
            enter: 400,
            exit: 300
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: { xs: "0px", md: "16px" },
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.1)",
            bgcolor: "#FFFFFF",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            minHeight: { xs: "auto", md: "600px" },
            animation: customerModal ? "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "@keyframes slideUp": {
              from: {
                opacity: 0,
                transform: "translateY(30px)"
              },
              to: {
                opacity: 1,
                transform: "translateY(0)"
              }
            },
            "@keyframes slideDown": {
              from: {
                opacity: 1,
                transform: "translateY(0)"
              },
              to: {
                opacity: 0,
                transform: "translateY(30px)"
              }
            }
          }
        }}
      >
        {/* Premium Header - Left Side - Hidden on Mobile */}
        <Box sx={{
          display: { xs: "none", md: "flex" },
          background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
          padding: "40px 32px",
          borderRadius: "16px 0 0 16px",
          flex: "0 0 35%",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          animation: customerModal ? "slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "@keyframes slideInLeft": {
            from: {
              opacity: 0,
              transform: "translateX(-40px)"
            },
            to: {
              opacity: 1,
              transform: "translateX(0)"
            }
          },
          "@keyframes slideOutLeft": {
            from: {
              opacity: 1,
              transform: "translateX(0)"
            },
            to: {
              opacity: 0,
              transform: "translateX(-40px)"
            }
          }
        }}>
          <Box>
            <Typography variant="h5" sx={{
              color: "white",
              fontWeight: 700,
              fontSize: "2rem",
              letterSpacing: "-0.5px",
              mb: 1
            }}>
              {tCustomer('title')}
            </Typography>
            <Typography variant="body2" sx={{
              color: "#D1D5DB",
              fontWeight: 500,
              fontSize: "0.95rem",
              lineHeight: 1.6
            }}>
              {tCustomer('subtitle')}
            </Typography>
          </Box>

          {/* Sale Summary Card - Left Side */}
          <Box sx={{
            width: "100%",
            p: "20px 24px",
            bgcolor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            animation: customerModal ? "scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both" : "scaleOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "@keyframes scaleIn": {
              from: {
                opacity: 0,
                transform: "scale(0.95)"
              },
              to: {
                opacity: 1,
                transform: "scale(1)"
              }
            },
            "@keyframes scaleOut": {
              from: {
                opacity: 1,
                transform: "scale(1)"
              },
              to: {
                opacity: 0,
                transform: "scale(0.95)"
              }
            }
          }}>
            <Typography variant="caption" sx={{
              color: "#D1D5DB",
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "block",
              mb: 1
            }}>
              {tCustomer('totalAmount')}
            </Typography>
            <Typography variant="h4" sx={{
              color: "#FBBF24",
              fontWeight: 800,
              fontSize: "1.875rem",
              mb: 1
            }}>
              {new Intl.NumberFormat(locale).format(Object.values(selectedItems).reduce((sum, item) => sum + (item.price * item.qty), 0))} FRW
            </Typography>
            <Typography variant="caption" sx={{
              color: "#9CA3AF",
              display: "block"
            }}>
              {tCustomer('summary', {
                count: Object.keys(selectedItems).length,
                status: isDebt ? tStatus('debtSale') : tStatus('paidInFull')
              })}
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{
          pt: { xs: 2, md: 4 },
          pb: { xs: 20, md: 24 },
          px: { xs: 2, md: 4 },
          flex: 1,
          overflow: "auto",
          position: "relative",
          width: { xs: "100%", md: "auto" },
          animation: customerModal ? "slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "@keyframes slideInRight": {
            from: {
              opacity: 0,
              transform: "translateX(40px)"
            },
            to: {
              opacity: 1,
              transform: "translateX(0)"
            }
          },
          "@keyframes slideOutRight": {
            from: {
              opacity: 1,
              transform: "translateX(0)"
            },
            to: {
              opacity: 0,
              transform: "translateX(40px)"
            }
          }
        }}>
          {/* Customer Phone Field with Live Search Recommendations */}
          <Box sx={{ mb: 3, position: "relative" }}>
            <Typography variant="body2" sx={{
              color: "#111827",
              fontWeight: 600,
              mb: 1.2,
              fontSize: "0.95rem"
            }}>
              {tCustomer('phoneLabel')} <span style={{ color: "#FF6D00" }}>*</span>
            </Typography>
            <TextField
              autoFocus
              fullWidth
              placeholder={tCustomer('phonePlaceholder')}
              value={customerPhone}
              onChange={handlePhoneChange}
              error={!!customerErrors.customerPhone}
              helperText={customerErrors.customerPhone}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#FFFFFF",
                  borderRadius: "10px",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  "& fieldset": {
                    borderColor: "#E5E7EB",
                    borderWidth: "1.5px"
                  },
                  "&:hover fieldset": {
                    borderColor: "#D1D5DB"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6D00",
                    borderWidth: "2px"
                  }
                },
                "& .MuiOutlinedInput-input": {
                  padding: "12px 16px",
                  color: "#111827"
                },
                "& .MuiFormHelperText-root": {
                  color: "#EF4444",
                  fontSize: "0.8rem",
                  marginTop: "6px"
                }
              }}
            />

            {/* Customer Recommendations Dropdown - Absolute Position, Overlay Style */}
            {filteredCustomers.length > 0 && (
              <Box sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                mt: 0.5,
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                maxHeight: "280px",
                overflowY: "auto",
                zIndex: 1300,
                "& ::-webkit-scrollbar": {
                  width: "6px"
                },
                "& ::-webkit-scrollbar-track": {
                  bgcolor: "transparent"
                },
                "& ::-webkit-scrollbar-thumb": {
                  bgcolor: "#D1D5DB",
                  borderRadius: "3px",
                  "&:hover": {
                    bgcolor: "#9CA3AF"
                  }
                }
              }}>
                {filteredCustomers.map((customer, idx) => (
                  <Box
                    key={`${customer.id}-${idx}`}
                    onClick={() => handleSelectCustomer(customer)}
                    sx={{
                      p: "12px 16px",
                      cursor: "pointer",
                      borderBottom: idx < filteredCustomers.length - 1 ? "1px solid #F3F4F6" : "none",
                      transition: "background-color 0.15s ease",
                      "&:hover": {
                        bgcolor: "#F9FAFB"
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{
                      color: "#111827",
                      fontWeight: 600,
                      fontSize: "0.95rem"
                    }}>
                      {customer.customerName}
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: "#6B7280",
                      fontSize: "0.85rem"
                    }}>
                      {customer.customerPhone}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Customer Name Field - Only show if user typed phone but no match found */}
          {!matchedCustomer && customerPhone.trim().length > 0 && filteredCustomers.length === 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{
                color: "#111827",
                fontWeight: 600,
                mb: 1.2,
                fontSize: "0.95rem"
              }}>
                {tCustomer('nameLabel')} <span style={{ color: "#FF6D00" }}>*</span>
              </Typography>

              <TextField
                fullWidth
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setCustomerErrors({ ...customerErrors, customerName: "" });
                }}
                error={!!customerErrors.customerName}
                helperText={customerErrors.customerName}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    borderRadius: "10px",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    "& fieldset": {
                      borderColor: "#E5E7EB",
                      borderWidth: "1.5px"
                    },
                    "&:hover fieldset": {
                      borderColor: "#D1D5DB"
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FF6D00",
                      borderWidth: "2px"
                    }
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "12px 16px",
                    color: "#111827"
                  },
                  "& .MuiFormHelperText-root": {
                    color: "#EF4444",
                    fontSize: "0.8rem",
                    marginTop: "6px"
                  }
                }}
              />
            </Box>
          )}

          {/* Matched Customer Display - Only show if match found */}
          {matchedCustomer && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{
                p: 2,
                bgcolor: "#FFF7ED",
                border: "1px solid #FFCC80",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" color="#9A3412">
                    {matchedCustomer.customerName}
                  </Typography>
                  <Typography variant="caption" color="#C2410C">
                    {tCustomer('existingCustomer')}
                  </Typography>
                </Box>
                <MuiButton
                  size="small"
                  onClick={handleClearMatchedCustomer}
                  sx={{
                    minWidth: "auto",
                    color: "#9A3412",
                    textTransform: "none",
                    fontSize: "0.8rem"
                  }}
                >
                  {tCustomer('change')}
                </MuiButton>
              </Box>
            </Box>
          )}

          {/* Payment Method Selection - Premium Design */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{
              color: "#111827",
              fontWeight: 600,
              mb: 2,
              fontSize: "0.95rem"
            }}>
              {tCustomer('paymentMethodLabel')} <span style={{ color: "#FF6D00" }}>*</span>
            </Typography>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(4, 1fr)" },
              gap: { xs: "8px", md: "10px" }
            }}>
              {[
                { id: "cash", label: tCustomer('paymentMethods.cash'), img: "/images/cash.jpeg" },
                { id: "mtn", label: tCustomer('paymentMethods.mtn'), img: "/images/mtn-momo-mobile-money-uganda-logo-png_seeklogo-556395.png" },
                { id: "airtel", label: tCustomer('paymentMethods.airtel'), img: "/images/Airtel Money Uganda Logo PNG Vector (PDF) Free Download.jpeg" },
                { id: "bank_transfer", label: tCustomer('paymentMethods.bank'), img: "/images/🏦 Bank Emoji.jpeg" },
              ].map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <Box
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    sx={{
                      aspectRatio: "1/1",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      bgcolor: isSelected ? "#F3F4F6" : "#F9FAFB",
                      border: isSelected ? "2.5px solid #FF6D00" : "",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        border: isSelected ? "2.5px solid #FF6D00" : "2px solid #D1D5DB",
                        bgcolor: isSelected ? "#E5E7EB" : "#F3F4F6",
                        transform: "translateY(-2px)",
                        boxShadow: isSelected ? "0 8px 24px rgba(255, 109, 0, 0.15)" : "0 4px 12px rgba(0, 0, 0, 0.08)"
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={method.img}
                      alt={method.label}
                      sx={{
                        height: "40px",
                        width: "auto",
                        maxWidth: "85%",
                        objectFit: "contain",
                        transition: "all 0.3s ease"
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        color: isSelected ? "#FF6D00" : "#6B7280",
                        textAlign: "center",
                        letterSpacing: "0.3px"
                      }}
                    >
                      {method.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Conditional Phone Input for Mobile Payments */}
          {(paymentMethod === "airtel" || paymentMethod === "mtn") && (
            <Box>
              <Typography variant="body2" sx={{
                color: "#111827",
                fontWeight: 600,
                mb: 1.2,
                fontSize: "0.95rem"
              }}>
                {tCustomer('paymentPhoneLabel')} <span style={{ color: "#FF6D00" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder={`e.g. +250788123456`}
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  setCustomerErrors({ ...customerErrors, customerPhone: "" });
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    borderRadius: "8px",
                    fontWeight: 500,
                    "& fieldset": {
                      borderColor: "#FFD4A3",
                      borderWidth: "1.5px"
                    },
                    "&:hover fieldset": {
                      borderColor: "#FFC080"
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FF6D00",
                      borderWidth: "2px"
                    }
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "10px 14px",
                    fontSize: "0.9rem"
                  }
                }}
              />
              <Typography variant="caption" sx={{
                color: "#EA580C",
                display: "block",
                marginTop: "8px",
                fontWeight: 500
              }}>
                ℹ {tCustomer('paymentPhoneInfo', { method: paymentMethod.toUpperCase() })}
              </Typography>
            </Box>
          )}

          {/* Amount Paid Now (Only for Debt) */}
          {isDebt && (
            <Box sx={{ mb: 4, p: "16px 20px", bgcolor: "#F0F9FF", borderRadius: "10px", border: "1.5px solid #BAE6FD" }}>
              <Typography variant="body2" sx={{
                color: "#111827",
                fontWeight: 600,
                mb: 1.2,
                fontSize: "0.95rem"
              }}>
                {tCustomer('initialPayment')}
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="0"
                value={amountPaidNow}
                onChange={(e) => {
                  setAmountPaidNow(e.target.value);
                  if (customerErrors.amountPaidNow) {
                    setCustomerErrors((prev) => ({ ...prev, amountPaidNow: "" }));
                  }
                }}
                error={!!customerErrors.amountPaidNow}
                helperText={customerErrors.amountPaidNow || tCustomer('debtHelper')}
                inputProps={{
                  min: 0,
                  max: Object.values(selectedItems).reduce((sum, item) => sum + (item.price * item.qty), 0),
                  step: "1"
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    borderRadius: "8px",
                    fontWeight: 500,
                    "& fieldset": {
                      borderColor: "#BFDBFE",
                      borderWidth: "1.5px"
                    },
                    "&:hover fieldset": {
                      borderColor: "#93C5FD"
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6",
                      borderWidth: "2px"
                    }
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "10px 14px",
                    fontSize: "0.9rem"
                  },
                  "& .MuiFormHelperText-root": {
                    color: "#0369A1",
                    fontSize: "0.8rem"
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>

        {/* Premium Footer - Responsive */}
        <Box sx={{
          borderTop: "1px solid #E5E7EB",
          padding: { xs: "16px", md: "20px 28px" },
          bgcolor: "#F9FAFB",
          borderRadius: { xs: "0", md: "0 0 16px 16px" },
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          position: { xs: "relative", md: "absolute" },
          bottom: { xs: "auto", md: 0 },
          right: { xs: "auto", md: 0 },
          left: { xs: "auto", md: "35%" },
          width: { xs: "100%", md: "auto" }
        }}>
          <MuiButton
            onClick={handleCloseCustomerModal}
            sx={{
              color: "#6B7280",
              fontWeight: 600,
              fontSize: "0.95rem",
              textTransform: "none",
              px: "24px",
              py: "10px",
              borderRadius: "8px",
              border: "1.5px solid #E5E7EB",
              bgcolor: "#FFFFFF",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#F3F4F6",
                borderColor: "#D1D5DB",
                color: "#374151"
              }
            }}
          >
            {t('actions.cancel')}
          </MuiButton>
          <MuiButton
            onClick={handleConfirmSale}
            variant="contained"
            disabled={sellMutation.isPending}
            sx={{
              bgcolor: "#FF6D00",
              color: "white",
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "none",
              px: "32px",
              py: "10px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(255, 109, 0, 0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "#E65100",
                boxShadow: "0 8px 20px rgba(255, 109, 0, 0.4)",
                transform: "translateY(-2px)"
              },
              "&:disabled": {
                bgcolor: "#D1D5DB",
                color: "#F3F4F6",
                boxShadow: "none",
                cursor: "not-allowed"
              }
            }}
          >
            {sellMutation.isPending ? tActions('processing') : tCustomer('completeSale')}
          </MuiButton>
        </Box>
      </Dialog>

      <SuccessModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      />
    </section>
  );
};

export default CurrentInventory;