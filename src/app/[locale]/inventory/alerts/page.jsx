// // src/app/[locale]/inventory/alerts/page.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Bell,
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Trash2,
//   Settings,
//   RefreshCw,
//   Search,
//   Filter,
//   CheckCheck,
//   Package,
//   Calendar,
//   Loader2
// } from "lucide-react";
// import { motion } from "framer-motion";
// import {
//   getAlerts,
//   resolveAlert,
//   deleteAlert,
//   markAllAlertsAsRead
// } from "@/services/alertService";
// import { AlertSettingsModal } from "@/components/inventory/alerts";

// const alertTypeIcons = {
//   low_stock: { icon: Package, color: "orange" },
//   expired: { icon: Calendar, color: "red" },
//   out_of_stock: { icon: XCircle, color: "gray" },
//   success: { icon: CheckCircle, color: "green" },
//   info: { icon: Clock, color: "blue" },
// };

// export default function AlertsPage() {
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all");
//   const [priorityFilter, setPriorityFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showSettings, setShowSettings] = useState(false);
//   const [page, setPage] = useState(0);
//   const [total, setTotal] = useState(0);
//   const [message, setMessage] = useState(null);

//   // In a real app, get this from your auth context/store
//   const companyId = typeof window !== 'undefined'
//     ? localStorage.getItem('companyId') || 'demo-company'
//     : 'demo-company';

//   useEffect(() => {
//     fetchAlerts();
//   }, [filter, priorityFilter]);

//   const fetchAlerts = async () => {
//     setLoading(true);
//     try {
//       const result = await getAlerts({
//         companyId,
//         status: filter !== "all" ? filter : undefined,
//         priority: priorityFilter !== "all" ? priorityFilter : undefined
//       });
//       setAlerts(result?.data || []);
//       setTotal(result?.pagination?.total || 0);
//     } catch (err) {
//       // Placeholder data for demo
//       setAlerts([
//         {
//           _id: "1",
//           type: "low_stock",
//           title: "Low Stock Alert",
//           message: "iPhone 13 Pro stock is below threshold (5 units remaining)",
//           priority: "high",
//           isResolved: false,
//           isRead: false,
//           product: { name: "iPhone 13 Pro", sku: "IP13P-256" },
//           createdAt: new Date().toISOString()
//         },
//         {
//           _id: "2",
//           type: "expired",
//           title: "Product Expiring Soon",
//           message: "Milk 1L will expire in 3 days",
//           priority: "medium",
//           isResolved: false,
//           isRead: true,
//           product: { name: "Milk 1L", sku: "MILK-1L" },
//           createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
//         },
//         {
//           _id: "3",
//           type: "out_of_stock",
//           title: "Out of Stock",
//           message: "Samsung Galaxy S21 is out of stock",
//           priority: "high",
//           isResolved: true,
//           isRead: true,
//           product: { name: "Samsung Galaxy S21", sku: "SGS21-128" },
//           createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
//         },
//         {
//           _id: "4",
//           type: "success",
//           title: "Stock Replenished",
//           message: "MacBook Pro stock has been replenished (50 units added)",
//           priority: "low",
//           isResolved: true,
//           isRead: true,
//           product: { name: "MacBook Pro M2", sku: "MBP-M2-14" },
//           createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
//         },
//       ]);
//       setTotal(4);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResolve = async (id) => {
//     try {
//       await resolveAlert(id);
//       setMessage({ type: "success", text: "Alert resolved!" });
//       setAlerts(alerts.map(a => a._id === id ? { ...a, isResolved: true } : a));
//     } catch (err) {
//       // Fallback for demo
//       setAlerts(alerts.map(a => a._id === id ? { ...a, isResolved: true } : a));
//       setMessage({ type: "success", text: "Alert resolved!" });
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this alert?")) return;

//     try {
//       await deleteAlert(id);
//       setAlerts(alerts.filter(a => a._id !== id));
//       setMessage({ type: "success", text: "Alert deleted!" });
//     } catch (err) {
//       // Fallback for demo
//       setAlerts(alerts.filter(a => a._id !== id));
//       setMessage({ type: "success", text: "Alert deleted!" });
//     }
//   };

//   const handleMarkAllRead = async () => {
//     try {
//       await markAllAlertsAsRead(companyId);
//       setAlerts(alerts.map(a => ({ ...a, isRead: true })));
//       setMessage({ type: "success", text: "All alerts marked as read!" });
//     } catch (err) {
//       setAlerts(alerts.map(a => ({ ...a, isRead: true })));
//       setMessage({ type: "success", text: "All alerts marked as read!" });
//     }
//   };

//   const filteredAlerts = alerts.filter((alert) => {
//     const matchesSearch = searchTerm === "" ||
//       alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (alert.product?.name && alert.product.name.toLowerCase().includes(searchTerm.toLowerCase()));
//     return matchesSearch;
//   });

//   const stats = {
//     total: alerts.length,
//     unresolved: alerts.filter(a => !a.isResolved).length,
//     unread: alerts.filter(a => !a.isRead).length,
//     highPriority: alerts.filter(a => a.priority === "high" && !a.isResolved).length,
//   };

//   const getPriorityColor = (priority) => {
//     const colors = {
//       high: "bg-red-100 text-red-700",
//       medium: "bg-orange-100 text-orange-700",
//       low: "bg-blue-100 text-blue-700",
//     };
//     return colors[priority] || "bg-gray-100 text-gray-700";
//   };

//   const getAlertIcon = (type) => {
//     const config = alertTypeIcons[type] || alertTypeIcons.info;
//     const Icon = config.icon;
//     const colorClasses = {
//       orange: "text-orange-500",
//       red: "text-red-500",
//       green: "text-green-500",
//       blue: "text-blue-500",
//       gray: "text-gray-500",
//     };
//     return <Icon size={24} className={colorClasses[config.color]} />;
//   };

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     return date.toLocaleDateString();
//   };

//   return (
//     <div className="min-h-screen bg-white p-6">
//       {/* Page Header */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
//               <Bell size={24} className="text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
//               <p className="text-gray-500">{stats.unresolved} unresolved alerts</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={handleMarkAllRead}
//               className="px-4 py-2.5 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
//             >
//               <CheckCheck size={16} />
//               Mark All Read
//             </button>
//             <button
//               onClick={() => setShowSettings(true)}
//               className="px-4 py-2.5 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
//             >
//               <Settings size={16} />
//               Settings
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Total Alerts</p>
//               <p className="text-xl font-bold text-gray-900">{stats.total}</p>
//             </div>
//             <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
//               <Bell size={20} className="text-orange-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Unresolved</p>
//               <p className="text-xl font-bold text-gray-900">{stats.unresolved}</p>
//             </div>
//             <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
//               <AlertTriangle size={20} className="text-yellow-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Unread</p>
//               <p className="text-xl font-bold text-gray-900">{stats.unread}</p>
//             </div>
//             <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//               <Clock size={20} className="text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">High Priority</p>
//               <p className="text-xl font-bold text-gray-900">{stats.highPriority}</p>
//             </div>
//             <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
//               <XCircle size={20} className="text-red-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {message && (
//         <div className={`mb-6 p-4 rounded-lg ${message.type === "success"
//           ? "bg-green-50 text-green-700 border border-green-100"
//           : "bg-red-50 text-red-700 border border-red-100"
//           }`}>
//           {message.text}
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
//         <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
//           <div className="flex flex-1 gap-3 w-full sm:w-auto">
//             {/* Search */}
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search alerts..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
//               />
//             </div>

//             {/* Status Filter */}
//             <div className="flex bg-gray-100 rounded-lg p-1">
//               {["all", "unresolved", "resolved"].map((f) => (
//                 <button
//                   key={f}
//                   onClick={() => setFilter(f)}
//                   className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${filter === f
//                     ? "bg-white shadow-sm text-orange-600"
//                     : "text-gray-600 hover:text-gray-900"
//                     }`}
//                 >
//                   {f}
//                 </button>
//               ))}
//             </div>

//             {/* Priority Filter */}
//             <select
//               value={priorityFilter}
//               onChange={(e) => setPriorityFilter(e.target.value)}
//               className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
//             >
//               <option value="all">All Priority</option>
//               <option value="high">High</option>
//               <option value="medium">Medium</option>
//               <option value="low">Low</option>
//             </select>
//           </div>

//           <button
//             onClick={fetchAlerts}
//             className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
//           >
//             <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
//           </button>
//         </div>
//       </div>

//       {/* Alerts List */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         {loading ? (
//           <div className="p-12 text-center">
//             <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
//             <p className="text-gray-500 mt-3">Loading alerts...</p>
//           </div>
//         ) : filteredAlerts.length === 0 ? (
//           <div className="p-12 text-center">
//             <Bell size={48} className="mx-auto text-gray-300 mb-3" />
//             <p className="text-gray-500">No alerts found</p>
//           </div>
//         ) : (
//           <div className="divide-y divide-gray-100">
//             {filteredAlerts.map((alert, index) => (
//               <motion.div
//                 key={alert._id}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.03 }}
//                 className={`p-4 flex items-start gap-4 transition-colors ${alert.isResolved
//                   ? "bg-gray-50"
//                   : alert.isRead
//                     ? "bg-white"
//                     : "bg-orange-50/30"
//                   }`}
//               >
//                 {/* Unread Indicator */}
//                 <div className="pt-1">
//                   {!alert.isRead && (
//                     <div className="w-2 h-2 bg-orange-500 rounded-full" />
//                   )}
//                 </div>

//                 {/* Content */}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h3 className={`font-semibold ${alert.isResolved ? "text-gray-500" : "text-gray-900"}`}>
//                       {alert.title}
//                     </h3>
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
//                       {alert.priority}
//                     </span>
//                     {alert.isResolved && (
//                       <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
//                         Resolved
//                       </span>
//                     )}
//                   </div>
//                   <p className={`text-sm mb-2 ${alert.isResolved ? "text-gray-400" : "text-gray-600"}`}>
//                     {alert.message}
//                   </p>
//                   {alert.product && (
//                     <p className="text-xs text-gray-500">
//                       Product: <span className="font-medium">{alert.product.name}</span>
//                       {alert.product.sku && <span className="text-gray-400 ml-2">({alert.product.sku})</span>}
//                     </p>
//                   )}
//                   <p className="text-xs text-gray-400 mt-2">{formatTime(alert.createdAt)}</p>
//                 </div>

//                 {/* Icon */}
//                 <div className="mt-0.5">{getAlertIcon(alert.type)}</div>

//                 {/* Actions */}
//                 <div className="flex items-center gap-2">
//                   {!alert.isResolved && (
//                     <button
//                       onClick={() => handleResolve(alert._id)}
//                       className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
//                     >
//                       Resolve
//                     </button>
//                   )}
//                   <button
//                     onClick={() => handleDelete(alert._id)}
//                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Settings Modal */}
//       <AlertSettingsModal
//         isOpen={showSettings}
//         onClose={() => setShowSettings(false)}
//         companyId={companyId}
//       />
//     </div>
//   );
// }