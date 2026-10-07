import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMe } from "../services/api.js";

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const res = await getMe();
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    checked: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.checked = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.checked = true;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
