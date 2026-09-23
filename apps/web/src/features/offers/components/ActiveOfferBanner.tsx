import React from "react";
import { Sparkles, CheckCircle2, Gift } from "lucide-react";
import type { PlanOfferResult } from "../types/offer.types";

interface ActiveOfferBannerProps {
  planOffer?: PlanOfferResult | null;
  className?: string;
}

export const ActiveOfferBanner: React.FC<ActiveOfferBannerProps> = ({
  planOffer,
  className = "",
}) => {
  if (!planOffer || !planOffer.hasOffer) {
    return null;
  }

  const { title, badgeText, discountType, discountValue, discountAmount, message } = planOffer;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 p-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
                {title || "Promotional Discount Applied"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                {badgeText ||
                  (discountType === "PERCENTAGE"
                    ? `${discountValue}% OFF`
                    : `₹${discountValue} FLAT OFF`)}
              </span>
            </div>

            {message && (
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 line-clamp-1">
                {message}
              </p>
            )}

            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              ✨ Automatic discount of ₹{discountAmount.toLocaleString("en-IN")} applied to your plan!
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0">
          <Gift className="w-3 h-3" />
          <span>Auto-Applied</span>
        </div>
      </div>
    </div>
  );
};
