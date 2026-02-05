"use client";

import { useEffect, useState, Suspense } from "react";
import AnalyticsService from "@/services/analyticsService";
import { motion } from "framer-motion";

function EmployeePerformanceReportPageContent() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                const mockData = [
                    { id: 1, name: "Sarah Connor", sales: 15000, avatar: "https://i.pravatar.cc/150?u=1" },
                    { id: 2, name: "John Doe", sales: 12500, avatar: "https://i.pravatar.cc/150?u=2" },
                    { id: 3, name: "Jane Smith", sales: 11000, avatar: "https://i.pravatar.cc/150?u=3" },
                    { id: 4, name: "Mike Johnson", sales: 9500, avatar: "https://i.pravatar.cc/150?u=4" },
                    { id: 5, name: "Emily Davis", sales: 8000, avatar: "https://i.pravatar.cc/150?u=5" },
                ];
                setEmployees(mockData);
            } catch (error) {
                console.error("Failed to fetch employee performance data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Top Performers</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="space-y-6">
                        {employees.map((employee, index) => (
                            <motion.div
                                key={employee.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div className="flex-shrink-0 w-8 text-center font-bold text-gray-400 text-xl">
                                    #{index + 1}
                                </div>
                                <img
                                    src={employee.avatar}
                                    alt={employee.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div className="flex-grow">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-semibold text-gray-900">{employee.name}</span>
                                        <span className="font-bold text-green-600">${employee.sales.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${(employee.sales / employees[0].sales) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function EmployeePerformanceReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <EmployeePerformanceReportPageContent />
        </Suspense>
    );
}

