import { useState, useEffect } from "react"
import { isTokenRefreshing, onTokenRefreshStateChange } from "@/lib/api-client"

/**
 * Hook to track whether an auth token refresh network request is actively in-flight.
 */
export function useIsRefreshingToken(): boolean {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(isTokenRefreshing())

  useEffect(() => {
    setIsRefreshing(isTokenRefreshing())
    return onTokenRefreshStateChange(setIsRefreshing)
  }, [])

  return isRefreshing
}

export default useIsRefreshingToken
