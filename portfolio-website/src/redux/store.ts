import { configureStore } from "@reduxjs/toolkit";
import globalDataSlice from "./slices/globalData";

export const makeStore = () => {
  return configureStore({
    reducer: {
      globalDataSlice,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
