

"use client";
import { useSelector } from "react-redux";
import { selectDocumentStats } from "@/features/documents/documentsSlice";

export default function Statistics() {
  const stats = useSelector(selectDocumentStats);

  const StatCard = ({ label, value, subtext }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
      {subtext && <p className="text-xs text-gray-400 mt-4">{subtext}</p>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        label="Total Documents"
        value={stats.total}
        subtext={`${stats.thisMonth} added this month`}
      />
      <StatCard
        label="Inbound Value"
        value={`$${(stats.totalAmount / 1000).toFixed(1)}K`}
        subtext="0% of total"
      />
      <StatCard
        label="Financial Docs"
        value={stats.financial}
        subtext={`${stats.total > 0 ? ((stats.financial / stats.total) * 100).toFixed(0) : 0}% of total`}
      />
      <StatCard
        label="Archived"
        value={stats.archived}
        subtext="Stored safely"
      />
    </div>
  );
}