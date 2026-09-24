import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Search,
  Trash2,
  ChevronRight,
  ArrowUpDown,
  Compass,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist, useClearWishlist } from "../hooks/useWishlist";
import { WishlistCard } from "../components/WishlistCard";
import { WishlistEmptyState } from "../components/WishlistEmptyState";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

export const WishlistPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price_asc" | "price_desc">("newest");
  const [page, setPage] = useState(1);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useWishlist({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    sortBy,
  });

  const clearMutation = useClearWishlist();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleClearAll = async () => {
    const confirmed = await confirm({
      actionType: "delete",
      variant: "danger",
      title: "Clear Entire Wishlist?",
      description: "Are you sure you want to remove all courses from your saved wishlist? This action cannot be undone.",
      confirmText: "Clear Wishlist",
      cancelText: "Cancel",
      icon: <Trash2 className="w-5 h-5 text-[#F42A18]" />,
    });
    if (confirmed) {
      clearMutation.mutate();
    }
  };

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Link to="/" className="hover:text-[#F42A18] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4 text-neutral-400" />
        <span className="font-semibold text-neutral-900 dark:text-white">
          My Wishlist
        </span>
      </div>

      {/* 2. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Heart className="w-5 h-5 fill-red-500/30" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>My Wishlist</span>
                {!isLoading && (
                  <Badge className="bg-red-500 text-white border-0 text-xs px-2.5 py-0.5 rounded-full font-mono">
                    {total} {total === 1 ? "course" : "courses"}
                  </Badge>
                )}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
              All your saved courses, learning tracks, and live cohorts in one organized place. Ready to level up your engineering career?
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/courses">
              <Button
                variant="outline"
                className="h-10 text-xs rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Compass className="w-4 h-4 mr-1.5" />
                <span>Browse More</span>
              </Button>
            </Link>

            {total > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={clearMutation.isPending}
                className="h-10 text-xs rounded-xl border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                <span>Clear All</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Search & Sorting Toolbar (Only when there are items or active search) */}
      {(total > 0 || debouncedSearch) && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search in Wishlist */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved courses..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-neutral-500 font-medium flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort by:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 cursor-pointer"
            >
              <option value="newest">Recently Saved</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. Course Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 animate-pulse border border-neutral-200/60 dark:border-neutral-800/60"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <WishlistEmptyState />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <WishlistCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs rounded-xl cursor-pointer"
              >
                Previous
              </Button>
              <span className="text-xs text-neutral-500 px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs rounded-xl cursor-pointer"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};
