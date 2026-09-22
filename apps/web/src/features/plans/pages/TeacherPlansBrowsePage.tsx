import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePlans, useMySubscription } from "../hooks/usePlans";
import type { Plan } from "../types/plan.types";
import { PricingCard } from "../components/PricingCard";
import { FeatureComparisonMatrix } from "../components/FeatureComparisonMatrix";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export const TeacherPlansBrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: plansData, isLoading: isPlansLoading, isError: isPlansError, refetch: refetchPlans } = usePlans();
  const { data: subData, refetch: refetchSub } = useMySubscription();

  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  if (isPlansLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 w-full">
        <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
        <p className="text-sm font-medium text-neutral-500">Loading plan catalog & pricing...</p>
      </div>
    );
  }

  if (isPlansError) {
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

  const handleSelectPlan = (plan: Plan) => {
    navigate(`/teachers/plans/checkout?planId=${plan.id}&cycle=${billingCycle}`);
  };

  return (
    <div className="flex flex-1 flex-col w-full text-left space-y-12">
      {/* 1. Header with Breadcrumb & Billing Cycle Toggle */}
      <div className="space-y-6 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-xl h-8 px-2.5 cursor-pointer"
          >
            <Link to="/teachers/plans">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Usage & Limits
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Choose the Right Tier for Your Academy
              </h1>
              <Badge className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 font-semibold text-[11px] px-2.5 py-0.5">
                Instructor Plans
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Scale your teaching with crystal clear live streaming, automated cloud recording storage, and powerful AI classroom assistance.
            </p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 self-start md:self-auto">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                billingCycle === "MONTHLY"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("YEARLY")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                billingCycle === "YEARLY"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan?.id === plan.id}
            onSelectPlan={handleSelectPlan}
            billingCycle={billingCycle}
          />
        ))}
      </div>

      {/* 3. Reassurance Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Secure Payments</h4>
            <p className="text-[11px] text-neutral-500">256-bit encrypted Razorpay checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F42A18]/10 text-[#F42A18]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Instant Quota Upgrade</h4>
            <p className="text-[11px] text-neutral-500">Immediate access to new limits upon payment</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">GST Invoices</h4>
            <p className="text-[11px] text-neutral-500">Compliant B2B & individual tax receipts</p>
          </div>
        </div>
      </div>

      {/* 4. Full Feature Comparison Matrix */}
      <div className="space-y-4 pt-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Feature Comparison Matrix
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Side-by-side comparison of live limits, storage capacity, and teaching capabilities.
          </p>
        </div>

        <FeatureComparisonMatrix
          plans={plans}
          features={features}
          currentPlanId={currentPlan?.id}
          onSelectPlan={handleSelectPlan}
        />
      </div>

      {/* 5. FAQs */}
      <div className="space-y-6 pt-6 border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#F42A18]" />
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Everything you need to know about instructor plans, billing, and cancellations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 space-y-2">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              Can I upgrade or downgrade my tier anytime?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Yes! Upgrading takes effect immediately with the new quota limits available right away. Any unused days on your previous tier will be automatically prorated.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 space-y-2">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              What payment methods are supported?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We support UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and international cards via Razorpay.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 space-y-2">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              What happens if I reach my live viewer quota?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              You will receive an in-app notice when you reach 80% and 100% of your limit. Your ongoing stream will not be abruptly cut off, but you will be prompted to upgrade for future streams.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 space-y-2">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              Do you provide GST tax invoices?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Yes. You can provide your GSTIN at checkout. All official tax receipts with 18% GST breakdown are generated immediately and downloadable from your Billing History.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPlansBrowsePage;
