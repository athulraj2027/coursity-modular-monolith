import React from "react";
import type { Plan } from "../types/plan.types";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, ArrowRight } from "lucide-react";

interface PricingCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelectPlan: (plan: Plan) => void;
  isLoading?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isCurrentPlan,
  onSelectPlan,
  isLoading,
}) => {
  const isFree = plan.price === 0;

  return (
    <div
      className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all duration-300 text-left ${
        plan.isFeatured
          ? "border-2 border-[#F42A18] bg-white dark:bg-neutral-900 shadow-xl shadow-[#F42A18]/5"
          : "border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50"
      }`}
    >
      {/* Featured Pill */}
      {plan.isFeatured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#F42A18] text-white shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Most Popular Tier
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              {plan.name}
            </h3>
            {isCurrentPlan && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active Plan
              </span>
            )}
          </div>
          {plan.tagline && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed min-h-[32px]">
              {plan.tagline}
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {isFree ? "Free" : `$${plan.price}`}
          </span>
          {!isFree && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              / month
            </span>
          )}
        </div>

        {/* Trial Callout */}
        {plan.trialDays > 0 && !isFree && (
          <div className="p-2.5 rounded-xl bg-[#F42A18]/5 dark:bg-[#F42A18]/10 border border-[#F42A18]/15 text-[11px] font-semibold text-[#F42A18] flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>{plan.trialDays}-Day Free Trial Included</span>
          </div>
        )}

        {/* Dynamic Feature Checklist */}
        <div className="space-y-3 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            What's included:
          </p>
          <ul className="space-y-2.5">
            {plan.features?.map((pf) => {
              const isBool = pf.feature?.featureType === "BOOLEAN";
              const isEnabled = isBool ? pf.value === "true" || pf.value === "1" : true;
              const isUnlimited = pf.isUnlimited || pf.value === "-1";

              return (
                <li
                  key={pf.id}
                  className={`flex items-start gap-2.5 text-xs ${
                    isEnabled
                      ? "text-neutral-700 dark:text-neutral-300"
                      : "text-neutral-400 line-through opacity-60"
                  }`}
                >
                  <div
                    className={`p-0.5 rounded-full mt-0.5 shrink-0 ${
                      isEnabled
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                  <span>
                    {!isBool && (
                      <strong className="font-semibold text-neutral-900 dark:text-white mr-1">
                        {isUnlimited ? "Unlimited" : Number(pf.value).toLocaleString()}{" "}
                        {pf.feature?.unit || ""}
                      </strong>
                    )}
                    {pf.feature?.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-8">
        <Button
          onClick={() => onSelectPlan(plan)}
          disabled={isCurrentPlan || isLoading}
          className={`w-full gap-2 rounded-xl text-xs font-semibold py-2.5 cursor-pointer ${
            isCurrentPlan
              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
              : plan.isFeatured
              ? "bg-[#F42A18] hover:bg-[#d92212] text-white shadow-md shadow-[#F42A18]/20"
              : "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          }`}
        >
          {isCurrentPlan ? (
            <span>Current Subscription</span>
          ) : (
            <>
              <span>
                {isFree
                  ? "Get Started Free"
                  : plan.trialDays > 0
                  ? `Start ${plan.trialDays}-Day Free Trial`
                  : "Upgrade to " + plan.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;
