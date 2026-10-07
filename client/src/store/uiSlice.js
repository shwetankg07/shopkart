import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    toast: null,
  },
  reducers: {
    showToast: (state, action) => {
      state.toast = { message: action.payload, id: Date.now() };
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
