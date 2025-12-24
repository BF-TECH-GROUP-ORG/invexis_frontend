"use client"
import React from 'react';
import ProtectedRoute from '@/lib/ProtectedRoute';
import LogsDashboard from '@/components/logs/LogsDashboard';

const LogsPage = () => {
    return (
        <ProtectedRoute allowedRoles={["company_admin", "super_admin", "admin", "manager"]}>
            <LogsDashboard />
        </ProtectedRoute>
    );
};

export default LogsPage;
