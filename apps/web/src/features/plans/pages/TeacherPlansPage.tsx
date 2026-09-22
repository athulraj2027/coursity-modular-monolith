import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMySubscription, useInvoices, useCancelSubscription } from "../hooks/usePlans";
import { TeacherUsageGauge } from "../components/TeacherUsageGauge";
import { BillingHistoryTable } from "../components/BillingHistoryTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  Zap,
  ArrowUpRight,
  Receipt,
  Calendar,
} from "lucide-react";

export const TeacherPlansPage: React.FC = () => {
  const {
    data: subData,
    isLoading: isSubLoading,
    isError: isSubError,
    refetch: refetchSub,
  } = useMySubscription();

  const {
    data: invoices = [],
    isLoading: isInvoicesLoading,
    refetch: refetchInvoices,
  } = useInvoices();

  const cancelMutation = useCancelSubscription();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleConfirmCancel = async () => {
    try {
      await cancelMutation.mutateAsync(false);
      setIsCancelModalOpen(false);
    } catch {
      // Handled in toast
    }
  };

  if (isSubLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 w-full">
        <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
        <p className="text-sm font-medium text-neutral-500">Loading subscription quotas & usage...</p>
      </div>
    );
  }

  if (isSubError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 w-full">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          Failed to load subscription details.
        </p>
        <Button
          onClick={() => {
            refetchSub();
            refetchInvoices();
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

  const activeSubscription = subData?.subscription;
  const currentPlan = activeSubscription?.plan;
  const quotaSummary = subData?.quotaSummary || [];

  return (
    <div className="flex flex-1 flex-col w-full text-left space-y-10">
      {/* 1. Page Header & Top Upgrade Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Plans & Quota Usage
            </h1>
            <Badge className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 font-semibold text-[11px] px-2.5 py-0.5">
              Teacher Studio
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Monitor your live viewer minutes, recording storage, and active course limits in real-time. Upgrade your plan anytime to unlock unlimited bandwidth and advanced teaching tools.
          </p>
        </div>

        {/* Upgrade Plan Action Button */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="gap-2 bg-[#F42A18] hover:bg-[#D42212] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-xs h-10 px-5"
          >
            <Link to="/teachers/plans/browse">
              <Sparkles className="w-4 h-4" />
              Upgrade Plan
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Active Subscription Card */}
      <div className="p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-linear-to-br from-neutral-50/80 to-white dark:from-neutral-900/80 dark:to-neutral-900/40 backdrop-blur-xs relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F42A18]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {currentPlan?.name || "Free Starter Tier"}
                </h2>
                <Badge
                  className={
                    activeSubscription?.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]"
                      : activeSubscription?.status === "PAST_DUE"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold text-[11px]"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold text-[11px]"
                  }
                >
                  {activeSubscription?.status || "ACTIVE"}
                </Badge>
                {activeSubscription?.cancelAtPeriodEnd && (
                  <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold text-[10px]">
                    Cancels at period end
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
                {currentPlan?.tagline ||
                  "Ideal for getting started with your first interactive courses and webinars."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            {activeSubscription && (
              <div className="flex items-center gap-2 bg-white/80 dark:bg-neutral-800/80 px-4 py-2 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span>
                  Renews:{" "}
                  <strong className="text-neutral-900 dark:text-white">
                    {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                </span>
              </div>
            )}

            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold cursor-pointer h-9"
            >
              <Link to="/teachers/plans/browse">
                Browse All Tiers
              </Link>
            </Button>

            {activeSubscription && !activeSubscription.cancelAtPeriodEnd && (
              <Button
                onClick={() => setIsCancelModalOpen(true)}
                disabled={cancelMutation.isPending}
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs text-neutral-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer h-9"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Real-Time Resource Gauges & Quotas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F42A18]" />
              Usage Meters & Limits
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Live metrics across storage, live broadcasting, and enrolled students.
            </p>
          </div>
          {activeSubscription && (
            <span className="text-xs text-neutral-400 font-medium">
              Quota cycle ends {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          )}
        </div>

        <TeacherUsageGauge
          items={quotaSummary}
          planName={currentPlan?.name || "Free Starter"}
        />
      </div>

      {/* 4. Billing History & Invoices */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#F42A18]" />
              Billing History & Invoices
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              View past payments, download official GST tax invoices, and track billing cycles.
            </p>
          </div>
        </div>

        <BillingHistoryTable invoices={invoices} isLoading={isInvoicesLoading} />
      </div>

      {/* Custom Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Cancel Subscription?
                </h3>
                <p className="text-xs text-neutral-500">
                  Tier: {currentPlan?.name || "Active Tier"}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Your subscription and quota limits will remain active until the end of the current billing cycle on{" "}
              <strong className="text-neutral-900 dark:text-white">
                {new Date(activeSubscription?.currentPeriodEnd || "").toLocaleDateString()}
              </strong>
              . You will not be billed again.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={() => setIsCancelModalOpen(false)}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs cursor-pointer"
              >
                Keep Subscription
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
                size="sm"
                className="rounded-xl text-xs bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPlansPage;
