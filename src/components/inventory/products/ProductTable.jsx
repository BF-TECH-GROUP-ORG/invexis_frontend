"use client";

import React, { useState } from "react";
import Image from "next/image";
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

export default function ProductTable({
  products = [],
  loading = false,
  selectedIds = [],
  onSelectIds = () => { },
  onDelete = () => { },
  onView = () => { },
  onEdit = () => { },
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

  // Determine pagination values (MUI expects count, page, rowsPerPage)
  const page = pagination.page ? Math.max(0, (pagination.page || 1) - 1) : 0;
  const rowsPerPage = pagination.limit || 20;
  const total = pagination.total || rows.length;

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
            <TableCell>Product</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Stock</TableCell>
            <TableCell>Warehouse</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((product) => {
            const id = product._id || product.id;
            const name = product.name || product.ProductName || "Unnamed";
            const sku = product.sku || product.SKU || "N/A";
            const category = product.category?.name || product.category || product.Category || "Uncategorized";
            const price = (product.pricing?.basePrice ?? product.price ?? product.UnitPrice ?? 0).toFixed ? Number(product.pricing?.basePrice ?? product.price ?? product.UnitPrice ?? 0).toFixed(2) : (product.pricing?.basePrice ?? product.price ?? product.UnitPrice ?? 0);
            const stock = product.inventory?.quantity ?? product.stock ?? 0;
            const warehouse = product.warehouse?.name || product.warehouse || product.Warehouse || "-";
            const status = product.status || product.availability || (stock > 0 ? "in_stock" : "out_of_stock");

            return (
              <TableRow key={id} hover>
                <TableCell padding="checkbox">
                  <Checkbox checked={selectedIds.includes(id)} onChange={() => handleSelectOne(id)} />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.images && product.images[0] && product.images[0].url ? (
                      <div className="w-12 h-12 relative rounded overflow-hidden">
                        <Image src={product.images[0].url} alt={name} fill sizes="48px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-white rounded flex items-center justify-center">#</div>
                    )}
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-gray-500">{product.brand || ''}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{sku}</TableCell>
                <TableCell>{category}</TableCell>
                <TableCell align="right">${price}</TableCell>
                <TableCell align="right">{stock}</TableCell>
                <TableCell>{warehouse}</TableCell>
                <TableCell>{status.replaceAll('_', ' ')}</TableCell>

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
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
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