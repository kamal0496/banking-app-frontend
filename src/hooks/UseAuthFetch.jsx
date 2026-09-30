import { useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";

/**
 * Returns a drop-in replacement for fetch() that adds
 * "Authorization: Bearer <access token>" to every request.
 *
 * getAccessTokenSilently() returns the cached token, or quietly gets a fresh one
 * from Auth0 when it has expired, so components never handle tokens themselves.
 * The returned function is stable (safe in useEffect / useCallback dependency arrays).
 */
export function useAuthFetch() {
  const { getAccessTokenSilently } = useAuth0();

  return useCallback(
    async (url, options = {}) => {
      const token = await getAccessTokenSilently();
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [getAccessTokenSilently],
  );
}