import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  RotateCcw,
  CalendarPlus,
  ArrowRightLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { useAdminPlans } from "../hooks/usePlans";

// ==========================================
// 1. CANCEL SUBSCRIPTION MODAL
// ==========================================

export interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { immediate: boolean; reason?: string }) => Promise<void>;
  subscriptionId: string;
  instructorName?: string;
  planName?: string;
  currentPeriodEnd?: string;
  isLoading?: boolean;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  instructorName = "Instructor",
  planName = "Current Plan",
  currentPeriodEnd,
  isLoading = false,
}) => {
  const [strategy, setStrategy] = useState<"period_end" | "immediate">("period_end");
  const [reason, setReason] = useState("");

  const formattedPeriodEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "end of current billing cycle";

  const handleConfirm = async () => {
    await onConfirm({
      immediate: strategy === "immediate",
      reason: reason.trim() || undefined,
    });
    setReason("");
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
      >
        Keep Subscription
      </Button>
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className={
          strategy === "immediate"
            ? "text-xs rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 cursor-pointer"
            : "text-xs rounded-xl font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20 cursor-pointer"
        }
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
        {strategy === "immediate" ? "Revoke & Cancel Now" : "Schedule Cancellation"}
      </Button>
    </>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Instructor Subscription"
      description={`Manage the cancellation lifecycle for ${instructorName}'s ${planName}.`}
      icon={
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
      }
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Cancellation Method
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {/* Graceful / Period End */}
            <div
              onClick={() => setStrategy("period_end")}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                strategy === "period_end"
                  ? "bg-amber-500/5 border-amber-500/40 text-neutral-900 dark:text-white"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              }`}
            >
              <input
                type="radio"
                checked={strategy === "period_end"}
                onChange={() => setStrategy("period_end")}
                className="mt-1 text-amber-600 focus:ring-amber-500"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Cancel at Period End (Graceful)</span>
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] py-0 px-1.5 border-amber-500/20">
                    Recommended
                  </Badge>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  The teacher retains full active quotas and live classroom streaming until{" "}
                  <strong>{formattedPeriodEnd}</strong>. After this date, no auto-renewal will occur.
                </p>
              </div>
            </div>

            {/* Immediate Revocation */}
            <div
              onClick={() => setStrategy("immediate")}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                strategy === "immediate"
                  ? "bg-red-500/5 border-red-500/40 text-neutral-900 dark:text-white"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              }`}
            >
              <input
                type="radio"
                checked={strategy === "immediate"}
                onChange={() => setStrategy("immediate")}
                className="mt-1 text-red-600 focus:ring-red-500"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Immediate Revocation (Policy Violation / Direct Request)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Immediately cancels the subscription right now. Live streaming limits and allocated
                  quotas will instantly revert to Free starter defaults.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reason Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Administrative Reason Note (Optional)
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Instructor requested cancellation via support ticket #1042"
            className="text-xs"
          />
        </div>
      </div>
    </ModalTemplate>
  );
};

// ==========================================
// 2. REFUND INVOICE MODAL
// ==========================================

export interface RefundInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    invoiceId: string;
    amount?: number;
    reason: string;
    cancelSubscriptionImmediately: boolean;
  }) => Promise<void>;
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    paymentMethod?: string | null;
    paidAt?: string | null;
  } | null;
  isLoading?: boolean;
}

export const RefundInvoiceModal: React.FC<RefundInvoiceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  invoice,
  isLoading = false,
}) => {
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [reason, setReason] = useState("");
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice) {
      setRefundType("full");
      setPartialAmount(invoice.amount.toString());
      setReason("");
      setCancelImmediately(false);
      setError(null);
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Please provide a mandatory reason for this refund.");
      return;
    }

    let finalAmount = invoice.amount;
    if (refundType === "partial") {
      const parsed = parseFloat(partialAmount);
      if (isNaN(parsed) || parsed <= 0) {
        setError("Please enter a valid positive refund amount.");
        return;
      }
      if (parsed > invoice.amount) {
        setError(`Refund amount cannot exceed invoice total of ₹${invoice.amount.toLocaleString()}.`);
        return;
      }
      finalAmount = parsed;
    }

    setError(null);
    await onConfirm({
      invoiceId: invoice.id,
      amount: finalAmount,
      reason: reason.trim(),
      cancelSubscriptionImmediately: cancelImmediately,
    });
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className="text-xs rounded-xl font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 cursor-pointer"
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
        Process Razorpay Refund
      </Button>
    </>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Process Payment Refund"
      description={`Issue an automated refund via Razorpay for Invoice #${invoice.invoiceNumber}.`}
      icon={
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <RotateCcw className="w-5 h-5" />
        </div>
      }
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-4 py-2">
        {/* Invoice Summary Box */}
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-neutral-500">Invoice Number</span>
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">
              #{invoice.invoiceNumber}
            </p>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[11px] text-neutral-500">Total Paid Amount</span>
            <p className="text-sm font-bold text-neutral-900 dark:text-white">
              ₹{invoice.amount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Refund Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Refund Amount
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRefundType("full")}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                refundType === "full"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              <span>Full Refund (100%)</span>
              <span className="font-bold">₹{invoice.amount.toLocaleString()}</span>
            </button>

            <button
              type="button"
              onClick={() => setRefundType("partial")}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                refundType === "partial"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              <span>Partial Amount</span>
              <span className="text-[10px] text-neutral-500">Custom ₹</span>
            </button>
          </div>

          {refundType === "partial" && (
            <div className="pt-1">
              <label className="text-[11px] text-neutral-500">Custom Refund Amount (₹)</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-xs text-neutral-500">₹</span>
                <Input
                  type="number"
                  min="1"
                  max={invoice.amount}
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  className="pl-7 text-xs"
                  placeholder="Enter amount in ₹"
                />
              </div>
            </div>
          )}
        </div>

        {/* Refund Reason (Mandatory) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Mandatory Reason for Audit Note <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Instructor dissatisfaction during onboarding guarantee period / Billing dispute resolved."
            className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Immediate Cancellation Toggle */}
        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-start gap-3">
          <input
            type="checkbox"
            id="cancelImmediatelyCheckbox"
            checked={cancelImmediately}
            onChange={(e) => setCancelImmediately(e.target.checked)}
            className="mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="cancelImmediatelyCheckbox" className="text-xs space-y-0.5 cursor-pointer">
            <span className="font-semibold text-neutral-900 dark:text-white block">
              Immediately revoke and cancel subscription
            </span>
            <span className="text-[11px] text-neutral-500 block">
              If enabled, this will instantly reset active feature allocations and cancel the plan tier.
            </span>
          </label>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>
    </ModalTemplate>
  );
};

// ==========================================
// 3. EXTEND SUBSCRIPTION MODAL
// ==========================================

export interface ExtendSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { daysToAdd?: number; newPeriodEnd?: string; reason?: string }) => Promise<void>;
  currentPeriodEnd: string;
  instructorName?: string;
  isLoading?: boolean;
}

export const ExtendSubscriptionModal: React.FC<ExtendSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPeriodEnd,
  instructorName = "Instructor",
  isLoading = false,
}) => {
  const [days, setDays] = useState<number>(14);
  const [reason, setReason] = useState("");

  const baseDate = currentPeriodEnd && new Date(currentPeriodEnd) > new Date()
    ? new Date(currentPeriodEnd)
    : new Date();

  const computedEndDate = new Date(baseDate);
  computedEndDate.setDate(computedEndDate.getDate() + days);

  const formattedNewDate = computedEndDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleConfirm = async () => {
    await onConfirm({
      daysToAdd: days,
      reason: reason.trim() || undefined,
    });
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className="text-xs rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer"
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
        Extend by +{days} Days
      </Button>
    </>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Extend Subscription Period"
      description={`Grant complimentary days or extend access for ${instructorName}.`}
      icon={
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
          <CalendarPlus className="w-5 h-5" />
        </div>
      }
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-4 py-2">
        {/* Quick Days Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Extension Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[7, 14, 30, 60].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  days === d
                    ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                }`}
              >
                +{d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Date Preview Card */}
        <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-neutral-500">New Expiration Date</span>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">
              {formattedNewDate}
            </p>
          </div>
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px]">
            +{days} Days Added
          </Badge>
        </div>

        {/* Reason Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Administrative Extension Reason (Optional)
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Promotional goodwill extension / Resolution of support ticket"
            className="text-xs"
          />
        </div>
      </div>
    </ModalTemplate>
  );
};

// ==========================================
// 4. CHANGE PLAN MODAL
// ==========================================

export interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { newPlanId: string; resetPeriod: boolean }) => Promise<void>;
  currentPlanId: string;
  instructorName?: string;
  isLoading?: boolean;
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPlanId,
  instructorName = "Instructor",
  isLoading = false,
}) => {
  const { data: plansData } = useAdminPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [resetPeriod, setResetPeriod] = useState(false);

  const activePlans = (plansData || []).filter((p) => p.isActive);

  useEffect(() => {
    if (activePlans.length > 0 && !selectedPlanId) {
      const firstNonCurrent = activePlans.find((p) => p.id !== currentPlanId) || activePlans[0];
      if (firstNonCurrent) setSelectedPlanId(firstNonCurrent.id);
    }
  }, [activePlans, currentPlanId, selectedPlanId]);

  const handleConfirm = async () => {
    if (!selectedPlanId) return;
    await onConfirm({
      newPlanId: selectedPlanId,
      resetPeriod,
    });
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading || !selectedPlanId || selectedPlanId === currentPlanId}
        className="text-xs rounded-xl font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 cursor-pointer"
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
        Switch Plan Tier
      </Button>
    </>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Change Instructor Plan Tier"
      description={`Upgrade or downgrade ${instructorName}'s active subscription plan.`}
      icon={
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400">
          <ArrowRightLeft className="w-5 h-5" />
        </div>
      }
      footer={footer}
      maxWidth="lg"
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Select Target Plan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
            {activePlans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isCurrent = currentPlanId === plan.id;
              const priceInRupees = Number(plan.price) >= 100 ? Number(plan.price) / 100 : Number(plan.price);

              return (
                <div
                  key={plan.id}
                  onClick={() => !isCurrent && setSelectedPlanId(plan.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-purple-500/5 border-purple-500/50 ring-1 ring-purple-500/30 shadow-sm"
                      : isCurrent
                      ? "border-neutral-200 dark:border-neutral-800 opacity-60 cursor-not-allowed bg-neutral-50 dark:bg-neutral-900/30"
                      : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {plan.name}
                      </span>
                      {isCurrent ? (
                        <Badge className="bg-neutral-500/10 text-neutral-600 text-[10px] py-0 px-1.5">
                          Current
                        </Badge>
                      ) : isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      ) : null}
                    </div>
                    {plan.tagline && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {plan.tagline}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                      ₹{priceInRupees.toLocaleString()}
                      <span className="text-[10px] font-normal text-neutral-500">
                        /{plan.billingCycle.toLowerCase()}
                      </span>
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {plan.features?.length || 0} features
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset Period Option */}
        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-start gap-3">
          <input
            type="checkbox"
            id="resetPeriodCheckbox"
            checked={resetPeriod}
            onChange={(e) => setResetPeriod(e.target.checked)}
            className="mt-0.5 rounded border-neutral-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <label htmlFor="resetPeriodCheckbox" className="text-xs space-y-0.5 cursor-pointer">
            <span className="font-semibold text-neutral-900 dark:text-white block">
              Reset full billing period from today
            </span>
            <span className="text-[11px] text-neutral-500 block">
              If enabled, current period start will be set to today and period end will be recalculated
              based on the new plan's billing cycle.
            </span>
          </label>
        </div>
      </div>
    </ModalTemplate>
  );
};
