import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePlans } from "../hooks/usePlans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ArrowRight,
  Receipt,
  Sparkles,
  ShieldCheck,
  Video,
} from "lucide-react";

export const TeacherPlanSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const planId = searchParams.get("planId");
  const amountParam = searchParams.get("amount");

  const { data: plansData } = usePlans();
  const plans = plansData?.plans || [];
  const plan = plans.find((p) => p.id === planId);

  const formattedAmount = amountParam ? Number(amountParam).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00";

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[600px] w-full text-center max-w-2xl mx-auto space-y-8 py-8">
      {/* Celebration Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-[#F42A18] text-white shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Success Title */}
      <div className="space-y-2">
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs px-3 py-1">
          Payment Confirmed
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Welcome to {plan?.name || "Your New Instructor"} Tier!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
          Your subscription has been activated and your live streaming quotas, AI evaluation limits, and recording storage have been unlocked.
        </p>
      </div>

      {/* Order & Transaction Details Card */}
      <div className="w-full p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 text-left space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-neutral-500">Transaction Summary</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified & Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-neutral-400">Plan Activated</span>
            <p className="font-bold text-neutral-900 dark:text-white text-sm mt-0.5">
              {plan?.name || "Instructor Subscription"}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400">Total Amount Paid</span>
            <p className="font-bold text-[#F42A18] text-sm mt-0.5">
              ₹{formattedAmount}
            </p>
          </div>

          {paymentId && (
            <div>
              <span className="text-[11px] text-neutral-400">Payment Reference ID</span>
              <p className="font-mono text-neutral-700 dark:text-neutral-300 mt-0.5">
                {paymentId}
              </p>
            </div>
          )}

          {orderId && (
            <div>
              <span className="text-[11px] text-neutral-400">Gateway Order ID</span>
              <p className="font-mono text-neutral-700 dark:text-neutral-300 mt-0.5">
                {orderId}
              </p>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <Receipt className="w-4 h-4 text-[#F42A18] shrink-0" />
          <span>
            A detailed GST tax invoice has been sent to your registered email and is available in your billing history.
          </span>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <Button
          asChild
          className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold text-xs bg-[#F42A18] hover:bg-[#d92212] text-white shadow-md shadow-[#F42A18]/20 cursor-pointer"
        >
          <Link to="/teachers/plans">
            <span>View Quota Gauges & Usage</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold text-xs cursor-pointer"
        >
          <Link to="/teachers/courses">
            <Video className="w-4 h-4 mr-1.5" />
            Go to Course Studio
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default TeacherPlanSuccessPage;
