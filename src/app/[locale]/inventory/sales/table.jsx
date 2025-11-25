"use client";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, IconButton, Typography, TextField, Box, Menu, MenuItem, ListItemIcon, ListItemText, Popover, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Button,
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
import { getSalesHistory, deleteSale } from "@/services/salesService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Placeholder for rows, will be managed by state in DataTable
const rows = [];

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
const RowActionsMenu = ({ rowId, productId, onRedirect, onDeleteRequest }) => {
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
    navigate.push(`/${locale}/inventory/sales/${rowId}/${rowId}`);
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
          <ListItemText primary={`${t('view')}`} />
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon><EditIcon sx={{ color: "#333" }} /></ListItemIcon>
          <ListItemText primary={`${t('Edit')}`} />
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const DataTable = () => {
  const t = useTranslations("sales");
  const navigation = useRouter();
  const [search, setSearch] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const queryClient = useQueryClient();

  const companyId = "a6e0c5ff-8665-449d-9864-612ab1c9b9f2"; // Hardcoded as requested

  const { data: rows = [] } = useQuery({
    queryKey: ["salesHistory", companyId],
    queryFn: () => getSalesHistory(companyId),
    select: (data) => {
      if (!data || !Array.isArray(data)) return [];
      return data.map((sale) => ({
        id: sale.saleId,
        productId: sale.items && sale.items.length > 0 ? sale.items[0].productId : null,
        ProductName: sale.items && sale.items.length > 0 ? sale.items[0].productName : "Unknown",
        Category: "N/A",
        UnitPrice: sale.items && sale.items.length > 0 ? sale.items[0].unitPrice : 0,
        returned: "false",
        Discount: sale.discountTotal || "0",
        Date: new Date(sale.createdAt).toLocaleDateString(),
        TotalValue: sale.totalAmount,
        action: "more"
      }));
    },
    // staleTime removed to ensure fresh data on every mount/navigation
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (saleId) => deleteSale(saleId),
    onSuccess: () => {
      // Invalidate and refetch sales history
      queryClient.invalidateQueries(["salesHistory", companyId]);
      console.log("Sale deleted and cache invalidated");
    },
    onError: (error) => {
      console.error("Failed to delete sale:", error);
      alert("Failed to delete sale. Please try again.");
    },
  });

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
    navigation.push(`/${locale}/inventory/sales/${saleId}`);
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
    let csv = "Sale ID,Product Name,Category,Unit Price (FRW),Returned,Discount,Date,Total Value (FRW)\n";
    rows.forEach(r => {
      csv += `${r.id},${r.ProductName},${r.Category},${r.UnitPrice},${r.returned},${r.Discount},${r.Date},${r.TotalValue}\n`;
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

    const tableColumn = ["Sale ID", "Product", "Category", "Unit Price", "Returned", "Discount", "Date", "Total"];
    const tableRows = rows.map(r => [
      r.id,
      r.ProductName,
      r.Category,
      r.UnitPrice.toLocaleString(),
      r.returned === "false" ? "No" : "Yes",
      r.Discount,
      r.Date,
      r.TotalValue.toLocaleString()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: "#FF6D00", textColor: 255 },
      alternateRowStyles: { fillColor: [255, 243, 230] },
      margin: { left: 14, right: 14 }
    });

    doc.save("sales_report.pdf");
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
  }, [search, activeFilter, rows]);

  return (
    <Paper sx={{ width: "100%", overflowY: "auto", boxShadow: "none", background: "transparent" }}>
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

      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {t("stockOutHistory")}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search…"
            sx={{ border: "2px orange solid", borderRadius: 2 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
            }}
          />

          <IconButton onClick={handleOpenFilter} variant="contained"  >
            <FilterAltRoundedIcon
              sx={{
                borderRadius: "6px",
                height: "30px",
                padding: "2px",
                color: activeFilter.value ? 'black' : 'black',
                filter: activeFilter.value ? 'drop-shadow(0 0 4px rgba(0, 123, 255, 0.4))' : 'none'
              }}
            />
            <small className="font-bold text-black text-sm ">{t('filter')}</small>
          </IconButton>

          <IconButton onClick={handleExportMenuOpen} sx={{ bgcolor: "none" }} className="space-x-3"  >
            <CloudDownloadRoundedIcon
              sx={{ padding: "2px", color: "black" }} />
            <small className="font-bold text-black text-sm ">{t('export')}</small>
          </IconButton>

          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={handleExportMenuClose}>
            <MenuItem onClick={() => { exportCSV(filteredRows); handleExportMenuClose(); }}>Export CSV</MenuItem>
            <MenuItem onClick={() => { exportPDF(filteredRows); handleExportMenuClose(); }}>Export PDF</MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>
                {t("sale")}
              </TableCell>

              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>
                {t("productName")}
              </TableCell>

              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>
                {t("category")}
              </TableCell>

              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>
                {t("unitPrice")} (FRW)
              </TableCell>

              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>
                {t("Returned")}
              </TableCell>

              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>
                {t("Discount")}
              </TableCell>

              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>
                {t("date")}
              </TableCell>

              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>
                {t("totalValue")}
              </TableCell>

              <TableCell sx={{ color: "#ff9500", fontWeight: "bold" }}>
                {t("action")}
              </TableCell>

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
                <TableCell>{row.returned == "false" ? <span className='text-green-500'>false</span> : <span className='text-red-500'>true</span>}</TableCell>
                <TableCell>{row.Discount}</TableCell>
                <TableCell>{row.Date}</TableCell>
                <TableCell>{row.TotalValue}</TableCell>
                <TableCell>
                  <RowActionsMenu
                    rowId={row.id}
                    productId={row.productId}
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