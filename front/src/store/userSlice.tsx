import { User } from "../models/User";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../services/http-common";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface UserState {
    user: User | null;
    status: Status;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    status: "idle",
    error: null,
};

export const updateUser = createAsyncThunk<
    User,
    User,
    { rejectValue: string }
>("users/update", async (user, { rejectWithValue }) => {
    try {
        const response = await api.put<User>(`/user/${user.id}`, user);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.error || "Failed to update user");
    }
});
export const fetchUserById = createAsyncThunk<
    User,
    string,
    { rejectValue: string }
>("user/fetchById", async (id, { rejectWithValue }) => {
    try {
        const response = await api.get<User>(`/user/info/${id}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.error || "Failed to fetch user");
    }
});

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserById.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Unknown error";
            })
            .addCase(updateUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export default userSlice.reducer;