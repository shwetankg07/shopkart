import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCart, addToCart, updateCartItem, removeCartItem, errorMessage } from "../services/api.js";
import { clearUser } from "./authSlice.js";

export const loadCart = createAsyncThunk("cart/load", async () => {
  const res = await fetchCart();
  return res.data.cart;
});

export const addItem = createAsyncThunk("cart/add", async (productId, { rejectWithValue }) => {
  try {
    const res = await addToCart(productId);
    return res.data.cart;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Couldn't add that to your cart."));
  }
});

export const changeQuantity = createAsyncThunk("cart/change", async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const res = await updateCartItem(productId, quantity);
    return res.data.cart;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Couldn't update the quantity."));
  }
});

export const removeItem = createAsyncThunk("cart/remove", async (productId, { rejectWithValue }) => {
  try {
    const res = await removeCartItem(productId);
    return res.data.cart;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Couldn't remove that item."));
  }
});

// the product id each mutation is working on, so only that row shows as busy
const idOf = (action) => {
  if (typeof action.meta.arg === "string") return action.meta.arg;
  return action.meta.arg.productId;
};

const startBusy = (state, action) => {
  state.busyIds.push(idOf(action));
};

const stopBusy = (state, action) => {
  state.busyIds = state.busyIds.filter((id) => id !== idOf(action));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle",
    busyIds: [],
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "ready";
      })
      .addCase(loadCart.rejected, (state) => {
        state.status = "error";
      })
      .addCase(clearUser, (state) => {
        state.items = [];
        state.status = "idle";
        state.busyIds = [];
      });

    for (const thunk of [addItem, changeQuantity, removeItem]) {
      builder
        .addCase(thunk.pending, startBusy)
        .addCase(thunk.fulfilled, (state, action) => {
          state.items = action.payload;
          state.status = "ready";
          stopBusy(state, action);
        })
        .addCase(thunk.rejected, stopBusy);
    }
  },
});

export const selectCartCount = (state) => {
  let count = 0;
  for (const item of state.cart.items) {
    count = count + item.quantity;
  }
  return count;
};

export const selectSubtotal = (state) => {
  let total = 0;
  for (const item of state.cart.items) {
    total = total + item.product.price * item.quantity;
  }
  return total;
};

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
