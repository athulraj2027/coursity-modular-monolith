import React, { useState } from "react";
import {
  Building2,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { useCreateBankDetail } from "../hooks/useBankDetails";
import type { BankAccountType, PayoutMethodType } from "../types/bank-detail.types";

export interface AddBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserName?: string;
}

export const AddBankModal: React.FC<AddBankModalProps> = ({
  isOpen,
  onClose,
  defaultUserName = "",
}) => {
  const [methodType, setMethodType] = useState<PayoutMethodType>("BANK_ACCOUNT");
  const [accountHolderName, setAccountHolderName] = useState(defaultUserName);
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountType, setAccountType] = useState<BankAccountType>("SAVINGS");
  const [upiId, setUpiId] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createMutation = useCreateBankDetail();

  const resetForm = () => {
    setMethodType("BANK_ACCOUNT");
    setAccountHolderName(defaultUserName);
    setAccountNumber("");
    setConfirmAccountNumber("");
    setIfscCode("");
    setBankName("");
    setBranchName("");
    setAccountType("SAVINGS");
    setUpiId("");
    setIsPrimary(true);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!accountHolderName.trim()) {
      errs.accountHolderName = "Account holder name is required";
    }

    if (methodType === "BANK_ACCOUNT") {
      if (!accountNumber.trim()) {
        errs.accountNumber = "Account number is required";
      } else if (accountNumber.trim().length < 8) {
        errs.accountNumber = "Account number must be at least 8 digits";
      }

      if (!confirmAccountNumber.trim()) {
        errs.confirmAccountNumber = "Please confirm account number";
      } else if (accountNumber.trim() !== confirmAccountNumber.trim()) {
        errs.confirmAccountNumber = "Account numbers do not match";
      }

      if (!ifscCode.trim()) {
        errs.ifscCode = "IFSC code is required";
      } else if (ifscCode.trim().length !== 11) {
        errs.ifscCode = "IFSC must be exactly 11 characters (e.g. HDFC0001234)";
      }

      if (!bankName.trim()) {
        errs.bankName = "Bank name is required";
      }
    } else if (methodType === "UPI") {
      if (!upiId.trim()) {
        errs.upiId = "UPI ID is required";
      } else if (!upiId.includes("@")) {
        errs.upiId = "Enter a valid UPI ID (e.g. name@bank or phone@upi)";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    createMutation.mutate(
      {
        methodType,
        accountHolderName: accountHolderName.trim(),
        accountNumber: methodType === "BANK_ACCOUNT" ? accountNumber.trim() : undefined,
        ifscCode: methodType === "BANK_ACCOUNT" ? ifscCode.toUpperCase().trim() : undefined,
        bankName: methodType === "BANK_ACCOUNT" ? bankName.trim() : undefined,
        branchName: methodType === "BANK_ACCOUNT" && branchName.trim() ? branchName.trim() : undefined,
        accountType: methodType === "BANK_ACCOUNT" ? accountType : undefined,
        upiId: methodType === "UPI" ? upiId.trim() : undefined,
        isPrimary,
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      }
    );
  };

  const headerIcon = (
    <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#F42A18] flex items-center justify-center">
      <Building2 className="w-5 h-5" />
    </div>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Add Payout Method"
      description="Add a verified bank account or UPI ID for seamless course payouts and instant refunds."
      icon={headerIcon}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-1">
        {/* Method Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
          <button
            type="button"
            onClick={() => {
              setMethodType("BANK_ACCOUNT");
              setErrors({});
            }}
            className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              methodType === "BANK_ACCOUNT"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/80 dark:border-neutral-700"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4 text-[#F42A18]" />
            <span>Bank Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMethodType("UPI");
              setErrors({});
            }}
            className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              methodType === "UPI"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/80 dark:border-neutral-700"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#F42A18]" />
            <span>UPI Direct (VPA)</span>
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          {/* Account Holder Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Account Holder Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => {
                setAccountHolderName(e.target.value);
                if (errors.accountHolderName) setErrors((prev) => ({ ...prev, accountHolderName: "" }));
              }}
              placeholder="e.g. Rahul Sharma (as per bank passbook / PAN)"
              className="w-full h-10 px-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
            />
            {errors.accountHolderName && (
              <p className="text-[11px] text-red-500 font-medium">{errors.accountHolderName}</p>
            )}
          </div>

          {methodType === "BANK_ACCOUNT" ? (
            <>
              {/* Account Number & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      if (errors.accountNumber) setErrors((prev) => ({ ...prev, accountNumber: "" }));
                    }}
                    placeholder="Enter account number"
                    className="w-full h-10 px-3.5 font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                  />
                  {errors.accountNumber && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.accountNumber}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Confirm Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={confirmAccountNumber}
                    onChange={(e) => {
                      setConfirmAccountNumber(e.target.value);
                      if (errors.confirmAccountNumber)
                        setErrors((prev) => ({ ...prev, confirmAccountNumber: "" }));
                    }}
                    placeholder="Re-enter account number"
                    className="w-full h-10 px-3.5 font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                  />
                  {errors.confirmAccountNumber && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.confirmAccountNumber}</p>
                  )}
                </div>
              </div>

              {/* IFSC & Bank Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={ifscCode}
                    onChange={(e) => {
                      setIfscCode(e.target.value.toUpperCase());
                      if (errors.ifscCode) setErrors((prev) => ({ ...prev, ifscCode: "" }));
                    }}
                    placeholder="e.g. HDFC0001234"
                    className="w-full h-10 px-3.5 font-mono uppercase rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                  />
                  {errors.ifscCode && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.ifscCode}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: "" }));
                    }}
                    placeholder="e.g. HDFC Bank / SBI"
                    className="w-full h-10 px-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                  />
                  {errors.bankName && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.bankName}</p>
                  )}
                </div>
              </div>

              {/* Branch & Account Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Branch Name <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Koramangala 5th Block"
                    className="w-full h-10 px-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Account Type
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as BankAccountType)}
                    className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 cursor-pointer"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            /* UPI VPA Input */
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                UPI Virtual Payment Address (VPA) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  if (errors.upiId) setErrors((prev) => ({ ...prev, upiId: "" }));
                }}
                placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
                className="w-full h-10 px-3.5 font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
              />
              {errors.upiId && <p className="text-[11px] text-red-500 font-medium">{errors.upiId}</p>}
            </div>
          )}

          {/* Primary Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300 select-none">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4 rounded text-[#F42A18] focus:ring-[#F42A18] accent-[#F42A18]"
              />
              <span>Set as primary account for receiving payouts and refunds</span>
            </label>
          </div>
        </div>

        {/* Security Assurance Callout */}
        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 text-xs flex items-start gap-2.5 text-neutral-600 dark:text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Bank details are stored with bank-grade 256-bit encryption. Account numbers are masked and only utilized for scheduled settlements and direct IMPS transfers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="text-xs rounded-xl h-9 px-4 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="text-xs rounded-xl font-semibold bg-[#F42A18] hover:bg-[#D92212] text-white h-9 px-5 shadow-md shadow-[#F42A18]/25 cursor-pointer flex items-center gap-1.5"
          >
            {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Payout Method</span>
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
};

export default AddBankModal;
