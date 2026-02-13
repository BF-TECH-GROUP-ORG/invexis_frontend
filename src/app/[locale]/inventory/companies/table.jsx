"use client"
import { useRouter, useSearchParams } from "next/navigation";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, IconButton, Typography, TextField, Box, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Fade
} from "@mui/material";
import { InputAdornment } from "@mui/material";
import { HiSearch } from "react-icons/hi";
import { useLocale, useTranslations } from "next-intl";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useMemo } from "react";
import { deleteBranch } from "@/services/branches";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, cancelBtn, deleteBtn }) => (
    <Dialog open={open} onClose={onCancel} TransitionComponent={Fade} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#081422' }}>{title}</DialogTitle>
        <DialogContent>
            <Typography variant="body1" color="text.secondary">{message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button onClick={onCancel} fullWidth variant="outlined" sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 600, color: '#4b5563', borderColor: '#e5e7eb' }}>{cancelBtn}</Button>
            <Button onClick={onConfirm} fullWidth variant="contained" color="error" sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}>{deleteBtn}</Button>
        </DialogActions>
    </Dialog>
);

const RowActionsMenu = ({ rowId, onDeleteRequest, labels }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const router = useRouter();
    const locale = useLocale();

    const handleClick = (event) => { event.stopPropagation(); setAnchorEl(event.currentTarget); };
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <IconButton onClick={handleClick} size="small" sx={{ bgcolor: '#f9fafb', '&:hover': { bgcolor: '#f3f4f6' } }}>
                <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', minWidth: 160, mt: 0.5 } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => { router.push(`/${locale}/inventory/companies/${rowId}`); handleClose(); }} sx={{ py: 1.2 }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={labels.viewDetails} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={() => { router.push(`/${locale}/inventory/companies/${rowId}/edit`); handleClose(); }} sx={{ py: 1.2 }}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={labels.editBranch} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); onDeleteRequest(rowId)(true); }} sx={{ py: 1.2, color: 'error.main' }}>
                    <ListItemIcon><DeleteIcon fontSize="small" color="inherit" /></ListItemIcon>
                    <ListItemText primary={labels.delete} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>
            </Menu>
        </>
    );
};

const CompaniesTable = ({ initialRows = [], initialParams = {}, updateFilters }) => {
    const t = useTranslations("management.companies");
    const commonT = useTranslations("common");
    const searchParams = useSearchParams();
    const [exportAnchor, setExportAnchor] = useState(null);
    const queryClient = useQueryClient();
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const search = searchParams.get("search") || initialParams.search || "";

    const rows = useMemo(() => {
        if (!Array.isArray(initialRows)) return [];
        return initialRows.map((shop) => ({
            id: shop.id,
            name: shop.name,
            city: shop.city,
            address: shop.address_line1,
            capacity: shop.capacity || 0,
            status: shop.status,
        }));
    }, [initialRows]);

    const deleteMutation = useMutation({
        mutationFn: (branchId) => deleteBranch(branchId, initialParams.companyId),
        onSuccess: () => {
            queryClient.invalidateQueries(["branches"]);
            setSnackbar({ open: true, message: t("toast.deleted") || "Branch removed successfully!", severity: "success" });
        },
    });

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const toggleDeleteModalFor = (id) => (open) => setDeleteModal({ open: Boolean(open), id: open ? id : null });

    const filteredRows = useMemo(() => {
        let currentRows = rows;
        if (search) {
            currentRows = currentRows.filter((row) =>
                row.name.toLowerCase().includes(search.toLowerCase()) ||
                row.city.toLowerCase().includes(search.toLowerCase())
            );
        }
        return currentRows;
    }, [search, rows]);

    return (
        <Paper
            elevation={0}
            sx={{
                border: "1px solid #f3f4f6",
                borderRadius: "24px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.04)",
                overflow: "hidden",
                bgcolor: 'white'
            }}
        >
            <ConfirmDialog
                open={deleteModal.open}
                title={t("deleteConfirm.title") || "Confirm Deletion"}
                message={t("deleteConfirm.message") || "Are you sure you want to delete this branch?"}
                cancelBtn={commonT("cancel") || "Cancel"}
                deleteBtn={t("actions.delete") || "Delete"}
                onConfirm={() => { deleteMutation.mutate(deleteModal.id); setDeleteModal({ open: false, id: null }); }}
                onCancel={() => setDeleteModal({ open: false, id: null })}
            />

            <Toolbar
                sx={{
                    display: "flex",
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'center' },
                    py: { xs: 3, md: 4 },
                    px: { xs: 2, md: 4 },
                    gap: 3,
                    borderBottom: '1px solid #f3f4f6'
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#081422', letterSpacing: '-0.5px' }}>
                    {t("allBranches") || "Shop Branches"}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 2 }}>
                    <TextField
                        placeholder={t("searchShops") || "Search by name or city..."}
                        size="small"
                        fullWidth
                        value={search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><HiSearch color="#9ca3af" /></InputAdornment>),
                            sx: { borderRadius: '14px', bgcolor: '#f9fafb', border: 'none', '& fieldset': { border: 'none' } }
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            onClick={(e) => setExportAnchor(e.currentTarget)}
                            sx={{ bgcolor: '#f9fafb', borderRadius: '12px', p: 1.2, '&:hover': { bgcolor: '#f3f4f6' } }}
                        >
                            <CloudDownloadRoundedIcon sx={{ fontSize: 20, color: '#4b5563' }} />
                        </IconButton>
                        <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
                            <MenuItem onClick={() => setExportAnchor(null)}>Export CSV</MenuItem>
                            <MenuItem onClick={() => setExportAnchor(null)}>Export PDF</MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Toolbar>

            <TableContainer sx={{ maxHeight: 650 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em' }}>{t("table.branchInfo") || "Branch Info"}</TableCell>
                            <TableCell sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', display: { xs: 'none', sm: 'table-cell' } }}>{t("table.city") || "City"}</TableCell>
                            <TableCell sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', display: { xs: 'none', md: 'table-cell' } }}>{t("table.address") || "Address"}</TableCell>
                            <TableCell sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', display: { xs: 'none', lg: 'table-cell' } }}>{t("table.capacity") || "Capacity"}</TableCell>
                            <TableCell sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em' }}>{t("table.status") || "Status"}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em' }}>{t("table.actions") || "Actions"}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows.map((row) => (
                            <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#fdfdfd' } }}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                            {row.name.charAt(0).toUpperCase()}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={800} color="#081422">{row.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: { sm: 'none' } }}>{row.city}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                    <Typography variant="body2" fontWeight={600} color="#4b5563">{row.city}</Typography>
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                    <Typography variant="body2" color="text.secondary">{row.address}</Typography>
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                    <Chip label={row.capacity} size="small" sx={{ fontWeight: 700, bgcolor: '#f3f4f6' }} />
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.status === 'open' ? '#10b981' : '#ef4444' }} />
                                        <Typography variant="body2" fontWeight={700} sx={{ color: row.status === 'open' ? '#065f46' : '#991b1b', textTransform: 'capitalize' }}>
                                            {commonT(row.status) || row.status}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <RowActionsMenu
                                        rowId={row.id}
                                        onDeleteRequest={toggleDeleteModalFor}
                                        labels={{
                                            viewDetails: t("actions.viewDetails") || "View Details",
                                            editBranch: t("actions.editBranch") || "Edit Branch",
                                            delete: t("actions.delete") || "Delete"
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '12px' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Paper>
    );
};

export default CompaniesTable;
