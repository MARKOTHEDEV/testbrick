import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import UiLoader from "@/components/ui/UiLoader";

const AuthCallback = () => {
  const { handleRedirectCallback } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback({
          afterSignInUrl: "/dashboard",
          afterSignUpUrl: "/dashboard",
        });
      } catch (err) {
        console.error("Auth callback error:", err);
        navigate("/auth/login");
      }
    };

    handleCallback();
  }, [handleRedirectCallback, navigate]);

  return <UiLoader />;
};

export default AuthCallback;
