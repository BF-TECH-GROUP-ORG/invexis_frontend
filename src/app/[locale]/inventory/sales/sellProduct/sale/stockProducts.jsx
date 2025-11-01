"use client";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalOfferIcon from '@mui/icons-material/LocalOffer'; // Using this for 'Sale' icon
import SettingsIcon from "@mui/icons-material/Settings";
import { useState, useMemo, useEffect } from "react";

// --- UPDATED SAMPLE DATA ---
const rows = [
  { id: 1, ProductId: "PROD001", ProductName: "Gaming Laptop X", Category: "Electronics", Quantity: 15, Price: 1200, action: "more" },
  { id: 2, ProductId: "PROD002", ProductName: "Office Chair Pro", Category: "Furniture", Quantity: 50, Price: 250, action: "more" },
  { id: 3, ProductId: "PROD003", ProductName: "Cotton T-shirt", Category: "Apparel", Quantity: 200, Price: 25, action: "more" },
  { id: 4, ProductId: "PROD004", ProductName: "4K Monitor 32'", Category: "Electronics", Quantity: 8, Price: 450, action: "more" },
  { id: 5, ProductId: "PROD005", ProductName: "Desk Lamp LED", Category: "Home Goods", Quantity: 110, Price: 40, action: "more" },
  { id: 6, ProductId: "PROD006", ProductName: "Running Shoes", Category: "Apparel", Quantity: 75, Price: 85, action: "more" },
];
// ----------------------------

// Small local confirmation dialog (Kept but not used in the new RowActionsMenu)
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title || "Confirm"}</DialogTitle>
    <DialogContent>
      <Typography>{message || "Are you sure?"}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} color="primary" variant="outlined">Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
    </DialogActions>
  </Dialog>
);

// Custom Component for the Action Menu (RowActionsMenu)
// Modified to only show 'Sale' and 'View'
const RowActionsMenu = ({ rowId, onRedirect, onSale }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 'View' action - kept original logic
  const handleView = (event) => {
    event.stopPropagation();
    navigate.push(`/inventory/sales/`);
    handleClose();
  };

  const navigate = useRouter();
  // 'Sale' action - Maps to the original 'Edit' route
  const handleSale = (event) => {
    event.stopPropagation();
    navigate.push(`/inventory/sales/sellProduct/sale/${rowId}`)
    handleClose();
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
        {/* Sale Button */}
        <MenuItem onClick={handleSale}>
          <ListItemIcon><LocalOfferIcon sx={{ color: "#333" }} /></ListItemIcon>
          <ListItemText primary="Sale" />
        </MenuItem>
        {/* View Button */}
        <MenuItem onClick={handleView}>
          <ListItemIcon><VisibilityIcon sx={{ color: "#333" }} /></ListItemIcon>
          <ListItemText primary="View" />
        </MenuItem>
      </Menu>
    </>
  );
};

// ----------------------------------------------------------------------
// Custom Component for the Filter Popover (FilterPopover)
// ----------------------------------------------------------------------

const FilterPopover = ({ anchorEl, onClose, onFilterChange, currentFilter }) => {
  const open = Boolean(anchorEl);
  const [filterCriteria, setFilterCriteria] = useState(currentFilter);

  useEffect(() => {
    // Only update if the prop changes to prevent local state overwrite during local changes
    if (JSON.stringify(currentFilter) !== JSON.stringify(filterCriteria)) {
      setFilterCriteria(currentFilter);
    }
  }, [currentFilter]);

  const uniqueCategories = useMemo(() => {
    const categories = rows.map(row => row.Category);
    return ["", ...new Set(categories)];
  }, []);

  const availableColumns = [
    { label: 'Category', value: 'Category', type: 'text' },
    { label: 'Price (FRW)', value: 'Price', type: 'number' },
  ];

  const getOperators = (columnType) => {
    if (columnType === 'number') {
      return [
        { label: 'is greater than', value: '>' },
        { label: 'is less than', value: '<' },
        { label: 'equals', value: '==' },
      ];
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
      // Reset operator and value when changing column type
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
    // Reset to default Category filter, as Category is a good default for text
    const defaultFilter = { column: 'Category', operator: 'contains', value: '' };
    onFilterChange(defaultFilter);
    setFilterCriteria(defaultFilter);
    onClose();
  };

  const selectedColumnType = availableColumns.find(
    col => col.value === filterCriteria.column
  )?.type || 'text';

  return (
    <>
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          padding: 2,
          borderRadius: 2,
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.8))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          minWidth: 550,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mt: 1,
        }
      }}
    >
      <IconButton onClick={handleClearFilter} size="small" sx={{ position: 'absolute', top: 8, right: 8, left: 'auto' }}>
        <CloseIcon />
      </IconButton>
      <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: 'bold' }}>Filter By:</Typography>

      <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mt: 3 }}>
        <InputLabel>Columns</InputLabel>
        <Select
          label="Columns"
          name="column"
          value={filterCriteria.column}
          onChange={handleSelectChange}
        >
          {availableColumns.map(col => (
            <MenuItem key={col.value} value={col.value}>{col.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mt: 3 }}>
        <InputLabel>Operator</InputLabel>
        <Select
          label="Operator"
          name="operator"
          value={filterCriteria.operator}
          onChange={handleSelectChange}
        >
          {getOperators(selectedColumnType).map(op => (
            <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" size="small" sx={{ flexGrow: 1, minWidth: 160, mt: 3 }}>
        <InputLabel>{selectedColumnType === 'number' ? 'Filter amount' : 'Filter value'}</InputLabel>
        {selectedColumnType === 'number' ? (
          <TextField
            size="small"
            variant="outlined"
            name="value"
            value={filterCriteria.value}
            onChange={handleValueChange}
            type="number"
            InputLabelProps={{ shrink: true }}
            label="Filter amount"
          />
        ) : (
          <Select
            label="Filter value"
            name="value"
            value={filterCriteria.value}
            onChange={handleValueChange}
          >
            {uniqueCategories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat || "All Categories"}</MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
    </Popover>
    </>
  );
};

// ----------------------------------------------------------------------
// Main DataTable Component
// ----------------------------------------------------------------------

const CurrentInventory = () => {
  const navigation = useRouter();
  const [search, setSearch] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const [activeFilter, setActiveFilter] = useState({
    column: 'Category', // Default filter column
    operator: 'contains',
    value: '',
  });

  // Delete modal state and logic (Kept for structure, not used by current menu)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const toggleDeleteModalFor = (id) => (open) => { setDeleteModal({ open: Boolean(open), id: open ? id : null }); };
  const handleConfirmDelete = () => { console.log("Confirmed delete for id:", deleteModal.id); setDeleteModal({ open: false, id: null }); };
  const handleCancelDelete = () => { setDeleteModal({ open: false, id: null }); };


  const handleRedirectToSlug = (id) => {
    navigation.push(`/inventory/products/${id}`); // Adjusted to product view
  };

  const handleOpenFilter = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
  };

  const filteredRows = useMemo(() => {
    let currentRows = rows;

    // Search on Product Name or ID
    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      currentRows = currentRows.filter((row) =>
        row.ProductName.toLowerCase().includes(lowerCaseSearch) ||
        row.ProductId.toLowerCase().includes(lowerCaseSearch)
      );
    }

    const { column, operator, value } = activeFilter;

    if (column && value) {
      if (column === 'Price') {
        const numValue = Number(value);
        if (isNaN(numValue)) return currentRows;

        currentRows = currentRows.filter((row) => {
          const rowPrice = row.Price;
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
      }
    }

    return currentRows;
  }, [search, activeFilter]);

  return (
    <>
    <section>
    <Paper sx={{ width: "100%", overflowY: "auto", boxShadow: "none", background: "transparent" }}>
      <FilterPopover
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        onFilterChange={handleFilterChange}
        currentFilter={activeFilter}
      />

      <ConfirmDialog
        open={deleteModal.open}
        title="Delete sale"
        message={deleteModal.id ? `Are you sure you want to delete sale #${deleteModal.id}?` : "Are you sure?"}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Inventory Stock
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* Search */}
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search ID or Name…"
            sx={{ border: "2px orange solid", borderRadius: 2 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
            }}
          />

          {/* Filter */}
          <IconButton onClick={handleOpenFilter} variant="contained"  >
            <FilterAltRoundedIcon
              sx={{
                borderRadius: "6px",
                height: "30px",
                padding: "2px",
                color: activeFilter.value ? 'black' : 'black',
                filter: activeFilter.value ? 'drop-shadow(0 0 4px rgba(0, 123, 255, 0.4))' : 'none'
              }}
            />
            <small className="font-bold text-black text-sm ">Filter</small>
          </IconButton>

          {/* Designs/Settings button */}
          <IconButton sx={{ bgcolor: "none" }} className="space-x-3" >
            <SettingsIcon
              sx={{ padding: "2px", color: "black" }} />
            <small className="font-bold text-black text-sm ">Designs</small>
          </IconButton>
        </Box>
      </Toolbar>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Product Id</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Product Name</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Category</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Quantity in Stock</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Price (FRW)</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  cursor: "default",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <TableCell>{row.ProductId}</TableCell>
                <TableCell>{row.ProductName}</TableCell>
                <TableCell>{row.Category}</TableCell>
                <TableCell>{row.Quantity}</TableCell>
                <TableCell>{row.Price}</TableCell>
                <TableCell>
                  <RowActionsMenu
                    rowId={row.id}
                    onRedirect={handleRedirectToSlug}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    </section>
    </>
  );
};
export default CurrentInventory;




