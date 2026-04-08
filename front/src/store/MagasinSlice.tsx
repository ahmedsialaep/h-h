import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminApi } from "@/services/AdminApi";
import api from "@/services/http-common";
import { Magasin } from "@/models/Magasin";


type Status = "idle" | "loading" | "succeeded" | "failed";

interface MagasinState {
  magasin: Magasin | null;
  status: Status;
  error: string | null;
}

const initialState: MagasinState = {
  magasin: null,
  status: "idle",
  error: null,
};

export const fetchMagasin = createAsyncThunk<Magasin, void, { rejectValue: string }>(
  "magasin/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Magasin>("/magasin");
      return response.data[0];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch magasin");
    }
  }
);

export const createMagasin = createAsyncThunk<Magasin, Magasin, { rejectValue: string }>(
  "magasin/create",
  async (magasin, { rejectWithValue }) => {
    try {
      const response = await adminApi.post("/magasin/add", magasin);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create magasin");
    }
  }
);

export const updateMagasin = createAsyncThunk<
  Magasin,
  { id: number; data: Partial<Magasin> },
  { rejectValue: string }
>(
  "magasin/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminApi.put(`/magasin/update/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update magasin");
    }
  }
);

export const deleteMagasin = createAsyncThunk<void, number, { rejectValue: string }>(
  "magasin/delete",
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.delete(`/magasin/delete/${id}`);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete magasin");
    }
  }
);

const magasinSlice = createSlice({
  name: "magasin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMagasin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMagasin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.magasin = action.payload;
      })
      .addCase(fetchMagasin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(createMagasin.fulfilled, (state, action) => {
        state.magasin = action.payload;
      })
      .addCase(updateMagasin.fulfilled, (state, action) => {
        state.magasin = action.payload;
      })
      .addCase(deleteMagasin.fulfilled, (state) => {
        state.magasin = null;
      });
  },
});

export default magasinSlice.reducer;