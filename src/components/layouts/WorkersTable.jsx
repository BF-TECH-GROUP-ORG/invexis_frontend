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
} from "@mui/material";
import { HiDotsVertical, HiSearch } from "react-icons/hi";
import IOSSwitch from "../shared/IosSwitch";
import UsersPageHeader from "./UsersPageHeader";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { getWorkersByCompanyId } from "../../services/workersService";
import { useEffect } from "react";



export default function WorkersTable() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const companyId = "09a89de8-4a0f-4f40-a4ce-bcef7bfc364d";
        const data = await getWorkersByCompanyId(companyId);

        if (data && Array.isArray(data)) {
          const mappedWorkers = data.map(worker => ({
            id: worker.id,
            firstName: "Worker",
            lastName: worker.id.substring(0, 8),
            email: worker.user_id || "N/A",
            role: "Worker", // Default role
            status: worker.status || "active",
            joinedAt: worker.assigned_at ? new Date(worker.assigned_at).toLocaleDateString() : "N/A",
            nationalId: worker.id,
          }));
          setWorkers(mappedWorkers);
        }
      } catch (error) {
        console.error("Error fetching workers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // Filtering logic
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchesSearch =
        `${w.firstName} ${w.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        w.email.toLowerCase().includes(search.toLowerCase());
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
    router.push(`/${locale}/inventory/workers/add-worker`)
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.01)" }}>
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
              <TableCell>User ID</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredWorkers
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
                  <TableCell>
                    <Chip
                      label={worker.role}
                      size="small"
                      sx={{
                        backgroundColor: "#E0F2FE",
                        color: "#0369A1",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={worker.status}
                      size="small"
                      sx={{
                        backgroundColor: worker.status === 'active' ? "#E8F5E9" : "#FFEBEE",
                        color: worker.status === 'active' ? "#2E7D32" : "#C62828",
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    />
                  </TableCell>
                  <TableCell>{worker.joinedAt}</TableCell>

                  <TableCell align="center">
                    <Tooltip title="Actions">
                      <IconButton size="small">
                        <HiDotsVertical />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
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
    </Card>
  );
}
