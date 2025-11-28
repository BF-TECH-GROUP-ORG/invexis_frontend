"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { fetchAlerts, resolveAlert, deleteAlert } from "@/features/alerts/alertsSlice";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function AlertsList() {
  const dispatch = useDispatch();
  const { items, loading, unreadCount } = useSelector((state) => state.alerts);
  const [filter, setFilter] = useState("all"); // all, unresolved, resolved

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  const handleResolve = async (id) => {
    try {
      await dispatch(resolveAlert(id)).unwrap();
      toast.success("Alert resolved!");
    } catch (error) {
      toast.error("Failed to resolve alert");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this alert?")) {
      try {
        await dispatch(deleteAlert(id)).unwrap();
        toast.success("Alert deleted!");
      } catch (error) {
        toast.error("Failed to delete alert");
      }
    }
  };

  const filteredAlerts = items.filter((alert) => {
    if (filter === "unresolved") return !alert.isResolved;
    if (filter === "resolved") return alert.isResolved;
    return true;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case "low_stock":
        return <AlertCircle className="text-orange-500" size={24} />;
      case "expired":
        return <XCircle className="text-red-500" size={24} />;
      case "success":
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return <Clock className="text-blue-500" size={24} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-orange-100 text-orange-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unresolved alerts
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unresolved")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "unresolved"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Unresolved
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "resolved"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-lg text-gray-500">No alerts found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 border-l-4 rounded-lg ${
                  alert.isResolved
                    ? "bg-gray-50 border-gray-300"
                    : "bg-white border-orange-500 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{alert.title || "Alert"}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      {alert.product && (
                        <p className="text-xs text-gray-500">
                          Product: <span className="font-medium">{alert.product.name}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!alert.isResolved && (
                      <button
                        onClick={() => handleResolve(alert._id)}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(alert._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}