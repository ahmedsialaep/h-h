import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../services/http-common";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface User {
  nom: string;
  prenom: string;
  userId: string;
  username: string;
  isAdmin: boolean;
  deviceType: string;
  verified2FA: boolean;
}

export interface ConflictPayload {
  existingSession: boolean;
  deviceType: string;
  error?: string;
  status?: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  restoringSession: boolean;
  error: string | null;
  sessionConflict: ConflictPayload | null;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  username: string;
  pwd: string;
}

export interface Verify2FaRequest {
  verificationCode: string;
}


export const registerUser = createAsyncThunk<
  { message: string },
  RegisterPayload,
  { rejectValue: { error: string } }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data);
  }
});

export const send2FA = createAsyncThunk<
  boolean,
  void,
  { rejectValue: { error: string } }
>("auth/2fa/send", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/2fa/send");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data);
  }
});

export const verify2FA = createAsyncThunk<
  User,
  Verify2FaRequest,
  { rejectValue: { error: string } }
>("auth/2fa/verify", async (verifCode, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/2fa/verify", verifCode);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data);
  }
});

export const loginUser = createAsyncThunk<
  User,
  { username: string; password: string; force?: boolean },
  { rejectValue: ConflictPayload }
>("auth/login", async ({ username, password, force = false }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/auth/login?force=${force}`, {
      username,
      pwd: password,
    });
    const data = response.data;
    const user: User = {
      userId: data.userId,
      username: data.username,
      isAdmin: data.isAdmin ?? false,
      deviceType: data.deviceType ?? "",
      verified2FA: data.verified2FA ?? false,
      nom: data.nom ?? "",
      prenom: data.prenom ?? "",
    };
    return user;
  } catch (error: any) {
    return rejectWithValue(error.response?.data);
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }

  }
);

export const restoreSession = createAsyncThunk<void, void>(
  "auth/restoreSession",
  async (_, { dispatch, getState }) => {
    const state = getState() as { auth: AuthState };

    // If persist already rehydrated a user, validate with server
    if (!state.auth.user) return;

    try {
      const res = await api.get("/auth/validate-session");
      if (res.data.valid) {
        const u = res.data.user;
        const user: User = {
          userId: u.userId,
          username: u.username,
          isAdmin: u.isAdmin ?? false,
          deviceType: u.deviceType ?? "",
          verified2FA: u.verified2FA ?? false,
          nom: u.nom ?? "",
          prenom: u.prenom ?? "",
        };
        dispatch(setUser(user)); // refresh with latest server data
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        dispatch(forceLogout());
      }
    }
  }
);

// ─────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────
const initialState: AuthState = {
  user: null, // redux-persist rehydrates this automatically on app start
  loading: false,
  restoringSession: false,
  error: null,
  sessionConflict: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSessionConflict: (state) => { state.sessionConflict = null; },
    forceLogout: (state) => { state.user = null; },
    setUser: (state, action: PayloadAction<User>) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.restoringSession = true;
      })
      .addCase(restoreSession.fulfilled, (state) => {
        state.restoringSession = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.restoringSession = false;
        state.user = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.sessionConflict = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;

      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.existingSession) {
          state.sessionConflict = action.payload;
        } else {
          state.error = action.payload?.error || "Erreur de connexion";
        }
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Erreur lors de l'inscription";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        // redux-persist sees user = null and wipes the encrypted entry
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
      })
      .addCase(send2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(send2FA.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(send2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Erreur envoi code 2FA";
      })
      .addCase(verify2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // verified2FA: true is now persisted automatically
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Code 2FA invalide";
      });
  },
});

export const { clearError, clearSessionConflict, forceLogout, setUser } = authSlice.actions;
export default authSlice.reducer;