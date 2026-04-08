import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productReducer from "./productSlice";
import brandReducer from "./brandSlice";
import typeReducer from "./TypeSlice";
import commandeReducer from "./CommandeSlice";
import cartReducer from "./CartSlice";
import magasinReducer from "./MagasinSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    brands: brandReducer,
    types: typeReducer,
    commande: commandeReducer,
    cart: cartReducer,
    magasin: magasinReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


