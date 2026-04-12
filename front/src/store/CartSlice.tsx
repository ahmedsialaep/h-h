import { CartDto } from "@/models/Cart";
import { CartItemDto } from "@/models/CartItem";
import api from "@/services/http-common";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface CartState {
  cart: CartDto | null;

  guestItems: CartItemDto[];
  isCartOpen: boolean;
  status: Status;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  guestItems: [],
  isCartOpen: false,
  status: "idle",
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk<CartDto, void, { rejectValue: string }>(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<CartDto>("/cart");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
    }
  }
);

export const syncCart = createAsyncThunk<
  CartItemDto[],
  CartItemDto[],
  { rejectValue: string }
>(
  "cart/sync",
  async (items, { rejectWithValue }) => {
    try {
      const response = await api.put<CartItemDto[]>("/cart", items);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to sync cart");
    }
  }
);


export const mergeGuestCartOnLogin = createAsyncThunk<
  CartItemDto[],
  void,
  { rejectValue: string; state: { cart: CartState } }
>(
  "cart/mergeOnLogin",
  async (_, { getState, rejectWithValue }) => {
    try {
      // 1️⃣ Refresh session + CSRF token (VERY IMPORTANT)
      await api.get("/cart", { withCredentials: true });

      // 2️⃣ Get latest server cart
      const serverRes = await api.get<CartDto>("/cart");
      const serverItems: CartItemDto[] = serverRes.data.cartItemDtos ?? [];

      // 3️⃣ Get guest cart
      const guestItems = getState().cart.guestItems;

      if (!guestItems || guestItems.length === 0) {
        return serverItems;
      }

      // 4️⃣ Merge safely
      const merged: CartItemDto[] = [...serverItems];

      for (const guestItem of guestItems) {
        const existing = merged.find(
          (i) => i.variantId === guestItem.variantId
        );

        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          merged.push(guestItem);
        }
      }
      const payload = merged.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      // 6️⃣ Sync with backend
      const syncRes = await api.put<CartItemDto[]>("/cart", payload);

      return syncRes.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to merge cart"
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    openCart: (state) => { state.isCartOpen = true; },
    closeCart: (state) => { state.isCartOpen = false; },
    toggleCart: (state) => { state.isCartOpen = !state.isCartOpen; },

    // Works for both guest and logged-in users
    addItem: (state, action: PayloadAction<CartItemDto>) => {
      if (state.cart) {
        // Logged in — add to real cart
        if (!state.cart.cartItemDtos) state.cart.cartItemDtos = [];
        const existing = state.cart.cartItemDtos.find(
          (i) => i.variantId === action.payload.variantId
        );
        if (existing) {
          existing.quantity += action.payload.quantity;
        } else {
          state.cart.cartItemDtos.push(action.payload);
        }
      } else {
        // Guest — add to guestItems
        const existing = state.guestItems.find(
          (i) => i.variantId === action.payload.variantId
        );
        if (existing) {
          existing.quantity += action.payload.quantity;
        } else {
          state.guestItems.push(action.payload);
        }
      }
    },

    removeItem: (state, action: PayloadAction<number>) => {
      if (state.cart) {
        state.cart.cartItemDtos = state.cart.cartItemDtos.filter(
          (i) => i.variantId !== action.payload
        );
      } else {
        state.guestItems = state.guestItems.filter(
          (i) => i.variantId !== action.payload
        );
      }
    },

    updateQuantity: (state, action: PayloadAction<{ variantId: number; quantity: number }>) => {
      const items = state.cart ? state.cart.cartItemDtos : state.guestItems;
      const item = items.find((i) => i.variantId === action.payload.variantId);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          if (state.cart) {
            state.cart.cartItemDtos = state.cart.cartItemDtos.filter(
              (i) => i.variantId !== action.payload.variantId
            );
          } else {
            state.guestItems = state.guestItems.filter(
              (i) => i.variantId !== action.payload.variantId
            );
          }
        }
      }
    },

    clearCart: (state) => {
      if (state.cart) state.cart.cartItemDtos = [];
      state.guestItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = {
          ...action.payload,
          cartItemDtos: action.payload.cartItemDtos ?? [],
        };
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        if (state.cart) {
          state.cart.cartItemDtos = action.payload;
        }
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.error = action.payload ?? "Sync failed";
      })
      // After merge: set the cart with merged items and clear guest items
      .addCase(mergeGuestCartOnLogin.fulfilled, (state, action) => {
        if (!state.cart) state.cart = { cartItemDtos: [] } as any;
        state.cart!.cartItemDtos = action.payload;
        state.guestItems = []; // guest items are now in the server cart
        state.status = "succeeded";
      })
      .addCase(mergeGuestCartOnLogin.rejected, (state, action) => {
        state.error = action.payload ?? "Merge failed";
      });
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;