import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toggleSaved } from "../store/wishlistSlice.js";
import { showToast } from "../store/uiSlice.js";
import HeartIcon from "./HeartIcon.jsx";

export default function WishlistButton({ product, withLabel }) {
  const user = useSelector((state) => state.auth.user);
  const saved = useSelector((state) => state.wishlist.ids.includes(product._id));
  const busy = useSelector((state) => state.wishlist.busyIds.includes(product._id));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const result = await dispatch(toggleSaved(product._id));
    if (toggleSaved.rejected.match(result)) {
      dispatch(showToast(result.payload));
    }
  };

  const label = saved ? `Remove ${product.name} from saved` : `Save ${product.name}`;

  if (withLabel) {
    let text = "Save";
    if (saved) text = "Saved";
    if (busy) text = "Saving…";

    return (
      <button
        type="button"
        className={saved ? "btn btn-quiet save-button is-saved" : "btn btn-quiet save-button"}
        onClick={handleClick}
        disabled={busy}
        aria-pressed={saved}
        aria-label={label}
      >
        <HeartIcon filled={saved} />
        {text}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={saved ? "heart is-saved" : "heart"}
      onClick={handleClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={label}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}
