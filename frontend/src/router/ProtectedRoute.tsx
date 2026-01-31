import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import UiLoader from "@/components/ui/UiLoader";

const ProtectedRoute = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  // Show loading state while Clerk initializes
  if (!isLoaded) {
    return <UiLoader text="Loading..." />;
  }

  if (!isSignedIn) {
    // Redirect to login while saving the attempted URL
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
