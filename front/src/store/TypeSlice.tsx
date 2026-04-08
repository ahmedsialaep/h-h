import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/http-common";
import { adminApi } from "@/services/AdminApi";
import { Type } from "@/models/Type";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface TypeState {
  items: Type[];
  status: Status;
  error: string | null;
}

const initialState: TypeState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchTypes = createAsyncThunk<Type[], void, { rejectValue: string }>(
  "types/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Type[]>("/product-type");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch types");
    }
  }
);

export const createType = createAsyncThunk<Type, Partial<Type>, { rejectValue: string }>(
  "types/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminApi.post("/type/add", data);
      return response.data as Type;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create type");
    }
  }
);

export const updateType = createAsyncThunk<
  Type,
  { id: number; data: Partial<Type> },
  { rejectValue: string }
>("types/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await adminApi.put(`/type/${id}`, data);
    return response.data as Type;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update type");
  }
});

export const deleteType = createAsyncThunk<number, number, { rejectValue: string }>(
  "types/delete",
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.delete(`/type/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete type");
    }
  }
);

const typeSlice = createSlice({
  name: "types",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTypes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(createType.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateType.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteType.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export default typeSlice.reducer;