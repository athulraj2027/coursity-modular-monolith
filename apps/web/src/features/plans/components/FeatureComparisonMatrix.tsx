import React from "react";
import type { Plan, Feature } from "../types/plan.types";
import { Check, X } from "lucide-react";

interface FeatureComparisonMatrixProps {
  plans: Plan[];
  features: Feature[];
  currentPlanId?: string;
  onSelectPlan?: (plan: Plan) => void;
}

export const FeatureComparisonMatrix: React.FC<FeatureComparisonMatrixProps> = ({
  plans,
  features,
}) => {
  if (!plans || plans.length === 0 || !features || features.length === 0) {
    return null;
  }

  // Group features by Category
  const categories: Array<{ id: string; name: string }> = [
    { id: "LIVE_STREAMING", name: "Live Interactive Classes & Streaming" },
    { id: "COURSES", name: "Courses & Curriculum" },
    { id: "RECORDING", name: "Class Recordings & Video Playback" },
    { id: "STORAGE", name: "Cloud Storage & Assets" },
    { id: "ANALYTICS", name: "AI Tools & Intelligence" },
    { id: "COMMUNITY", name: "Branding & Certificates" },
  ];

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm text-left">
      <table className="w-full border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/80">
            <th className="py-4 px-6 font-bold text-sm text-neutral-900 dark:text-white w-1/3">
              Plan Features & Quotas
            </th>
            {plans.map((plan) => (
              <th
                key={plan.id}
                className="py-4 px-4 font-bold text-sm text-center text-neutral-900 dark:text-white min-w-[140px]"
              >
                <div className="space-y-1">
                  <span className="block">{plan.name}</span>
                  <span className="text-xs font-semibold text-[#F42A18]">
                    {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body Categorized */}
        <tbody>
          {categories.map((cat) => {
            const catFeatures = features.filter((f) => f.category === cat.id);
            if (catFeatures.length === 0) return null;

            return (
              <React.Fragment key={cat.id}>
                {/* Category Header Row */}
                <tr className="bg-neutral-100/60 dark:bg-neutral-800/40 border-y border-neutral-200/60 dark:border-neutral-800">
                  <td
                    colSpan={plans.length + 1}
                    className="py-2.5 px-6 font-bold text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    {cat.name}
                  </td>
                </tr>

                {/* Features within Category */}
                {catFeatures.map((feat) => (
                  <tr
                    key={feat.id}
                    className="border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40 transition-colors"
                  >
                    <td className="py-3 px-6">
                      <span className="font-semibold text-neutral-900 dark:text-white block">
                        {feat.name}
                      </span>
                      {feat.description && (
                        <span className="text-[11px] text-neutral-400 block mt-0.5">
                          {feat.description}
                        </span>
                      )}
                    </td>

                    {plans.map((plan) => {
                      const planFeature = plan.features?.find(
                        (pf) => pf.featureId === feat.id || pf.feature?.code === feat.code
                      );

                      if (!planFeature) {
                        return (
                          <td key={plan.id} className="py-3 px-4 text-center text-neutral-400">
                            —
                          </td>
                        );
                      }

                      if (feat.featureType === "BOOLEAN") {
                        const isEnabled =
                          planFeature.value === "true" || planFeature.value === "1";
                        return (
                          <td key={plan.id} className="py-3 px-4 text-center">
                            {isEnabled ? (
                              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />
                            )}
                          </td>
                        );
                      }

                      const isUnlimited =
                        planFeature.isUnlimited || planFeature.value === "-1";

                      return (
                        <td
                          key={plan.id}
                          className="py-3 px-4 text-center font-semibold text-neutral-800 dark:text-neutral-200"
                        >
                          {isUnlimited ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              Unlimited
                            </span>
                          ) : (
                            <span>
                              {Number(planFeature.value).toLocaleString()}{" "}
                              {feat.unit ? (
                                <span className="font-normal text-neutral-400 text-[11px]">
                                  {feat.unit}
                                </span>
                              ) : (
                                ""
                              )}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FeatureComparisonMatrix;
