import React from "react";
import {
  Tag,
  Copy,
  Calendar,
  Layers,
  Percent,
  TrendingDown,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Trash2,
  Power,
} from "lucide-react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TeacherCoupon } from "../types/coupon.types";
import { toast } from "@/lib/toast";

interface AdminCouponDetailModalProps {
  coupon: TeacherCoupon | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (coupon: TeacherCoupon) => void;
  onDelete: (coupon: TeacherCoupon) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

export const AdminCouponDetailModal: React.FC<AdminCouponDetailModalProps> = ({
  coupon,
  isOpen,
  onClose,
  onToggleStatus,
  onDelete,
  isToggling,
  isDeleting,
}) => {
  if (!coupon) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Coupon code "${text}" copied!`);
  };

  const isExpired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Teacher Coupon Telemetry & Details"
      description="Inspect coupon discount parameters, redemption stats, and instructor attribution."
      maxWidth="md"
    >
      <div className="space-y-5 text-left text-neutral-900 dark:text-neutral-100">
        
        {/* Code & Hero Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold tracking-wider text-purple-600 dark:text-purple-400">
                {coupon.code}
              </span>
              <button
                onClick={() => copyToClipboard(coupon.code)}
                title="Copy code"
                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              {coupon.isActive && !isExpired ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Active
                </Badge>
              ) : isExpired ? (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                  Expired
                </Badge>
              ) : (
                <Badge className="bg-neutral-500/10 text-neutral-500 font-semibold">
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          {coupon.description && (
            <p className="text-xs text-neutral-600 dark:text-neutral-300 italic">
              "{coupon.description}"
            </p>
          )}

          <div className="flex items-center gap-2 pt-1 text-xs">
            <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-0 font-bold">
              {coupon.discountType === "PERCENTAGE"
                ? `${coupon.discountValue}% OFF`
                : `₹${coupon.discountValue} FLAT OFF`}
            </Badge>
            {coupon.maxDiscountAmount && (
              <span className="text-[11px] text-neutral-500">
                (Capped at ₹{coupon.maxDiscountAmount.toLocaleString()})
              </span>
            )}
          </div>
        </div>

        {/* Instructor & Scope Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Instructor Creator
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-700 dark:text-neutral-300 overflow-hidden shrink-0">
                {coupon.instructorAvatar ? (
                  <img src={coupon.instructorAvatar} alt={coupon.instructorName || "Instructor"} className="w-full h-full object-cover" />
                ) : (
                  coupon.instructorName?.charAt(0).toUpperCase() || "T"
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                  {coupon.instructorName || "Instructor"}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {coupon.instructorEmail}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Applicable Scope
            </span>
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                {coupon.courseTitle || "All Instructor Courses"}
              </div>
              <span className="text-[11px] text-neutral-500">
                {coupon.courseId ? "Course-specific promo" : "Instructor-wide promo"}
              </span>
            </div>
          </div>
        </div>

        {/* Redemption Metrics & Savings */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
            Redemption & Usage Telemetry
          </span>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 block">Times Used</span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white">
                {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ""}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 block">Limit/Student</span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white">
                {coupon.maxUsesPerStudent} per user
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 block">Total Savings</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                ₹{(coupon.totalDiscountGiven || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {coupon.minOrderAmount && (
            <div className="text-xs text-neutral-500 flex items-center justify-between pt-1">
              <span>Minimum order course price required:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                ₹{coupon.minOrderAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Validity Period */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-500">Valid From:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {new Date(coupon.validFrom).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Expires At:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {coupon.expiresAt
                ? new Date(coupon.expiresAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Never (Open-ended)"}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(coupon)}
            disabled={isDeleting}
            className="rounded-xl border-red-500/20 text-red-600 hover:bg-red-500/10 cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Coupon</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(coupon)}
              disabled={isToggling}
              className={`rounded-xl cursor-pointer flex items-center gap-1.5 ${
                coupon.isActive
                  ? "hover:text-amber-600 hover:border-amber-500/30"
                  : "hover:text-emerald-600 hover:border-emerald-500/30"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{coupon.isActive ? "Deactivate" : "Activate"}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 cursor-pointer"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </ModalTemplate>
  );
};
