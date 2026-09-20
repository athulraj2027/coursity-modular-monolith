import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Sparkles,
  Code2,
  BrainCircuit,
  Palette,
  Briefcase,
  Landmark,
  TrendingUp,
  Cloud,
  Activity,
  Music,
  Languages,
  GraduationCap,
  Camera,
  Utensils,
  Laptop,
  BookOpen,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import {
  useAdminCreateCategory,
  useAdminUpdateCategory,
  useAdminCategories,
} from "../hooks/useCategories";
import type { Category, CreateCategoryPayload } from "../types/category.types";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: Category | null;
  defaultParentId?: string | null;
  onSuccess?: (category: Category) => void;
}

const PRESET_ICONS = [
  { name: "Code2", label: "Code & Dev", icon: Code2 },
  { name: "BrainCircuit", label: "AI & Data", icon: BrainCircuit },
  { name: "Palette", label: "Design & Art", icon: Palette },
  { name: "Briefcase", label: "Business", icon: Briefcase },
  { name: "Landmark", label: "Finance", icon: Landmark },
  { name: "TrendingUp", label: "Marketing", icon: TrendingUp },
  { name: "Cloud", label: "Cloud & IT", icon: Cloud },
  { name: "Sparkles", label: "Self Growth", icon: Sparkles },
  { name: "Activity", label: "Health & Fit", icon: Activity },
  { name: "Music", label: "Music & Audio", icon: Music },
  { name: "Languages", label: "Languages", icon: Languages },
  { name: "GraduationCap", label: "Academics", icon: GraduationCap },
  { name: "Camera", label: "Photo & Video", icon: Camera },
  { name: "Utensils", label: "Lifestyle", icon: Utensils },
  { name: "Laptop", label: "Tech", icon: Laptop },
  { name: "BookOpen", label: "Education", icon: BookOpen },
  { name: "Globe", label: "Global", icon: Globe },
  { name: "FolderTree", label: "Hierarchy", icon: FolderTree },
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  defaultParentId,
  onSuccess,
}) => {
  const isEditing = Boolean(initialCategory?.id);
  const createCategoryMutation = useAdminCreateCategory();
  const updateCategoryMutation = useAdminUpdateCategory();

  // Load parent categories for the parent dropdown
  const { data: parentCategoriesData } = useAdminCategories({
    onlyParents: true,
    isDeleted: false,
    limit: 100,
  });

  const parentOptions = parentCategoriesData?.items || [];

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("FolderTree");
  const [image, setImage] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<number | string>(0);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Sync state when editing or opening
  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name || "");
      setSlug(initialCategory.slug || "");
      setIsSlugManuallyEdited(true);
      setDescription(initialCategory.description || "");
      setIcon(initialCategory.icon || "FolderTree");
      setImage(initialCategory.image || "");
      setParentId(initialCategory.parentId || null);
      setSortOrder(initialCategory.sortOrder ?? 0);
      setIsActive(initialCategory.isActive ?? true);
      setIsFeatured(initialCategory.isFeatured ?? false);
    } else {
      setName("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      setDescription("");
      setIcon("FolderTree");
      setImage("");
      setParentId(defaultParentId || null);
      setSortOrder(0);
      setIsActive(true);
      setIsFeatured(false);
    }
  }, [initialCategory, defaultParentId, isOpen]);

  // Auto-slug generator
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: CreateCategoryPayload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || null as any,
      icon: icon.trim() || null as any,
      image: image.trim() || null as any,
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
      isFeatured,
    };

    if (isEditing && initialCategory?.id) {
      updateCategoryMutation.mutate(
        { id: initialCategory.id, payload },
        {
          onSuccess: (updated) => {
            onSuccess?.(updated);
            onClose();
          },
        }
      );
    } else {
      createCategoryMutation.mutate(payload, {
        onSuccess: (created) => {
          onSuccess?.(created);
          onClose();
        },
      });
    }
  };

  const isPending = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Category: ${initialCategory?.name}` : "Create New Category"}
      description={
        isEditing
          ? "Update category details, taxonomy level, icon, and visibility."
          : "Define a root learning domain or attach a subcategory to organize the course catalog."
      }
      maxWidth="lg"
      showCloseButton={!isPending}
      closeOnOverlayClick={!isPending}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm flex items-center gap-1.5"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? "Save Changes" : "Create Category"}</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Section 1: Taxonomy Level & Parent */}
        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-blue-500" />
              Taxonomy Level
            </span>
            <Badge
              variant="outline"
              className={
                parentId
                  ? "bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]"
                  : "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]"
              }
            >
              {parentId ? "Subcategory" : "Top-Level Domain"}
            </Badge>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Parent Category (Optional)
            </label>
            <select
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
              disabled={isEditing && (initialCategory?._count?.children || 0) > 0}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">None (Top-Level Root Domain)</option>
              {parentOptions
                .filter((p) => !isEditing || p.id !== initialCategory?.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
            {isEditing && (initialCategory?._count?.children || 0) > 0 && (
              <p className="text-[11px] text-amber-500 mt-1">
                This category contains subcategories and must remain a root domain.
              </p>
            )}
          </div>
        </div>

        {/* Section 2: General Information */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Artificial Intelligence & Data Science"
                value={name}
                onChange={handleNameChange}
                required
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Slug <span className="text-neutral-400 text-[11px]">(URL Identifier)</span>
              </label>
              <Input
                placeholder="e.g. ai-data-science"
                value={slug}
                onChange={handleSlugChange}
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              placeholder="Brief summary of topics, skills, and disciplines covered in this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        </div>

        {/* Section 3: Icon Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Icon Selection
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30">
            {PRESET_ICONS.map((preset) => {
              const IconComp = preset.icon;
              const isSelected = icon === preset.name;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setIcon(preset.name)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "border-neutral-200/60 dark:border-neutral-800 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <IconComp className="w-4 h-4 mb-1" />
                  <span className="text-[10px] truncate max-w-full">{preset.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-neutral-500">Custom Lucide Icon:</span>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. Code2, Sparkles, Brain"
              className="text-xs h-7 w-48 font-mono"
            />
          </div>
        </div>

        {/* Section 4: Display Order & Media */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Banner / Thumbnail URL (Optional)
            </label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Sort Order
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>

        {/* Section 5: Visibility Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 cursor-pointer">
            <div>
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                Active Status
              </p>
              <p className="text-[11px] text-neutral-500">Visible across course search</p>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 cursor-pointer">
            <div>
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                Featured Domain
              </p>
              <p className="text-[11px] text-neutral-500">Showcase on homepage header</p>
            </div>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </form>
    </ModalTemplate>
  );
};

export default CategoryFormModal;
