// src/components/inventory/products/ProductTable.jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TablePagination from '@mui/material/TablePagination';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Package } from "lucide-react";

export default function ProductTable({
  products = [],
  loading = false,
  selectedIds = [],
  onSelectIds = () => { },
  onDelete = () => { },
  onView = () => { },
  onEdit = () => { },
  viewUrl,
  editUrl,
  pagination = {},
  onPageChange = () => { },
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

  // Status badge component
  const StatusBadge = ({ status, stock }) => {
    const isActive = status === "active" || status === "in_stock" || stock > 0;
    const isInactive = status === "inactive" || status === "out_of_stock" || stock === 0;

    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          • Active
        </span>
      );
    }

    if (isInactive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          • Inactive
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  return (
    <div>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedIds.length > 0 && selectedIds.length < rows.length}
                checked={rows.length > 0 && selectedIds.length === rows.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Product name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Unit price</TableCell>
            <TableCell align="center">In stock</TableCell>
            <TableCell>Discount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Total Value</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((product) => {
            const id = product._id || product.id;
            const name = product.name || product.ProductName || "Unnamed";
            const category = product.category?.name || product.category || product.Category || "Uncategorized";
            const basePrice = product.pricing?.basePrice ?? product.price ?? product.UnitPrice ?? 0;
            const salePrice = product.pricing?.salePrice ?? 0;
            const stock = product.inventory?.quantity ?? product.stock ?? 0;
            const status = product.status || product.availability || (stock > 0 ? "active" : "inactive");

            // Calculate discount percentage
            const discountPercent = salePrice > 0 && basePrice > 0
              ? Math.round(((basePrice - salePrice) / basePrice) * 100)
              : 0;

            // Calculate total value (price * stock)
            const totalValue = basePrice * stock;

            return (
              <TableRow key={id} hover>
                <TableCell padding="checkbox">
                  <Checkbox checked={selectedIds.includes(id)} onChange={() => handleSelectOne(id)} />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.images && product.images[0] && product.images[0].url ? (
                      <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.images[0].url}
                          alt={name}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized={product.images[0].url.includes('cdn.example.com')}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-orange-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{name}</div>
                      {product.brand && (
                        <div className="text-xs text-gray-500 truncate">{product.brand}</div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-gray-700">{category}</span>
                </TableCell>

                <TableCell>
                  <span className="font-medium text-gray-900">
                    {basePrice.toLocaleString('en-US', {
                      style: 'currency',
                      currency: product.pricing?.currency || 'RWF',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </TableCell>

                <TableCell align="center">
                  <span className="font-semibold text-gray-900">{stock}</span>
                </TableCell>

                <TableCell>
                  {discountPercent > 0 ? (
                    <span className="text-sm font-medium text-orange-600">
                      {discountPercent}%
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>

                <TableCell>
                  <StatusBadge status={status} stock={stock} />
                </TableCell>

                <TableCell>
                  <span className="font-medium text-gray-900">
                    {totalValue.toLocaleString('en-US', {
                      style: 'currency',
                      currency: product.pricing?.currency || 'RWF',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </TableCell>

                <TableCell align="center">
                  <IconButton size="small" onClick={(e) => openMenu(e, id)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        {viewUrl ? (
          <MenuItem component={Link} href={viewUrl(menuRowId)} onClick={closeMenu}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
        )}

        {editUrl ? (
          <MenuItem component={Link} href={editUrl(menuRowId)} onClick={closeMenu}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <div className="p-2 flex justify-end">
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
          onRowsPerPageChange={(e) => onPageChange(1, Number(e.target.value))}
        />
      </div>
    </div>
  );
}