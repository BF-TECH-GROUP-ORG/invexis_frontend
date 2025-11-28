// src/components/inventory/dashboard/DashboardOverview.jsx
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { fetchInventorySummary } from "@/features/reports/reportsSlice";
import { fetchAlerts } from "@/features/alerts/alertsSlice";
import { fetchProducts } from "@/features/products/productsSlice";
import { motion } from "framer-motion";
import Link from "next/link";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function DashboardOverview() {
  const dispatch = useDispatch();
  const reportsState = useSelector((state) => state.reports || {});
  const inventorySummary = reportsState.inventorySummary;
  const alertsState = useSelector((state) => state.alerts || {});
  const unreadCount = alertsState.unreadCount;
  const productsState = useSelector((state) => state.products || {});
  const products = Array.isArray(productsState.items) ? productsState.items : [];

  useEffect(() => {
    dispatch(fetchInventorySummary());
    dispatch(fetchAlerts());
    dispatch(fetchProducts({ limit: 5 }));
  }, [dispatch]);

  const quickStats = [
    {
      title: "Total Products",
      value: inventorySummary?.totalProducts || 0,
      icon: <Package size={32} className="text-[#F97316]" />,
      href: "/inventory/products",
    },
    {
      title: "Total Value",
      value: `$${(inventorySummary?.totalValue || 0).toLocaleString()}`,
      icon: <DollarSign size={32} className="text-[#F97316]" />,
      href: "/inventory/report",
    },
    {
      title: "Low Stock Alerts",
      value: unreadCount || 0,
      icon: <AlertTriangle size={32} className="text-[#F97316]" />,
      href: "/inventory/alerts",
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
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { href: "/inventory/products/add", icon: Package, label: "Add Product" },
            { href: "/inventory/categories", icon: ShoppingCart, label: "Add Category" },
            { href: "/inventory/report", icon: TrendingUp, label: "View Reports" },
            { href: "/inventory/alerts", icon: AlertTriangle, label: "View Alerts" },
          ].map((item) => (
            <Link key={item.label} href={item.href} prefetch={true}>
              <button className="w-full p-6 border border-gray-200 rounded-xl hover:border-[#EA580C] hover:bg-white transition-all flex flex-col items-center gap-3 group">
                <div className="w-16 h-16 rounded-full border-2 border-gray-200 group-hover:border-[#EA580C] flex items-center justify-center transition-all">
                  <item.icon size={28} className="text-[#F97316]" />
                </div>
                <span className="text-sm font-medium text-[#333]">{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Quick Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {quickStats.map((stat) => (
          <Link key={stat.title} href={stat.href} prefetch={true}>
            <div className="border border-gray-200 hover:border-[#EA580C] rounded-xl bg-white p-8 transition-all cursor-pointer flex items-center justify-between group">
              <div>
                <p className="text-sm font-medium text-[#333]">{stat.title}</p>
                <p className="text-4xl font-bold text-[#1F1F1F] mt-3">{stat.value}</p>
              </div>
              <div className="text-[#F97316] opacity-80 group-hover:opacity-100 transition-opacity">
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Products + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card sx={{ 
            border: "1px solid #E5E5E5", 
            borderRadius: 4, 
            boxShadow: "none", 
            backgroundColor: "white",
            "&:hover": { borderColor: "#EA580C" }
          }}>
            <CardContent sx={{ p: 6 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight={600} color="#1F1F1F">
                  Recent Products
                </Typography>
                <Link href="products" prefetch={true}>
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    color="#333" 
                    sx={{ 
                      "&:hover": { color: "#EA580C" },
                      cursor: "pointer"
                    }}
                  >
                    View All →
                  </Typography>
                </Link>
              </Box>

              <List disablePadding>
                {products.slice(0, 5).map((product) => (
                  <Link 
                    key={product._id} 
                    href={`/inventory/products/${product._id}`} 
                    prefetch={true}
                  >
                    <ListItem
                      disableGutters
                      sx={{
                        py: 3,
                        borderBottom: "1px solid #F0F0F0",
                        "&:last-child": { borderBottom: "none" },
                        transition: "all 0.2s",
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#FFF7F0" }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={product.images?.[0]?.url || product.image?.url} 
                          alt={product.name}
                          sx={{ width: 56, height: 56, bgcolor: "white", border: "2px solid #E5E5E5" }}
                        >
                          <Package size={28} className="text-[#F97316]" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography fontWeight={600} color="#1F1F1F" fontSize="1rem">
                            {product.name}
                          </Typography>
                        }
                        secondary={
                          <Typography fontSize="0.875rem" color="#666" mt={0.5}>
                            Stock: {product.stock} units
                          </Typography>
                        }
                      />
                      <Typography fontWeight={700} color="#1F1F1F" fontSize="1.1rem">
                        ${product.price || product.pricing?.basePrice}
                      </Typography>
                    </ListItem>
                  </Link>
                ))}
              </List>
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
          <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Recent Activity</h2>
          <div className="space-y-5">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0">
                  {act.action.includes("Added") && <TrendingUp size={20} className="text-[#F97316]" />}
                  {act.action.includes("alert") && <AlertTriangle size={20} className="text-[#F97316]" />}
                  {act.action.includes("Sold") && <Package size={20} className="text-[#F97316]" />}
                  {!act.action.includes("Added") && !act.action.includes("alert") && !act.action.includes("Sold") && (
                    <ShoppingCart size={20} className="text-[#F97316]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1F1F1F]">{act.action}</p>
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