import React, { useState } from "react";
import { usePlans, useMySubscription, useSubscribePlan } from "../hooks/usePlans";
import type { Plan } from "../types/plan.types";
import { TeacherUsageGauge } from "../components/TeacherUsageGauge";
import { PricingCard } from "../components/PricingCard";
import { FeatureComparisonMatrix } from "../components/FeatureComparisonMatrix";
import { SubscribeModal } from "../components/SubscribeModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";

export const TeacherPlansPage: React.FC = () => {
  const { data: plansData, isLoading: isPlansLoading, isError: isPlansError, refetch: refetchPlans } = usePlans();
  const { data: subData, isLoading: isSubLoading, isError: isSubError, refetch: refetchSub } = useMySubscription();
  const subscribeMutation = useSubscribePlan();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isPlansLoading || isSubLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 w-full">
        <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
        <p className="text-sm font-medium text-neutral-500">Loading subscription plans & quotas...</p>
      </div>
    );
  }

  if (isPlansError || isSubError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 w-full">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          Failed to load subscription plans.
        </p>
        <Button
          onClick={() => {
            refetchPlans();
            refetchSub();
          }}
          variant="outline"
          className="gap-2 rounded-xl text-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  const plans = plansData?.plans || [];
  const features = plansData?.features || [];
  const activeSubscription = subData?.subscription;
  const currentPlan = activeSubscription?.plan;
  const quotaSummary = subData?.quotaSummary || [];

  const handleOpenSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleConfirmSubscribe = async (plan: Plan) => {
    try {
      await subscribeMutation.mutateAsync({ planId: plan.id });
      setIsModalOpen(false);
      setSelectedPlan(null);
    } catch {
      // Handled in mutation hook toast
    }
  };

  return (
    <div className="flex flex-1 flex-col w-full text-left space-y-12">
      {/* 1. Page Header & Active Plan Callout */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Plans & Quota Management
            </h1>
            <Badge className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 font-semibold text-[11px] px-2.5 py-0.5">
              Teacher Studio
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Manage your instructor subscription tier, monitor live viewer minutes & course quotas in real-time, or upgrade to unlock enterprise streaming and AI tools.
          </p>
        </div>

        {/* Current Plan Summary Pill */}
        {currentPlan && (
          <div className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xs flex items-center gap-4">
            <div className="p-2 rounded-xl bg-[#F42A18]/10 text-[#F42A18]">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {currentPlan.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {activeSubscription?.status}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Billing Cycle: {new Date(activeSubscription?.currentPeriodEnd || "").toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Live Usage & Quota Gauges */}
      {quotaSummary.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F42A18]" />
              Current Period Quotas & Usage
            </h2>
            <span className="text-xs text-neutral-400">
              Resets on {new Date(activeSubscription?.currentPeriodEnd || "").toLocaleDateString()}
            </span>
          </div>

          <TeacherUsageGauge items={quotaSummary} />
        </div>
      )}

      {/* 3. Available Subscription Tiers */}
      <div className="space-y-6">
        <div className="text-left space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Available Instructor Tiers
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Choose the plan that fits your teaching audience, live streaming volume, and recording storage needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentPlan?.id === plan.id}
              onSelectPlan={handleOpenSubscribe}
              isLoading={subscribeMutation.isPending}
            />
          ))}
        </div>
      </div>

      {/* 4. Full Feature Comparison Matrix */}
      <div className="space-y-4 pt-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Detailed Feature Comparison
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Compare live class limits, storage, AI features, and viewer minutes across all tiers.
          </p>
        </div>

        <FeatureComparisonMatrix
          plans={plans}
          features={features}
          currentPlanId={currentPlan?.id}
          onSelectPlan={handleOpenSubscribe}
        />
      </div>

      {/* Subscribe & Upgrade Confirmation Modal */}
      <SubscribeModal
        plan={selectedPlan}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
        onConfirm={handleConfirmSubscribe}
        isLoading={subscribeMutation.isPending}
      />
    </div>
  );
};

export default TeacherPlansPage;
