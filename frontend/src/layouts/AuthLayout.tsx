import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import UiLoader from "@/components/ui/UiLoader";

const AuthLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading state while Clerk initializes
  if (!isLoaded) {
    return <UiLoader text="Loading..." />;
  }

  // Redirect to dashboard if already logged in
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
