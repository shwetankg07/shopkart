import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWishlist, toggleWishlist } from "../services/api.js";
import { clearUser } from "./authSlice.js";

// only the saved ids live here, for the hearts and the nav count. the wishlist page loads its own data
export const loadSavedIds = createAsyncThunk("wishlist/loadIds", async () => {
  const res = await fetchWishlist();
  return res.data.wishlist.map((product) => product._id);
});

export const toggleSaved = createAsyncThunk("wishlist/toggle", async (productId, { rejectWithValue }) => {
  try {
    const res = await toggleWishlist(productId);
    return res.data.saved;
  } catch {
    return rejectWithValue("Unable to save product. Please try again.");
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    ids: [],
    busyIds: [],
  },
  reducers: {
    forgetSaved: (state, action) => {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSavedIds.fulfilled, (state, action) => {
        state.ids = action.payload;
      })
      .addCase(toggleSaved.pending, (state, action) => {
        state.busyIds.push(action.meta.arg);
      })
      .addCase(toggleSaved.fulfilled, (state, action) => {
        const productId = action.meta.arg;
        state.busyIds = state.busyIds.filter((id) => id !== productId);
        state.ids = state.ids.filter((id) => id !== productId);
        if (action.payload === true) state.ids.push(productId);
      })
      .addCase(toggleSaved.rejected, (state, action) => {
        state.busyIds = state.busyIds.filter((id) => id !== action.meta.arg);
      })
      .addCase(clearUser, (state) => {
        state.ids = [];
        state.busyIds = [];
      });
  },
});

export const { forgetSaved } = wishlistSlice.actions;
export default wishlistSlice.reducer;
