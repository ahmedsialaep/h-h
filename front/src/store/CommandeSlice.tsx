// store/commandeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Commande, CommandeDto, CommandeFilterRequest, CommandeRequest } from "@/models/Commande";
import { adminApi } from "@/services/AdminApi";
import { PagedResponse } from "@/models/PagedResponse";
import api from "@/services/http-common";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface CommandeState {
  items: CommandeDto[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  filters: CommandeFilterRequest;
  status: Status;
  error: string | null;
  myOrders: CommandeDto[];
  myOrdersStatus: Status;
  selectedOrder: CommandeDto | null;
  selectedOrderStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialFilters: CommandeFilterRequest = {
  page: 0,
  pageSize: 20,
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
  error: null,
  myOrders: [],
  myOrdersStatus: "idle",
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
    return rejectWithValue(error.response?.data?.message || "Failed to create commande");
  }
});
export const fetchMyOrders = createAsyncThunk<
  CommandeDto[],
  void,
  { rejectValue: string }
>("commandes/myOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<CommandeDto[]>("/commande/my-orders");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
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
    const response = await adminApi.get("/commandes", { params });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch commandes");
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
    return rejectWithValue(error.response?.data?.message || "Commande introuvable");
  }
});

export const updateCommandeStatus = createAsyncThunk<
  CommandeDto,
  { id: number; status: string },
  { rejectValue: string }
>("commandes/updateStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await adminApi.put(`/commande/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update status");
  }
});

const commandeSlice = createSlice({
  name: "commandes",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CommandeFilterRequest>>) => {
      state.filters = { ...state.filters, ...action.payload, page: 0 };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
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
      .addCase(updateCommandeStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.myOrdersStatus = "loading";
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrdersStatus = "succeeded";
        state.myOrders = action.payload;
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

export const { setFilters, setPage, resetFilters } = commandeSlice.actions;
export default commandeSlice.reducer;