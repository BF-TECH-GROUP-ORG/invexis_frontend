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
} from "@/features/documents/documentsSlice";

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

  const getFileIcon = (type) => {
    switch (type) {
      case 'Invoice': return '📄';
      case 'Report': return '📊';
      case 'Agreement': return '🤝';
      default: return '📁';
    }
  };

  if (status === "loading") return <div className="p-12 text-center text-gray-500">Loading...</div>;
  if (status === "failed") return <div className="p-12 text-center text-red-500">Failed to load data</div>;

  // Grid View
  const DocumentCard = ({ doc }) => (
    <div
      onClick={() => handleRowClick(doc)}
      className="bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-orange-50 text-2xl rounded-lg group-hover:bg-orange-100 transition-colors">
            {getFileIcon(doc.type)}
          </div>
          <input
            type="checkbox"
            checked={selected.includes(doc.id)}
            onClick={(e) => e.stopPropagation()}
            onChange={() => dispatch(toggleSelect(doc.id))}
            className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
          />
        </div>

        <h3 className="font-semibold text-gray-900 truncate mb-1">{doc.name}</h3>
        <p className="text-xs text-gray-500 mb-4">{doc.date} • {doc.size}</p>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900">${doc.amount?.toLocaleString()}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${doc.status === 'Approved' ? 'bg-green-100 text-green-700' :
            doc.status === 'Financial' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
            {doc.status}
          </span>
        </div>
      </div>
    </div>
  );

  // Table View
  const TableRow = ({ doc }) => (
    <tr
      onClick={() => handleRowClick(doc)}
      className="border-b border-gray-100 hover:bg-orange-50/50 transition-colors cursor-pointer last:border-0"
    >
      <td className="p-4 w-12" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected.includes(doc.id)}
          onChange={() => dispatch(toggleSelect(doc.id))}
          className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
        />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl bg-gray-50 w-8 h-8 flex items-center justify-center rounded">
            {getFileIcon(doc.type)}
          </span>
          <div>
            <p className="font-medium text-gray-900">{doc.name}</p>
            <p className="text-xs text-gray-500">{doc.tags?.join(", ")}</p>
          </div>
        </div>
      </td>
      <td className="p-4 text-sm text-gray-600">{doc.type}</td>
      <td className="p-4 text-sm font-medium text-gray-900">${doc.amount?.toLocaleString()}</td>
      <td className="p-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
            {doc.uploadedBy?.charAt(0) || 'U'}
          </div>
          <span className="truncate max-w-[100px]">{doc.uploadedBy || 'Unknown'}</span>
        </div>
      </td>
      <td className="p-4">
        <span
          className={`px-2 py-1 rounded-md text-xs font-semibold ${doc.status === "Financial" ? "bg-blue-50 text-blue-700" :
            doc.status === "Workshop" ? "bg-yellow-50 text-yellow-700" :
              doc.status === "Approved" ? "bg-green-50 text-green-700" :
                doc.status === "Archived" ? "bg-gray-100 text-gray-600" :
                  "bg-gray-50 text-gray-700"
            }`}
        >
          {doc.status}
        </span>
      </td>
      <td className="p-4">
        {doc.priority && (
          <span className={`text-xs font-medium ${doc.priority === 'high' ? 'text-red-600' :
            doc.priority === 'medium' ? 'text-orange-600' : 'text-gray-500'
            }`}>
            {doc.priority.charAt(0).toUpperCase() + doc.priority.slice(1)}
          </span>
        )}
      </td>
    </tr>
  );

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
        <p className="text-gray-500">Get started by uploading your first file.</p>
      </div>
    );
  }

  return (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                    />
                  </th>
                  {[
                    { id: 'name', label: 'Name' },
                    { id: 'type', label: 'Type' },
                    { id: 'amount', label: 'Value' },
                    { id: 'uploadedBy', label: 'Uploaded by' },
                    { id: 'status', label: 'Status' },
                    { id: 'priority', label: 'Priority' },
                  ].map(h => (
                    <th key={h.id} className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => dispatch(setSort({ field: h.id }))}
                    >
                      {h.label} {sortField === h.id && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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
