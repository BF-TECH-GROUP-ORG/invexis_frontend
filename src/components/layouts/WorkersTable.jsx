"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Typography,
  Chip,
  Box,
  TextField,
  TablePagination,
  Select,
  MenuItem,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Fade
} from "@mui/material";
import {
  HiDotsVertical,
  HiSearch,
  HiPencil,
  HiTrash
} from "react-icons/hi";
import { useLocale, useTranslations } from "next-intl";
import { getWorkersByCompanyId, deleteWorker } from "../../services/workersService";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import WorkerCards from "./WorkerCards";
import UsersPageHeader from "./UsersPageHeader";

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, loading, cancelBtn, deleteBtn }) => (
  <Dialog open={open} onClose={onCancel} TransitionComponent={Fade} PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
    <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#081422' }}>{title}</DialogTitle>
    <DialogContent>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ p: 3, gap: 1.5 }}>
      <Button onClick={onCancel} fullWidth disabled={loading} variant="outlined" sx={{ borderRadius: '14px', py: 1.5, textTransform: 'none', fontWeight: 700, borderColor: '#e5e7eb', color: '#4b5563' }}>{cancelBtn}</Button>
      <Button onClick={onConfirm} fullWidth disabled={loading} variant="contained" color="error" sx={{ borderRadius: '14px', py: 1.5, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>
        {loading ? "..." : deleteBtn}
      </Button>
    </DialogActions>
  </Dialog>
);

export default function WorkersTable({ initialParams = {} }) {
  const t = useTranslations("management.workers");
  const commonT = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = useLocale();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") || initialParams.search || "";
  const filter = searchParams.get("filter") || initialParams.filter || "";
  const page = (parseInt(searchParams.get("page")) || initialParams.page || 1) - 1;
  const rowsPerPage = parseInt(searchParams.get("limit")) || initialParams.limit || 10;

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const companyObj = session?.user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id || initialParams.companyId);

  const options = useMemo(() => (session?.accessToken ? {
    headers: { Authorization: `Bearer ${session.accessToken}` }
  } : {}), [session?.accessToken]);

  const { data: rawWorkers = [], isLoading: loading } = useQuery({
    queryKey: ["workers", companyId],
    queryFn: () => getWorkersByCompanyId(companyId, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  });

  const workers = useMemo(() => {
    if (!Array.isArray(rawWorkers)) return [];
    return rawWorkers.map((w) => ({
      id: w.id || w._id,
      name: `${w.firstName} ${w.lastName}`,
      firstName: w.firstName,
      lastName: w.lastName,
      email: w.email || "N/A",
      phone: w.phone || "N/A",
      role: w.role || "worker",
      status: w.status || "active",
      joinedAt: w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "N/A",
      nationalId: w.nationalId || "N/A"
    }));
  }, [rawWorkers]);

  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.email.toLowerCase().includes(search.toLowerCase()) ||
        w.nationalId.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = !filter || w.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [workers, search, filter]);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteWorker(id, companyId, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries(["workers", companyId]);
      setDeleteModalOpen(false);
    },
  });

  const updateFilters = useCallback((updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    });
    if (!updates.page) params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return (
    <Box sx={{ spaceY: 6 }}>
      <UsersPageHeader onAddUser={() => router.push(`/${locale}/inventory/workers/add-worker`)} />

      <WorkerCards workers={workers} />

      <div className="border border-[#f3f4f6] rounded-2xl overflow-hidden bg-white p-4">
        <Box sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, p: 3, gap: 2, borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
          <TextField
            placeholder={t("searchPersonnel") || "Search staff, email, or credentials..."}
            size="small"
            fullWidth
            value={search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><HiSearch color="#9ca3af" /></InputAdornment>),
              sx: { borderRadius: '14px', bgcolor: '#f9fafb', '& fieldset': { border: 'none' } }
            }}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <Select
              size="small"
              value={filter}
              onChange={(e) => updateFilters({ filter: e.target.value })}
              displayEmpty
              sx={{ minWidth: 160, borderRadius: '14px', bgcolor: '#f9fafb', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            >
              <MenuItem value="">{commonT("allStatuses") || "All Statuses"}</MenuItem>
              <MenuItem value="active">{commonT("active") || "Active"}</MenuItem>
              <MenuItem value="inactive">{commonT("inactive") || "Inactive"}</MenuItem>
            </Select>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t("table.userProfile") || "User Profile"}</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase', display: { xs: 'none', md: 'table-cell' } }}>{t("table.contactInfo") || "Contact Info"}</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t("table.role") || "Role"}</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t("table.status") || "Status"}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#f9fafb', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t("table.actions") || "Actions"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorkers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((worker) => (
                <TableRow key={worker.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={`https://ui-avatars.com/api/?name=${worker.firstName}+${worker.lastName}&background=random&color=fff`}
                        sx={{ width: 44, height: 44, borderRadius: '14px' }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={800} color="#081422">{worker.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{worker.nationalId}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" fontWeight={600} color="#4b5563">{worker.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{worker.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={worker.role} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, borderRadius: '8px', textTransform: 'uppercase', fontSize: '10px' }} />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: worker.status === 'active' ? '#10b981' : '#ef4444' }} />
                      <Typography variant="body2" fontWeight={700} color={worker.status === 'active' ? '#065f46' : '#991b1b'} sx={{ textTransform: 'capitalize' }}>
                        {commonT(worker.status) || worker.status}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedWorkerId(worker.id); }} sx={{ bgcolor: '#f9fafb' }}>
                      <HiDotsVertical />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, bgcolor: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
          <TablePagination
            component="div"
            count={filteredWorkers.length}
            page={page}
            onPageChange={(_, p) => updateFilters({ page: p + 1 })}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => updateFilters({ limit: e.target.value, page: 1 })}
          />
        </Box>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', minWidth: 180, mt: 1 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { router.push(`/${locale}/inventory/workers/edit/${selectedWorkerId}`); setAnchorEl(null); }} sx={{ py: 1.5 }}>
          <ListItemIcon><HiPencil size={18} /></ListItemIcon>
          <ListItemText primary={t("actions.editProfile") || "Edit Profile"} primaryTypographyProps={{ fontWeight: 700 }} />
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); setDeleteModalOpen(true); }} sx={{ py: 1.5, color: 'error.main' }}>
          <ListItemIcon><HiTrash size={18} color="inherit" /></ListItemIcon>
          <ListItemText primary={t("actions.deleteMember") || "Delete Member"} primaryTypographyProps={{ fontWeight: 700 }} />
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={deleteModalOpen}
        loading={deleteMutation.isLoading}
        title={t("deleteConfirm.title") || "Delete Staff Member"}
        message={t("deleteConfirm.message") || "This action is permanent."}
        cancelBtn={commonT("cancel") || "Cancel"}
        deleteBtn={commonT("delete") || "Delete"}
        onConfirm={() => deleteMutation.mutate(selectedWorkerId)}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </Box>
  );
}