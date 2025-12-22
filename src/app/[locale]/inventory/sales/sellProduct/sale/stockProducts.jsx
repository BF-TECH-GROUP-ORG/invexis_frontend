"use client";

import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, IconButton, Typography, TextField, Box, Menu, MenuItem, ListItemIcon, ListItemText, Popover, Select, InputLabel, FormControl, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton, Avatar, TablePagination } from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Button } from "@/components/shared/button";
import { Package } from "lucide-react";
import { useState, useMemo } from "react";
import { getAllProducts } from "@/services/salesService";
import { SellProduct } from "@/services/salesService";
import { useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import TransferModal from "./TransferModal";
import { CheckCircle, AlertCircle } from "lucide-react";



// Filter Popover (Category & Price)
const FilterPopover = ({ anchorEl, onClose, onApply, currentFilter }) => {
  const [tempFilter, setTempFilter] = useState(currentFilter);

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
      PaperProps={{ sx: { p: 3, borderRadius: 2, minWidth: 400 } }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Filter Products</Typography>
        <IconButton onClick={handleClear} size="small"><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
        <FormControl size="small">
          <InputLabel>Column</InputLabel>
          <Select
            value={tempFilter.column}
            label="Column"
            onChange={(e) => setTempFilter({ ...tempFilter, column: e.target.value, value: "" })}
          >
            <MenuItem value="Category">Category</MenuItem>
            <MenuItem value="Price">Price (FRW)</MenuItem>
          </Select>
        </FormControl>

        {tempFilter.column === "Price" ? (
          <>
            <FormControl size="small">
              <InputLabel>Operator</InputLabel>
              <Select
                value={tempFilter.operator}
                label="Operator"
                onChange={(e) => setTempFilter({ ...tempFilter, operator: e.target.value })}
              >
                <MenuItem value=">">Greater than</MenuItem>
                <MenuItem value="<">Less than</MenuItem>
                <MenuItem value="==">Equals</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Amount"
              type="number"
              value={tempFilter.value}
              onChange={(e) => setTempFilter({ ...tempFilter, value: e.target.value })}
            />
          </>
        ) : (
          <TextField
            size="small"
            label="Search in Category"
            value={tempFilter.value}
            onChange={(e) => setTempFilter({ ...tempFilter, value: e.target.value })}
            placeholder="e.g. Electronics"
          />
        )}

        <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleApply}>Apply Filter</Button>
        </Box>
      </Box>
    </Popover>
  );
};

const SuccessModal = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: 4,
        p: 2,
        minWidth: 400,
        textAlign: "center"
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
        mb: 1
      }}>
        <CheckCircle size={48} className="text-emerald-500" />
      </Box>
      <Typography variant="h5" fontWeight="bold" color="#081422">
        Sale Completed!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300 }}>
        The transaction has been successfully recorded in the system.
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
        Done
      </MuiButton>
    </DialogActions>
  </Dialog>
);

// Main Component with Multi-Product Sales
const CurrentInventory = () => {
  const router = useRouter();
  const locale = useLocale();
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
      alert(`Sale failed: ${error.response?.data?.message || error.message}`);
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
      alert(`Cannot sell "${product.ProductName}" - Out of stock!`);
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

  // Handle sell button - opens customer modal
  const handleSellSelected = () => {
    setCustomerModal(true);
  };

  // Validate customer info
  const validateCustomerInfo = () => {
    const errors = {};
    const totalSaleAmount = Object.values(selectedItems).reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (!customerName.trim()) {
      errors.customerName = "Customer name is required";
    }

    if (!customerPhone.trim()) {
      errors.customerPhone = "Phone number is required";
    } else if (!/^[0-9+\-\s]{10,20}$/.test(customerPhone.trim())) {
      errors.customerPhone = "Invalid phone format";
    }

    if (isDebt && parseFloat(amountPaidNow) > totalSaleAmount) {
      errors.amountPaidNow = "Amount paid cannot exceed the total selling price";
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

  const selectedCount = Object.keys(selectedItems).length;

  const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <section className="bg-white min-h-screen">
      <Paper sx={{ width: "100%", overflow: "hidden", boxShadow: "none", borderRadius: 0 }}>
        <FilterPopover
          anchorEl={filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          onApply={setActiveFilter}
          currentFilter={activeFilter}
        />

        {/* Consolidated Header */}
        <Box sx={{
          p: 3,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          bgcolor: "#fff"
        }}>
          {/* Top Row: Title & Search */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: "#111827", letterSpacing: "-0.5px" }}>
                Sales & Inventory
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage products, track stock, and process sales efficiently.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
                }}
                sx={{
                  width: 320,
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1,
                bgcolor: selectedCount > 0 ? "#FFF3E0" : "#f9fafb",
                borderRadius: "8px",
                border: `1px solid ${selectedCount > 0 ? "#FFCC80" : "#e5e7eb"}`
              }}>
                <ShoppingCartIcon sx={{ color: selectedCount > 0 ? "#FF6D00" : "#9ca3af", fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="600" color={selectedCount > 0 ? "#E65100" : "#6b7280"}>
                  {selectedCount} Selected
                </Typography>
              </Box>

              {/* Debt Toggle */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 2 }}>
                <Typography variant="body2" fontWeight="600" color="text.primary">Debt Sale</Typography>
                <button
                  type="button"
                  onClick={() => setIsDebt(!isDebt)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${isDebt ? "bg-orange-500" : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${isDebt ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <button
                disabled={selectedCount === 0}
                onClick={() => {
                  setTransferMode("shop");
                  setTransferModalOpen(true);
                }}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                  ${selectedCount === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                  }`}
              >
                Transfer to Shop
              </button>

              <button
                disabled={selectedCount === 0}
                onClick={() => {
                  setTransferMode("company");
                  setTransferModalOpen(true);
                }}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                  ${selectedCount === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
                  }`}
              >
                Transfer to Company
              </button>

              <button
                disabled={selectedCount === 0 || sellMutation.isPending}
                onClick={handleSellSelected}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm text-white shadow-md transition-all duration-200 flex items-center gap-2
                  ${selectedCount === 0 || sellMutation.isPending
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
              >
                <ShoppingCartIcon fontSize="small" />
                {sellMutation.isPending ? "Processing..." : "COMPLETE SALE"}
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

        {/* Table */}
        <TableContainer
          sx={{
            maxHeight: "calc(100vh - 300px)",
            "&::-webkit-scrollbar": { width: 4, height: 8 },
            "&::-webkit-scrollbar-track": { bgcolor: "#f1f1f1" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#c1c1c1", borderRadius: 4 },
            paddingLeft: "8px",
            paddingRight: "2px"
          }}
        >
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>Select</TableCell>
                <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>Product</TableCell>
                <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>SKU</TableCell>
                <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>Category</TableCell>
                <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>Stock</TableCell>
                <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>Min Price (FRW)</TableCell>
                <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>Selling Price (FRW)</TableCell>
                <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>Quantity</TableCell>
                <TableCell align="center" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading inventory...</Typography>
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
          <MuiButton
            onClick={handleClosePriceModal}
            sx={{ color: "#666" }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleSavePrice}
            variant="contained"
            sx={{
              bgcolor: "#FF6D00",
              "&:hover": { bgcolor: "#E65100" }
            }}
          >
            Save
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Customer Information Modal */}
      <Dialog
        open={customerModal}
        onClose={handleCloseCustomerModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)"
          }
        }}
      >
        <DialogTitle sx={{
          color: "#000",
          fontWeight: "bold",
          fontSize: "1.25rem"
        }}>
          Customer Information
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {/* Sale Summary */}
          <Box sx={{
            mb: 3,
            p: 2,
            bgcolor: "#FFF3E0",
            borderRadius: 1,
            border: "1px solid #FFE0B2"
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Sale Summary</strong>
            </Typography>
            <Typography variant="h6" sx={{ color: "#FF6D00", fontWeight: "bold" }}>
              {Object.keys(selectedItems).length} product(s) - Total: {
                Object.values(selectedItems).reduce((sum, item) =>
                  sum + (item.price * item.qty), 0
                ).toLocaleString()
              } FRW
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isDebt ? "💳 Debt Sale (Payment Pending)" : "✅ Regular Sale (Paid in Full)"}
            </Typography>
          </Box>

          {/* Customer Name */}
          <TextField
            autoFocus
            fullWidth
            label="Customer Name *"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              setCustomerErrors({ ...customerErrors, customerName: "" });
            }}
            error={!!customerErrors.customerName}
            helperText={customerErrors.customerName}
            placeholder="John Doe"
            sx={{ mb: 2 }}
          />

          {/* Customer Phone */}
          <TextField
            fullWidth
            label="Customer Phone *"
            value={customerPhone}
            onChange={(e) => {
              setCustomerPhone(e.target.value);
              setCustomerErrors({ ...customerErrors, customerPhone: "" });
            }}
            error={!!customerErrors.customerPhone}
            helperText={customerErrors.customerPhone}
            placeholder="+250788123456"
            sx={{ mb: 2 }}
          />

          {/* Customer Email (Optional) */}
          <TextField
            fullWidth
            label="Customer Email (Optional)"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="customer@example.com"
            sx={{ mb: 2 }}
          />

          {/* Payment Method */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Method *</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method *"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="cash">💵 Cash</MenuItem>
              <MenuItem value="card">💳 Card</MenuItem>
              <MenuItem value="mobile">📱 Mobile Money</MenuItem>
              <MenuItem value="wallet">👛 Wallet</MenuItem>
              <MenuItem value="bank_transfer">🏦 Bank Transfer</MenuItem>
            </Select>
          </FormControl>

          {/* Amount Paid Now (Only for Debt) */}
          {isDebt && (
            <TextField
              fullWidth
              label="Amount Paid Now (FRW)"
              type="number"
              value={amountPaidNow}
              onChange={(e) => {
                setAmountPaidNow(e.target.value);
                if (customerErrors.amountPaidNow) {
                  setCustomerErrors((prev) => ({ ...prev, amountPaidNow: "" }));
                }
              }}
              placeholder="0"
              InputProps={{ inputProps: { min: 0, max: Object.values(selectedItems).reduce((sum, item) => sum + (item.price * item.qty), 0) } }}
              sx={{ mb: 2 }}
              error={!!customerErrors.amountPaidNow}
              helperText={customerErrors.amountPaidNow || `Enter the initial payment amount. Remaining balance will be recorded as debt.`}
            />
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            * Required fields
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <MuiButton
            onClick={handleCloseCustomerModal}
            sx={{ color: "#666" }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleConfirmSale}
            variant="contained"
            disabled={sellMutation.isPending}
            sx={{
              bgcolor: "#FF6D00",
              "&:hover": { bgcolor: "#E65100" },
              minWidth: 120
            }}
          >
            {sellMutation.isPending ? "Processing..." : "Confirm Sale"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <SuccessModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      />
    </section>
  );
};

export default CurrentInventory;