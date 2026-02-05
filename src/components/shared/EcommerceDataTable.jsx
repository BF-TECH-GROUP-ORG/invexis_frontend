"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Paper,
  Typography,
} from "@mui/material";
import { HiDotsVertical } from "react-icons/hi";

export default function EcommerceDataTable({
  columns = [],
  rows = [],
  initialRowsPerPage = 5,
  denseDefault = false,
  onEdit = () => { },
  onDelete = () => { },
  showSearch = true,
  keyField = "id",
  filters = null,
  actions = null,
}) {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [dense, setDense] = useState(denseDefault);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      columns.some((c) => {
        const v =
          typeof c.accessor === "function"
            ? c.accessor(r)
            : r[c.accessor || c.id];
        return String(v || "")
          .toLowerCase()
          .includes(q);
      })
    );
  }, [rows, query, columns]);

  const visibleRows = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelected(visibleRows.map((r) => r[keyField]));
    else setSelected([]);
  };

  const toggleRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          {showSearch && (
            <TextField
              size="small"
              placeholder="Search table..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ width: 320 }}
            />
          )}
          {filters}
        </Box>
        <Box>{actions}</Box>
      </Box>

      <Paper sx={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        bgcolor: "white"
      }}>
        <TableContainer sx={{
          width: "100%",
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#e5e7eb',
            borderRadius: '10px',
          },
        }}>
          <Table size={dense ? "small" : "medium"} sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 && selected.length < visibleRows.length
                    }
                    checked={
                      visibleRows.length > 0 &&
                      selected.length === visibleRows.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col.id}>{col.label}</TableCell>
                ))}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleRows.length > 0 ? (
                visibleRows.map((row) => (
                  <TableRow
                    key={row[keyField] || JSON.stringify(row)}
                    hover
                    selected={selected.includes(row[keyField])}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(row[keyField])}
                        onChange={() => toggleRow(row[keyField])}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.id} sx={{ verticalAlign: "middle" }}>
                        {col.render ? (
                          col.render(row)
                        ) : (
                          <span>{row[col.accessor || col.id]}</span>
                        )}
                      </TableCell>
                    ))}

                    <TableCell align="center">
                      <Tooltip title="Actions">
                        <IconButton size="small">
                          <HiDotsVertical />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 10 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                      <Typography variant="body2" color="textSecondary" fontWeight={600}>
                        No records found
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Try adjusting your search or filters
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          py={1}
          sx={{ borderTop: "1px solid #e5e7eb", bgcolor: "#fafafa" }}
        >
          <Box>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) =>
                setRowsPerPage(parseInt(e.target.value, 10))
              }
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>

          <Box>
            <Chip label={selected.length ? `${selected.length} selected` : ""} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
