import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product, ProductFilters, ProductDTO } from "@/models/Product";
import api from "@/services/http-common";
import { adminApi } from "@/services/AdminApi";
import { PagedResponse } from "@/models/PagedResponse";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface ProductState {
  items: ProductDTO[];
  selected: ProductDTO | null;
  totalPages: number;
  totalItems: number;
  currentPage: number;
  filters: ProductFilters;
  status: Status;
  selectedStatus: Status;
  error: string | null;
}

const initialFilters: ProductFilters = {
  brandIds: null,
  genres: null,
  categories: null,
  types: null,
  colors: null,
  size: null,
  minPrice: null,
  maxPrice: null,
  newArrival: null,
  marketVisible: null,
  search: null,
  page: 0,
  pageSize: 20,
  sortBy: "id",
  sortDir: "asc",
};

const initialState: ProductState = {
  items: [],
  selected: null,
  totalPages: 0,
  totalItems: 0,
  currentPage: 0,
  filters: initialFilters,
  status: "idle",
  selectedStatus: "idle",
  error: null,
};

export const fetchProducts = createAsyncThunk<
  PagedResponse<ProductDTO>,
  { filters: ProductFilters; search?: string | null },
  { rejectValue: string }
>("products/fetchAll", async ({ filters, search }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "search") return;
      if (value === null || value === undefined || value === "") return;
      if (Array.isArray(value)) {
        if (value.length === 0) return;
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    });
    if (search && search.trim()) params.append("search", search.trim());
    const response = await api.get<PagedResponse<ProductDTO>>("/products", { params });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
  }
});

export const fetchProductById = createAsyncThunk<
  ProductDTO,
  number,
  { rejectValue: string }
>("products/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get<ProductDTO>(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch product");
  }
});

export const createProduct = createAsyncThunk<
  Product,
  { data: Partial<Product>; image?: File },
  { rejectValue: string }
>("products/create", async ({ data, image }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("product", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (image) formData.append("image", image);
    const response = await adminApi.post("/product/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as Product;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to create product");
  }
});

export const updateProduct = createAsyncThunk<
  Product,
  { id: number; data: Partial<Product>; image?: File },
  { rejectValue: string }
>("products/update", async ({ id, data, image }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("product", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (image) formData.append("image", image);
    const response = await adminApi.put(`/product/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as Product;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update product");
  }
});

export const deleteProduct = createAsyncThunk<number, number, { rejectValue: string }>(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.delete(`/product/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  }
);

export const saveVariants = createAsyncThunk<
  void,
  { productId: number; variants: { id?: number | null; size: string; color: string; stock: number }[] },
  { rejectValue: string }
>("products/saveVariants", async ({ productId, variants }, { rejectWithValue }) => {
  try {
    await adminApi.post(`/product/${productId}/variants`, variants);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to save variants");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    setSort: (state, action: PayloadAction<{ sortBy: string; sortDir: "asc" | "desc" }>) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortDir = action.payload.sortDir;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    clearSelected: (state) => {
      state.selected = null;
      state.selectedStatus = "idle";
    },
    resetAndSetFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...initialFilters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalItems = action.payload.totalItems;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(fetchProductById.pending, (state) => {
        state.selectedStatus = "loading";
        state.selected = null;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(createProduct.fulfilled, () => { })
      .addCase(updateProduct.fulfilled, () => { })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const { setFilter, setPage, setSort, resetFilters, clearSelected, resetAndSetFilters } = productSlice.actions;
export default productSlice.reducer;