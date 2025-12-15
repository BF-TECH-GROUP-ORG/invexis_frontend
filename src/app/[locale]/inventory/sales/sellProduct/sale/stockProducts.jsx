"use client";

import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, IconButton, Typography, TextField, Box, Menu, MenuItem, ListItemIcon, ListItemText, Popover, Select, InputLabel, FormControl, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Button } from "@/components/shared/button";
import { useState, useMemo } from "react";
import { getAllProducts } from "@/services/salesService";
import { SellProduct } from "@/services/salesService";
import { useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

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
  const [customerErrors, setCustomerErrors] = useState({});

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
      alert("Sale completed successfully!");
    },
    onError: (error) => {
      console.error("Sale failed:", error);
      alert(`Sale failed: ${error.response?.data?.message || error.message}`);
    }
  });

  // Filter + Search Logic
  const filteredProducts = useMemo(() => {
    let result = products;

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
  }, [products, search, activeFilter]);

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
          shopId: product.shopId
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

  // Handle sell button - opens customer modal
  const handleSellSelected = () => {
    setCustomerModal(true);
  };

  // Validate customer info
  const validateCustomerInfo = () => {
    const errors = {};

    if (!customerName.trim()) {
      errors.customerName = "Customer name is required";
    }

    if (!customerPhone.trim()) {
      errors.customerPhone = "Phone number is required";
    } else if (!/^[0-9+\-\s]{10,20}$/.test(customerPhone.trim())) {
      errors.customerPhone = "Invalid phone format";
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
      unitPrice: item.price,
      totalPrice: item.price * item.qty,
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
      discountAmount: 0
    };

    sellMutation.mutate({ payload, isDebt });
    setCustomerModal(false);

    // Reset customer form
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setPaymentMethod("cash");
    setCustomerErrors({});
  };

  // Close customer modal
  const handleCloseCustomerModal = () => {
    setCustomerModal(false);
    setCustomerErrors({});
  };

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <section>
      <Paper sx={{ width: "100%", overflow: "hidden", boxShadow: "none", background: "transparent" }}>
        <FilterPopover
          anchorEl={filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          onApply={setActiveFilter}
          currentFilter={activeFilter}
        />

        {/* Toolbar */}
        <Toolbar sx={{ justifyContent: "space-between", borderBottom: "1px solid #eee", py: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Multi-Product Sale {products.length > 0 && `(${filteredProducts.length} products)`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select products, set quantities and prices, then click Sell
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
              }}
              sx={{ width: 300, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />

            <IconButton
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              color={activeFilter.value ? "primary" : "default"}
            >
              <FilterAltRoundedIcon />
              {activeFilter.value && <Chip label="1" size="small" color="primary" sx={{ ml: 1, height: 18 }} />}
            </IconButton>
          </Box>
        </Toolbar>

        {/* Action Bar with Sell Button */}
        <Box sx={{
          p: 2,
          // bgcolor: "#FFF3E0",
          borderBottom: "2px solid #FF6D00",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ShoppingCartIcon sx={{ color: "#FF6D00", fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: "#333" }}>
              {selectedCount === 0 ? "No products selected" : `${selectedCount} product${selectedCount > 1 ? 's' : ''} selected`}
            </Typography>
          </Box>

          {/* Debt Toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "500" }}>
                Debt Sale
              </Typography>
              <button
                type="button"
                onClick={() => setIsDebt(!isDebt)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isDebt ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${isDebt ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </Box>

            <MuiButton
              variant="contained"
              disabled={selectedCount === 0 || sellMutation.isPending}
              onClick={handleSellSelected}
              startIcon={<ShoppingCartIcon />}
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
              {sellMutation.isPending ? "Processing..." : `SELL SELECTED (${selectedCount})`}
            </MuiButton>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "black", fontWeight: "bold" }}>Select</TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold" }}>Product ID</TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold" }}>Product Name</TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold" }}>Category</TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold" }}>Stock</TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold" }}>Min Price (FRW)</TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold" }}>Selling Price (FRW)</TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold" }}>Quantity</TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold" }}>Actions</TableCell>
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
                filteredProducts.map((product) => {
                  const isSelected = !!selectedItems[product.id];
                  const item = selectedItems[product.id];

                  return (
                    <TableRow
                      key={product.id}
                      onClick={() => handleCheckboxChange(product)}
                      sx={{
                        bgcolor: isSelected ? "#FFF3E0" : "white",
                        "&:hover": { bgcolor: isSelected ? "#FFE0B2" : "#f5f5f5" },
                        transition: "all 0.2s ease",
                        cursor: product.Quantity === 0 ? "not-allowed" : "pointer",
                        opacity: product.Quantity === 0 ? 0.5 : 1
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(product)}
                          className="w-5 h-5 cursor-pointer accent-orange-500"
                        />
                      </TableCell>

                      {/* Product ID */}
                      <TableCell><strong>{product.ProductId}</strong></TableCell>

                      {/* Product Name */}
                      <TableCell sx={{ fontWeight: isSelected ? "600" : "400" }}>
                        {product.ProductName}
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Chip label={product.Category} size="small" color="primary" variant="outlined" />
                      </TableCell>

                      {/* Stock */}
                      <TableCell>
                        <Chip
                          label={product.Quantity}
                          color={product.Quantity < 10 ? "error" : product.Quantity < 30 ? "warning" : "success"}
                          size="small"
                        />
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <MuiButton
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
                        </MuiButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
          bgcolor: "#FF6D00",
          color: "white",
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
            borderRadius: 2,
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
    </section>
  );
};

export default CurrentInventory;