import React from "react";
import {
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { CategoryTreeNode } from "@/features/categories";
import type { CourseLevel, CoursePricingType } from "../types/course.types";

export interface CourseFilterState {
  categoryId?: string;
  subcategoryId?: string;
  level?: CourseLevel;
  pricingType?: CoursePricingType;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
}

interface CourseFilterSidebarProps {
  categories: CategoryTreeNode[];
  filters: CourseFilterState;
  onFilterChange: (filters: CourseFilterState) => void;
  onResetFilters: () => void;
  totalResults?: number;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const LEVELS: { label: string; value: CourseLevel }[] = [
  { label: "All Levels", value: "ALL_LEVELS" },
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Mandarin", "Japanese"];

export const CourseFilterSidebar: React.FC<CourseFilterSidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  isMobile = false,
  onCloseMobile,
}) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({});

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasActiveFilters =
    Boolean(filters.categoryId) ||
    Boolean(filters.subcategoryId) ||
    Boolean(filters.level) ||
    Boolean(filters.pricingType) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    Boolean(filters.language);

  const activeFiltersCount = [
    filters.categoryId,
    filters.subcategoryId,
    filters.level,
    filters.pricingType,
    filters.minPrice !== undefined ? "minPrice" : null,
    filters.maxPrice !== undefined ? "maxPrice" : null,
    filters.language,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header with Title & Reset Button */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#F42A18]" />
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Filters</h3>
          {totalResults !== undefined && (
            <span className="text-xs text-neutral-400 font-mono">({totalResults})</span>
          )}
          {activeFiltersCount > 0 && (
            <Badge className="bg-[#F42A18] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-[#F42A18] hover:text-[#D92212] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          )}

          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Category Domain Filter */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Categories & Topics
        </label>

        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange({ ...filters, categoryId: undefined, subcategoryId: undefined })}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
              !filters.categoryId
                ? "bg-[#F42A18]/10 text-[#F42A18] font-bold"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <span>All Categories</span>
            {!filters.categoryId && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((cat) => {
            const isSelected = filters.categoryId === cat.id && !filters.subcategoryId;
            const hasChildren = cat.children && cat.children.length > 0;
            const isExpanded = expandedCategories[cat.id] || filters.categoryId === cat.id;

            return (
              <div key={cat.id} className="space-y-1">
                <div
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-[#F42A18]/10 text-[#F42A18] font-bold"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <button
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        categoryId: filters.categoryId === cat.id && !filters.subcategoryId ? undefined : cat.id,
                        subcategoryId: undefined,
                      })
                    }
                    className="flex-1 text-left truncate cursor-pointer"
                  >
                    {cat.name}
                  </button>

                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpand(cat.id)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {hasChildren && isExpanded && (
                  <div className="pl-4 space-y-1 border-l border-neutral-200 dark:border-neutral-800 ml-3">
                    {cat.children?.map((sub) => {
                      const isSubSelected = filters.subcategoryId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() =>
                            onFilterChange({
                              ...filters,
                              categoryId: cat.id,
                              subcategoryId: isSubSelected ? undefined : sub.id,
                            })
                          }
                          className={`w-full text-left px-2 py-1 rounded-md text-[11px] transition-colors flex items-center justify-between cursor-pointer ${
                            isSubSelected
                              ? "bg-[#F42A18]/10 text-[#F42A18] font-bold"
                              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          {isSubSelected && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Difficulty Level */}
      <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Difficulty Level
        </label>
        <div className="space-y-1.5">
          {LEVELS.map((lvl) => {
            const isSelected = filters.level === lvl.value;
            return (
              <label
                key={lvl.value}
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    level: isSelected ? undefined : lvl.value,
                  })
                }
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#F42A18]/10 text-[#F42A18] font-bold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <span>{lvl.label}</span>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="rounded border-neutral-300 text-[#F42A18] focus:ring-[#F42A18] h-3.5 w-3.5 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Pricing Model */}
      <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Pricing Type
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 dark:bg-neutral-800/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, pricingType: undefined })}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              !filters.pricingType
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, pricingType: "FREE" })}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filters.pricingType === "FREE"
                ? "bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Free
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, pricingType: "PAID" })}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filters.pricingType === "PAID"
                ? "bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Paid
          </button>
        </div>

        {/* Min & Max Price input if PAID or All */}
        {filters.pricingType !== "FREE" && (
          <div className="pt-2 flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-neutral-500 font-mono mb-1 block">Min (₹)</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={filters.minPrice ?? ""}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-8 text-xs font-mono"
              />
            </div>
            <span className="text-neutral-400 text-xs mt-4">-</span>
            <div className="flex-1">
              <label className="text-[10px] text-neutral-500 font-mono mb-1 block">Max (₹)</label>
              <Input
                type="number"
                min="0"
                placeholder="5000"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Language */}
      <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Course Language
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange({ ...filters, language: undefined })}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
              !filters.language
                ? "bg-[#F42A18]/10 text-[#F42A18] font-bold"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <span>All Languages</span>
            {!filters.language && <Check className="w-3.5 h-3.5" />}
          </button>
          {LANGUAGES.map((lang) => {
            const isSelected = filters.language === lang;
            return (
              <button
                key={lang}
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    language: isSelected ? undefined : lang,
                  })
                }
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#F42A18]/10 text-[#F42A18] font-bold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <span>{lang}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
