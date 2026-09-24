import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Plus,
  ShieldCheck,
  Lock,
  Smartphone,
  Banknote,
  Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/features/auth";
import { useProfile } from "@/features/profile";
import {
  useMyBankDetails,
  useCreateBankDetail,
} from "@/features/bank-details/hooks/useBankDetails";
import { BankCard } from "@/features/bank-details/components/BankCard";
import { AddBankModal } from "@/features/bank-details/components/AddBankModal";
import type { BankAccountType, PayoutMethodType } from "@/features/bank-details/types/bank-detail.types";
import { toast } from "@/lib/toast";

export const TeacherOnboardingBankDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: profileData, isLoading: isProfileLoading } = useProfile();
  const { data: bankDetails = [], isLoading: isBankLoading } = useMyBankDetails();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Inline Form State for first-time account setup
  const [methodType, setMethodType] = useState<PayoutMethodType>("BANK_ACCOUNT");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountType, setAccountType] = useState<BankAccountType>("SAVINGS");
  const [upiId, setUpiId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createBankMutation = useCreateBankDetail();

  const teacherProfile = profileData?.teacherProfile;
  const approvalStatus =
    teacherProfile?.approvalStatus || (teacherProfile?.isApproved ? "VERIFIED" : "PENDING");
  const isInterviewPassed = Boolean(teacherProfile?.isInterviewPassed);

  // Set default account holder name from user profile
  useEffect(() => {
    if (user?.name && !accountHolderName) {
      setAccountHolderName(user.name);
    }
  }, [user?.name, accountHolderName]);

  // Routing Guard: Redirect if profile is incomplete or still pending initial review
  useEffect(() => {
    if (isProfileLoading) return;

    if (approvalStatus === "IN_PROGRESS") {
      navigate("/teachers/onboarding/review", { replace: true });
    } else if (approvalStatus === "PENDING" || approvalStatus === "REDO") {
      navigate("/teachers/onboarding/profile", { replace: true });
    }
  }, [approvalStatus, isProfileLoading, navigate]);

  const validateInlineForm = (): boolean => {
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
        errs.ifscCode = "IFSC code must be 11 characters (e.g. HDFC0001234)";
      }

      if (!bankName.trim()) {
        errs.bankName = "Bank name is required";
      }
    } else if (methodType === "UPI") {
      if (!upiId.trim()) {
        errs.upiId = "UPI ID is required";
      } else if (!upiId.includes("@")) {
        errs.upiId = "Enter a valid UPI ID (e.g. username@okhdfcbank)";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInlineForm()) return;

    createBankMutation.mutate(
      {
        methodType,
        accountHolderName: accountHolderName.trim(),
        accountNumber: methodType === "BANK_ACCOUNT" ? accountNumber.trim() : undefined,
        ifscCode: methodType === "BANK_ACCOUNT" ? ifscCode.toUpperCase().trim() : undefined,
        bankName: methodType === "BANK_ACCOUNT" ? bankName.trim() : undefined,
        branchName: methodType === "BANK_ACCOUNT" && branchName.trim() ? branchName.trim() : undefined,
        accountType: methodType === "BANK_ACCOUNT" ? accountType : undefined,
        upiId: methodType === "UPI" ? upiId.trim() : undefined,
        isPrimary: true,
      },
      {
        onSuccess: () => {
          toast.success("Payout account saved! You can now proceed to Creator Studio.");
          // Clear form
          setAccountNumber("");
          setConfirmAccountNumber("");
          setIfscCode("");
          setBankName("");
          setBranchName("");
          setUpiId("");
          setErrors({});
        },
      }
    );
  };

  const handleFinishOnboarding = () => {
    if (bankDetails.length === 0) {
      toast.info("You can add your bank details later from your Creator Studio settings.");
    } else {
      toast.success("Welcome to Coursity Creator Studio!");
    }
    navigate("/teachers/dashboard", { replace: true });
  };

  const hasBankAccounts = bankDetails.length > 0;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-8 animate-in fade-in duration-300">
      {/* 1. Top Hero / Celebratory Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F42A18]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                AI Vetting Assessment Passed
              </Badge>
              <Badge className="bg-white/10 text-neutral-300 border border-white/15 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Step 4 of 4 • Final Step
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Setup Your Instructor Payout Account
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Congratulations on clearing the technical vetting assessment! Link your primary bank account or UPI ID to receive automatic royalties and payouts for your published courses and live masterclasses.
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-white/5 border border-white/10 p-3 text-center shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#F42A18]/20 text-[#F42A18] flex items-center justify-center font-black text-xl mb-1">
              ₹
            </div>
            <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
              Direct Payouts
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Benefits Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">100% Instructor Royalties</h4>
            <p className="text-[11px] text-neutral-500">0% platform commission on course earnings</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Automated Settlements</h4>
            <p className="text-[11px] text-neutral-500">Direct NEFT/IMPS payouts to your bank</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">256-bit Bank Encryption</h4>
            <p className="text-[11px] text-neutral-500">Industry-standard security & privacy</p>
          </div>
        </div>
      </div>

      {/* 3. Main Bank Account Configuration */}
      <div className="space-y-6">
        {hasBankAccounts ? (
          /* State A: User has already added bank accounts */
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#F42A18]" />
                  Your Configured Payout Accounts ({bankDetails.length})
                </h3>
                <p className="text-xs text-neutral-500">
                  Select your primary account or add additional accounts for receiving payouts.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs rounded-xl border-neutral-300 dark:border-neutral-700 hover:border-[#F42A18] hover:text-[#F42A18] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Account</span>
              </Button>
            </div>

            {/* List of Bank Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankDetails.map((bank) => (
                <BankCard key={bank.id} bankDetail={bank} />
              ))}
            </div>

            {/* Complete Onboarding CTA Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-950 border border-emerald-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Onboarding Requirements Satisfied</span>
                </div>
                <p className="text-xs text-neutral-300 max-w-md">
                  Your instructor profile, vetting assessment, and payout details are ready. Enter Creator Studio to launch your first course.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleFinishOnboarding}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-6 py-3 shadow-lg shadow-emerald-600/25 cursor-pointer flex items-center gap-2 shrink-0 transition-transform active:scale-95"
              >
                <span>Enter Creator Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* State B: User has 0 bank accounts registered -> Show Inline Setup Form */
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#F42A18]" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Add Your Primary Payout Account
                </h3>
              </div>
              <p className="text-xs text-neutral-500">
                Choose between a direct Bank Account (NEFT / IMPS) or Instant UPI Virtual Address (VPA).
              </p>
            </div>

            <form onSubmit={handleInlineSubmit} className="space-y-5">
              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    setMethodType("BANK_ACCOUNT");
                    setErrors({});
                  }}
                  className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${methodType === "BANK_ACCOUNT"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                >
                  <Building2 className="w-4 h-4 text-[#F42A18]" />
                  <span>Bank Account (NEFT/IMPS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethodType("UPI");
                    setErrors({});
                  }}
                  className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${methodType === "UPI"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                >
                  <Smartphone className="w-4 h-4 text-[#F42A18]" />
                  <span>UPI ID (Instant VPA)</span>
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Holder Name */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Account Holder Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => {
                      setAccountHolderName(e.target.value);
                      if (errors.accountHolderName) setErrors((p) => ({ ...p, accountHolderName: "" }));
                    }}
                    placeholder="e.g. Rahul Sharma (as per bank passbook / PAN)"
                    className="w-full h-11 px-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                  />
                  {errors.accountHolderName && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.accountHolderName}</p>
                  )}
                </div>

                {methodType === "BANK_ACCOUNT" ? (
                  <>
                    {/* Account Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={accountNumber}
                        onChange={(e) => {
                          setAccountNumber(e.target.value);
                          if (errors.accountNumber) setErrors((p) => ({ ...p, accountNumber: "" }));
                        }}
                        placeholder="Enter bank account number"
                        className="w-full h-11 px-3.5 font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                      />
                      {errors.accountNumber && (
                        <p className="text-[11px] text-red-500 font-medium">{errors.accountNumber}</p>
                      )}
                    </div>

                    {/* Confirm Account Number */}
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
                            setErrors((p) => ({ ...p, confirmAccountNumber: "" }));
                        }}
                        placeholder="Re-enter account number"
                        className="w-full h-11 px-3.5 font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                      />
                      {errors.confirmAccountNumber && (
                        <p className="text-[11px] text-red-500 font-medium">{errors.confirmAccountNumber}</p>
                      )}
                    </div>

                    {/* IFSC Code */}
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
                          if (errors.ifscCode) setErrors((p) => ({ ...p, ifscCode: "" }));
                        }}
                        placeholder="e.g. HDFC0001234"
                        className="w-full h-11 px-3.5 font-mono uppercase rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                      />
                      {errors.ifscCode && (
                        <p className="text-[11px] text-red-500 font-medium">{errors.ifscCode}</p>
                      )}
                    </div>

                    {/* Bank Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => {
                          setBankName(e.target.value);
                          if (errors.bankName) setErrors((p) => ({ ...p, bankName: "" }));
                        }}
                        placeholder="e.g. HDFC Bank / State Bank of India"
                        className="w-full h-11 px-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                      />
                      {errors.bankName && (
                        <p className="text-[11px] text-red-500 font-medium">{errors.bankName}</p>
                      )}
                    </div>

                    {/* Branch Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Branch Name <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="e.g. Indiranagar Branch"
                        className="w-full h-11 px-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                      />
                    </div>

                    {/* Account Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Account Type
                      </label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value as BankAccountType)}
                        className="w-full h-11 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 cursor-pointer"
                      >
                        <option value="SAVINGS">Savings Account</option>
                        <option value="CURRENT">Current Account</option>
                      </select>
                    </div>
                  </>
                ) : (
                  /* UPI VPA Field */
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      UPI Virtual Payment Address (VPA) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        if (errors.upiId) setErrors((p) => ({ ...p, upiId: "" }));
                      }}
                      placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
                      className="w-full h-11 px-3.5 font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                    />
                    {errors.upiId && <p className="text-[11px] text-red-500 font-medium">{errors.upiId}</p>}
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 text-xs flex items-start gap-2.5 text-neutral-600 dark:text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Your banking information is tokenized and protected using AES-256 encryption. Details are used solely for disbursing your teacher royalties and automated refunds.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleFinishOnboarding}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  Skip for now & enter Creator Studio
                </Button>

                <Button
                  type="submit"
                  disabled={createBankMutation.isPending}
                  className="bg-[#F42A18] hover:bg-[#D92212] text-white text-xs font-bold rounded-xl px-6 py-2.5 shadow-md shadow-[#F42A18]/25 cursor-pointer flex items-center gap-2"
                >
                  <span>Save Payout & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 4. Add Bank Account Modal for adding multiple accounts */}
      <AddBankModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultUserName={user?.name || ""}
      />
    </div>
  );
};

export default TeacherOnboardingBankDetailsPage;
