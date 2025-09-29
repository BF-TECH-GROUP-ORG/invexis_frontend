"use client";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import GetAppIcon from "@mui/icons-material/GetApp";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

const rows = [
  { id: 1, ProductName: "John Doe theBadman", Category: "Electronics", UnitPrice: 100, InStock: 10, Discount: "20%", Date: "12/09/2024", TotalValue: 40, action: "more" },
  { id: 2, ProductName: "Jane Smith", Category: "Electronics", UnitPrice: 450, InStock: 20, Discount: "15%", Date: "10/09/2024", TotalValue: 9000, action: "more" },
  { id: 3, ProductName: "Gaming Chair", Category: "Furniture", UnitPrice: 250, InStock: 5, Discount: "5%", Date: "01/09/2024", TotalValue: 1250, action: "more" },
  { id: 4, ProductName: "Shoes Nike Air", Category: "Fashion", UnitPrice: 75, InStock: 40, Discount: "10%", Date: "18/08/2024", TotalValue: 3000, action: "more" },
];

const DataTable = () => {
  const navigation = useRouter();
  const [search, setSearch] = useState("");

  const handleRowClick = (id) => {
    navigation.push(`/inventory/sales/${id}`);
  };

  const filteredRows = rows.filter((row) =>
    row.ProductName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {/* Toolbar Header */}
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #ddd",
          background: "#fafafa",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Sales Records
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Search box */}
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
            }}
          />

          {/* Action Icons */}
          <IconButton><ViewColumnIcon /></IconButton>
          <IconButton><FilterListIcon /></IconButton>
          <IconButton><GetAppIcon /></IconButton>
          <IconButton><SettingsIcon /></IconButton>
        </Box>
      </Toolbar>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Sale</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Category</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Unit Price (FRW)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>In Stock</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Discount</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total Value</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>View</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
                onClick={() => handleRowClick(row.id)}
              >
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.ProductName}</TableCell>
                <TableCell>{row.Category}</TableCell>
                <TableCell>{row.UnitPrice}</TableCell>
                <TableCell>{row.InStock}</TableCell>
                <TableCell>{row.Discount}</TableCell>
                <TableCell>{row.Date}</TableCell>
                <TableCell>{row.TotalValue}</TableCell>
                <TableCell sx={{ color: "blue", fontWeight: "bold" }}>
                  {row.action}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DataTable;
