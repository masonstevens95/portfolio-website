import { createSlice } from "@reduxjs/toolkit";

export enum HeaderSelected {
  WELCOME,
  FEATURED_WORK,
  ABOUT_ME,
  PROFESSIONAL_GOALS,
  CONTACT,
}

type GlobalData = {
  headerSelected: HeaderSelected;
};

const initialState: GlobalData = {
  headerSelected: HeaderSelected.WELCOME,
};

export const globalDataSlice = createSlice({
  name: "globalData",
  initialState,
  reducers: {
    setHeaderSelected: (state, action) => {
      state.headerSelected = action.payload;
    },
  },
});

export const { setHeaderSelected } = globalDataSlice.actions;

export default globalDataSlice.reducer;
