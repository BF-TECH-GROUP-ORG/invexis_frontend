"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Box,
  Checkbox,
  TextField,
  FormControlLabel,
  Switch,
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
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { HiDotsVertical, HiSearch, HiPencil, HiTrash } from "react-icons/hi";
import IOSSwitch from "../shared/IosSwitch";
import UsersPageHeader from "./UsersPageHeader";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  getWorkersByCompanyId,
  deleteWorker,
} from "../../services/workersService";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function WorkersTable() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  // Get companyId from next-auth session
  const { data: session } = useSession();
  const companyObj = session?.user?.companies?.[0];
  const companyId =
    typeof companyObj === "string"
      ? companyObj
      : companyObj?.id || companyObj?._id;

  useEffect(() => {
    const fetchWorkers = async () => {
      // Only fetch if companyId is available
      if (!companyId) {
        console.warn("⚠️ No companyId available from session");
        console.log("Session data:", session);
        setLoading(false);
        return;
      }

      try {
        const data = await getWorkersByCompanyId(companyId);
        console.log(data);

        if (data && Array.isArray(data)) {
          console.log(`✅ Successfully fetched ${data.length} workers`);

          // Map the backend JSON format to the table format
          const mappedWorkers = data.map((worker, index) => {
            console.log(`Mapping worker ${index + 1}:`, worker);
            return {
              id: worker.id || worker._id,
              firstName: worker.firstName || "Unknown",
              lastName: worker.lastName || "",
              email: worker.email || "N/A",
              phone: worker.phone || "N/A",
              role: worker.role || "worker",
              nationalId: worker.nationalId,
              department: worker.department || "N/A",
              status: worker.status || "active",
              gender: worker.gender || "N/A",
              dateOfBirth: worker.dateOfBirth || null,
              joinedAt: worker.createdAt
                ? new Date(worker.createdAt).toLocaleDateString()
                : "N/A",
              address: worker.address || {},
              emergencyContact: worker.emergencyContact || {},
            };
          });

          console.log("✅ Mapped workers:", mappedWorkers);
          setWorkers(mappedWorkers);
        } else {
          console.warn("⚠️ Data is not an array or is null:", data);
          setWorkers([]);
        }
      } catch (error) {
        console.error("❌ Error fetching workers:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response,
          stack: error.stack,
        });
        setWorkers([]);
      } finally {
        setLoading(false);
        console.log("🏁 Finished fetching workers");
      }
    };

    fetchWorkers();
  }, [companyId, session]); // Re-fetch when companyId or session changes

  // Menu Handlers
  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedWorkerId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWorkerId(null);
  };

  const handleEdit = () => {
    if (selectedWorkerId) {
      router.push(`/${locale}/inventory/workers/edit/${selectedWorkerId}`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null); // Close menu but keep selectedWorkerId
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedWorkerId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedWorkerId || !companyId) return;

    setDeleting(true);
    console.log("Session object:", session);
    console.log("Token to be sent:", session?.user?.token);
    try {
      if (!session?.user?.token) {
        // console.error("No token found in session!");
        // You might want to show an error or return here
      }
      await deleteWorker(selectedWorkerId, companyId, session?.accessToken);
      // Refresh list
      const updatedWorkers = workers.filter((w) => w.id !== selectedWorkerId);
      setWorkers(updatedWorkers);
      router.refresh(); // Ensure server side is also aware
      setDeleteDialogOpen(false);
      setSelectedWorkerId(null);
    } catch (error) {
      console.error("Failed to delete worker:", error);
      // console.log(session?.user)
      console.log("Access token:", session?.accessToken);
      console.log("Company ID:", companyId);
      console.log("Worker ID:", selectedWorkerId);

      // Optionally show error snackbar here
    } finally {
      setDeleting(false);
    }
  };

  // Filtering logic
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchesSearch =
        `${w.firstName} ${w.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        w.email.toLowerCase().includes(search.toLowerCase()) ||
        w.phone.toLowerCase().includes(search.toLowerCase()) ||
        w.nationalId.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        !filter ||
        w.role.toLowerCase() === filter.toLowerCase() ||
        w.status.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [workers, search, filter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredWorkers.map((w) => w.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleAddUser = () => {
    router.push(`/${locale}/inventory/workers/add-worker`);
  };

  // Show loading state
  if (loading) {
    return (
      <div>
        <UsersPageHeader onAddUser={handleAddUser} />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Typography>Loading workers...</Typography>
        </Box>
      </div>
    );
  }

  // Show empty state if no companyId
  if (!companyId) {
    return (
      <div>
        <UsersPageHeader onAddUser={handleAddUser} />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Typography color="error">
            Unable to load company information. Please log in again.
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div>
      <UsersPageHeader onAddUser={handleAddUser} />

      {/* 🔍 Top Controls */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2.5}
        py={1.5}
        gap={2}
      >
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
        <Select
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </Box>

      {/* 🧾 Table */}
      <TableContainer>
        <Table size={dense ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < filteredWorkers.length
                  }
                  checked={
                    filteredWorkers.length > 0 &&
                    selected.length === filteredWorkers.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>National ID </TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredWorkers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {workers.length === 0
                      ? "No workers found for this company. Check browser console for API details."
                      : "No workers match your search criteria"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((worker) => (
                  <TableRow
                    key={worker.id}
                    hover
                    selected={selected.includes(worker.id)}
                    sx={{
                      "&:hover": { backgroundColor: "#f4f6f8" },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(worker.id)}
                        onChange={() => handleSelectRow(worker.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          alt={worker.firstName}
                          src={`https://ui-avatars.com/api/?name=${worker.firstName}+${worker.lastName}`}
                          sx={{ width: 36, height: 36 }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {worker.firstName} {worker.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {worker.nationalId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>{worker.email}</TableCell>
                    <TableCell>{worker.phone}</TableCell>
                    <TableCell>{worker.position}</TableCell>
                    <TableCell>
                      <Chip
                        label={worker.role}
                        size="small"
                        sx={{
                          backgroundColor: "#E0F2FE",
                          color: "#0369A1",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={worker.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            worker.status === "active" ? "#E8F5E9" : "#FFEBEE",
                          color:
                            worker.status === "active" ? "#2E7D32" : "#C62828",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>{worker.joinedAt}</TableCell>

                    <TableCell align="center">
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, worker.id)}
                        >
                          <HiDotsVertical />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ⚙️ Bottom Controls */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1.5}
        sx={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#fafafa" }}
      >
        <FormControlLabel
          control={
            <IOSSwitch
              checked={dense}
              onChange={(e) => setDense(e.target.checked)}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              Dense padding
            </Typography>
          }
          sx={{
            "& .MuiFormControlLabel-label": {
              fontFamily: "Metropolis, sans-serif",
            },
          }}
        />

        <TablePagination
          component="div"
          count={filteredWorkers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <HiPencil fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <HiTrash fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Worker?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this worker? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
