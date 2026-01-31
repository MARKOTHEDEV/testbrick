import { useAuth, useClerk } from "@clerk/clerk-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export function useApi() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const isRefreshingRef = useRef(false);

  const handleSessionExpired = useCallback(async () => {
    toast.error("Session expired", {
      description: "Please sign in again to continue.",
      duration: 5000,
    });
    await signOut();
  }, [signOut]);

  const authFetch = useCallback(
    async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
      const { method = "GET", body, headers = {} } = options;

      // Get a fresh token for each request
      const token = await getToken();

      if (!token) {
        // No token available - sign out and throw
        await handleSessionExpired();
        throw new Error("Session expired. Please sign in again.");
      }

      const makeRequest = async (authToken: string): Promise<Response> => {
        return fetch(`${API_BASE_URL}${endpoint}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          credentials: "include",
        });
      };

      let response = await makeRequest(token);

      // Handle 401 Unauthorized - attempt to refresh token and retry once
      if (response.status === 401 && !isRefreshingRef.current) {
        isRefreshingRef.current = true;

        try {
          // Force a fresh token by passing skipCache: true
          // Clerk's getToken automatically handles refresh, but we can try again
          const freshToken = await getToken({ skipCache: true });

          if (freshToken && freshToken !== token) {
            // Got a new token, retry the request
            response = await makeRequest(freshToken);
          }

          // If still 401 after retry, sign out the user
          if (response.status === 401) {
            console.warn("[Auth] Session expired, signing out...");
            await handleSessionExpired();
            throw new Error("Session expired. Please sign in again.");
          }
        } catch (error) {
          // Refresh failed - sign out
          console.error("[Auth] Token refresh failed:", error);
          await handleSessionExpired();
          throw new Error("Session expired. Please sign in again.");
        } finally {
          isRefreshingRef.current = false;
        }
      }

      // Handle other errors
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(errorBody.message || `HTTP ${response.status}`);
      }

      return response.json();
    },
    [getToken, handleSessionExpired]
  );

  return { authFetch };
}
