import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const from = useLocation().pathname;
  const state = useMemo(() => ({ from }), [from]);

  if (!user) {
    return <Navigate to="/login" replace state={state} />;
  }

  return children;
}
