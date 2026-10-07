import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { addItem } from "../store/cartSlice.js";
import { showToast } from "../store/uiSlice.js";
import { flyToCart } from "../lib/flyToCart.js";

export default function AddToCartButton({ product, imageRef, className }) {
  const user = useSelector((state) => state.auth.user);
  const busy = useSelector((state) => state.cart.busyIds.includes(product._id));
  const inCart = useSelector((state) => state.cart.items.some((item) => item.product._id === product._id));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const result = await dispatch(addItem(product._id));

    if (addItem.fulfilled.match(result)) {
      if (imageRef) flyToCart(imageRef.current);
    } else {
      dispatch(showToast(result.payload));
    }
  };

  if (product.stock === 0) {
    return (
      <button type="button" className={className} disabled>
        Sold out
      </button>
    );
  }

  let text = "Add to cart";
  if (inCart) text = "Add another";
  if (busy) text = "Adding…";

  return (
    <button type="button" className={className} onClick={handleClick} disabled={busy}>
      {text}
    </button>
  );
}
