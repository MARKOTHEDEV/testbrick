import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";
import { apiRequest } from "@/lib/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export function useApi() {
  const { getToken } = useAuth();

  const authFetch = useCallback(
    async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
      const token = await getToken();
      return apiRequest<T>(endpoint, { ...options, token });
    },
    [getToken]
  );

  return { authFetch };
}
