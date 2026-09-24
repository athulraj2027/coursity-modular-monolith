import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  ShieldCheck,
  CreditCard,
  Smartphone,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/features/auth";
import { useMyBankDetails } from "../hooks/useBankDetails";
import { BankCard } from "../components/BankCard";
import { AddBankModal } from "../components/AddBankModal";

export const UserBankDetailsPage: React.FC = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: bankDetails = [], isLoading } = useMyBankDetails();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isTeacher = currentUser?.role?.toLowerCase() === "teacher";
  const homePath = isTeacher ? "/teachers/dashboard" : "/students/dashboard";

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Link to={homePath} className="hover:text-[#F42A18] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 text-neutral-400" />
        <span className="font-semibold text-neutral-900 dark:text-white">
          {isTeacher ? "Payout & Bank Details" : "Bank Accounts & Refunds"}
        </span>
      </div>

      {/* 2. Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{isTeacher ? "Payout Methods" : "Saved Bank Accounts"}</span>
                {!isLoading && (
                  <Badge className="bg-red-500 text-white border-0 text-xs px-2.5 py-0.5 rounded-full font-mono">
                    {bankDetails.length} {bankDetails.length === 1 ? "account" : "accounts"}
                  </Badge>
                )}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
              {isTeacher
                ? "Manage your primary bank account and UPI IDs to receive automated course payouts, earnings settlements, and revenue transfers."
                : "Manage your registered bank account and UPI details for receiving instant course refunds and platform rewards."}
            </p>
          </div>

          <div className="shrink-0">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="h-11 px-5 rounded-2xl bg-[#F42A18] hover:bg-[#D92212] text-white font-bold text-xs shadow-lg shadow-[#F42A18]/25 hover:shadow-xl hover:shadow-[#F42A18]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payout Method</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Bank Accounts Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-3xl bg-neutral-100 dark:bg-neutral-800/50 animate-pulse border border-neutral-200/60 dark:border-neutral-800/60"
            />
          ))}
        </div>
      ) : bankDetails.length === 0 ? (
        <div className="p-10 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-3xl bg-red-500/10 text-[#F42A18] flex items-center justify-center mx-auto border border-red-500/20">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              No Payout Accounts Saved
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Add your primary bank account or UPI ID to enable automated course revenue payouts and fast refund processing.
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-5 rounded-xl bg-[#F42A18] hover:bg-[#D92212] text-white font-semibold text-xs cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Bank Account</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bankDetails.map((detail) => (
              <BankCard key={detail.id} bankDetail={detail} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Security & Compliance Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
            Encrypted & Secure
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            All banking credentials are encrypted with AES-256 standard and stored in compliance with RBI guidelines.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
            Primary Payout Routing
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Your designated primary account will automatically receive settlements on the scheduled payout clearance date.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
            UPI Instant Transfer
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Adding a verified UPI VPA handle allows instantaneous IMPS routing directly to your mobile banking app.
          </p>
        </div>
      </div>

      {/* Add Bank Modal */}
      <AddBankModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultUserName={currentUser?.name || ""}
      />
    </div>
  );
};

export default UserBankDetailsPage;
