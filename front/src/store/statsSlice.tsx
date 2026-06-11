import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminApi } from "@/services/AdminApi";
import { DashboardDto } from "../models/DashboardDto";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface StatsState {
  dashboard: DashboardDto | null;
  status: Status;
  error: string | null;
}

const initialState: StatsState = {
  dashboard: null,
  status: "idle",
  error: null,
};

export const fetchDashboard = createAsyncThunk<DashboardDto, number, { rejectValue: string }>(
  "stats/fetchDashboard",
  async (year, { rejectWithValue }) => {
    try {
      const response = await adminApi.get(`/stats/dashboard?year=${year}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch dashboard stats");
    }
  }
);

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export default statsSlice.reducer;