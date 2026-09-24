import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { useWishlistIds, useToggleWishlist } from "../hooks/useWishlist";
import { useCurrentUser } from "@/features/auth";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export interface WishlistButtonProps {
  courseId: string;
  variant?: "icon" | "button" | "pill";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  courseId,
  variant = "icon",
  className,
  size = "md",
}) => {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { data: wishlistIds = [] } = useWishlistIds();
  const toggleMutation = useToggleWishlist();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const isWishlisted = wishlistIds.includes(courseId);
  const isLoading = toggleMutation.isPending && toggleMutation.variables === courseId;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.info("Please sign in to save courses to your wishlist.");
      navigate(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const confirmed = await confirm({
      actionType: isWishlisted ? "delete" : "wishlist",
      variant: isWishlisted ? "danger" : "neutral",
      title: isWishlisted ? "Remove from Wishlist?" : "Add to Wishlist?",
      description: isWishlisted
        ? "Are you sure you want to remove this course from your saved wishlist?"
        : "Save this course to your wishlist so you can easily access and enroll in it later.",
      confirmText: isWishlisted ? "Remove Course" : "Add to Wishlist",
      cancelText: "Cancel",
      icon: isWishlisted ? (
        <Heart className="w-5 h-5 text-[#F42A18]" />
      ) : (
        <Heart className="w-5 h-5 text-[#F42A18] fill-[#F42A18]" />
      ),
    });

    if (confirmed) {
      toggleMutation.mutate(courseId);
    }
  };

  if (variant === "button") {
    return (
      <>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "w-full h-11 px-4 rounded-2xl border font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer",
            isWishlisted
              ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
              : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5",
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <Heart
              className={cn(
                "w-4 h-4 transition-transform active:scale-125",
                isWishlisted
                  ? "fill-red-500 text-red-500 animate-in zoom-in-50 duration-200"
                  : "text-neutral-500 group-hover:text-red-500"
              )}
            />
          )}
          <span>{isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
        </button>
        <ConfirmDialog />
      </>
    );
  }

  if (variant === "pill") {
    return (
      <>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
            isWishlisted
              ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
              : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:border-red-500/30 hover:text-red-600",
            className
          )}
        >
          <Heart
            className={cn(
              "w-3.5 h-3.5 transition-transform active:scale-125",
              isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-500"
            )}
          />
          <span>{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
        </button>
        <ConfirmDialog />
      </>
    );
  }

  // Default floating icon button (for course cards)
  const sizeClasses = {
    sm: "w-7 h-7 p-1.5",
    md: "w-8.5 h-8.5 p-2",
    lg: "w-10 h-10 p-2.5",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "group/wishlist rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md backdrop-blur-md",
          isWishlisted
            ? "bg-white/90 dark:bg-neutral-900/90 text-red-500 border border-red-500/30 hover:bg-white dark:hover:bg-neutral-900 hover:scale-110"
            : "bg-black/40 hover:bg-black/70 text-white border border-white/20 hover:scale-110 hover:text-red-400",
          sizeClasses,
          className
        )}
      >
        {isLoading ? (
          <Loader2 className={cn("animate-spin text-red-500", iconSizes)} />
        ) : (
          <Heart
            className={cn(
              "transition-all duration-200 active:scale-125",
              iconSizes,
              isWishlisted
                ? "fill-red-500 text-red-500 scale-105 animate-in zoom-in-75 duration-200"
                : "group-hover/wishlist:text-red-400"
            )}
          />
        )}
      </button>
      <ConfirmDialog />
    </>
  );
};
