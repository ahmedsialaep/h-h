import { CartDto } from "@/models/Cart";
import { CartItemDto } from "@/models/CartItem";
import api from "@/services/http-common";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface CartState {
  cart: CartDto | null;
  isCartOpen: boolean;
  status: Status;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isCartOpen: false,
  status: "idle",
  error: null,
};

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

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    openCart: (state) => { state.isCartOpen = true; },
    closeCart: (state) => { state.isCartOpen = false; },
    toggleCart: (state) => { state.isCartOpen = !state.isCartOpen; },

    addItem: (state, action: PayloadAction<CartItemDto>) => {
      if (!state.cart) return;
      // ← guard against null cartItemDtos
      if (!state.cart.cartItemDtos) state.cart.cartItemDtos = [];
      const existing = state.cart.cartItemDtos.find(
        (i) => i.variantId === action.payload.variantId
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.cart.cartItemDtos.push(action.payload);
      }
    },

    removeItem: (state, action: PayloadAction<number>) => {
      if (!state.cart) return;
      state.cart.cartItemDtos = state.cart.cartItemDtos.filter(
        (i) => i.variantId !== action.payload
      );
    },

    updateQuantity: (state, action: PayloadAction<{ variantId: number; quantity: number }>) => {
      if (!state.cart) return;
      const item = state.cart.cartItemDtos.find(
        (i) => i.variantId === action.payload.variantId
      );
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.cart.cartItemDtos = state.cart.cartItemDtos.filter(
            (i) => i.variantId !== action.payload.variantId
          );
        }
      }
    },

    clearCart: (state) => {
      if (state.cart) state.cart.cartItemDtos = [];
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