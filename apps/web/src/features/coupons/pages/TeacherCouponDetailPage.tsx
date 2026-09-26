import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Tag,
  ArrowLeft,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Percent,
  IndianRupee,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Power,
  RotateCcw,
  GraduationCap,
  CreditCard,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCouponDetail, useUpdateCoupon, useDeleteCoupon } from "../hooks/use-coupons";
import { TeacherCouponFormModal } from "../components/TeacherCouponFormModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { toast } from "@/lib/toast";

export const TeacherCouponDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: coupon, isLoading, isError } = useCouponDetail(id || "");
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-500">Loading coupon details...</p>
      </div>
    );
  }

  if (isError || !coupon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
          <Tag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Coupon Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-md">
          This coupon may have been removed or you do not have permission to view it.
        </p>
        <Button
          onClick={() => navigate("/teachers/coupons")}
          className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Coupons List
        </Button>
      </div>
    );
  }

  const isExpired = Boolean(coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now());
  const redemptions = coupon.redemptions || [];
  const totalRevenueGenerated = redemptions.reduce((sum, r) => sum + r.finalAmount, 0);
  const averageDiscountPerStudent = coupon.usedCount > 0 ? (coupon.totalDiscountGiven || 0) / coupon.usedCount : 0;
  const usagePercentage = coupon.maxUses ? Math.min(100, Math.round((coupon.usedCount / coupon.maxUses) * 100)) : 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedCode(true);
    toast.success(`Coupon "${coupon.code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConfirmToggleStatus = async () => {
    try {
      await updateMutation.mutateAsync({
        id: coupon.id,
        payload: { isActive: !coupon.isActive },
      });
      setIsToggleModalOpen(false);
      toast.success(
        `Coupon is now ${!coupon.isActive ? "Active and usable by students" : "Deactivated / Inactive"}`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleConfirmSoftDelete = async () => {
    try {
      await deleteMutation.mutateAsync(coupon.id);
      setIsDeleteModalOpen(false);
      toast.success(`Coupon "${coupon.code}" has been soft-deleted (deactivated).`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to soft delete coupon");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* 1. Breadcrumbs & Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
          <Link to="/teachers/dashboard" className="hover:text-[#F42A18] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/teachers/coupons" className="hover:text-[#F42A18] transition-colors">
            Course Coupons
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-neutral-900 dark:text-white">
            {coupon.code}
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl text-xs border-neutral-200 dark:border-neutral-800 gap-1.5 cursor-pointer"
        >
          <Link to="/teachers/coupons">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Coupons</span>
          </Link>
        </Button>
      </div>

      {/* 2. Main Title & Action Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center font-bold shrink-0">
            {coupon.discountType === "PERCENTAGE" ? (
              <Percent className="w-7 h-7" />
            ) : (
              <IndianRupee className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-neutral-900 dark:text-white">
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy Promo Code"
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <Badge
                className={
                  isExpired
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-xs font-bold px-2.5 py-0.5"
                    : coupon.isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold px-2.5 py-0.5"
                    : "bg-neutral-500/10 text-neutral-500 border-neutral-500/20 text-xs font-bold px-2.5 py-0.5"
                }
              >
                {isExpired ? "EXPIRED" : coupon.isActive ? "ACTIVE & LIVE" : "INACTIVE (SOFT-DELETED)"}
              </Badge>
            </div>

            <p className="text-xs text-neutral-500">
              {coupon.description || "No specific note provided for this promo code."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setIsToggleModalOpen(true)}
            disabled={updateMutation.isPending}
            variant="outline"
            className="rounded-xl text-xs font-semibold border-neutral-200 dark:border-neutral-800 gap-1.5 cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" />
            <span>{coupon.isActive ? "Deactivate Coupon" : "Activate Coupon"}</span>
          </Button>

          <Button
            onClick={() => setIsFormModalOpen(true)}
            variant="outline"
            className="rounded-xl text-xs font-semibold border-neutral-200 dark:border-neutral-800 gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Coupon</span>
          </Button>

          <Button
            onClick={() => setIsDeleteModalOpen(true)}
            variant="destructive"
            className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Soft Delete</span>
          </Button>
        </div>
      </div>

      {/* 3. Performance Metrics Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-neutral-500">Total Discounts Given</span>
          <p className="text-2xl font-black text-[#F42A18] font-mono">
            ₹{(coupon.totalDiscountGiven || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-neutral-400">Direct student tuition discount</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-neutral-500">Total Redemptions</span>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ""}
          </p>
          <span className="text-[11px] text-neutral-400">
            {coupon.maxUses ? `${usagePercentage}% quota claimed` : "Unlimited usage"}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-neutral-500">Revenue Generated</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{totalRevenueGenerated.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-neutral-400">Net tuition collected via this code</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-neutral-500">Avg. Savings per Student</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            ₹{averageDiscountPerStudent.toFixed(2)}
          </p>
          <span className="text-[11px] text-neutral-400">Average discount per enrollee</span>
        </div>
      </div>

      {/* 4. Details Breakdown & Rules Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Coupon Parameters & Rules */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Coupon Rules & Specifications
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Discount Value:</span>
                <span className="font-bold text-neutral-900 dark:text-white font-mono">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}% Percentage Off`
                    : `₹${coupon.discountValue} Flat Discount`}
                </span>
              </div>

              {coupon.maxDiscountAmount && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Max Discount Cap:</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">
                    ₹{coupon.maxDiscountAmount}
                  </span>
                </div>
              )}

              {coupon.minOrderAmount && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Min. Course Price:</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">
                    ₹{coupon.minOrderAmount}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-neutral-500">Max Uses per Student:</span>
                <span className="font-bold text-neutral-900 dark:text-white font-mono">
                  {coupon.maxUsesPerStudent} redemption
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Valid From:</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {new Date(coupon.validFrom).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Expires At:</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "No expiration (Evergreen)"}
                </span>
              </div>
            </div>

            {/* Course Scope Banner */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Applicable Course
              </span>

              {coupon.courseTitle ? (
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {coupon.courseThumbnail ? (
                      <img src={coupon.courseThumbnail} alt={coupon.courseTitle} className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                      {coupon.courseTitle}
                    </p>
                    {coupon.coursePrice && (
                      <p className="text-[11px] text-neutral-500 font-mono">
                        Base tuition: ₹{coupon.coursePrice}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Applies to all courses taught by you</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Student Redemptions Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F42A18]" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Student Redemptions Log ({redemptions.length})
                </h3>
              </div>
            </div>

            {redemptions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  No Students Have Redeemed This Code Yet
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Share your promo code <strong>{coupon.code}</strong> with prospective students to start seeing live enrollments and discount usage here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-bold">Student</th>
                      <th className="pb-3 font-bold">Course Enrolled</th>
                      <th className="pb-3 font-bold">Discount Saved</th>
                      <th className="pb-3 font-bold">Final Tuition</th>
                      <th className="pb-3 font-bold">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {redemptions.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
                              {r.studentAvatar ? (
                                <img src={r.studentAvatar} alt={r.studentName} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-3.5 h-3.5 text-neutral-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-neutral-900 dark:text-white block truncate">
                                {r.studentName}
                              </span>
                              <span className="text-[10px] text-neutral-400 block truncate">
                                {r.studentEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate block max-w-[180px]">
                            {r.courseTitle}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-emerald-600">
                            -₹{r.discountAmount.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-neutral-900 dark:text-white">
                            ₹{r.finalAmount.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3 pl-3 text-neutral-500 font-mono text-[11px]">
                          {new Date(r.enrolledAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Form Modal for Editing */}
      <TeacherCouponFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        coupon={coupon}
      />

      {/* 6. Toggle Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={
          coupon.isActive
            ? `Deactivate Coupon "${coupon.code}"?`
            : `Activate Coupon "${coupon.code}"?`
        }
        description={
          coupon.isActive
            ? `Deactivating coupon "${coupon.code}" will prevent students from applying it during course checkout. Existing student enrollments will remain completely safe.`
            : `Activating coupon "${coupon.code}" will make it immediately active and redeemable by students during course checkout.`
        }
        confirmText={coupon.isActive ? "Yes, Deactivate" : "Yes, Activate"}
        cancelText="Cancel"
        variant={coupon.isActive ? "warning" : "success"}
        isLoading={updateMutation.isPending}
      />

      {/* 7. Soft Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmSoftDelete}
        title="Soft-Delete / Deactivate Coupon"
        description={`Are you sure you want to soft-delete coupon "${coupon.code}"? It will be marked inactive and cannot be redeemed for new enrollments. All historical redemptions by students will remain preserved.`}
        confirmText="Yes, Soft Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default TeacherCouponDetailPage;
