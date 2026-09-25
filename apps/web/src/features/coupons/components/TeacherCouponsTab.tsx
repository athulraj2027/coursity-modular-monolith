import { useState } from "react";
import { useMyCoupons, useDeleteCoupon, useUpdateCoupon } from "../hooks/use-coupons";
import { TeacherCouponFormModal } from "./TeacherCouponFormModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Edit2, Trash2, Users, Calendar, Percent, IndianRupee, Power } from "lucide-react";
import { toast } from "@/lib/toast";
import type { TeacherCoupon } from "../types/coupon.types";

interface TeacherCouponsTabProps {
  courseId: string;
}

export function TeacherCouponsTab({ courseId }: TeacherCouponsTabProps) {
  const { data: coupons = [], isLoading } = useMyCoupons({ courseId });
  const deleteMutation = useDeleteCoupon();
  const updateMutation = useUpdateCoupon();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<TeacherCoupon | null>(null);
  const [couponToToggle, setCouponToToggle] = useState<TeacherCoupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<TeacherCoupon | null>(null);

  const handleCreate = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleEdit = (coupon: TeacherCoupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!couponToToggle) return;
    try {
      await updateMutation.mutateAsync({
        id: couponToToggle.id,
        payload: { isActive: !couponToToggle.isActive },
      });
      toast.success(
        `Coupon "${couponToToggle.code}" is now ${!couponToToggle.isActive ? "Active" : "Deactivated"}`
      );
      setCouponToToggle(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update coupon status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteMutation.mutateAsync(couponToDelete.id);
      toast.success(`Coupon "${couponToDelete.code}" soft-deleted.`);
      setCouponToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 p-5 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#F42A18]" />
            <span>Course Discount Coupons</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Create promotional codes to share with your audience for live class enrollment discounts.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-[#F42A18]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </Button>
      </div>

      {/* Coupons List / Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-neutral-400">Loading discount coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Tag className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">No Coupons Created Yet</h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Create your first coupon code to offer limited-time discounts for this live class cohort.
          </p>
          <Button
            onClick={handleCreate}
            variant="outline"
            className="rounded-xl text-xs font-semibold cursor-pointer gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Coupon</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#F42A18]/40 transition-colors"
            >
              {/* Top Banner */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black tracking-wider text-neutral-900 dark:text-white">
                      {c.code}
                    </span>
                    <Badge
                      className={
                        c.isActive
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                          : "bg-neutral-500/10 text-neutral-500 border-neutral-500/20 text-[10px]"
                      }
                    >
                      {c.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  {c.description && (
                    <p className="text-xs text-neutral-500 line-clamp-1">{c.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCouponToToggle(c)}
                    title={c.isActive ? "Deactivate coupon" : "Activate coupon"}
                    className={`h-8 w-8 p-0 rounded-lg cursor-pointer ${
                      c.isActive
                        ? "text-emerald-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        : "text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(c)}
                    className="h-8 w-8 p-0 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCouponToDelete(c)}
                    className="h-8 w-8 p-0 rounded-lg text-neutral-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Discount Highlight */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/70 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center font-bold">
                    {c.discountType === "PERCENTAGE" ? <Percent className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {c.maxDiscountAmount ? `Max cap ₹${c.maxDiscountAmount}` : "No max cap"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                    <Users className="w-3 h-3 text-neutral-400" />
                    {c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : "used"}
                  </span>
                  <span className="text-[10px] text-neutral-400">Redemptions</span>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  {c.expiresAt ? `Expires ${new Date(c.expiresAt).toLocaleDateString()}` : "Evergreen (No expiry)"}
                </span>
                {c.minOrderAmount ? <span>Min ₹{c.minOrderAmount}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <TeacherCouponFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={selectedCoupon}
        defaultCourseId={courseId}
      />

      {/* Toggle Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(couponToToggle)}
        onClose={() => setCouponToToggle(null)}
        onConfirm={handleConfirmToggle}
        title={
          couponToToggle?.isActive
            ? `Deactivate Coupon "${couponToToggle?.code}"?`
            : `Activate Coupon "${couponToToggle?.code}"?`
        }
        description={
          couponToToggle?.isActive
            ? `Deactivating coupon "${couponToToggle?.code}" will prevent students from redeeming it for this course cohort.`
            : `Activating coupon "${couponToToggle?.code}" will enable students to redeem it immediately.`
        }
        confirmText={couponToToggle?.isActive ? "Yes, Deactivate" : "Yes, Activate"}
        cancelText="Cancel"
        variant={couponToToggle?.isActive ? "warning" : "success"}
        isLoading={updateMutation.isPending}
      />

      {/* Soft Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(couponToDelete)}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Soft Delete Coupon "${couponToDelete?.code}"?`}
        description={`Are you sure you want to deactivate and soft-delete coupon "${couponToDelete?.code}"? Existing student redemptions and records will remain preserved.`}
        confirmText="Yes, Soft Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
