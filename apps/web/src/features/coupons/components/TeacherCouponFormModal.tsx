import { useState, useEffect } from "react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tag, Sparkles, AlertCircle, BookOpen } from "lucide-react";
import { useCreateCoupon, useUpdateCoupon } from "../hooks/use-coupons";
import { useTeacherCourses } from "@/features/course/hooks/useCourses";
import type { TeacherCoupon, DiscountType } from "../types/coupon.types";

interface TeacherCouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: TeacherCoupon | null;
  defaultCourseId?: string;
}

export function TeacherCouponFormModal({
  isOpen,
  onClose,
  coupon,
  defaultCourseId,
}: TeacherCouponFormModalProps) {
  const isEditing = Boolean(coupon);
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const { data: coursesData } = useTeacherCourses({ limit: 100 });
  const teacherCourses = coursesData?.items || [];

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [minOrderAmount, setMinOrderAmount] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDescription(coupon.description || "");
      setCourseId(coupon.courseId || "");
      setDiscountType(coupon.discountType);
      setDiscountValue(coupon.discountValue);
      setMaxDiscountAmount(coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : "");
      setMinOrderAmount(coupon.minOrderAmount ? String(coupon.minOrderAmount) : "");
      setMaxUses(coupon.maxUses ? String(coupon.maxUses) : "");
      setExpiresAt(coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "");
      setIsActive(coupon.isActive);
    } else {
      setCode("");
      setDescription("");
      setCourseId(defaultCourseId || "");
      setDiscountType("PERCENTAGE");
      setDiscountValue(20);
      setMaxDiscountAmount("");
      setMinOrderAmount("");
      setMaxUses("");
      setExpiresAt("");
      setIsActive(true);
    }
    setError(null);
  }, [coupon, defaultCourseId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || code.trim().length < 3) {
      setError("Coupon code must be at least 3 characters.");
      return;
    }

    if (discountValue <= 0) {
      setError("Discount value must be greater than zero.");
      return;
    }

    if (discountType === "PERCENTAGE" && discountValue > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    try {
      if (isEditing && coupon) {
        await updateMutation.mutateAsync({
          id: coupon.id,
          payload: {
            description: description.trim() || undefined,
            discountType,
            discountValue: Number(discountValue),
            maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
            minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
            courseId: courseId ? courseId : null,
            maxUses: maxUses ? Number(maxUses) : null,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
          discountType,
          discountValue: Number(discountValue),
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
          courseId: courseId ? courseId : defaultCourseId || undefined,
          maxUses: maxUses ? Number(maxUses) : undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          isActive,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save coupon");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Discount Coupon" : "Create New Course Coupon"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Code Input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Coupon Code <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. LIVECOHORT20, LAUNCH50"
              disabled={isEditing}
              className="pl-9 uppercase font-mono font-bold tracking-wider rounded-xl text-sm"
              required
            />
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Students will enter this uppercase promo code during checkout.
          </p>
        </div>

        {/* Applicable Course Selection */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Applicable Course Scope
          </label>
          <div className="relative">
            <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
            >
              <option value="">✨ All My Courses (Global Teacher Coupon)</option>
              {teacherCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.price ? `(₹${c.price})` : ""}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Choose whether this discount applies to a specific course or across all your courses.
          </p>
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/70 rounded-xl">
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  discountType === "PERCENTAGE"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                % Percent
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("FLAT")}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  discountType === "FLAT"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                ₹ Flat Off
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {discountType === "PERCENTAGE" ? "Discount Percentage (%)" : "Flat Amount (₹)"} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              max={discountType === "PERCENTAGE" ? "100" : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="rounded-xl text-sm font-semibold"
              required
            />
          </div>
        </div>

        {/* Optional Caps & Minimums */}
        <div className="grid grid-cols-2 gap-3">
          {discountType === "PERCENTAGE" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Max Discount Cap (₹)
              </label>
              <Input
                type="number"
                placeholder="Optional max cap"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Min Course Price (₹)
            </label>
            <Input
              type="number"
              placeholder="Optional minimum"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Redemption Limit & Expiry Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Max Redemptions
            </label>
            <Input
              type="number"
              placeholder="Unlimited if blank"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Expiration Date
            </label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Description / Note */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Internal Note / Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Special 20% discount for Twitter/LinkedIn followers"
            rows={2}
            className="rounded-xl text-xs resize-none"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800">
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">Active Status</p>
            <p className="text-[11px] text-neutral-500">Allow students to redeem this coupon immediately</p>
          </div>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-[#F42A18] rounded cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-[#F42A18]/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Coupon"}</span>
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
}
