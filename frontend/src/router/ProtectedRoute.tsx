import { Outlet } from "react-router-dom";
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth";

const ProtectedRoute = () => {
  // TODO: Re-enable auth check when ready
  // const { isAuthenticated } = useAuth();
  // const location = useLocation();

  // if (!isAuthenticated) {
  //   // Redirect to login while saving the attempted URL
  //   return <Navigate to="/auth/login" state={{ from: location }} replace />;
  // }

  return <Outlet />;
};

export default ProtectedRoute;
