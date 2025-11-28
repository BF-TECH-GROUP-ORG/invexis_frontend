

'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';  
import store from '@/store/store';        
import Controls from '@/components/documents/Controls';
import DataTable from '@/components/documents/DataTable';
import Statistics from '@/components/documents/Statistics';
import Pagination from '@/components/documents/Pagination';
import DocumentModal from '@/components/documents/DocumentModal';

function DocumentsContent() {
  const [showModal, setShowModal] = useState(null); // 'add', 'view', 'edit', null
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleAddNew = () => {
    setSelectedDoc(null);
    setShowModal('add');
  };

  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
    setShowModal('view');
  };

  const handleEditDocument = (doc) => {
    setSelectedDoc(doc);
    setShowModal('edit');
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setSelectedDoc(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Management</h1>
        <p className="text-gray-600">Manage and organize all your business documents</p>
      </div>

      {/* Statistics Cards */}
      <Statistics />

      {/* Controls (Search, Filters, Actions) */}
      <Controls onAddNew={handleAddNew} />

      {/* Data Table / Grid */}
      <DataTable 
        onViewDocument={handleViewDocument}
        onEditDocument={handleEditDocument}
      />

      {/* Pagination */}
      <Pagination />

      {/* Modal for Add/Edit/View */}
      {showModal && (
        <DocumentModal
          mode={showModal}
          document={selectedDoc}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Provider store={store}>
      <DocumentsContent />
    </Provider>
  );
}