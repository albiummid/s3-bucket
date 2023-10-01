
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import uploadSlice from "./features/upload/uploadSlice";
const store = configureStore({
    reducer: {
        upload:uploadSlice,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;

export const {
    getState,
    subscribe,
    dispatch
} = store
