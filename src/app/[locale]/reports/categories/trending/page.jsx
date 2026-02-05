"use client";

import { useEffect, useState, Suspense } from "react";
import AnalyticsService from "@/services/analyticsService";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#8889DD", "#9597E4", "#8DC77B", "#A5D297", "#E2CF45", "#F8C12D"];

const CustomizedContent = (props) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : "none",
                    stroke: "#fff",
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {depth === 1 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 7}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                >
                    {name}
                </text>
            ) : null}
            {depth === 1 ? (
                <text
                    x={x + 4}
                    y={y + 18}
                    fill="#fff"
                    fontSize={16}
                    fillOpacity={0.9}
                >
                    {index + 1}
                </text>
            ) : null}
        </g>
    );
};

function TrendingCategoriesReportPageContent() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                const mockData = [
                    {
                        name: "Electronics",
                        children: [
                            { name: "Phones", size: 10000 },
                            { name: "Laptops", size: 8000 },
                            { name: "Accessories", size: 5000 },
                        ],
                    },
                    {
                        name: "Clothing",
                        children: [
                            { name: "Men", size: 7000 },
                            { name: "Women", size: 9000 },
                        ],
                    },
                    {
                        name: "Home",
                        children: [
                            { name: "Furniture", size: 4000 },
                            { name: "Decor", size: 3000 },
                        ],
                    },
                ];
                setData(mockData);
            } catch (error) {
                console.error("Failed to fetch trending categories data", error);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Trending Categories</h1>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[600px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={data}
                            dataKey="size"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent colors={COLORS} />}
                        >
                            <Tooltip />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}


export default function TrendingCategoriesReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <TrendingCategoriesReportPageContent />
        </Suspense>
    );
}

