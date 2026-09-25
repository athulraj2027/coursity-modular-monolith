import { useState } from "react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, AlertCircle, Wallet, CreditCard, Sparkles, Loader2 } from "lucide-react";
import { useRequestRefund } from "../hooks/use-enrollment";
import type { CourseEnrollment, RefundDestination } from "../types/enrollment.types";

interface CourseRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: CourseEnrollment | null;
}

export function CourseRefundModal({
  isOpen,
  onClose,
  enrollment,
}: CourseRefundModalProps) {
  const refundMutation = useRequestRefund();
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState<RefundDestination>("WALLET");
  const [error, setError] = useState<string | null>(null);

  if (!enrollment) return null;

  const refundAmount = enrollment.finalAmount;
  const daysRemaining = enrollment.daysRemainingForRefund ?? 0;
  const classesConducted = enrollment.classesConductedCount ?? 0;
  const classesAttended = enrollment.attendedClassesCount ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim() || reason.trim().length < 5) {
      setError("Please provide a short reason (at least 5 characters).");
      return;
    }

    try {
      await refundMutation.mutateAsync({
        enrollmentId: enrollment.id,
        payload: {
          reason: reason.trim(),
          destination,
        },
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to process refund");
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Request 100% Course Refund"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 20-Day / 4-Classes Guarantee Status Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              {enrollment.courseTitle}
            </span>
            <span className="text-sm font-black text-emerald-600 font-mono">
              ₹{refundAmount.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <div className="p-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
              <span className="text-[10px] text-neutral-400 block">Time Window</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {daysRemaining} days left of 20
              </span>
            </div>
            <div className="p-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
              <span className="text-[10px] text-neutral-400 block">Classes Held</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {classesConducted}/4 classes (attended: {classesAttended})
              </span>
            </div>
          </div>
        </div>

        {/* Refund Destination Option */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Select Refund Destination
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDestination("WALLET")}
              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                destination === "WALLET"
                  ? "bg-[#F42A18]/5 border-[#F42A18] text-neutral-900 dark:text-white shadow-sm"
                  : "bg-white dark:bg-neutral-800/70 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Wallet className="w-3.5 h-3.5 text-[#F42A18]" />
                <span>Coursity Wallet</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Instant 0-wait credit. Ready for immediate enrollment.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDestination("ORIGINAL_PAYMENT_METHOD")}
              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                destination === "ORIGINAL_PAYMENT_METHOD"
                  ? "bg-[#F42A18]/5 border-[#F42A18] text-neutral-900 dark:text-white shadow-sm"
                  : "bg-white dark:bg-neutral-800/70 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <CreditCard className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                <span>Original Source</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                UPI / Card via Razorpay (typically 3–5 business days).
              </p>
            </button>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Reason for cancellation / refund <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Schedule clash with work, content was not as expected..."
            rows={3}
            className="rounded-xl text-xs resize-none"
            required
          />
        </div>

        {/* Confirmation Button */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={refundMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
          >
            {refundMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Refund...</span>
              </>
            ) : (
              <span>Confirm 100% Refund (₹{refundAmount.toFixed(2)})</span>
            )}
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
}
