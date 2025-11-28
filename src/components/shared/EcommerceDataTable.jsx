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
} from "@mui/material";
import { HiDotsVertical } from "react-icons/hi";

export default function EcommerceDataTable({
  columns = [],
  rows = [],
  initialRowsPerPage = 5,
  denseDefault = false,
  onEdit = () => {},
  onDelete = () => {},
  showSearch = true,
  keyField = "id",
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
      {showSearch && (
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            size="small"
            placeholder="Search table..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: 320 }}
          />
        </Box>
      )}

      <TableContainer sx={{ width: "100%" }}>
        <Table size={dense ? "small" : "medium"}>
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
            {visibleRows.map((row) => (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
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
    </Box>
  );
}
