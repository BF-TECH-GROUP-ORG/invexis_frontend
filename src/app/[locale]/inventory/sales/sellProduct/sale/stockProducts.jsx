"use client";

import { useRouter } from "next/navigation";
import {Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Toolbar,IconButton,Typography,TextField,Box,Menu,MenuItem,ListItemIcon,ListItemText,Popover,Select,InputLabel,FormControl,CircularProgress,Chip,} from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SettingsIcon from "@mui/icons-material/Settings";
import { Button } from "@/components/shared/button";
import { useState, useMemo, useEffect } from "react";
import { getAllProducts } from "@/services/salesService"; // Make sure this path is correct
import { useLocale } from "next-intl";

// Row Actions Menu (Sale + View)
const RowActionsMenu = ({ productId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const locale = useLocale();

  const handleClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSale = (e) => {
    e.stopPropagation();
    router.push(`/${locale}/inventory/sales/sellProduct/sale/${productId}`);
  };

  const handleView = (e) => {
    e.stopPropagation();
    router.push(`/${locale}/inventory/products/${productId}`);
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ sx: { mt: 1 } }}>
        <MenuItem onClick={handleSale}>
          <ListItemIcon><LocalOfferIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Sale</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleView}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

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

// Main Component
const CurrentInventory = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState({
    column: "Category",
    operator: "contains",
    value: "",
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  // Filter + Search Logic
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(p =>
        p.ProductName.toLowerCase().includes(term) ||
        p.ProductId.toLowerCase().includes(term)
      );
    }

    // Advanced Filter
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

  const handleRowClick = (id) => {
    router.push(`/inventory/products/${id}`);
  };

  return (
    <section>
      <Paper sx={{ width: "100%", overflow: "hidden", boxShadow: "none", background: "transparent" }}>
        {/* Filter Popover */}
        <FilterPopover
          anchorEl={filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          onApply={setActiveFilter}
          currentFilter={activeFilter}
        />

        {/* Toolbar */}
        <Toolbar sx={{ justifyContent: "space-between", borderBottom: "1px solid #eee", py: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Inventory Stock {products.length > 0 && `(${filteredProducts.length})`}
          </Typography>

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

            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Table */}
        <TableContainer sx={{ maxHeight: "calc(100vh - 250px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#0d47a1" }}>
                {["Product ID", "Product Name", "Category", "Stock", "Price (FRW)", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ color: "white", fontWeight: "bold", fontSize: "0.95rem" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading inventory...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10, color: "gray" }}>
                    <Typography variant="h6">No products found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => handleRowClick(row.id)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f0f8ff" },
                    }}
                  >
                    <TableCell><strong>{row.ProductId}</strong></TableCell>
                    <TableCell>{row.ProductName}</TableCell>
                    <TableCell>{row.brand}</TableCell>
                    <TableCell>{row.manufacturer}</TableCell>
                    <TableCell>
                      <Chip label={row.Category} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.Quantity}
                        color={row.Quantity < 10 ? "error" : row.Quantity < 30 ? "warning" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {row.Price.toLocaleString()} FRW
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu productId={row.id} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </section>
  );
};

export default CurrentInventory;