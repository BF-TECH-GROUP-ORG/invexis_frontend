import axiosClient from "@/utils/axiosClient";
import mockData from '@/features/documents/mockData';

const documentService = {
    // Get all documents
    getAll: async (params) => {
        try {
            // If developer wants to use local mocks, enable via env var NEXT_PUBLIC_USE_MOCKS=true
            if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
                return mockData;
            }
            const response = await axiosClient.get("/documents", { params });
            return response.data;
        } catch (error) {
            // If API fails, fall back to bundled mock data to keep the UI functional during dev
            console.warn('documentService.getAll failed, returning mock data', error);
            return mockData;
        }
    },

    // Create a new document
    create: async (data) => {
        try {
            const response = await axiosClient.post("/documents", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update a document
    update: async (id, data) => {
        try {
            const response = await axiosClient.put(`/documents/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Move to Trash (Soft Delete)
    moveToTrash: async (id) => {
        try {
            const response = await axiosClient.patch(`/documents/${id}/status`, { status: 'Trash' });
            return response.data;
        } catch (error) {
            // Fallback for demo if API fails
            return { id, status: 'Trash' };
        }
    },

    // Archive Document
    archive: async (id) => {
        try {
            const response = await axiosClient.patch(`/documents/${id}/status`, { status: 'Archived' });
            return response.data;
        } catch (error) {
            // Fallback for demo
            return { id, status: 'Archived' };
        }
    },

    // Permanent Delete
    delete: async (id) => {
        try {
            await axiosClient.delete(`/documents/${id}`);
            return id;
        } catch (error) {
            throw error;
        }
    },

    // Download Document
    download: async (id) => {
        try {
            const response = await axiosClient.get(`/documents/${id}/download`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                }
            });
            return response.data;
        } catch (error) {
            // Mock download if API not available
            console.warn("Download API failed, creating mock PDF blob");
            // A more realistic mock PDF header to ensure browsers treat it as PDF
            const pdfHeader = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n178\n%%EOF";
            return new Blob([pdfHeader], { type: 'application/pdf' });
        }
    }
};

export default documentService;
