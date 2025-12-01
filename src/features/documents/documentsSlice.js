

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "@/utils/axiosClient";
import mockData from "./mockData";

// ==================== ASYNC THUNKS ====================

export const fetchData = createAsyncThunk("documents/fetchData", async (_, thunkAPI) => {
  try {
    const res = await axiosClient.get("/documents");
    return res.data;
  } catch (err) {
    console.warn("API failed, falling back to mockData");
    return mockData;
  }
});

// ✅ Create Document
export const createDocument = createAsyncThunk(
  "documents/create",
  async (documentData, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/documents", documentData);
      return res.data;
    } catch (err) {
      // Fallback for development
      const newDoc = {
        ...documentData,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        version: "v1.0",
        uploadedBy: "Current User",
        lastModified: new Date().toISOString().split('T')[0],
        size: "0 KB"
      };
      return newDoc;
    }
  }
);

// ✅ Update Document
export const updateDocument = createAsyncThunk(
  "documents/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put(`/documents/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update document");
    }
  }
);

// ✅ Delete Documents
export const deleteDocument = createAsyncThunk(
  "documents/delete",
  async (documentIds, { rejectWithValue }) => {
    try {
      await axiosClient.delete("/documents", { data: { ids: documentIds } });
      return documentIds;
    } catch (err) {
      // Fallback for development
      return documentIds;
    }
  }
);

// ✅ Bulk Update Status
export const bulkUpdateStatus = createAsyncThunk(
  "documents/bulkUpdateStatus",
  async ({ ids, status }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch("/documents/bulk-status", { ids, status });
      return { ids, status };
    } catch (err) {
      return { ids, status }; // Fallback
    }
  }
);

// ✅ Export Documents
export const exportDocuments = createAsyncThunk(
  "documents/export",
  async ({ format, filters }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/documents/export", { format, filters }, {
        responseType: "blob",
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to export");
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  items: [],
  status: "idle",
  error: null,
  search: "",
  filterStatus: "All",
  filterType: "All",
  filterPriority: "All",
  filterCategory: "All",
  dateRange: { start: null, end: null },
  sortField: "date",
  sortOrder: "desc",
  page: 1,
  perPage: 10,
  selected: [],
  viewMode: "table",
  currentDocument: null,
  uploadProgress: 0,
  exportLoading: false,
  lastFetch: null,
};

// ==================== SLICE ====================

const dataSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
      state.page = 1;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
      state.page = 1;
    },
    setFilterPriority: (state, action) => {
      state.filterPriority = action.payload;
      state.page = 1;
    },
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
      state.page = 1;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
      state.page = 1;
    },
    setSort: (state, action) => {
      const { field } = action.payload;
      if (state.sortField === field) {
        state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
      } else {
        state.sortField = field;
        state.sortOrder = "asc";
      }
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPerPage: (state, action) => {
      state.perPage = action.payload;
      state.page = 1;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    toggleSelect: (state, action) => {
      const id = action.payload;
      if (state.selected.includes(id)) {
        state.selected = state.selected.filter((sid) => sid !== id);
      } else {
        state.selected.push(id);
      }
    },
    selectAll: (state, action) => {
      state.selected = action.payload;
    },
    clearSelection: (state) => {
      state.selected = [];
    },
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.search = "";
      state.filterStatus = "All";
      state.filterType = "All";
      state.filterPriority = "All";
      state.filterCategory = "All";
      state.dateRange = { start: null, end: null };
      state.page = 1;
    },
  },
  extraReducers(builder) {
    // Fetch documents
    builder
      .addCase(fetchData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });

    // Create document
    builder
      .addCase(createDocument.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Update document
    builder
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete documents
    builder
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => !action.payload.includes(item.id));
        state.selected = [];
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Bulk update status
    builder
      .addCase(bulkUpdateStatus.fulfilled, (state, action) => {
        const { ids, status } = action.payload;
        state.items = state.items.map(item =>
          ids.includes(item.id) ? { ...item, status } : item
        );
        state.selected = [];
      });

    // Export documents
    builder
      .addCase(exportDocuments.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportDocuments.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportDocuments.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload;
      });
  },
});

// ==================== EXPORTS ====================

export const {
  setSearch,
  setFilterStatus,
  setFilterType,
  setFilterPriority,
  setFilterCategory,
  setDateRange,
  setSort,
  setPage,
  setPerPage,
  setViewMode,
  toggleSelect,
  selectAll,
  clearSelection,
  setCurrentDocument,
  clearCurrentDocument,
  clearError,
  resetFilters,
} = dataSlice.actions;

// ==================== SELECTORS ====================

// Enhanced filtered data selector
export const selectFilteredData = (state) => {
  const {
    items,
    search,
    filterStatus,
    filterType,
    filterPriority,
    filterCategory,
    dateRange,
    sortField,
    sortOrder,
    page,
    perPage,
  } = state.documents;

  let filtered = [...items];

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q) ||
        it.type.toLowerCase().includes(q) ||
        it.assignee?.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (filterStatus !== "All") {
    filtered = filtered.filter((it) => it.status === filterStatus);
  }

  // Type filter
  if (filterType !== "All") {
    filtered = filtered.filter((it) => it.type === filterType);
  }

  // Priority filter
  if (filterPriority !== "All") {
    filtered = filtered.filter((it) => it.priority === filterPriority);
  }

  // Category filter
  if (filterCategory !== "All") {
    filtered = filtered.filter((it) => it.category === filterCategory);
  }

  // Date range filter
  if (dateRange.start && dateRange.end) {
    filtered = filtered.filter((it) => {
      const docDate = new Date(it.date);
      return docDate >= new Date(dateRange.start) && docDate <= new Date(dateRange.end);
    });
  }

  // Sort
  filtered.sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return {
    data: paginated,
    totalPages,
    totalCount: items.length,
    filteredCount: filtered.length,
  };
};

// Statistics selector
export const selectDocumentStats = (state) => {
  const { items } = state.documents;

  return {
    total: items.length,
    financial: items.filter((it) => it.status === "Financial").length,
    workshop: items.filter((it) => it.status === "Workshop").length,
    archived: items.filter((it) => it.status === "Archived").length,
    totalAmount: items.reduce((sum, it) => sum + (it.amount || 0), 0),
    thisMonth: items.filter(it => {
      const docDate = new Date(it.date);
      const now = new Date();
      return docDate.getMonth() === now.getMonth() && 
             docDate.getFullYear() === now.getFullYear();
    }).length,
    highPriority: items.filter((it) => it.priority === "high").length,
  };
};

// ✅ Get unique categories
export const selectCategories = (state) => {
  const categories = new Set(state.documents.items.map(item => item.category).filter(Boolean));
  return ['All', ...Array.from(categories)];
};

// ✅ Get unique assignees
export const selectAssignees = (state) => {
  const assignees = new Set(state.documents.items.map(item => item.assignee).filter(Boolean));
  return Array.from(assignees);
};

export default dataSlice.reducer;