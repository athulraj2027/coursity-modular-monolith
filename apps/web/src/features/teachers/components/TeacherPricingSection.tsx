import React, { useState } from "react";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { PricingCard } from "@/features/plans/components/PricingCard";
import { FeatureComparisonMatrix } from "@/features/plans/components/FeatureComparisonMatrix";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Loader2,
  HelpCircle,
} from "lucide-react";

export const TeacherPricingSection: React.FC = () => {
  const { data: plansData, isLoading: isPlansLoading } = usePlans();
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const plans = plansData?.plans || [];
  const features = plansData?.features || [];

  return (
    <section id="pricing" className="w-full py-24 sm:py-32 px-4 sm:px-6 border-t border-neutral-200/40 dark:border-neutral-900 relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-40"
      >
        <div className="h-[600px] w-[70vw] rounded-full bg-gradient-to-tr from-[#F42A18]/10 via-transparent to-purple-500/10 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl space-y-16">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
            <Zap className="w-3.5 h-3.5" />
            Transparent Pricing
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Simple, Predictable Plans for <br className="hidden sm:inline" />
            <span className="text-[#F42A18]">Ambitious Educators</span>
          </h2>

          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
            Choose the tier that matches your academy's growth. Start free with essential studio tools, or unlock unlimited streaming bandwidth and automated cloud recording storage.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-4">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-1.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  billingCycle === "MONTHLY"
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Monthly Billing
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle("YEARLY")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  billingCycle === "YEARLY"
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
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

        {/* Pricing Cards Grid */}
        {isPlansLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
            <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
            <p className="text-sm font-medium text-neutral-500">Loading plan catalog & pricing...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                showActionButton={false}
              />
            ))}
          </div>
        )}

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Secure Payments</h4>
              <p className="text-xs text-neutral-500">256-bit encrypted Razorpay gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#F42A18]/10 text-[#F42A18]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Instant Quota Upgrade</h4>
              <p className="text-xs text-neutral-500">Immediate access to new limits upon payment</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">GST Invoices</h4>
              <p className="text-xs text-neutral-500">Official B2B & individual tax receipts</p>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="space-y-6 pt-4 text-left">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Full Feature Comparison Matrix
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Compare live classroom limits, recording cloud storage, AI intelligence, and creator revenue tools side by side.
            </p>
          </div>

          <FeatureComparisonMatrix
            plans={plans}
            features={features}
          />
        </div>

        {/* FAQs */}
        <div className="space-y-8 pt-8 border-t border-neutral-200/80 dark:border-neutral-800 text-left">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#F42A18]" />
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Common questions about instructor tiers, billing cycles, and quota management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl border border-neutral-200/60 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 space-y-2">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                Can I upgrade or downgrade my tier anytime?
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Yes! Upgrades take effect immediately with new quota limits provisioned right away.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-neutral-200/60 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 space-y-2">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                What payment methods are supported?
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                We support UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), and Net Banking via Razorpay.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-neutral-200/60 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 space-y-2">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                What happens when I reach my live streaming limit?
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                You will receive in-app notifications at 80% and 100% capacity. Your live stream will never abruptly disconnect, but you will be prompted to upgrade for subsequent streams.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-neutral-200/60 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 space-y-2">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                Do you provide GST tax invoices?
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Yes. You can supply your GSTIN during checkout. Official tax invoices with 18% GST itemization are downloadable from your billing dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherPricingSection;
