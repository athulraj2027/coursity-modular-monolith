import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowLeft,
  User,
  Mail,
  ExternalLink,
  Calendar,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminBankDetail } from "../hooks/useBankDetails";
import { AdminVerifyBankModal } from "../components/AdminVerifyBankModal";

export const AdminBankDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const { data: bankDetail, isLoading, error } = useAdminBankDetail(id || "");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-44 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 md:col-span-2 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !bankDetail) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold">Bank Account Not Found</h3>
        <p className="text-xs text-neutral-500">
          The requested bank account record does not exist or has been removed.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/bank-details")}
          className="text-xs rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Accounts Registry</span>
        </Button>
      </div>
    );
  }

  const isUpi = bankDetail.methodType === "UPI";
  const user = bankDetail.user;

  const getStatusBadge = () => {
    switch (bankDetail.verificationStatus) {
      case "VERIFIED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Payout Account</span>
          </Badge>
        );
      case "REJECTED":
      case "FAILED":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 px-3 py-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Verification Rejected</span>
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 px-3 py-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Verification</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
        <Link to="/admin/dashboard" className="hover:text-[#F42A18] transition-colors">
          Admin
        </Link>
        <ChevronRight className="w-4 h-4 text-neutral-400" />
        <Link to="/admin/bank-details" className="hover:text-[#F42A18] transition-colors">
          Bank Accounts
        </Link>
        <ChevronRight className="w-4 h-4 text-neutral-400" />
        <span className="font-semibold text-neutral-900 dark:text-white truncate">
          {bankDetail.accountHolderName}
        </span>
      </div>

      {/* 2. Top Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#F42A18] shrink-0">
            {isUpi ? <Smartphone className="w-7 h-7" /> : <Building2 className="w-7 h-7" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {isUpi ? "UPI Direct Payout" : bankDetail.bankName}
              </h1>
              {bankDetail.isPrimary && (
                <Badge className="bg-[#F42A18] text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  Primary Payout
                </Badge>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Account Holder:{" "}
              <strong className="text-neutral-800 dark:text-neutral-200">
                {bankDetail.accountHolderName}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {getStatusBadge()}
          <Button
            onClick={() => setIsVerifyModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#F42A18] hover:bg-[#D92212] text-white font-semibold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Update Status</span>
          </Button>
        </div>
      </div>

      {/* 3. Main 2-Column Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account & Verification Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Banking Details */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F42A18]" />
              Account Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">Payout Method</span>
                <p className="font-bold text-sm text-neutral-900 dark:text-white">
                  {bankDetail.methodType}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">
                  {isUpi ? "Virtual Payment Address (VPA)" : "Account Number"}
                </span>
                <p className="font-bold font-mono text-sm text-neutral-900 dark:text-white break-all">
                  {isUpi ? bankDetail.upiId : bankDetail.accountNumber}
                </p>
              </div>

              {!isUpi && (
                <>
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] text-neutral-400 font-medium">IFSC Code</span>
                    <p className="font-bold font-mono text-sm text-neutral-900 dark:text-white">
                      {bankDetail.ifscCode}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] text-neutral-400 font-medium">Account Type</span>
                    <p className="font-bold text-sm text-neutral-900 dark:text-white capitalize">
                      {bankDetail.accountType.toLowerCase()}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 space-y-1 sm:col-span-2">
                    <span className="text-[11px] text-neutral-400 font-medium">Branch Location</span>
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {bankDetail.branchName || "Not specified"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card 2: Verification Audit Log */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F42A18]" />
              Verification Status & Notes
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-neutral-500">Registered On:</span>
                <span className="font-mono font-medium">
                  {new Date(bankDetail.createdAt).toLocaleString()}
                </span>
              </div>

              {bankDetail.verifiedAt && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="text-neutral-500">Verification Timestamp:</span>
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    {new Date(bankDetail.verifiedAt).toLocaleString()}
                  </span>
                </div>
              )}

              {bankDetail.verificationNotes && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase">
                    Admin Notes:
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
                    {bankDetail.verificationNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Linked User Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <User className="w-4 h-4 text-[#F42A18]" />
              Account Owner
            </h3>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-black text-sm border border-neutral-200 dark:border-neutral-700">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                  {user?.name || "User"}
                </h4>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                {user?.role && (
                  <Badge variant="outline" className="mt-1 text-[10px] uppercase font-semibold">
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Link to={user?.role === "TEACHER" ? `/admin/teachers/${user.id}` : `/admin/users/${user?.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs rounded-xl h-9 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>View User Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Verify Modal */}
      <AdminVerifyBankModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        bankDetail={bankDetail}
      />
    </div>
  );
};

export default AdminBankDetailPage;
