import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "../api/wishlist.api";
import { wishlistKeys } from "../api/wishlist.keys";
import { useCurrentUser } from "@/features/auth";
import { toast } from "@/lib/toast";
import type { WishlistQueryParams } from "../types/wishlist.types";

/**
 * Fetch all wishlisted course IDs for global UI heart states
 */
export function useWishlistIds() {
  const { data: user } = useCurrentUser();
  const isAuthenticated = Boolean(user);

  return useQuery({
    queryKey: wishlistKeys.ids(),
    queryFn: () => wishlistApi.getWishlistIds(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });
}

/**
 * Fetch paginated wishlist items for the wishlist page
 */
export function useWishlist(params?: WishlistQueryParams) {
  const { data: user } = useCurrentUser();
  const isAuthenticated = Boolean(user);

  return useQuery({
    queryKey: wishlistKeys.list(params),
    queryFn: () => wishlistApi.getWishlist(params),
    enabled: isAuthenticated,
  });
}

/**
 * Hook to toggle a course in/out of the user's wishlist with optimistic updates
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => wishlistApi.toggleWishlist(courseId),
    onMutate: async (courseId: string) => {
      // Cancel outgoing queries for ids to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: wishlistKeys.ids() });

      const previousIds = queryClient.getQueryData<string[]>(wishlistKeys.ids()) || [];
      const isCurrentlyWishlisted = previousIds.includes(courseId);

      const nextIds = isCurrentlyWishlisted
        ? previousIds.filter((id) => id !== courseId)
        : [...previousIds, courseId];

      queryClient.setQueryData<string[]>(wishlistKeys.ids(), nextIds);

      return { previousIds };
    },
    onError: (_err, _courseId, context) => {
      // Rollback on error
      if (context?.previousIds) {
        queryClient.setQueryData<string[]>(wishlistKeys.ids(), context.previousIds);
      }
      toast.error("Failed to update wishlist. Please try again.");
    },
    onSuccess: (data) => {
      if (data.isWishlisted) {
        toast.success("Course added to your wishlist!");
      } else {
        toast.info("Course removed from your wishlist.");
      }
    },
    onSettled: () => {
      // Invalidate both ids and list queries to sync with backend
      queryClient.invalidateQueries({ queryKey: wishlistKeys.ids() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
    },
  });
}

/**
 * Hook to explicitly remove a course from wishlist
 */
export function useRemoveWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => wishlistApi.removeItem(courseId),
    onMutate: async (courseId: string) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.ids() });

      const previousIds = queryClient.getQueryData<string[]>(wishlistKeys.ids()) || [];
      queryClient.setQueryData<string[]>(
        wishlistKeys.ids(),
        previousIds.filter((id) => id !== courseId)
      );

      return { previousIds };
    },
    onError: (_err, _courseId, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData<string[]>(wishlistKeys.ids(), context.previousIds);
      }
      toast.error("Failed to remove course from wishlist.");
    },
    onSuccess: () => {
      toast.info("Course removed from your wishlist.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.ids() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
    },
  });
}

/**
 * Hook to clear all items in wishlist
 */
export function useClearWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onSuccess: () => {
      queryClient.setQueryData<string[]>(wishlistKeys.ids(), []);
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success("Wishlist cleared successfully!");
    },
    onError: () => {
      toast.error("Failed to clear wishlist.");
    },
  });
}
