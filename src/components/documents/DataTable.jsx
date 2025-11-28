"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchData,
  toggleSelect,
  selectAll,
  clearSelection,
  selectFilteredData,
  setSort,
  setCurrentDocument,
} from "@/Data/dataSlice";

export default function DataTable({ onViewDocument, onEditDocument }) {
  const dispatch = useDispatch();
  const { status, selected, sortField, sortOrder, viewMode } = useSelector(
    (s) => s.documents
  );
  const { data, totalCount, filteredCount } = useSelector(selectFilteredData);

  useEffect(() => {
    if (status === "idle") dispatch(fetchData());
  }, [dispatch, status]);

  const allSelected = data.length > 0 && selected.length === data.length;

  const handleSelectAll = () => {
    if (allSelected) dispatch(clearSelection());
    else dispatch(selectAll(data.map((d) => d.id)));
  };

  const handleRowClick = (doc) => {
    dispatch(setCurrentDocument(doc));
    if (onViewDocument) onViewDocument(doc);
  };

  const handleEdit = (e, doc) => {
    e.stopPropagation();
    dispatch(setCurrentDocument(doc));
    if (onEditDocument) onEditDocument(doc);
  };

  if (status === "loading") {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="inline-block animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-600">Loading documents...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-semibold mb-2">Failed to load documents</p>
        <p className="text-gray-500 text-sm">Please try again later</p>
      </div>
    );
  }

  // Grid View
  const DocumentCard = ({ doc }) => (
    <div
      onClick={() => handleRowClick(doc)}
      className="bg-white rounded-lg shadow hover:shadow-xl transition-all border border-gray-200 hover:border-orange-500 cursor-pointer"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={selected.includes(doc.id)}
            onChange={(e) => {
              e.stopPropagation();
              dispatch(toggleSelect(doc.id));
            }}
            className="mt-1 h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
          />
          <div className="flex gap-1">
            <button
              onClick={(e) => handleEdit(e, doc)}
              className="p-1 hover:bg-orange-50 rounded transition-colors"
              title="Edit"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Document Info */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="font-semibold text-gray-900 truncate">{doc.name}</h3>
          </div>
          <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm mb-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-gray-900">${doc.amount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="text-gray-700">{doc.date}</span>
          </div>
          {doc.assignee && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Assignee:</span>
              <span className="text-gray-700 text-xs truncate max-w-[120px]">{doc.assignee}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              doc.status === "Financial"
                ? "bg-green-100 text-green-700"
                : doc.status === "Workshop"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {doc.status}
          </span>
          {doc.priority && (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                doc.priority === "high"
                  ? "bg-red-100 text-red-700"
                  : doc.priority === "medium"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {doc.priority}
            </span>
          )}
        </div>

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {doc.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
            {doc.tags.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{doc.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Table View
  const TableRow = ({ doc }) => (
    <tr
      onClick={() => handleRowClick(doc)}
      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <td className="p-3">
        <input
          type="checkbox"
          checked={selected.includes(doc.id)}
          onChange={(e) => {
            e.stopPropagation();
            dispatch(toggleSelect(doc.id));
          }}
          className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
        />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <p className="font-semibold text-gray-900">{doc.name}</p>
            <p className="text-xs text-gray-500">{doc.description}</p>
          </div>
        </div>
      </td>
      <td className="p-3 text-gray-700">{doc.type}</td>
      <td className="p-3 text-gray-700">{doc.date}</td>
      <td className="p-3 font-bold text-gray-900">${doc.amount.toLocaleString()}</td>
      <td className="p-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            doc.status === "Financial"
              ? "bg-green-100 text-green-700"
              : doc.status === "Workshop"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {doc.status}
        </span>
      </td>
      <td className="p-3">
        {doc.priority && (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              doc.priority === "high"
                ? "bg-red-100 text-red-700"
                : doc.priority === "medium"
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {doc.priority}
          </span>
        )}
      </td>
      <td className="p-3 text-gray-600 text-sm">{doc.assignee}</td>
      <td className="p-3">
        <div className="flex gap-1">
          <button
            onClick={(e) => handleEdit(e, doc)}
            className="p-1 hover:bg-orange-50 rounded transition-colors"
            title="Edit"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert("Download functionality");
            }}
            className="p-1 hover:bg-orange-50 rounded transition-colors"
            title="Download"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );

  // Empty State
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="h-20 w-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 text-lg font-medium mb-1">No documents found</p>
        <p className="text-gray-400 text-sm">
          {filteredCount === 0 && totalCount > 0
            ? "Try adjusting your filters"
            : "Get started by adding your first document"}
        </p>
      </div>
    );
  }

  // Render
  return (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </th>
                  {[
                    { field: "name", label: "Name" },
                    { field: "type", label: "Type" },
                    { field: "date", label: "Date" },
                    { field: "amount", label: "Amount" },
                    { field: "status", label: "Status" },
                    { field: "priority", label: "Priority" },
                    { field: "assignee", label: "Assignee" },
                    { field: "actions", label: "Actions" },
                  ].map((col) => (
                    <th
                      key={col.field}
                      onClick={() =>
                        ["name", "type", "date", "amount"].includes(col.field) &&
                        dispatch(setSort({ field: col.field }))
                      }
                      className={`p-3 text-left text-sm font-semibold text-gray-700 ${
                        ["name", "type", "date", "amount"].includes(col.field)
                          ? "cursor-pointer hover:bg-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortField === col.field && (
                          <span className="text-orange-500">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((doc) => (
                  <TableRow key={doc.id} doc={doc} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
