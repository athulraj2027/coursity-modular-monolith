import React from "react";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Wallet } from "../types/wallet.types";

interface WalletBalanceCardProps {
  wallet: Wallet | null | undefined;
  role: "student" | "teacher" | "admin";
  onOpenTopUp: () => void;
  onOpenWithdraw?: () => void;
  isLoading?: boolean;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  wallet,
  role,
  onOpenTopUp,
  onOpenWithdraw,
  isLoading,
}) => {
  const isTeacher = role === "teacher";
  const balance = wallet?.balance ?? 0;
  const lockedBalance = wallet?.lockedBalance ?? 0;
  const availableBalance = wallet?.availableBalance ?? Math.max(0, balance - lockedBalance);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 text-white p-6 sm:p-8 shadow-xl">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F42A18]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Main Balance & Details */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#F42A18]/20 text-[#F42A18] border-[#F42A18]/30 text-xs px-3 py-0.5 rounded-full font-bold flex items-center gap-1.5">
              <WalletIcon className="w-3.5 h-3.5" />
              {isTeacher ? "Instructor Creator Wallet" : "Student Cash & Credits"}
            </Badge>

            {wallet?.status === "ACTIVE" ? (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Active
              </Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {wallet?.status || "Active"}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono">
                ₹{availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-semibold text-neutral-400">INR</span>
            </div>
          </div>

          {/* Locked balance indicator (for teachers with active withdrawals) */}
          {lockedBalance > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl max-w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>
                ₹{lockedBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })} locked in pending withdrawal
              </span>
            </div>
          )}

          {/* Quick Analytics Summary Chips */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-neutral-300">
            {isTeacher ? (
              <>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Lifetime Royalties:{" "}
                    <strong className="text-white">
                      ₹{(wallet?.totalEarned || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
                <span className="text-neutral-600 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    Total Disbursed:{" "}
                    <strong className="text-white">
                      ₹{(wallet?.totalWithdrawn || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Total Spent on Courses:{" "}
                  <strong className="text-white">
                    ₹{(wallet?.totalSpent || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[200px]">
          <Button
            type="button"
            onClick={onOpenTopUp}
            className="bg-[#F42A18] hover:bg-[#d92212] text-white text-xs font-bold rounded-2xl h-12 px-6 shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Top-Up Balance</span>
          </Button>

          {isTeacher && onOpenWithdraw && (
            <Button
              type="button"
              variant="outline"
              onClick={onOpenWithdraw}
              disabled={availableBalance < 500}
              className="border-neutral-700 bg-white/5 hover:bg-white/10 text-white hover:text-white text-xs font-bold rounded-2xl h-12 px-6 cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw Payout</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletBalanceCard;
