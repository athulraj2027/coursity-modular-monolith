import React from "react";
import type { Plan } from "../types/plan.types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Sparkles, X, Zap } from "lucide-react";

interface SubscribeModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: Plan) => void;
  isLoading: boolean;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  plan,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !plan) return null;

  const isFree = plan.price === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-8 space-y-6 text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F42A18]/10 text-[#F42A18]">
            <Sparkles className="w-3.5 h-3.5" />
            Confirm Subscription
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Subscribe to {plan.name}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Review your plan summary below. You will get immediate access to all associated quotas and features.
          </p>
        </div>

        {/* Plan Summary Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              Billing Frequency:
            </span>
            <span className="text-xs font-bold uppercase text-neutral-900 dark:text-white">
              {plan.billingCycle}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              Amount Due Now:
            </span>
            <span className="text-base font-extrabold text-[#F42A18]">
              {isFree || plan.trialDays > 0 ? "$0.00 (Trial)" : `$${plan.price} ${plan.currency}`}
            </span>
          </div>

          {plan.trialDays > 0 && !isFree && (
            <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>
                {plan.trialDays} days free trial, then ${plan.price}/month thereafter. Cancel anytime.
              </span>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Key Quota Highlights:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700 dark:text-neutral-300">
            {plan.features?.slice(0, 4).map((pf) => (
              <div key={pf.id} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">
                  {pf.isUnlimited || pf.value === "-1" ? "Unlimited" : pf.value}{" "}
                  {pf.feature?.unit || ""} {pf.feature?.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(plan)}
            disabled={isLoading}
            className="gap-2 rounded-xl text-xs bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer font-semibold"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {isFree
                ? "Activate Free Tier"
                : plan.trialDays > 0
                ? `Start ${plan.trialDays}-Day Free Trial`
                : "Confirm & Upgrade"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
