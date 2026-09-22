import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  IndianRupee,
  Check,
  Infinity as InfinityIcon,
  Loader2,
  Sliders,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useAdminFeatures, useAdminCreatePlan, useAdminUpdatePlan } from "../hooks/usePlans";
import { type CreateOrUpdatePlanPayload } from "../api/plan.api";
import type { Plan, BillingCycle, Feature } from "../types/plan.types";

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: Plan | null;
  onSuccess?: (plan: Plan) => void;
}

interface FormFeatureState {
  featureId: string;
  code: string;
  name: string;
  featureType: "BOOLEAN" | "NUMERIC" | "TEXT";
  category: string;
  unit: string | null;
  value: string;
  isUnlimited: boolean;
}

const DEFAULT_FEATURES = [
  { id: "MAX_COURSES", code: "MAX_COURSES", name: "Max Published Courses", featureType: "NUMERIC" as const, category: "COURSES", unit: "courses" },
  { id: "MAX_RECORDED_CLASSES", code: "MAX_RECORDED_CLASSES", name: "Cloud Recorded Sessions", featureType: "NUMERIC" as const, category: "RECORDING", unit: "recordings" },
  { id: "LIVE_VIEWER_MINUTES_MONTHLY", code: "LIVE_VIEWER_MINUTES_MONTHLY", name: "Monthly Live Viewer Minutes", featureType: "NUMERIC" as const, category: "LIVE_STREAMING", unit: "minutes" },
  { id: "MAX_LIVE_CLASSES_PER_WEEK", code: "MAX_LIVE_CLASSES_PER_WEEK", name: "Live Classes per Week", featureType: "NUMERIC" as const, category: "LIVE_STREAMING", unit: "classes/week" },
  { id: "MAX_LIVE_CLASSES_PER_MONTH", code: "MAX_LIVE_CLASSES_PER_MONTH", name: "Live Classes per Month", featureType: "NUMERIC" as const, category: "LIVE_STREAMING", unit: "classes/month" },
  { id: "MAX_STUDENTS_PER_SESSION", code: "MAX_STUDENTS_PER_SESSION", name: "Max Students per Session", featureType: "NUMERIC" as const, category: "LIVE_STREAMING", unit: "students" },
  { id: "MAX_STORAGE_GB", code: "MAX_STORAGE_GB", name: "Cloud Media Storage", featureType: "NUMERIC" as const, category: "STORAGE", unit: "GB" },
  { id: "HD_RECORDING_1080P", code: "HD_RECORDING_1080P", name: "1080p Full HD Live Streaming", featureType: "BOOLEAN" as const, category: "RECORDING", unit: null },
  { id: "AI_CLASS_SUMMARIES", code: "AI_CLASS_SUMMARIES", name: "Automated AI Class Summaries", featureType: "BOOLEAN" as const, category: "ANALYTICS", unit: null },
  { id: "CUSTOM_BRANDED_CERTIFICATES", code: "CUSTOM_BRANDED_CERTIFICATES", name: "Custom Branded Course Certificates", featureType: "BOOLEAN" as const, category: "COMMUNITY", unit: null },
];

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  initialPlan,
  onSuccess,
}) => {
  const isEditing = Boolean(initialPlan?.id);
  const { data: dbFeatures } = useAdminFeatures();
  const createPlanMutation = useAdminCreatePlan();
  const updatePlanMutation = useAdminUpdatePlan();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>(0);
  const [currency, setCurrency] = useState("INR");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const [trialDays, setTrialDays] = useState<number | string>(0);
  const [sortOrder, setSortOrder] = useState<number | string>(0);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featureStates, setFeatureStates] = useState<FormFeatureState[]>([]);
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateOrUpdatePlanPayload | null>(null);

  // Sync initial plan data when editing
  useEffect(() => {
    if (initialPlan) {
      setName(initialPlan.name);
      setSlug(initialPlan.slug);
      setTagline(initialPlan.tagline || "");
      setDescription(initialPlan.description || "");
      const initialPriceInRupees =
        Number(initialPlan.price) >= 100 ? Number(initialPlan.price) / 100 : Number(initialPlan.price);
      setPrice(initialPriceInRupees);
      setCurrency(initialPlan.currency || "INR");
      setBillingCycle(initialPlan.billingCycle);
      setTrialDays(initialPlan.trialDays);
      setSortOrder(initialPlan.sortOrder);
      setIsActive(initialPlan.isActive);
      setIsFeatured(initialPlan.isFeatured);
      setAutoSlug(false);
    } else {
      setName("");
      setSlug("");
      setTagline("");
      setDescription("");
      setPrice(0);
      setCurrency("INR");
      setBillingCycle("MONTHLY");
      setTrialDays(0);
      setSortOrder(0);
      setIsActive(true);
      setIsFeatured(false);
      setAutoSlug(true);
    }
  }, [initialPlan]);

  // Merge DB features or default feature list
  useEffect(() => {
    const featurePool: Feature[] =
      dbFeatures && dbFeatures.length > 0
        ? dbFeatures
        : (DEFAULT_FEATURES as unknown as Feature[]);

    if (featurePool.length > 0) {
      const merged: FormFeatureState[] = featurePool.map((f) => {
        const existingPf = initialPlan?.features?.find((pf) => pf.featureId === f.id);
        const isUnlimited = existingPf ? existingPf.isUnlimited : f.featureType === "BOOLEAN" ? false : false;
        let value = "0";

        if (f.featureType === "BOOLEAN") {
          value = existingPf ? existingPf.value : "true";
        } else if (existingPf) {
          value = existingPf.value;
        } else {
          switch (f.code) {
            case "MAX_COURSES":
              value = "10";
              break;
            case "MAX_RECORDED_CLASSES":
              value = "25";
              break;
            case "LIVE_VIEWER_MINUTES_MONTHLY":
              value = "5000";
              break;
            case "MAX_LIVE_CLASSES_PER_WEEK":
              value = "5";
              break;
            case "MAX_LIVE_CLASSES_PER_MONTH":
              value = "20";
              break;
            case "MAX_STUDENTS_PER_SESSION":
              value = "100";
              break;
            case "MAX_STORAGE_GB":
              value = "50";
              break;
            default:
              value = "1";
          }
        }

        return {
          featureId: f.id,
          code: f.code,
          name: f.name,
          featureType: f.featureType,
          category: f.category,
          unit: f.unit,
          value,
          isUnlimited,
        };
      });

      setFeatureStates(merged);
    }
  }, [dbFeatures, initialPlan]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleToggleUnlimited = (code: string) => {
    setFeatureStates((prev) =>
      prev.map((f) => {
        if (f.code === code) {
          const nextUnlimited = !f.isUnlimited;
          return {
            ...f,
            isUnlimited: nextUnlimited,
            value: nextUnlimited ? "-1" : f.value === "-1" ? "10" : f.value,
          };
        }
        return f;
      })
    );
  };

  const handleFeatureValueChange = (code: string, val: string) => {
    setFeatureStates((prev) =>
      prev.map((f) => {
        if (f.code === code) {
          return {
            ...f,
            value: val,
            isUnlimited: false,
          };
        }
        return f;
      })
    );
  };

  const handleToggleBoolean = (code: string) => {
    setFeatureStates((prev) =>
      prev.map((f) => {
        if (f.code === code) {
          const isCurrentlyTrue = f.value === "true" || f.value === "1";
          return {
            ...f,
            value: isCurrentlyTrue ? "false" : "true",
          };
        }
        return f;
      })
    );
  };

  const executeSave = async (payload: CreateOrUpdatePlanPayload) => {
    try {
      if (isEditing && initialPlan?.id) {
        const updated = await updatePlanMutation.mutateAsync({
          id: initialPlan.id,
          payload,
        });
        onSuccess?.(updated);
      } else {
        const created = await createPlanMutation.mutateAsync(payload);
        onSuccess?.(created);
      }
      setIsConfirmSaveOpen(false);
      onClose();
    } catch {
      // Handled in mutation hook
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericPrice = Number(price) || 0;
    // Price stored in paise for Razorpay INR (e.g. 7499 rupees -> 749900 paise)
    const priceInPaise = numericPrice > 0 ? Math.round(numericPrice * 100) : 0;

    const payload: CreateOrUpdatePlanPayload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      price: priceInPaise,
      currency,
      billingCycle,
      trialDays: Number(trialDays) || 0,
      sortOrder: Number(sortOrder) || 0,
      isActive,
      isFeatured,
      features: featureStates.map((fs) => ({
        featureId: fs.featureId,
        value: fs.isUnlimited ? "-1" : fs.value,
        isUnlimited: fs.isUnlimited,
      })),
    };

    if (isEditing) {
      setPendingPayload(payload);
      setIsConfirmSaveOpen(true);
    } else {
      await executeSave(payload);
    }
  };

  const isSaving = createPlanMutation.isPending || updatePlanMutation.isPending;

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Plan: ${initialPlan?.name}` : "Create New Subscription Plan"}
      description="Configure pricing, billing intervals, access limits, and dynamic feature quotas for instructor tiers."
      maxWidth="xl"
      icon={
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F42A18]/10 border border-[#F42A18]/20 text-[#F42A18]">
          <Sliders className="w-5 h-5" />
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="plan-form"
            disabled={isSaving}
            className="text-xs rounded-xl bg-[#F42A18] hover:bg-[#d92212] text-white font-medium cursor-pointer shadow-md shadow-red-500/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Saving Plan...</span>
              </>
            ) : (
              <span>{isEditing ? "Save Plan Changes" : "Create Plan"}</span>
            )}
          </Button>
        </div>
      }
    >
      <form id="plan-form" onSubmit={handleSubmit} className="space-y-6 text-left">
        {/* Section 1: Basic Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <Tag className="w-4 h-4 text-[#F42A18]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              1. Basic Identity & Display
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Pro Educator Plus"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="rounded-xl text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>Slug Identifier <span className="text-red-500">*</span></span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {autoSlug ? "Manual Slug" : "Auto Slug"}
                  </button>
                )}
              </label>
              <Input
                type="text"
                placeholder="e.g. pro-educator-plus"
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                }}
                required
                className="rounded-xl text-xs h-9 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Short Tagline
              </label>
              <Input
                type="text"
                placeholder="e.g. Best for growing educators and cohorts"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="rounded-xl text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Display Sort Order
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="rounded-xl text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              placeholder="Detailed description of who this plan is tailored for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#F42A18] resize-none"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Terms */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <IndianRupee className="w-4 h-4 text-[#F42A18]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              2. Pricing, Billing & Trial
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="3499"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="rounded-xl text-xs h-9 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Currency
              </label>
              <Input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                maxLength={3}
                className="rounded-xl text-xs h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F42A18]"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
                <option value="LIFETIME">Lifetime</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Trial Period (Days)
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                className="rounded-xl text-xs h-9"
              />
            </div>
          </div>

          {/* Status Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div
              onClick={() => setIsActive(!isActive)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                isActive
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 text-neutral-500"
              }`}
            >
              <div>
                <span className="text-xs font-bold block">Active Status</span>
                <span className="text-[11px] opacity-80">
                  {isActive ? "Visible for new subscriptions" : "Hidden from checkout & pricing"}
                </span>
              </div>
              {isActive ? (
                <ToggleRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-neutral-400 shrink-0" />
              )}
            </div>

            <div
              onClick={() => setIsFeatured(!isFeatured)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                isFeatured
                  ? "bg-[#F42A18]/5 border-[#F42A18]/30 text-neutral-900 dark:text-white"
                  : "bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 text-neutral-500"
              }`}
            >
              <div>
                <span className="text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F42A18]" />
                  Featured Badge
                </span>
                <span className="text-[11px] opacity-80">
                  {isFeatured ? "Highlighted as 'Most Popular'" : "Standard tier display"}
                </span>
              </div>
              {isFeatured ? (
                <ToggleRight className="w-6 h-6 text-[#F42A18] shrink-0" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-neutral-400 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Feature Quota Allocation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F42A18]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                3. Quota Allocation & Feature Flags
              </h4>
            </div>
            <span className="text-[11px] text-neutral-400">
              {featureStates.length} features configured
            </span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {featureStates.map((feature) => {
              const isBool = feature.featureType === "BOOLEAN";
              const isBoolEnabled = feature.value === "true" || feature.value === "1";

              return (
                <div
                  key={feature.code}
                  className="p-3 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {feature.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-neutral-400">
                        {feature.code}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-neutral-400 capitalize">
                      Category: {feature.category?.toLowerCase()} • Type: {feature.featureType?.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isBool ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={isBoolEnabled ? "default" : "outline"}
                        onClick={() => handleToggleBoolean(feature.code)}
                        className={`h-8 text-xs rounded-xl cursor-pointer ${
                          isBoolEnabled
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "text-neutral-500 hover:text-neutral-700"
                        }`}
                      >
                        {isBoolEnabled ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Enabled
                          </>
                        ) : (
                          "Disabled"
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        {feature.isUnlimited ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-2.5 py-1 font-semibold flex items-center gap-1">
                            <InfinityIcon className="w-3.5 h-3.5" />
                            Unlimited
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="0"
                              value={feature.value}
                              onChange={(e) => handleFeatureValueChange(feature.code, e.target.value)}
                              className="w-24 h-8 rounded-xl text-xs font-semibold text-right"
                            />
                            {feature.unit && (
                              <span className="text-xs text-neutral-400 font-medium min-w-[45px]">
                                {feature.unit}
                              </span>
                            )}
                          </div>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleUnlimited(feature.code)}
                          className={`h-8 text-[11px] rounded-xl cursor-pointer ${
                            feature.isUnlimited ? "border-emerald-500/30 text-emerald-600" : ""
                          }`}
                        >
                          <InfinityIcon className="w-3.5 h-3.5 mr-1" />
                          {feature.isUnlimited ? "Set Limit" : "Unlimited"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>

      {/* Confirmation Modal Before Saving Changes */}
      {isConfirmSaveOpen && pendingPayload && (
        <ConfirmationModal
          isOpen={isConfirmSaveOpen}
          onClose={() => setIsConfirmSaveOpen(false)}
          onConfirm={() => executeSave(pendingPayload)}
          isLoading={isSaving}
          variant="warning"
          title={`Confirm Changes to ${name || initialPlan?.name}?`}
          description={
            <div className="space-y-2 text-xs">
              <p>
                Are you sure you want to update the plan settings and feature quota matrix for{" "}
                <span className="font-bold text-neutral-900 dark:text-white">"{name || initialPlan?.name}"</span>?
              </p>
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Price:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {Number(price) === 0 ? "Free" : `₹${Number(price).toLocaleString()} / ${billingCycle.toLowerCase()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Active Quotas Configured:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{featureStates.length} features</span>
                </div>
              </div>
              <p className="text-neutral-500 leading-relaxed">
                These updated capabilities and limits will be applied immediately across active teacher accounts.
              </p>
            </div>
          }
          confirmText="Save & Apply Changes"
          cancelText="Cancel"
        />
      )}
    </ModalTemplate>
  );
};

export default PlanFormModal;
