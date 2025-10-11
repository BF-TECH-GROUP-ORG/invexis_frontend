// "use client";
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
  { id: 1, ProductName: "John Doe theBadman", Category: "Electronics", UnitPrice: 100, InStock: 10, Discount: "20%", Date: "12/09/2024", TotalValue: 40, action: "more" },
  { id: 2, ProductName: "Jane Smith", Category: "Electronics", UnitPrice: 450, InStock: 20, Discount: "15%", Date: "10/09/2024", TotalValue: 9000, action: "more" },
  { id: 3, ProductName: "Gaming Chair", Category: "Furniture", UnitPrice: 250, InStock: 5, Discount: "5%", Date: "01/09/2024", TotalValue: 1250, action: "more" },
  { id: 4, ProductName: "Shoes Nike Air", Category: "Fashion", UnitPrice: 75, InStock: 40, Discount: "10%", Date: "18/08/2024", TotalValue: 3000, action: "more" },
  { id: 5, ProductName: "Mouse Pad", Category: "Electronics", UnitPrice: 15, InStock: 50, Discount: "5%", Date: "20/08/2024", TotalValue: 750, action: "more" },
  { id: 6, ProductName: "Office Desk", Category: "Furniture", UnitPrice: 300, InStock: 10, Discount: "0%", Date: "25/08/2024", TotalValue: 3000, action: "more" },
];

// ----------------------------------------------------------------------
// Custom Component for the Action Menu (RowActionsMenu)
// ----------------------------------------------------------------------
const RowActionsMenu = ({ rowId, onRedirect }) => {
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

  const handleDelete = (event) => {
    event.stopPropagation();
    console.log(`Delete row ${rowId}`);
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
        <MenuItem onClick={handleView}>
          <ListItemIcon><VisibilityIcon sx={{ color: "#333" }} /></ListItemIcon>
          <ListItemText primary="View" />
        </MenuItem>
        <MenuItem onClick={() => console.log('Edit clicked')}>
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
  // Internal state is initialized with the current external filter state
  const [filterCriteria, setFilterCriteria] = useState(currentFilter);

  // Sync internal state when currentFilter (from DataTable) changes
  useEffect(() => {
    setFilterCriteria(currentFilter);
  }, [currentFilter]);


  const uniqueCategories = useMemo(() => {
    const categories = rows.map(row => row.Category);
    return ["", ...new Set(categories)]; // Include empty string for 'All'
  }, []);

  // Columns available for filtering
  const availableColumns = [
    { label: 'Category', value: 'Category', type: 'text' },
    { label: 'Unit Price (FRW)', value: 'UnitPrice', type: 'number' },
  ];
  
  // Operators change based on the selected column type
  const getOperators = (columnType) => {
    if (columnType === 'number') {
      return [
        { label: 'is greater than', value: '>' },
        { label: 'is less than', value: '<' },
        { label: 'equals', value: '==' },
      ];
    }
    // Default for text columns (like Category)
    return [
      { label: 'contains', value: 'contains' },
      { label: 'equals', value: '==' },
    ];
  };
  
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    let newCriteria = { ...filterCriteria, [name]: value };

    // Reset value and operator if column changes (to match the new column type)
    if (name === 'column') {
      const newColumnType = availableColumns.find(col => col.value === value)?.type || 'text';
      newCriteria = { 
        ...newCriteria, 
        operator: getOperators(newColumnType)[0].value, // Set default operator
        value: '', // Clear value
      };
    }
    
    setFilterCriteria(newCriteria);
    // AUTOMATIC FILTERING: Apply filter immediately on column/operator change
    onFilterChange(newCriteria);
  };

  const handleValueChange = (event) => {
    const { value } = event.target;
    const newCriteria = { ...filterCriteria, value };
    
    setFilterCriteria(newCriteria);
    // AUTOMATIC FILTERING: Apply filter immediately on value change
    onFilterChange(newCriteria);
  };

  const handleClearFilter = () => {
    const defaultFilter = { column: 'Category', operator: 'contains', value: '' };
    onFilterChange(defaultFilter);
    setFilterCriteria(defaultFilter);
    onClose();
  }
  
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
      
      {/* 1. Column Select */}
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

      {/* 2. Operator Select */}
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

      {/* 3. Value Input/Select */}
      <FormControl variant="outlined" size="small" sx={{ flexGrow: 1, minWidth: 160, mt: 3 }}>
        <InputLabel>{selectedColumnType === 'number' ? 'Filter amount' : 'Filter value'}</InputLabel>
        
        {/* Render TextField for number input */}
        {selectedColumnType === 'number' ? (
            <TextField
                size="small"
                variant="outlined"
                name="value"
                value={filterCriteria.value}
                onChange={handleValueChange}
                type="number" // Set input type to number
                InputLabelProps={{ shrink: true }}
                label="Filter amount" // Re-labeling since InputLabel is present
            />
        ) : (
            // Render Select for Category (text) input
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
      
      {/* REMOVED: The Publish Button */}
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
  
  // State for the active filter, set to a default numerical filter
  const [activeFilter, setActiveFilter] = useState({
    column: 'UnitPrice',
    operator: '>',
    value: '', // Starts with no value
  });

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
    
    // 1. Apply Search Filter (ProductName)
    if (search) {
      currentRows = currentRows.filter((row) =>
        row.ProductName.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 2. Apply Popover Filter
    const { column, operator, value } = activeFilter;
    
    if (column && value) {
      // Numerical Filtering Logic
      if (column === 'UnitPrice') {
        const numValue = Number(value);
        if (isNaN(numValue)) return currentRows; // Ignore if value is not a number
        
        currentRows = currentRows.filter((row) => {
          const rowPrice = row.UnitPrice;
          if (operator === '>') return rowPrice > numValue;
          if (operator === '<') return rowPrice < numValue;
          if (operator === '==') return rowPrice === numValue;
          return true;
        });
        
      } else if (column === 'Category') {
        // Text Filtering Logic
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
      {/* Filter Popover Component */}
      <FilterPopover
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        onFilterChange={handleFilterChange}
        currentFilter={activeFilter}
      />
      
      {/* Toolbar Header */}
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Sales Overview
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* Search box */}
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

          
          {/* Filter Button - Highlight if an actual filter value is set */}
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



      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Sale</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Product Name</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Category</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>Unit Price (FRW)</TableCell>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>In Stock</TableCell>
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
                <TableCell>{row.InStock}</TableCell>
                <TableCell>{row.Discount}</TableCell>
                <TableCell>{row.Date}</TableCell>
                <TableCell>{row.TotalValue}</TableCell>
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
  );
};

export default DataTable;