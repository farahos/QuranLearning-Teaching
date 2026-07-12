import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export function ProtectedRoute() {
  const { token, user, bootStatus } = useSelector((state) => state.auth);
  const location = useLocation();

  if (token && bootStatus === "loading") {
    return <LoadingSpinner fullHeight label="Loading your account..." />;
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
