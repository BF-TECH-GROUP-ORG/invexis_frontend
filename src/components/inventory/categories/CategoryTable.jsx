"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
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
} from "@mui/material";
import { MoreVertical, Edit, Trash2, Folder } from "lucide-react";
import { toggleCategoryActive } from "@/features/categories/categoriesSlice";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function CategoryTable({
  categories = [],
  loading,
  selectedIds = [],
  onSelectIds,
  onDelete,
  onEdit,
  canManage = false,
}) {
  const t = useTranslations("categories");
  const dispatch = useDispatch();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectIds(categories.map((cat) => cat._id));
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

  const handleToggleActive = async (id) => {
    try {
      await dispatch(toggleCategoryActive(id)).unwrap();
      toast.success(t("toasts.statusUpdated"));
    } catch (error) {
      // toast.error("Failed to update category");
    }
  };

  const openMenu = (event, category) => {
    setMenuAnchor(event.currentTarget);
    setMenuRowId(category._id);
    setSelectedCategory(category);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRowId(null);
    setSelectedCategory(null);
  };

  const handleEditAction = () => {
    if (onEdit && selectedCategory) onEdit(selectedCategory);
    closeMenu();
  };

  const handleDeleteAction = () => {
    if (onDelete && menuRowId) onDelete(menuRowId);
    closeMenu();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
        <Folder className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-medium text-gray-900">{t("table.noCategories")}</p>
        <p className="text-sm text-gray-500 mt-1">
          {t("table.createFirst")}
        </p>
      </div>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          bgcolor: "white",
          width: '100%',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#e5e7eb',
            borderRadius: '10px',
          },
        }}
      >
        <Table size="medium" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length < categories.length
                  }
                  checked={
                    categories.length > 0 &&
                    selectedIds.length === categories.length
                  }
                  onChange={handleSelectAll}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                {t("table.categoryName")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                {t("table.level")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                {t("table.parent")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>
                {t("table.status")}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#4b5563" }}
              >
                {t("table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow
                key={category._id}
                hover
                selected={selectedIds.includes(category._id)}
                sx={{
                  "&:hover": { backgroundColor: "#f4f6f8" },
                  cursor: "pointer",
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.includes(category._id)}
                    onChange={() => handleSelectOne(category._id)}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    {category.image?.url ? (
                      <Avatar
                        src={category.image.url}
                        alt={category.name}
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
                        <Folder size={20} />
                      </Avatar>
                    )}
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {category.name}
                      </Typography>
                      {category.slug && (
                        <Typography variant="caption" color="text.secondary">
                          {category.slug}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={t("table.levelLabel", { level: category.level })}
                    size="small"
                    sx={{
                      backgroundColor: "#F3F4F6",
                      color: "#374151",
                      fontWeight: 600,
                      height: 24,
                      fontSize: "0.75rem",
                    }}
                  />
                </TableCell>

                <TableCell>
                  {category.parentCategory ? (
                    <Typography variant="body2" color="text.secondary">
                      {category.parentCategory.name}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      -
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={category.isActive ? t("table.active") : t("table.inactive")}
                    size="small"
                    onClick={() => handleToggleActive(category._id)}
                    sx={{
                      backgroundColor: category.isActive
                        ? "#E8F5E9"
                        : "#FFEBEE",
                      color: category.isActive ? "#2E7D32" : "#C62828",
                      fontWeight: 600,
                      cursor: "pointer",
                      height: 24,
                      fontSize: "0.75rem",
                    }}
                  />
                </TableCell>

                <TableCell align="center">
                  <Tooltip title={t("table.actions")}>
                    <IconButton
                      size="small"
                      onClick={(e) => openMenu(e, category)}
                    >
                      <MoreVertical size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            minWidth: 140,
            borderRadius: 2,
            mt: 0.5,
            border: "1px solid #E5E7EB",
            // boxShadow:
            //   "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          },
        }}
      >
        <MenuItem onClick={handleEditAction} sx={{ fontSize: "0.875rem" }}>
          <ListItemIcon>
            <Edit size={16} />
          </ListItemIcon>
          <ListItemText>{t("table.edit")}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteAction}
          sx={{ color: "error.main", fontSize: "0.875rem" }}
        >
          <ListItemIcon>
            <Trash2 size={16} className="text-red-600" />
          </ListItemIcon>
          <ListItemText>{t("table.delete")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
