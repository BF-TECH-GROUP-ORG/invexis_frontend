"use client";
import { useDispatch, useSelector } from "react-redux";
import { setPage, setPerPage, selectFilteredData } from "@/features/documents/dataSlice";

export default function Pagination() {
  const dispatch = useDispatch();
  const { page, perPage } = useSelector((s) => s.documents);
  const { totalPages, filteredCount } = useSelector(selectFilteredData);

  if (totalPages <= 1) return null;

  const startIndex = (page - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, filteredCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow p-4 gap-4">
      {/* Items Info */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
          <span className="font-semibold">{endIndex}</span> of{" "}
          <span className="font-semibold">{filteredCount}</span> results
        </span>
        <select
          value={perPage}
          onChange={(e) => dispatch(setPerPage(Number(e.target.value)))}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-500"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
          disabled={page === 1}
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((pageNum, idx) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => dispatch(setPage(pageNum))}
              className={`px-4 py-2 rounded-md transition-colors ${page === pageNum
                ? "bg-orange-500 text-white font-semibold"
                : "border border-gray-300 hover:bg-orange-100 text-orange-700"
                }`}
            >
              {pageNum}
            </button>
          )
        ))}

        {/* Next Button */}
        <button
          onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
          disabled={page === totalPages}
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
