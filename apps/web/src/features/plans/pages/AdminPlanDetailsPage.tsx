import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Edit2,
  Trash2,
  Infinity as InfinityIcon,
  Check,
  X,
  Loader2,
  RefreshCw,
  Video,
  BookOpen,
  HardDrive,
  Award,
  BarChart3,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { PlanFormModal } from "../components/PlanFormModal";
import {
  useAdminPlan,
  useAdminUpdatePlan,
  useAdminDeletePlan,
} from "../hooks/usePlans";
import type { PlanFeature, FeatureCategory } from "../types/plan.types";

const getCategoryIcon = (category?: FeatureCategory | string) => {
  switch (category) {
    case "LIVE_STREAMING":
      return <Video className="w-4 h-4 text-purple-500" />;
    case "COURSES":
      return <BookOpen className="w-4 h-4 text-emerald-500" />;
    case "STORAGE":
    case "RECORDING":
      return <HardDrive className="w-4 h-4 text-blue-500" />;
    case "ANALYTICS":
      return <BarChart3 className="w-4 h-4 text-amber-500" />;
    case "COMMUNITY":
      return <Award className="w-4 h-4 text-pink-500" />;
    default:
      return <Sliders className="w-4 h-4 text-neutral-400" />;
  }
};

export const AdminPlanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading, isError, refetch } = useAdminPlan(id);
  const updatePlanMutation = useAdminUpdatePlan();
  const deletePlanMutation = useAdminDeletePlan();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingFeatureCode, setEditingFeatureCode] = useState<string | null>(null);
  const [tempFeatureValue, setTempFeatureValue] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 w-full">
        <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
        <p className="text-sm font-medium text-neutral-500">Loading plan configuration...</p>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 w-full">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          Plan not found or failed to load.
        </p>
        <Button
          onClick={() => navigate("/admin/plans")}
          variant="outline"
          className="gap-2 rounded-xl text-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Plans List
        </Button>
      </div>
    );
  }

  const handleToggleActive = async () => {
    try {
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        payload: { isActive: !plan.isActive },
      });
    } catch {
      // Handled in hook
    }
  };

  const handleToggleFeatured = async () => {
    try {
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        payload: { isFeatured: !plan.isFeatured },
      });
    } catch {
      // Handled in hook
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePlanMutation.mutateAsync(plan.id);
      navigate("/admin/plans");
    } catch {
      // Handled in hook
    }
  };

  // Inline feature updates
  const handleToggleFeatureBoolean = async (pf: PlanFeature) => {
    if (!plan.features) return;
    const isCurrentlyTrue = pf.value === "true" || pf.value === "1";
    const nextValue = isCurrentlyTrue ? "false" : "true";

    const updatedFeatures = plan.features.map((item) =>
      item.id === pf.id ? { ...item, value: nextValue } : item
    );

    try {
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        payload: {
          features: updatedFeatures.map((f) => ({
            featureId: f.featureId,
            value: f.value,
            isUnlimited: f.isUnlimited,
          })) as any,
        },
      });
    } catch {
      // Handled in hook
    }
  };

  const handleToggleFeatureUnlimited = async (pf: PlanFeature) => {
    if (!plan.features) return;
    const nextUnlimited = !pf.isUnlimited;

    const updatedFeatures = plan.features.map((item) =>
      item.id === pf.id
        ? {
            ...item,
            isUnlimited: nextUnlimited,
            value: nextUnlimited ? "-1" : item.value === "-1" ? "10" : item.value,
          }
        : item
    );

    try {
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        payload: {
          features: updatedFeatures.map((f) => ({
            featureId: f.featureId,
            value: f.value,
            isUnlimited: f.isUnlimited,
          })) as any,
        },
      });
    } catch {
      // Handled in hook
    }
  };

  const handleSaveFeatureValue = async (pf: PlanFeature) => {
    if (!plan.features) return;

    const updatedFeatures = plan.features.map((item) =>
      item.id === pf.id ? { ...item, value: tempFeatureValue, isUnlimited: false } : item
    );

    try {
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        payload: {
          features: updatedFeatures.map((f) => ({
            featureId: f.featureId,
            value: f.value,
            isUnlimited: f.isUnlimited,
          })) as any,
        },
      });
      setEditingFeatureCode(null);
    } catch {
      // Handled in hook
    }
  };

  const isUpdating = updatePlanMutation.isPending;

  return (
    <div className="flex flex-1 flex-col w-full text-left space-y-6">
      {/* Top Breadcrumbs & Back */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/plans")}
          className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-xl gap-1.5 cursor-pointer -ml-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Plans Catalog</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="text-xs rounded-xl bg-[#F42A18] hover:bg-[#d92212] text-white font-medium cursor-pointer shadow-md shadow-red-500/20 flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Plan Settings</span>
          </Button>
        </div>
      </div>

      {/* Plan Header Card */}
      <div className="p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {plan.name}
              </h1>
              {plan.isFeatured && (
                <Badge className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 font-bold text-xs px-2.5 py-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Featured Tier
                </Badge>
              )}
              <Badge
                className={`text-xs px-2.5 py-0.5 font-semibold ${
                  plan.isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-neutral-200/60 dark:bg-neutral-800 text-neutral-400 border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {plan.isActive ? "Active (Live on Checkout)" : "Disabled (Hidden)"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
              <span>ID: {plan.id}</span>
              <span>•</span>
              <span>Slug: {plan.slug}</span>
            </div>
            {plan.tagline && (
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl font-medium">
                {plan.tagline}
              </p>
            )}
          </div>

          {/* Quick Status Control Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleActive}
              disabled={isUpdating}
              className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
            >
              {plan.isActive ? "Deactivate Plan" : "Activate Plan"}
            </Button>
            <Button
              size="sm"
              variant={plan.isFeatured ? "default" : "outline"}
              onClick={handleToggleFeatured}
              disabled={isUpdating}
              className={`text-xs rounded-xl cursor-pointer ${
                plan.isFeatured ? "bg-[#F42A18] hover:bg-[#d92212] text-white" : ""
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {plan.isFeatured ? "Unfeature" : "Make Featured"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Overview Metric Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800 space-y-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Price & Billing
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-neutral-900 dark:text-white">
                ${Number(plan.price).toFixed(2)}
              </span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase">
                {plan.currency} / {plan.billingCycle.toLowerCase()}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800 space-y-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Free Trial Period
            </span>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {plan.trialDays > 0 ? `${plan.trialDays} Days` : "No Trial"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800 space-y-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Display Sort Order
            </span>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              #{plan.sortOrder ?? 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800 space-y-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Allocated Features
            </span>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {plan.features?.length || 0}
            </div>
          </div>
        </div>

        {plan.description && (
          <div className="pt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Plan Description: </span>
            {plan.description}
          </div>
        )}
      </div>

      {/* Feature Quotas & Access Control Table */}
      <div className="p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Feature Quotas & Capability Matrix
            </h3>
            <p className="text-xs text-neutral-400">
              Control exact usage limits, metered quantities, and boolean switches assigned to instructors under this plan.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 mr-1" />
            Bulk Edit Quotas
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Feature Name & Code</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Allocated Limit</th>
                <th className="py-3 px-3 text-right">Direct Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {plan.features?.map((pf) => {
                const isBool = pf.feature?.featureType === "BOOLEAN";
                const isBoolEnabled = pf.value === "true" || pf.value === "1";
                const isUnlimited = pf.isUnlimited || pf.value === "-1";
                const isEditingThis = editingFeatureCode === pf.feature?.code;

                return (
                  <tr key={pf.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-all">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0">
                          {getCategoryIcon(pf.feature?.category)}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block text-xs">
                            {pf.feature?.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {pf.feature?.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <Badge variant="outline" className="text-[10px] capitalize text-neutral-600 dark:text-neutral-400">
                        {pf.feature?.category?.toLowerCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                        {pf.feature?.featureType}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {isBool ? (
                        <Badge
                          className={`text-xs px-2 py-0.5 font-semibold ${
                            isBoolEnabled
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700"
                          }`}
                        >
                          {isBoolEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      ) : isUnlimited ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1 w-fit">
                          <InfinityIcon className="w-3.5 h-3.5" />
                          Unlimited
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {isEditingThis ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                value={tempFeatureValue}
                                onChange={(e) => setTempFeatureValue(e.target.value)}
                                className="w-24 h-7 text-xs font-semibold rounded-lg"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveFeatureValue(pf)}
                                className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingFeatureCode(null)}
                                className="h-7 px-2 text-neutral-400 rounded-lg text-xs cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="font-bold text-neutral-900 dark:text-white text-xs">
                              {Number(pf.value).toLocaleString()} {pf.feature?.unit || ""}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isBool ? (
                          <Button
                            size="sm"
                            variant={isBoolEnabled ? "default" : "outline"}
                            onClick={() => handleToggleFeatureBoolean(pf)}
                            disabled={isUpdating}
                            className={`h-7 px-2.5 text-xs rounded-xl cursor-pointer ${
                              isBoolEnabled
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "text-neutral-500"
                            }`}
                          >
                            {isBoolEnabled ? "Disable" : "Enable"}
                          </Button>
                        ) : (
                          <>
                            {!isEditingThis && !isUnlimited && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingFeatureCode(pf.feature?.code || "");
                                  setTempFeatureValue(pf.value);
                                }}
                                disabled={isUpdating}
                                className="h-7 px-2 text-xs rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                              >
                                Edit
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleFeatureUnlimited(pf)}
                              disabled={isUpdating}
                              className={`h-7 px-2.5 text-[11px] rounded-xl cursor-pointer ${
                                isUnlimited ? "border-emerald-500/30 text-emerald-600" : ""
                              }`}
                            >
                              <InfinityIcon className="w-3.5 h-3.5 mr-1" />
                              {isUnlimited ? "Set Limit" : "Make Unlimited"}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {isEditModalOpen && (
        <PlanFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialPlan={plan}
          onSuccess={() => refetch()}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={deletePlanMutation.isPending}
          variant="danger"
          title={`Delete ${plan.name}`}
          description="Are you sure you want to delete this subscription plan? Existing teacher accounts assigned to this tier will need to be transitioned. This action is irreversible."
          confirmText="Delete Plan"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default AdminPlanDetailsPage;
