// src/components/inventory/products/ProductTable.jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
  Box,
  Typography,
  Avatar,
  TablePagination,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { Package } from "lucide-react";

export default function ProductTable({
  products = [],
  loading = false,
  selectedIds = [],
  onSelectIds = () => {},
  onDelete = () => {},
  onView = () => {},
  onEdit = () => {},
  viewUrl,
  editUrl,
  pagination = {},
  onPageChange = () => {},
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectIds(products.map((p) => p._id || p.id));
    } else {
      onSelectIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  const openMenu = (event, id) => {
    setMenuAnchor(event.currentTarget);
    setMenuRowId(id);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRowId(null);
  };

  const handleView = () => {
    if (menuRowId) onView(menuRowId);
    closeMenu();
  };

  const handleEdit = () => {
    if (menuRowId) onEdit(menuRowId);
    closeMenu();
  };

  const handleDelete = () => {
    if (menuRowId) onDelete(menuRowId);
    closeMenu();
  };

  const rows = products || [];

  const page = pagination.page ? Math.max(0, (pagination.page || 1) - 1) : 0;
  const rowsPerPage = pagination.limit || 20;
  const total = pagination.total || rows.length;

  return (
    <div>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 && selectedIds.length < rows.length
                  }
                  checked={
                    rows.length > 0 && selectedIds.length === rows.length
                  }
                  onChange={handleSelectAll}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                Product Name
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                SKU
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                Brand
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                Supplier
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                Unit Price
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#4b5563" }}
              >
                Stock
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                Total Value
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#4b5563" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((product) => {
              const id = product._id || product.id;
              const name = product.name || product.ProductName || "Unnamed";
              const category =
                product.category?.name ||
                product.categoryId?.name ||
                product.Category ||
                "Uncategorized";
              const basePrice =
                product.pricing?.basePrice ??
                product.pricingId?.basePrice ??
                product.price ??
                product.UnitPrice ??
                0;
              const salePrice =
                product.pricing?.salePrice ?? product.pricingId?.salePrice ?? 0;

              // Use sale price if available and lower than base price
              const effectivePrice =
                salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;

              const stock =
                product.stock?.total ??
                product.stock?.available ??
                product.inventory?.quantity ??
                product.stock ??
                0;
              const status =
                (typeof product.status === "object"
                  ? product.status.active
                    ? "active"
                    : "inactive"
                  : product.status) ||
                product.availability ||
                (stock > 0 ? "active" : "inactive");

              // Calculate discount percentage
              const discountPercent =
                salePrice > 0 && basePrice > 0
                  ? Math.round(((basePrice - salePrice) / basePrice) * 100)
                  : 0;

              // Calculate total value (price * stock)
              const totalValue = effectivePrice * stock;

              return (
                <TableRow
                  key={id}
                  hover
                  selected={selectedIds.includes(id)}
                  sx={{
                    "&:hover": { backgroundColor: "#f4f6f8" },
                    cursor: "pointer",
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(id)}
                      onChange={() => handleSelectOne(id)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <div className="relative w-10 h-10 flex-shrink-0">
                        {product.media?.images?.[0]?.url ||
                        product.images?.[0]?.url ? (
                          <Avatar
                            src={
                              product.media?.images?.[0]?.url ||
                              product.images?.[0]?.url
                            }
                            alt={name}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: "orange.50",
                              color: "orange.500",
                            }}
                          >
                            <Package size={20} />
                          </Avatar>
                        )}
                      </div>
                      <Box minWidth={0}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.primary"
                          noWrap
                        >
                          {name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {product.identifiers?.sku || product.sku || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={category}
                      size="small"
                      sx={{
                        backgroundColor: "#E0F2FE",
                        color: "#0369A1",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {product.brand || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {product.supplierName || product.manufacturer || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.primary"
                    >
                      {effectivePrice.toLocaleString("en-US", {
                        style: "currency",
                        currency:
                          product.pricing?.currency ||
                          product.pricingId?.currency ||
                          "RWF",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={stock < 10 ? "error.main" : "text.primary"}
                    >
                      {stock}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        status === "active"
                          ? "Active"
                          : status === "inactive"
                          ? "Inactive"
                          : status
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          status === "active" ? "#E8F5E9" : "#FFEBEE",
                        color: status === "active" ? "#2E7D32" : "#C62828",
                        fontWeight: 600,
                        textTransform: "capitalize",
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="text.primary"
                    >
                      {totalValue.toLocaleString("en-US", {
                        style: "currency",
                        currency:
                          product.pricing?.currency ||
                          product.pricingId?.currency ||
                          "RWF",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Actions">
                      <IconButton size="small" onClick={(e) => openMenu(e, id)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={closeMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            minWidth: 140,
            borderRadius: 2,
            mt: 0.5,
            border: "1px solid #E5E7EB",
          },
        }}
      >
        {viewUrl ? (
          <MenuItem
            component={Link}
            href={viewUrl(menuRowId)}
            onClick={closeMenu}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
        )}

        {editUrl ? (
          <MenuItem
            component={Link}
            href={editUrl(menuRowId)}
            onClick={closeMenu}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Product</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Product</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Product</ListItemText>
        </MenuItem>
      </Menu>

      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 mt-0 bg-white rounded-b-xl">
        <Typography variant="body2" color="text.secondary">
          Showing {(page + 1) * rowsPerPage - rowsPerPage + 1} to{" "}
          {Math.min((page + 1) * rowsPerPage, total)} of {total} results
        </Typography>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
          onRowsPerPageChange={(e) => onPageChange(1, Number(e.target.value))}
          sx={{ border: "none" }}
        />
      </div>
    </div>
  );
}
