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
            });
            return response.data;
        } catch (error) {
            // Mock download if API not available
            console.warn("Download API failed, creating mock blob");
            return new Blob(["Mock PDF Content"], { type: 'application/pdf' });
        }
    }
};

export default documentService;
