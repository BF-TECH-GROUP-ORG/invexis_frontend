"use client"
import { useRouter } from "next/navigation";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, IconButton, Typography, TextField, Box, Menu, MenuItem, ListItemIcon, ListItemText, Popover, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip
} from "@mui/material";
import { InputAdornment } from "@mui/material";
import { HiSearch } from "react-icons/hi";  
import { useLocale } from "next-intl";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { deleteBranch } from "@/services/branches";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Small local confirmation dialog
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

// Row Actions Menu
const RowActionsMenu = ({ rowId, onRedirect, onDeleteRequest }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const router = useRouter();
    const locale = useLocale();

    const handleClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleView = (event) => {
        event.stopPropagation();
        router.push(`/${locale}/inventory/companies/${rowId}`);
        handleClose();
    };

    const handleEdit = (event) => {
        event.stopPropagation();
        router.push(`/${locale}/inventory/companies/${rowId}/edit`);
        handleClose();
    };

    const handleDelete = (event) => {
        event.stopPropagation();
        handleClose();
        if (typeof onDeleteRequest === "function") {
            onDeleteRequest(rowId)(true);
        }
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                size="small"
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
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

// Filter Popover
const FilterPopover = ({ anchorEl, onClose, onFilterChange, currentFilter, rows }) => {
    const open = Boolean(anchorEl);
    const [filterCriteria, setFilterCriteria] = useState(currentFilter);

    useEffect(() => {
        setFilterCriteria(currentFilter);
    }, [currentFilter]);

    const uniqueCities = useMemo(() => {
        const cities = rows.map(row => row.city);
        return ["", ...new Set(cities)];
    }, [rows]);

    const availableColumns = [
        { label: 'City', value: 'city', type: 'text' },
        { label: 'Capacity', value: 'capacity', type: 'number' },
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
        const defaultFilter = { column: 'city', operator: 'contains', value: '' };
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
                        {uniqueCities.map(city => (
                            <MenuItem key={city} value={city}>{city || "All Cities"}</MenuItem>
                        ))}
                    </Select>
                )}
            </FormControl>
        </Popover>
    );
};

// Main Table Component
const CompaniesTable = ({ initialRows = [] }) => {
    const [search, setSearch] = useState("");
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [exportAnchor, setExportAnchor] = useState(null);
    const queryClient = useQueryClient();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const { data: session } = useSession();
    const companyObj = session?.user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    console.log(companyId)

    const rows = useMemo(() => {
        if (!initialRows || !Array.isArray(initialRows)) return [];
        return initialRows.map((shop) => ({
            id: shop.id,
            name: shop.name,
            location: `${shop.address_line1}, ${shop.city}`,
            city: shop.city,
            createdBy: shop.created_by,
            capacity: shop.capacity || 0,
            status: shop.status,
        }));
    }, [initialRows]);

    const deleteMutation = useMutation({
        mutationFn: (branchId) => deleteBranch(branchId, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries(["branches"]);
            console.log("Branch deleted and cache invalidated");
            setSnackbar({
                open: true,
                message: "Branch deleted successfully!",
                severity: "success"
            });
        },
        onError: (error) => {
            console.error("Failed to delete branch:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Failed to delete branch. Please try again.",
                severity: "error"
            });
        },
    });

    const [activeFilter, setActiveFilter] = useState({
        column: 'city',
        operator: 'contains',
        value: '',
    });

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    const toggleDeleteModalFor = (id) => (open) => {
        setDeleteModal({ open: Boolean(open), id: open ? id : null });
    };

    const handleConfirmDelete = async () => {
        if (deleteModal.id) {
            try {
                await deleteMutation.mutateAsync(deleteModal.id);
                setDeleteModal({ open: false, id: null });
            } catch (error) {
                setDeleteModal({ open: false, id: null });
            }
        }
    };

    const handleCancelDelete = () => {
        setDeleteModal({ open: false, id: null });
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

    const exportCSV = (rows) => {
        let csv = "ID,Name,Location,Created By,Capacity,Status\n";
        rows.forEach(r => {
            csv += `${r.id},${r.name},${r.location},${r.createdBy},${r.capacity},${r.status}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "companies_export.csv";
        link.click();
    };

    const exportPDF = (rows) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor("#FF6D00");
        doc.text("INVEXIS", 180, 15, { align: "right" });
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Companies Report", 14, 20);

        const tableColumn = ["Name", "Location", "Created By", "Capacity", "Status"];
        const tableRows = rows.map(r => [
            r.name,
            r.location,
            r.createdBy,
            r.capacity,
            r.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            headStyles: { fillColor: "#FF6D00", textColor: 255 },
            alternateRowStyles: { fillColor: [255, 243, 230] },
            margin: { left: 14, right: 14 }
        });

        doc.save("companies_report.pdf");
    };

    const handleFilterChange = (newFilter) => {
        setActiveFilter(newFilter);
    };

    const filteredRows = useMemo(() => {
        let currentRows = rows;

        if (search) {
            currentRows = currentRows.filter((row) =>
                row.name.toLowerCase().includes(search.toLowerCase()) ||
                row.location.toLowerCase().includes(search.toLowerCase())
            );
        }

        const { column, operator, value } = activeFilter;

        if (column && value) {
            if (column === 'capacity') {
                const numValue = Number(value);
                if (isNaN(numValue)) return currentRows;

                currentRows = currentRows.filter((row) => {
                    const rowVal = row.capacity;
                    if (operator === '>') return rowVal > numValue;
                    if (operator === '<') return rowVal < numValue;
                    if (operator === '==') return rowVal === numValue;
                    return true;
                });

            } else if (column === 'city') {
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
        <Paper sx={{border:"1px solid #ddd", width: "100%", overflowY: "auto", boxShadow: "none", background: "transparent" }}>
            <FilterPopover
                anchorEl={filterAnchorEl}
                onClose={handleCloseFilter}
                onFilterChange={handleFilterChange}
                currentFilter={activeFilter}
                rows={rows}
            />

            <ConfirmDialog
                open={deleteModal.open}
                title="Delete Branch"
                message={deleteModal.id ? `Are you sure you want to delete this branch?` : "Are you sure?"}
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
                    All Branches
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                   
                    <TextField
                              placeholder="Search workers..."
                              variant="outlined"
                              size="small"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              sx={{ flex: 1, maxWidth: 300 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <HiSearch size={18} />
                                  </InputAdornment>
                                ),
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
                        <small className="font-bold text-black text-sm ">Filter</small>
                    </IconButton>

                    <IconButton onClick={handleExportMenuOpen} sx={{ bgcolor: "none" }} className="space-x-3"  >
                        <CloudDownloadRoundedIcon
                            sx={{ padding: "2px", color: "black" }} />
                        <small className="font-bold text-black text-sm ">Export</small>
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
                            <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Branch Name</TableCell>
                            <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Location</TableCell>
                            <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Created By</TableCell>
                            <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Capacity</TableCell>
                            <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Status</TableCell>
                            <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Actions</TableCell>
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
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.location}</TableCell>
                                <TableCell>{row.createdBy}</TableCell>
                                <TableCell>{row.capacity}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.status}
                                        size="small"
                                        color={row.status === "open" ? "success" : "default"}
                                        sx={{ textTransform: "capitalize", fontWeight: "bold" }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <RowActionsMenu
                                        rowId={row.id}
                                        onDeleteRequest={toggleDeleteModalFor}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Success/Error Snackbar */}
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
        </Paper>
    );
};

export default CompaniesTable;
