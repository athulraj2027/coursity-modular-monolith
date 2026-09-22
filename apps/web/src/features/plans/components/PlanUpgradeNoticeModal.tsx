import React from "react";
import type { Plan } from "../types/plan.types";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Zap,
  Info,
  X,
  CheckCircle2,
} from "lucide-react";

interface PlanUpgradeNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  currentPlan?: Plan | null;
  targetPlan: Plan | null;
  billingCycle: "MONTHLY" | "YEARLY";
}

export const PlanUpgradeNoticeModal: React.FC<PlanUpgradeNoticeModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  currentPlan,
  targetPlan,
  billingCycle,
}) => {
  if (!isOpen || !targetPlan) return null;

  const targetPriceRupees = targetPlan.price >= 100 ? targetPlan.price / 100 : targetPlan.price;
  const currentPriceRupees = currentPlan ? (currentPlan.price >= 100 ? currentPlan.price / 100 : currentPlan.price) : 0;
  const isTargetFree = targetPlan.price === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-7 space-y-5 text-left animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Upgrade Notice & Quota Policy
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Upgrading to {targetPlan.name}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Please review how your billing cycle and metered usage quotas will refresh before heading to checkout.
          </p>
        </div>

        {/* Plan Transition Preview */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
          <div className="space-y-1 border-r border-neutral-200 dark:border-neutral-700 pr-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Current Tier
            </span>
            <div className="font-bold text-xs text-neutral-800 dark:text-neutral-200 truncate">
              {currentPlan?.name || "Starter Tier"}
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">
              {currentPriceRupees === 0 ? "Free" : `₹${currentPriceRupees.toLocaleString()}/mo`}
            </span>
          </div>

          <div className="space-y-1 pl-1">
            <span className="text-[10px] font-bold text-[#F42A18] uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" />
              New Target Tier
            </span>
            <div className="font-bold text-xs text-neutral-900 dark:text-white truncate">
              {targetPlan.name} ({billingCycle.toLowerCase()})
            </div>
            <span className="text-[11px] text-[#F42A18] font-bold">
              {isTargetFree ? "Free" : `₹${targetPriceRupees.toLocaleString()}/mo`}
            </span>
          </div>
        </div>

        {/* Policy Points */}
        <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong className="text-neutral-900 dark:text-white">Instant Capacity Upgrade:</strong> Your higher quotas for live streaming minutes, storage, and teaching tools become available immediately.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong className="text-neutral-900 dark:text-white">Cycle & Quota Refresh:</strong> A new 30-day billing cycle begins immediately. Any remaining unused metered minutes from your previous tier will reset and be replaced by your new plan's full allowance.
            </p>
          </div>
        </div>

        {/* 80% Usage Recommendation Alert Box */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-left space-y-1">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Recommended Upgrade Timing</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
            To get the maximum value from your current subscription, we recommend upgrading after you have utilized <strong>80% or more</strong> of your monthly limits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs cursor-pointer h-9 px-4"
          >
            Keep Current Plan
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onProceed}
            className="gap-1.5 rounded-xl text-xs bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer font-bold h-9 px-5 shadow-md shadow-[#F42A18]/20"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanUpgradeNoticeModal;
