import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  XCircle,
  RotateCcw,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

export const TeacherPlanFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "Your payment could not be processed by your bank or the payment window was closed.";
  const planId = searchParams.get("planId");

  const checkoutUrl = planId ? `/teachers/plans/checkout?planId=${planId}` : "/teachers/plans/browse";

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[600px] w-full text-center max-w-xl mx-auto space-y-8 py-8">
      {/* Alert Icon */}
      <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto shadow-xl shadow-red-500/10">
        <XCircle className="w-10 h-10" />
      </div>

      {/* Failure Title & Message */}
      <div className="space-y-2">
        <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-xs px-3 py-1">
          Transaction Incomplete
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Payment Was Not Completed
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          {reason}
        </p>
      </div>

      {/* Trouble-shooting Advice */}
      <div className="w-full p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 text-left space-y-3 text-xs text-neutral-600 dark:text-neutral-400 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Common reasons for incomplete payments:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-500">
          <li>Bank authorization timeout or pending approval in your UPI app.</li>
          <li>Incorrect card CVV or 3D Secure OTP expiration.</li>
          <li>Insufficient funds or daily card transaction limits.</li>
          <li>Temporary banking gateway downtime.</li>
        </ul>
        <p className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          Don't worry, no funds were deducted. If any amount was debited, it will be automatically refunded by your bank within 2-3 business days.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <Button
          asChild
          className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold text-xs bg-[#F42A18] hover:bg-[#d92212] text-white shadow-md shadow-[#F42A18]/20 cursor-pointer"
        >
          <Link to={checkoutUrl}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Try Payment Again
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold text-xs cursor-pointer"
        >
          <Link to="/teachers/plans/browse">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Return to Plans Catalog
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default TeacherPlanFailedPage;
