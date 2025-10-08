import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles = [] }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" />;
  return <Outlet />;
}
