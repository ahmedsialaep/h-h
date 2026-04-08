import { Brand } from "@/models/Brand";
import { adminApi } from "@/services/AdminApi";
import api from "@/services/http-common";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


type Status = "idle" | "loading" | "succeeded" | "failed";

interface BrandState {
  items: Brand[];
  productCounts: Record<number, number>;
  status: Status;
  error: string | null;
}

const initialState: BrandState = {
  items: [],
  productCounts: {},
  status: "idle",
  error: null,
};

export const fetchBrands = createAsyncThunk<Brand[], void, { rejectValue: string }>(
  "brands/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Brand[]>("/brand");
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch brands");
    }
  }
);
export const fetchBrandProductCounts = createAsyncThunk<
  Record<number, number>,
  void,
  { rejectValue: string }
>("brands/fetchProductCounts", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Record<number, number>>("/brand/product-counts");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch counts");
  }
});
export const createBrand = createAsyncThunk<
  Brand,
  { brand: Omit<Brand, "id">; image?: File },
  { rejectValue: string }
>("brands/create", async ({ brand, image }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("brand", new Blob([JSON.stringify(brand)], { type: "application/json" }));
    if (image) formData.append("image", image);
    const response = await adminApi.post("/brand/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as Brand;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to create brand");
  }
});

export const updateBrand = createAsyncThunk<
  Brand,
  { brand: Brand; image?: File },
  { rejectValue: string }
>("brands/update", async ({ brand, image }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("brand", new Blob([JSON.stringify(brand)], { type: "application/json" }));
    if (image) formData.append("image", image);
    const response = await adminApi.put(`/brand/update/${brand.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as Brand;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update brand");
  }
});

export const deleteBrand = createAsyncThunk<number, number, { rejectValue: string }>(
  "brands/delete",
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.delete(`/brand/delete/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete brand");
    }
  }
);

const brandSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBrands.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      // Create
      .addCase(createBrand.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.items.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // Delete
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      })
      .addCase(fetchBrandProductCounts.fulfilled, (state, action) => {
        state.productCounts = action.payload;
      })
  },
});

export default brandSlice.reducer;