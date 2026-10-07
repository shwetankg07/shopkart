import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "../store/uiSlice.js";

export default function Toaster() {
  const toast = useSelector((state) => state.ui.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(hideToast()), 3500);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <p className="toast" key={toast.id}>
          {toast.message}
        </p>
      )}
    </div>
  );
}
