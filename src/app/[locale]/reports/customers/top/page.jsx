"use client";

import { useEffect, useState, Suspense } from "react";
import AnalyticsService from "@/services/analyticsService";

function TopCustomersReportPageContent() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                const mockData = [
                    { id: 1, name: "Alice Johnson", orders: 15, totalSpent: 2500.00, lastOrder: "2024-12-10" },
                    { id: 2, name: "Bob Smith", orders: 12, totalSpent: 1850.50, lastOrder: "2024-12-12" },
                    { id: 3, name: "Charlie Brown", orders: 10, totalSpent: 1600.00, lastOrder: "2024-12-08" },
                    { id: 4, name: "Diana Prince", orders: 8, totalSpent: 1450.75, lastOrder: "2024-12-14" },
                    { id: 5, name: "Evan Wright", orders: 6, totalSpent: 900.00, lastOrder: "2024-12-01" },
                ];
                setCustomers(mockData);
            } catch (error) {
                console.error("Failed to fetch top customers", error);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Top Customers</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Orders</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total Spent</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Last Order</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-900 font-medium">{customer.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{customer.orders}</td>
                                        <td className="px-6 py-4 text-green-600 font-medium">${customer.totalSpent.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-gray-500">{customer.lastOrder}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Placeholder */}
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                        <span>Showing 1-5 of 50</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>Previous</button>
                            <button className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function TopCustomersReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <TopCustomersReportPageContent />
        </Suspense>
    );
}

