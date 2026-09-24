import React from "react";
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Star,
  Trash2,
  Smartphone,
  ShieldCheck,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BankDetail } from "../types/bank-detail.types";
import { useSetPrimaryBankDetail, useDeleteBankDetail } from "../hooks/useBankDetails";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

export interface BankCardProps {
  bankDetail: BankDetail;
  readOnly?: boolean;
}

export const BankCard: React.FC<BankCardProps> = ({
  bankDetail,
  readOnly = false,
}) => {
  const setPrimaryMutation = useSetPrimaryBankDetail();
  const deleteMutation = useDeleteBankDetail();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const isUpi = bankDetail.methodType === "UPI";
  const maskedAccountNumber = bankDetail.accountNumber
    ? `•••• •••• •••• ${bankDetail.accountNumber.slice(-4)}`
    : "";

  const handleSetPrimary = async () => {
    if (bankDetail.isPrimary || readOnly) return;
    setPrimaryMutation.mutate(bankDetail.id);
  };

  const handleDelete = async () => {
    if (readOnly) return;

    const confirmed = await confirm({
      actionType: "delete",
      variant: "danger",
      title: "Remove Bank Account?",
      description: `Are you sure you want to remove ${
        isUpi ? bankDetail.upiId : `${bankDetail.bankName} (${maskedAccountNumber})`
      } from your saved payout methods?`,
      confirmText: "Remove Account",
      cancelText: "Cancel",
      icon: <Trash2 className="w-5 h-5 text-[#F42A18]" />,
    });

    if (confirmed) {
      deleteMutation.mutate(bankDetail.id);
    }
  };

  const getStatusBadge = () => {
    switch (bankDetail.verificationStatus) {
      case "VERIFIED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified</span>
          </Badge>
        );
      case "REJECTED":
      case "FAILED":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </Badge>
        );
    }
  };

  return (
    <>
      <div
        className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 border flex flex-col justify-between gap-5 ${
          bankDetail.isPrimary
            ? "bg-gradient-to-br from-neutral-900 to-neutral-950 text-white border-neutral-700/80 shadow-xl dark:shadow-[#F42A18]/5"
            : "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-200/90 dark:border-neutral-800 shadow-sm hover:shadow-md"
        }`}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                bankDetail.isPrimary
                  ? "bg-red-500/20 border-red-500/30 text-red-400"
                  : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-[#F42A18]"
              }`}
            >
              {isUpi ? <Smartphone className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm sm:text-base truncate">
                  {isUpi ? "UPI Direct VPA" : bankDetail.bankName || "Bank Account"}
                </h4>
                {bankDetail.isPrimary && (
                  <Badge className="bg-[#F42A18] text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    Primary
                  </Badge>
                )}
              </div>
              <p
                className={`text-xs truncate ${
                  bankDetail.isPrimary
                    ? "text-neutral-300"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {bankDetail.accountHolderName}
              </p>
            </div>
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Middle Details */}
        <div className="space-y-2.5 py-1">
          {isUpi ? (
            <div className="space-y-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  bankDetail.isPrimary ? "text-neutral-400" : "text-neutral-400"
                }`}
              >
                Virtual Payment Address (VPA)
              </span>
              <p className="text-base sm:text-lg font-mono font-bold tracking-wide break-all">
                {bankDetail.upiId}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    bankDetail.isPrimary ? "text-neutral-400" : "text-neutral-400"
                  }`}
                >
                  Account Number
                </span>
                <p className="text-base sm:text-lg font-mono font-bold tracking-wider">
                  {maskedAccountNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span
                    className={`block text-[10px] font-medium ${
                      bankDetail.isPrimary ? "text-neutral-400" : "text-neutral-400"
                    }`}
                  >
                    IFSC Code
                  </span>
                  <span className="font-mono font-semibold">{bankDetail.ifscCode}</span>
                </div>
                <div>
                  <span
                    className={`block text-[10px] font-medium ${
                      bankDetail.isPrimary ? "text-neutral-400" : "text-neutral-400"
                    }`}
                  >
                    Account Type
                  </span>
                  <span className="font-medium capitalize">{bankDetail.accountType.toLowerCase()}</span>
                </div>
              </div>
            </>
          )}

          {bankDetail.verificationNotes && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
                bankDetail.verificationStatus === "REJECTED"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-neutral-800/80 border-neutral-700 text-neutral-300"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#F42A18]" />
              <span className="text-[11px] leading-relaxed">{bankDetail.verificationNotes}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!readOnly && (
          <div
            className={`pt-3 border-t flex items-center justify-between gap-2 ${
              bankDetail.isPrimary
                ? "border-neutral-800"
                : "border-neutral-100 dark:border-neutral-800"
            }`}
          >
            <div>
              {!bankDetail.isPrimary ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSetPrimary}
                  disabled={setPrimaryMutation.isPending}
                  className="h-8 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-[#F42A18] cursor-pointer px-2.5"
                >
                  <Star className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                  <span>Set as Primary</span>
                </Button>
              ) : (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Primary Payout Account
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              title="Remove Account"
              className="h-8 w-8 p-0 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog />
    </>
  );
};

export default BankCard;
