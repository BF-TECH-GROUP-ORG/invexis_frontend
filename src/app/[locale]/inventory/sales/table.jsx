// filepath: d:\invexis\invexis_frontend\src\app\inventory\sales\table.jsx
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

const rows = [
  { id: 1, ProductName: "John Doe theBadman", Category: "Electronics", UnitPrice: 100, returned:"false", Discount: "20%", Date: "12/09/2024", TotalValue: 40, action: "more" },
  { id: 2, ProductName: "Jane Smith", Category: "Electronics", UnitPrice: 450, returned:"false", Discount: "15%", Date: "10/09/2024", TotalValue: 9000, action: "more" },
  { id: 3, ProductName: "Gaming Chair", Category: "Furniture", UnitPrice: 250, returned:"true", Discount: "5%", Date: "01/09/2024", TotalValue: 1250, action: "more" },
  { id: 4, ProductName: "Shoes Nike Air", Category: "Fashion", UnitPrice: 75, returned:"true", Discount: "10%", Date: "18/08/2024", TotalValue: 3000, action: "more" },
  { id: 5, ProductName: "Mouse Pad", Category: "Electronics", UnitPrice: 15, returned:"false", Discount: "5%", Date: "20/08/2024", TotalValue: 750, action: "more" },
  { id: 6, ProductName: "Office Desk", Category: "Furniture", UnitPrice: 300, returned:"false", Discount: "0%", Date: "25/08/2024", TotalValue: 3000, action: "more" },
];

// Small local confirmation dialog to avoid external prop mismatches
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
// onDeleteRequest should be a curried function: (id) => (open:boolean) => void
const RowActionsMenu = ({ rowId, onRedirect, onDeleteRequest }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = (event) => {
    event.stopPropagation();
    onRedirect(rowId);
    handleClose();
  };

  const navigate = useRouter();
  const handleEdit = (event) => {
    event.stopPropagation();
    navigate.push(`/inventory/sales/${rowId}/${rowId}`);
    handleClose();
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleClose();
    if (typeof onDeleteRequest === "function") {
      onDeleteRequest(rowId)(true); // open modal for this id
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
          <ListItemText primary="View" />
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon><EditIcon sx={{ color: "#333" }} /></ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon><DeleteIcon sx={{ color: "error.main" }} /></ListItemIcon>
          <ListItemText primary="Delete" />
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
    setFilterCriteria(currentFilter);
  }, [currentFilter]);

  const uniqueCategories = useMemo(() => {
    const categories = rows.map(row => row.Category);
    return ["", ...new Set(categories)];
  }, []);

  const availableColumns = [
    { label: 'Category', value: 'Category', type: 'text' },
    { label: 'Unit Price (FRW)', value: 'UnitPrice', type: 'number' },
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
      <IconButton onClick={handleClearFilter} size="small" sx={{ position: 'absolute', top: 8, left: 8 }}>
        <CloseIcon />
      </IconButton>

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
  );
};

// ----------------------------------------------------------------------
// Main DataTable Component
// ----------------------------------------------------------------------

const DataTable = () => {
  const navigation = useRouter();
  const [search, setSearch] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const [activeFilter, setActiveFilter] = useState({
    column: 'UnitPrice',
    operator: '>',
    value: '',
  });

  // Delete modal state owned by DataTable
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  // Curried toggler: (id) => (open) => void
  const toggleDeleteModalFor = (id) => (open) => {
    setDeleteModal({ open: Boolean(open), id: open ? id : null });
  };

  const handleConfirmDelete = () => {
    // replace with actual delete logic (API call / state update)
    console.log("Confirmed delete for id:", deleteModal.id);
    // close afterwards
    setDeleteModal({ open: false, id: null });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ open: false, id: null });
  };

  const handleRedirectToSlug = (id) => {
    navigation.push(`/inventory/sales/${id}`);
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

    if (search) {
      currentRows = currentRows.filter((row) =>
        row.ProductName.toLowerCase().includes(search.toLowerCase())
      );
    }

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
      }
    }

    return currentRows;
  }, [search, activeFilter]);

  return (
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
          Stock-Out History
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search…"
            sx={{border:"2px orange solid",borderRadius:2}}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
            }}
          />

          <IconButton onClick={handleOpenFilter} variant="contained"  >
            <FilterAltRoundedIcon
                sx={{
                    borderRadius:"6px",
                    height:"30px",
                    padding:"2px",
                    color: activeFilter.value ? 'black' : 'black',
                    filter: activeFilter.value ? 'drop-shadow(0 0 4px rgba(0, 123, 255, 0.4))' : 'none'}}
            />
            <small className="font-bold text-black text-sm ">Filter</small>
          </IconButton>

          <IconButton sx={{bgcolor:"none"}} className="space-x-3"  >
            <CloudDownloadRoundedIcon
            sx={{ padding:"2px", color: "black" }}  />
            <small className="font-bold text-black text-sm ">Export</small>
          </IconButton>
        </Box>
      </Toolbar>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Sale</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Product Name</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Category</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Unit Price (FRW)</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Returned</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Discount</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Total Value</TableCell>
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
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.ProductName}</TableCell>
                <TableCell>{row.Category}</TableCell>
                <TableCell>{row.UnitPrice}</TableCell>
                <TableCell>{row.returned=="false" ? <span className='text-green-500'>false</span> : <span className='text-red-500'>true</span>}</TableCell>
                <TableCell>{row.Discount}</TableCell>
                <TableCell>{row.Date}</TableCell>
                <TableCell>{row.TotalValue}</TableCell>
                <TableCell>
                  <RowActionsMenu
                    rowId={row.id}
                    onRedirect={handleRedirectToSlug}
                    onDeleteRequest={toggleDeleteModalFor}
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
export default DataTable;