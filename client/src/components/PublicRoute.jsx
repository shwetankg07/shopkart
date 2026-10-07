import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// login and register make no sense once you're signed in
export default function PublicRoute({ children }) {
  const user = useSelector((state) => state.auth.user);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
