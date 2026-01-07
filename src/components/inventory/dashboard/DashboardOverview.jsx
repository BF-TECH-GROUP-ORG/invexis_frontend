// src/components/inventory/dashboard/DashboardOverview.jsx
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { fetchInventorySummary } from "@/features/reports/reportsSlice";
import { fetchAlerts } from "@/features/alerts/alertsSlice";
import { fetchProducts } from "@/features/products/productsSlice";
import { getProducts } from "@/services/productsService";
import { motion } from "framer-motion";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import Image from "next/image";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function DashboardOverview() {
  const dispatch = useDispatch();
  const reportsState = useSelector((state) => state.reports || {});
  const inventorySummary = reportsState.inventorySummary;
  const alertsState = useSelector((state) => state.alerts || {});
  const unreadCount = alertsState.unreadCount;
  const productsState = useSelector((state) => state.products || {});
  const products = Array.isArray(productsState.items)
    ? productsState.items
    : [];
  const [isExporting, setIsExporting] = useState(false);
  const [isCompactValue, setIsCompactValue] = useState(true);

  const formatValue = (val, isCompact) => {
    const num = Number(val) || 0;
    if (!isCompact) return num.toLocaleString();

    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  };

  useEffect(() => {
    dispatch(fetchInventorySummary());
    dispatch(fetchAlerts());
    dispatch(fetchProducts({ limit: 5 }));
  }, [dispatch]);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      toast.loading("Generating report...", { id: "export-pdf" });

      // Fetch all products for the report
      const response = await getProducts({ limit: 1000 }); // Adjust limit as needed
      const allProducts = response.products || response.items || [];

      const doc = new jsPDF();

      // Add Header
      doc.setFontSize(20);
      doc.setTextColor(249, 115, 22); // Orange color
      doc.text("Inventory Overview Report", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        14,
        30
      );

      // Summary Section
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Summary Stats:", 14, 45);
      doc.setFontSize(10);
      doc.text(
        `Total Products: ${inventorySummary?.totalProducts || 0}`,
        14,
        52
      );
      doc.text(
        `Total Value: $${(inventorySummary?.totalValue || 0).toLocaleString()}`,
        14,
        58
      );
      doc.text(`Low Stock Alerts: ${unreadCount || 0}`, 14, 64);

      const tableColumn = [
        "Image",
        "Product Details",
        "Category",
        "Stock & Price",
        "Status",
        "Total Value",
      ];
      const tableRows = [];

      for (const product of allProducts) {
        const price = product.pricing?.basePrice || product.price || 0;
        const stock = product.inventory?.quantity || product.stock || 0;
        const totalValue = price * stock;
        const status = stock > 0 ? "In Stock" : "Out of Stock";
        const discount = product.pricing?.discount || product.discount || 0;

        // Format data for the table
        const rowData = [
          "", // Placeholder for image
          `${product.name}\n${
            product.description
              ? String(product.description).substring(0, 30) + "..."
              : ""
          }`,
          product.category?.name || "N/A",
          `Qty: ${stock}\nPrice: $${price.toLocaleString()}${
            discount > 0 ? `\nDisc: ${discount}%` : ""
          }`,
          status,
          `$${totalValue.toLocaleString()}`,
        ];
        tableRows.push(rowData);
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        theme: "grid",
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: "middle",
          overflow: "linebreak",
        },
        columnStyles: {
          0: { cellWidth: 15 }, // Image column
          1: { cellWidth: 50 }, // Product Details
        },
        didDrawCell: (data) => {
          if (data.column.index === 0 && data.cell.section === "body") {
            const product = allProducts[data.row.index];
            if (product.image?.url) {
              try {
                // Attempt to add image if URL is accessible
                doc.addImage(
                  product.image.url,
                  "JPEG",
                  data.cell.x + 1,
                  data.cell.y + 1,
                  13,
                  13
                );
              } catch (e) {
                // Fallback or ignore
              }
            }
          }
        },
        minCellHeight: 15,
      });

      doc.save(
        `inventory-overview-${new Date().toISOString().slice(0, 10)}.pdf`
      );
      toast.success("Report generated successfully", { id: "export-pdf" });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to generate report", { id: "export-pdf" });
    } finally {
      setIsExporting(false);
    }
  };

  const quickStats = [
    {
      title: "Total Products",
      value: inventorySummary?.totalProducts || 0,
      icon: <Package size={32} className="text-[#F97316]" />,
      link: "products",
    },
    {
      title: "Total Value",
      value: inventorySummary?.totalValue || 0,
      icon: <DollarSign size={32} className="text-[#F97316]" />,
      link: "report",
      isMoney: true,
    },
    {
      title: "Low Stock Alerts",
      value: unreadCount || 0,
      icon: <AlertTriangle size={32} className="text-[#F97316]" />,
      link: "alerts",
    },
  ];

  const recentActivities = [
    { action: "Added 50 units of iPhone 13", time: "2 minutes ago" },
    { action: "Low stock alert: Samsung S21", time: "15 minutes ago" },
    { action: "Sold 20 units of MacBook Pro", time: "1 hour ago" },
    { action: "New category created: Accessories", time: "2 hours ago" },
    { action: "Warehouse updated: Main Storage", time: "3 hours ago" },
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-gray-200 rounded-xl bg-white p-8 mb-8"
      >
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { href: "products", icon: Package, label: "Add Product" },
            { href: "categories", icon: ShoppingCart, label: "Add Category" },
            { href: "report", icon: TrendingUp, label: "View Reports" },
            { href: "alerts", icon: AlertTriangle, label: "View Alerts" },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <button className="w-full p-6 border border-gray-200 rounded-xl hover:border-[#EA580C] hover:bg-white transition-all flex flex-col items-center gap-3 group">
                <div className="w-16 h-16 rounded-full border-2 border-gray-200 group-hover:border-[#EA580C] flex items-center justify-center transition-all">
                  <item.icon size={28} className="text-[#F97316]" />
                </div>
                <span className="text-sm font-medium text-[#333]">
                  {item.label}
                </span>
              </button>
            </Link>
          ))}

          {/* Export Button */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full p-6 border border-gray-200 rounded-xl hover:border-[#EA580C] hover:bg-white transition-all flex flex-col items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-16 h-16 rounded-full border-2 border-gray-200 group-hover:border-[#EA580C] flex items-center justify-center transition-all">
              <Download size={28} className="text-[#F97316]" />
            </div>
            <span className="text-sm font-medium text-[#333]">
              {isExporting ? "Exporting..." : "Export Report"}
            </span>
          </button>
        </div>
      </motion.section>

      {/* Quick Stats – 3 cards, icon on right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {quickStats.map((stat) => {
          const displayVal = stat.isMoney
            ? `$${formatValue(stat.value, isCompactValue)}`
            : typeof stat.value === "number"
            ? stat.value.toLocaleString()
            : stat.value;

          return (
            <div
              key={stat.title}
              className="border border-gray-200 hover:border-[#EA580C] rounded-xl bg-white p-8 transition-all flex items-center justify-between group relative overflow-hidden"
            >
              <Link href={stat.link} className="absolute inset-0 z-0" />
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-sm font-medium text-[#333] mb-3">
                  {stat.title}
                </p>
                <div className="flex items-center gap-2">
                  <p
                    className={`font-bold text-[#1F1F1F] transition-all ${
                      displayVal.toString().length > 12
                        ? "text-2xl"
                        : "text-4xl"
                    }`}
                  >
                    {displayVal}
                  </p>
                  {stat.isMoney && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCompactValue(!isCompactValue);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#EA580C] transition-all z-20"
                      title={
                        isCompactValue
                          ? "Show full value"
                          : "Show compact value"
                      }
                    >
                      {isCompactValue ? (
                        <Maximize2 size={16} />
                      ) : (
                        <Minimize2 size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="text-[#F97316] relative z-10 shrink-0">
                {stat.icon}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Recent Products (Left) + Recent Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products – MUI */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            sx={{
              border: "1px solid #E5E5E5",
              borderRadius: 4,
              boxShadow: "none",
              backgroundColor: "white",
              "&:hover": { borderColor: "#EA580C" },
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={3}
                pb={1}
              >
                <Typography variant="h6" fontWeight={600} color="#1F1F1F">
                  Recent Products
                </Typography>
                <Link href="/inventory/products">
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="#333"
                    sx={{ "&:hover": { color: "#EA580C" } }}
                  >
                    View All
                  </Typography>
                </Link>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell align="center">Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.slice(0, 5).map((product) => {
                      const name = product.name || "Unnamed";
                      const image =
                        product.image?.url || product.images?.[0]?.url;

                      return (
                        <TableRow key={product._id} hover>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {image ? (
                                <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100 shrink-0">
                                  <Image
                                    src={image}
                                    alt={name}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center shrink-0">
                                  <Package
                                    size={20}
                                    className="text-orange-600"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate text-sm">
                                  {name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {product.category?.name || "N/A"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-gray-900">
                              ${(product.price || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell align="center">
                            {(() => {
                              const stockValue =
                                product.stock?.available ??
                                product.stock?.total ??
                                product.stock ??
                                0;
                              return (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    stockValue > 10
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {stockValue}
                                </span>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-200 rounded-2xl bg-white p-8 hover:border-[#EA580C] transition-all"
        >
          <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">
            Recent Activity
          </h2>
          <div className="space-y-5">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0">
                  {act.action.includes("Added") && (
                    <TrendingUp size={20} className="text-[#F97316]" />
                  )}
                  {act.action.includes("alert") && (
                    <AlertTriangle size={20} className="text-[#F97316]" />
                  )}
                  {act.action.includes("Sold") && (
                    <Package size={20} className="text-[#F97316]" />
                  )}
                  {!act.action.includes("Added") &&
                    !act.action.includes("alert") &&
                    !act.action.includes("Sold") && (
                      <ShoppingCart size={20} className="text-[#F97316]" />
                    )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1F1F1F]">
                    {act.action}
                  </p>
                  <p className="text-xs text-[#666] mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
