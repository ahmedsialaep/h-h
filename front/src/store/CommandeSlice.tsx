// store/commandeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Commande, CommandeDto, CommandeFilterRequest, CommandeRequest } from "@/models/Commande";
import { adminApi } from "@/services/AdminApi";
import { PagedResponse } from "@/models/PagedResponse";
import api from "@/services/http-common";
import { CommandeItemDto } from "@/models/CommandItem";

type Status = "idle" | "loading" | "succeeded" | "failed";
type StatusItems = "idle" | "loading" | "succeeded" | "failed";
interface CommandeState {
  items: CommandeDto[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  filters: CommandeFilterRequest;
  status: Status;
  statusItems: StatusItems;
  error: string | null;
  myOrders: CommandeDto[];
  myOrdersTotalPages: number;
  myOrdersCurrentPage: number;
  myOrdersFilters: CommandeFilterRequest;
  OrderItems: Record<string, CommandeItemDto[]>;
  myOrdersStatus: Status;
  selectedOrder: CommandeDto | null;
  selectedOrderStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialFilters: CommandeFilterRequest = {
  page: 0,
  pageSize: 10,
  userId: null,
  search: null,
  status: null,
};
const initialMyOrdersFilters: CommandeFilterRequest = {
  page: 0,
  pageSize: 7,
  userId: null,
  search: null,
  status: null,
};
const initialState: CommandeState = {
  items: [],
  totalPages: 0,
  totalItems: 0,
  currentPage: 0,
  filters: initialFilters,
  status: "idle",
  statusItems: "idle",
  error: null,
  myOrders: [],
  myOrdersTotalPages: 0,
  myOrdersCurrentPage: 0,
  myOrdersFilters: initialMyOrdersFilters,
  myOrdersStatus: "idle",
  OrderItems: {},
  
  selectedOrder: null,
  selectedOrderStatus: "idle",
};


export const createCommande = createAsyncThunk<
  CommandeDto,
  CommandeRequest,
  { rejectValue: string }
>("commandes/create", async (request, { rejectWithValue }) => {
  try {
    const response = await api.post<CommandeDto>("/commande/checkout", request);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to create commande");
  }
});
export const fetchMyOrders = createAsyncThunk<
  PagedResponse<CommandeDto>,
  CommandeFilterRequest,
  { rejectValue: string }
>("commandes/myOrders", async (filter, { rejectWithValue }) => {
  try {
    const response = await api.get<PagedResponse<CommandeDto>>("/commande/my-orders", {
      params: filter,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch orders");
  }
});
export const fetchCommandes = createAsyncThunk<
  PagedResponse<CommandeDto>,
  CommandeFilterRequest,
  { rejectValue: string }
>("commandes/fetchAll", async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    });
    const response = await adminApi.get("/commande/getAll", { params });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch commandes");
  }
});
export const fetchCommandeItems = createAsyncThunk<
  CommandeItemDto[],
  string,
  { rejectValue: string }
>("commandes/items/fetchAll", async (ref, { rejectWithValue }) => {
  try {

    const response = await adminApi.get("/commande/items", { params: { ref } });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch commandes items");
  }
});
export const fetchOrderByRef = createAsyncThunk<
  CommandeDto,
  string,
  { rejectValue: string }
>("commandes/fetchByRef", async (ref, { rejectWithValue }) => {
  try {
    const response = await api.get<CommandeDto>(`/commande/${ref}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Commande introuvable");
  }
});

export const updateCommandeStatus = createAsyncThunk<
  CommandeDto,
  { id: number; status: string; commentaire?: string },
  { rejectValue: string }
>("commandes/updateStatus", async ({ id, status, commentaire }, { rejectWithValue }) => {
  try {
    const response = await adminApi.put(`/commande/${id}/status`, null, {
      params: { status, ...(commentaire ? { commentaire } : {}) },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to update status");
  }
});

const commandeSlice = createSlice({
  name: "commandes",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CommandeFilterRequest>>) => {
      state.filters = { ...state.filters, ...action.payload, page: 0 };
    },
    setMyordersFilters: (state, action: PayloadAction<Partial<CommandeFilterRequest>>) => {
      state.myOrdersFilters = { ...state.myOrdersFilters, ...action.payload, page: 0 };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    setMyOrdersPage: (state, action: PayloadAction<number>) => {
      state.myOrdersFilters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    resetMyOrdersFilters: (state) => {
      state.myOrdersFilters = initialMyOrdersFilters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCommande.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createCommande.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createCommande.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(fetchCommandes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCommandes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalItems = action.payload.totalItems;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchCommandes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(fetchCommandeItems.pending, (state) => {
        state.statusItems = "loading";
        state.error = null;
      })
      .addCase(fetchCommandeItems.fulfilled, (state, action) => {
        state.statusItems = "succeeded";
        state.OrderItems[action.meta.arg] = action.payload;

      })
      .addCase(fetchCommandeItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(updateCommandeStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.myOrdersStatus = "loading";
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrdersStatus = "succeeded";
        state.myOrders = action.payload.content;
        state.myOrdersTotalPages = action.payload.totalPages;
        state.myOrdersCurrentPage = action.payload.currentPage;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.myOrdersStatus = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(fetchOrderByRef.pending, (state) => {
        state.selectedOrderStatus = "loading";
        state.selectedOrder = null;
        state.error = null;
      })
      .addCase(fetchOrderByRef.fulfilled, (state, action) => {
        state.selectedOrderStatus = "succeeded";
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderByRef.rejected, (state, action) => {
        state.selectedOrderStatus = "failed";
        state.error = action.payload ?? "Unknown error";
      });

  },
});

export const { setFilters, setMyordersFilters, setPage, resetFilters, resetMyOrdersFilters, setMyOrdersPage } = commandeSlice.actions;
export default commandeSlice.reducer;