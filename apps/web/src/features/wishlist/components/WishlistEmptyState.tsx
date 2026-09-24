import React from "react";
import { Link } from "react-router-dom";
import { Heart, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WishlistEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-lg mx-auto space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/5 animate-in zoom-in-75 duration-300">
          <Heart className="w-12 h-12 stroke-[1.5]" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
          Your Wishlist is Empty
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Explore our wide range of interactive courses, live bootcamps, and modular learning tracks. Save courses here to easily enroll later!
        </p>
      </div>

      <Link to="/courses">
        <Button className="h-11 px-6 rounded-2xl bg-[#F42A18] hover:bg-[#D92212] text-white font-bold text-xs shadow-lg shadow-[#F42A18]/25 hover:shadow-xl hover:shadow-[#F42A18]/30 transition-all flex items-center gap-2 cursor-pointer">
          <Compass className="w-4 h-4" />
          <span>Explore All Courses</span>
        </Button>
      </Link>
    </div>
  );
};
