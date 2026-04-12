import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import encryptedStorage from "../services/EncryptedStorage";

import authReducer from "./authSlice";
import productReducer from "./productSlice";
import brandReducer from "./brandSlice";
import typeReducer from "./TypeSlice";
import commandeReducer from "./CommandeSlice";
import cartReducer from "./CartSlice";
import magasinReducer from "./MagasinSlice";

const authPersistConfig = {
  key: "auth",
  storage: encryptedStorage,
  whitelist: ["user"],
};

const cartPersistConfig = {
  key: "cart",
  storage,
  whitelist: ["guestItems"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  products: productReducer,
  brands: brandReducer,
  types: typeReducer,
  commande: commandeReducer,
  magasin: magasinReducer,
});

export const store = configureStore({
  reducer: rootReducer, 
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;