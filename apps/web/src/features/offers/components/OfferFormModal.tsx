import React, { useState, useEffect } from "react";
import { Sparkles, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { useAdminPlans } from "@/features/plans/hooks/usePlans";
import { useAdminCreateOffer, useAdminUpdateOffer } from "../hooks/useOffers";
import type {
  Offer,
  DiscountType,
  OfferEligibility,
  BillingCycle,
} from "../types/offer.types";

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOffer?: Offer | null;
  onSuccess?: () => void;
}

export const OfferFormModal: React.FC<OfferFormModalProps> = ({
  isOpen,
  onClose,
  initialOffer,
  onSuccess,
}) => {
  const isEdit = Boolean(initialOffer);
  const { data: plans } = useAdminPlans();
  const createMutation = useAdminCreateOffer();
  const updateMutation = useAdminUpdateOffer();

  // Form State
  const [title, setTitle] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number | "">(20);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | "">("");
  const [minOrderAmount, setMinOrderAmount] = useState<number | "">("");
  const [eligibility, setEligibility] = useState<OfferEligibility>("ALL_TEACHERS");
  const [maxRedemptions, setMaxRedemptions] = useState<number | "">("");
  const [maxRedemptionsPerUser, setMaxRedemptionsPerUser] = useState<number>(1);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [selectedCycles, setSelectedCycles] = useState<BillingCycle[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialOffer) {
      setTitle(initialOffer.title || "");
      setBadgeText(initialOffer.badgeText || "");
      setDescription(initialOffer.description || "");
      setDiscountType(initialOffer.discountType || "PERCENTAGE");
      setDiscountValue(initialOffer.discountValue || 0);
      setMaxDiscountAmount(initialOffer.maxDiscountAmount ?? "");
      setMinOrderAmount(initialOffer.minOrderAmount ?? "");
      setEligibility(initialOffer.eligibility || "ALL_TEACHERS");
      setMaxRedemptions(initialOffer.maxRedemptions ?? "");
      setMaxRedemptionsPerUser(initialOffer.maxRedemptionsPerUser ?? 1);
      setValidFrom(
        initialOffer.validFrom ? new Date(initialOffer.validFrom).toISOString().slice(0, 10) : ""
      );
      setValidUntil(
        initialOffer.validUntil ? new Date(initialOffer.validUntil).toISOString().slice(0, 10) : ""
      );
      setSelectedPlanIds(initialOffer.applicablePlans?.map((ap) => ap.planId) || []);
      setSelectedCycles(initialOffer.applicableCycles?.map((ac) => ac.billingCycle) || []);
    } else {
      // Default reset
      setTitle("");
      setBadgeText("");
      setDescription("");
      setDiscountType("PERCENTAGE");
      setDiscountValue(20);
      setMaxDiscountAmount("");
      setMinOrderAmount("");
      setEligibility("ALL_TEACHERS");
      setMaxRedemptions("");
      setMaxRedemptionsPerUser(1);
      setValidFrom(new Date().toISOString().slice(0, 10));
      setValidUntil("");
      setSelectedPlanIds([]);
      setSelectedCycles([]);
    }
    setErrors({});
  }, [initialOffer, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Offer title is required.";
    if (discountValue === "" || Number(discountValue) <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0.";
    }
    if (discountType === "PERCENTAGE" && Number(discountValue) > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      badgeText: badgeText.trim() || null,
      description: description.trim() || null,
      discountType,
      discountValue: Number(discountValue),
      maxDiscountAmount: maxDiscountAmount !== "" ? Number(maxDiscountAmount) : null,
      minOrderAmount: minOrderAmount !== "" ? Number(minOrderAmount) : null,
      eligibility,
      maxRedemptions: maxRedemptions !== "" ? Number(maxRedemptions) : null,
      maxRedemptionsPerUser: Number(maxRedemptionsPerUser) || 1,
      validFrom: validFrom ? new Date(validFrom).toISOString() : new Date().toISOString(),
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      applicablePlanIds: selectedPlanIds.length > 0 ? selectedPlanIds : undefined,
      applicableCycles: selectedCycles.length > 0 ? selectedCycles : undefined,
    };

    try {
      if (isEdit && initialOffer) {
        await updateMutation.mutateAsync({ id: initialOffer.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess?.();
      onClose();
    } catch {
      // Handled in hook
    }
  };

  const togglePlanSelection = (planId: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  const toggleCycleSelection = (cycle: BillingCycle) => {
    setSelectedCycles((prev) =>
      prev.includes(cycle) ? prev.filter((c) => c !== cycle) : [...prev, cycle]
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isPending}
        className="text-xs rounded-xl cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="offer-form"
        disabled={isPending}
        className="text-xs rounded-xl bg-[#F42A18] hover:bg-[#d92212] text-white font-medium cursor-pointer shadow-md shadow-red-500/20"
      >
        {isPending
          ? isEdit
            ? "Saving Changes..."
            : "Creating Offer..."
          : isEdit
          ? "Save Changes"
          : "Create Promotional Offer"}
      </Button>
    </div>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Offer: ${initialOffer?.title}` : "Create Default Promotional Offer"}
      description={
        isEdit
          ? "Update promotional discount rules, plan eligibility, and validity window."
          : "Define an automatic promotional discount campaign for teacher subscription plans."
      }
      maxWidth="xl"
      footer={footer}
    >
      <form id="offer-form" onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Title & Badge Text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Offer Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Early Bird Launch Special"
              className="w-full h-9 px-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-[#F42A18]"
            />
            {errors.title && <p className="text-[10px] text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Display Badge Text (Optional)
            </label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="e.g. 🔥 30% OFF LAUNCH SPECIAL"
              className="w-full h-9 px-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-[#F42A18]"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief description of this promotional offer (displayed at checkout)..."
            className="w-full p-2.5 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-[#F42A18]"
          />
        </div>

        {/* Discount Type & Values */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 space-y-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#F42A18]" />
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              Discount Calculation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Discount Type
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setDiscountType("PERCENTAGE")}
                  className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    discountType === "PERCENTAGE"
                      ? "bg-white dark:bg-neutral-800 text-[#F42A18] shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("FLAT")}
                  className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    discountType === "FLAT"
                      ? "bg-white dark:bg-neutral-800 text-[#F42A18] shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  Flat (₹)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                {discountType === "PERCENTAGE" ? "Discount Percentage (%)" : "Flat Amount (₹)"}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value === "" ? "" : Number(e.target.value))}
                min={1}
                max={discountType === "PERCENTAGE" ? 100 : undefined}
                className="w-full h-9 px-3 rounded-xl text-xs font-bold bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
              {errors.discountValue && (
                <p className="text-[10px] text-red-500">{errors.discountValue}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={discountType === "PERCENTAGE" ? "e.g. 2000 (Optional)" : "N/A for flat"}
                disabled={discountType === "FLAT"}
                className="w-full h-9 px-3 rounded-xl text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white disabled:opacity-40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 999 (Optional)"
                className="w-full h-9 px-3 rounded-xl text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Teacher Eligibility
              </label>
              <select
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value as OfferEligibility)}
                className="w-full h-9 px-3 rounded-xl text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white cursor-pointer"
              >
                <option value="ALL_TEACHERS">All Teachers (Open to All)</option>
                <option value="NEW_TEACHERS_ONLY">New Teachers Only (First Purchase)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automatic Promotional Application Info */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Automatic Default Discount</span>
          </div>
          <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90">
            This promotional offer is automatically applied when eligible teachers checkout matching plans and billing cycles.
          </p>
        </div>

        {/* Redemptions & Quotas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Total Redemptions Cap (Global)
            </label>
            <input
              type="number"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 500 (Leave empty for unlimited)"
              className="w-full h-9 px-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Max Uses Per Teacher
            </label>
            <input
              type="number"
              value={maxRedemptionsPerUser}
              onChange={(e) => setMaxRedemptionsPerUser(Number(e.target.value) || 1)}
              min={1}
              className="w-full h-9 px-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        {/* Validity Time Window */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Valid From Date
            </label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full h-9 px-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Valid Until (Expiry Date)
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full h-9 px-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        {/* Plan Applicability Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Applicable Plans (Select specific or leave all unselected for all plans)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {plans?.map((p) => {
              const isSelected = selectedPlanIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlanSelection(p.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/30 font-bold"
                      : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Billing Cycle Applicability Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Applicable Billing Cycles (Leave unselected for all cycles)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(["MONTHLY", "QUARTERLY", "YEARLY"] as BillingCycle[]).map((cycle) => {
              const isSelected = selectedCycles.includes(cycle);
              return (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => toggleCycleSelection(cycle)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-bold"
                      : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {cycle}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </ModalTemplate>
  );
};

export default OfferFormModal;
