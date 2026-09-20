import React, { useState, useMemo } from "react";
import {
  FolderTree,
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  RotateCcw,
  Tag,
  CheckCircle2,
  XCircle,
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
  FolderPlus,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
  type TableTabOption,
  type TableDropdownFilter,
  type TableSortOption,
} from "@/components/common/DataTableTemplate";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { CategoryFormModal } from "../components/CategoryFormModal";
import {
  useAdminCategories,
  useAdminCategoryMetrics,
  useAdminToggleCategoryStatus,
  useAdminSoftDeleteCategory,
  useAdminRestoreCategory,
  useAdminHardDeleteCategory,
} from "../hooks/useCategories";
import type { Category } from "../types/category.types";
import { useDebounce } from "@/hooks/use-debounce";

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  BrainCircuit,
  Palette,
  Briefcase,
  Landmark,
  TrendingUp,
  Cloud,
  Sparkles,
  Activity,
  Music,
  Languages,
  GraduationCap,
  Camera,
  Utensils,
  FolderTree,
  Layers,
  Tag,
};

export const AdminCategoriesPage: React.FC = () => {
  // Query hooks
  const { data: categoriesData, isLoading, refetch } = useAdminCategories({
    includeDeleted: true,
    limit: 200,
  });
  const { data: metrics } = useAdminCategoryMetrics();

  // Mutations
  const toggleStatusMutation = useAdminToggleCategoryStatus();
  const softDeleteMutation = useAdminSoftDeleteCategory();
  const restoreMutation = useAdminRestoreCategory();
  const hardDeleteMutation = useAdminHardDeleteCategory();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("sort-order");

  // Modals state
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formDefaultParentId, setFormDefaultParentId] = useState<string | null>(null);

  // Deletion modals
  const [categoryToSoftDelete, setCategoryToSoftDelete] = useState<Category | null>(null);
  const [categoryToRestore, setCategoryToRestore] = useState<Category | null>(null);
  const [categoryToHardDelete, setCategoryToHardDelete] = useState<Category | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const allItems = useMemo(() => categoriesData?.items || [], [categoriesData]);

  // Derive Parent categories for filter dropdown
  const parentCategories = useMemo(() => {
    return allItems.filter((cat) => !cat.parentId && !cat.isDeleted);
  }, [allItems]);

  // Metrics Data Cards
  const metricsCards: TableMetricCard[] = useMemo(() => {
    return [
      {
        label: "Total Categories",
        val: metrics?.total ?? allItems.length,
        icon: Layers,
        color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "Top-Level Domains",
        val: metrics?.parentCategories ?? allItems.filter((c) => !c.parentId && !c.isDeleted).length,
        icon: FolderTree,
        color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
      },
      {
        label: "Subcategories",
        val: metrics?.subcategories ?? allItems.filter((c) => !!c.parentId && !c.isDeleted).length,
        icon: Tag,
        color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "Trash / Inactive",
        val: (metrics?.deleted ?? 0) + (metrics?.inactive ?? 0),
        icon: Trash2,
        color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      },
    ];
  }, [metrics, allItems]);

  // Tab Options
  const tabOptions: TableTabOption[] = useMemo(() => {
    const activeNonDeleted = allItems.filter((c) => !c.isDeleted);
    const parents = activeNonDeleted.filter((c) => !c.parentId);
    const subs = activeNonDeleted.filter((c) => !!c.parentId);
    const trash = allItems.filter((c) => c.isDeleted);

    return [
      { key: "all", label: "All Active", count: activeNonDeleted.length },
      { key: "parents", label: "Root Domains", count: parents.length },
      { key: "subcategories", label: "Subcategories", count: subs.length },
      { key: "trash", label: "Trash / Archived", count: trash.length },
    ];
  }, [allItems]);

  // Dropdown Filters
  const dropdownFilters: TableDropdownFilter[] = useMemo(() => {
    if (activeTab === "trash") return [];

    return [
      {
        key: "parent-filter",
        label: "Filter by Domain",
        value: parentFilter,
        onChange: setParentFilter,
        options: [
          { label: "All Parent Domains", value: "all" },
          ...parentCategories.map((p) => ({ label: p.name, value: p.id })),
        ],
      },
    ];
  }, [activeTab, parentFilter, parentCategories]);

  // Sort Options
  const sortOptions: TableSortOption[] = [
    { label: "Sort Order (Ascending)", value: "sort-order" },
    { label: "Name (A - Z)", value: "name-asc" },
    { label: "Name (Z - A)", value: "name-desc" },
    { label: "Recently Created", value: "created-desc" },
  ];

  // Filter and Sort Processing
  const filteredCategories = useMemo(() => {
    let result = [...allItems];

    // Tab Filter
    if (activeTab === "trash") {
      result = result.filter((c) => c.isDeleted);
    } else {
      result = result.filter((c) => !c.isDeleted);
      if (activeTab === "parents") {
        result = result.filter((c) => !c.parentId);
      } else if (activeTab === "subcategories") {
        result = result.filter((c) => !!c.parentId);
      }
    }

    // Parent Domain Filter
    if (parentFilter !== "all" && activeTab !== "trash") {
      result = result.filter((c) => c.parentId === parentFilter || c.id === parentFilter);
    }

    // Search Query Filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.parent && c.parent.name.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === "sort-order") {
        // Parents first by sortOrder, then children
        if (!a.parentId && b.parentId) return -1;
        if (a.parentId && !b.parentId) return 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
      if (sortOption === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      if (sortOption === "created-desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [allItems, activeTab, parentFilter, debouncedSearch, sortOption]);

  // Pagination Calculation
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Open Create Modal
  const handleOpenCreateModal = (defaultParent: string | null = null) => {
    setCategoryToEdit(null);
    setFormDefaultParentId(defaultParent);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cat: Category) => {
    setCategoryToEdit(cat);
    setFormDefaultParentId(cat.parentId || null);
    setIsFormModalOpen(true);
  };

  // Table Columns Definition
  const columns: TableColumn<Category>[] = [
    {
      header: "Category & Identifier",
      cell: (cat) => {
        const IconComponent = cat.icon && ICON_MAP[cat.icon] ? ICON_MAP[cat.icon] : FolderTree;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                cat.parentId
                  ? "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
              }`}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {cat.name}
                </span>
                {cat.isFeatured && (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0 flex items-center gap-1"
                  >
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                /{cat.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Taxonomy Level",
      cell: (cat) => {
        if (!cat.parentId) {
          return (
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs px-2 py-0.5"
            >
              Root Domain
            </Badge>
          );
        }
        return (
          <div className="space-y-0.5">
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs px-2 py-0.5"
            >
              Subcategory
            </Badge>
            {cat.parent && (
              <p className="text-[11px] text-neutral-500 truncate max-w-[150px]">
                under <span className="font-medium text-neutral-700 dark:text-neutral-300">{cat.parent.name}</span>
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: "Subcategories",
      align: "center",
      cell: (cat) => {
        if (cat.parentId) {
          return <span className="text-xs text-neutral-400">—</span>;
        }
        const count = cat._count?.children ?? 0;
        return (
          <button
            onClick={() => {
              setParentFilter(cat.id);
              setActiveTab("subcategories");
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            title="Filter by this parent's subcategories"
          >
            <Tag className="w-3 h-3 text-blue-500" />
            <span>{count} Subcategories</span>
          </button>
        );
      },
    },
    {
      header: "Status",
      align: "center",
      cell: (cat) => {
        if (cat.isDeleted) {
          return (
            <Badge
              variant="outline"
              className="bg-red-500/10 text-red-600 border-red-500/20 text-xs px-2 py-0.5"
            >
              In Trash
            </Badge>
          );
        }
        return (
          <button
            onClick={() => toggleStatusMutation.mutate({ id: cat.id, isActive: !cat.isActive })}
            disabled={toggleStatusMutation.isPending}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              cat.isActive
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-neutral-500/10 border-neutral-500/20 text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {cat.isActive ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Active
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Inactive
              </>
            )}
          </button>
        );
      },
    },
    {
      header: "Order",
      align: "center",
      cell: (cat) => (
        <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
          #{cat.sortOrder ?? 0}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (cat) => {
        // Actions for items in Trash
        if (cat.isDeleted) {
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoryToRestore(cat)}
                className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                title="Restore from Trash"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoryToHardDelete(cat)}
                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                title="Permanently Delete"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Purge
              </Button>
            </div>
          );
        }

        // Actions for Active items
        return (
          <div className="flex items-center justify-end gap-1">
            {!cat.parentId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenCreateModal(cat.id)}
                className="h-8 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                title="Add Subcategory under this domain"
              >
                <FolderPlus className="w-3.5 h-3.5 mr-1" />
                Add Sub
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenEditModal(cat)}
              className="h-8 px-2 text-xs text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100"
              title="Edit Category"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCategoryToSoftDelete(cat)}
              className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
              title="Move to Trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Category Management Table */}
      <DataTableTemplate<Category>
        // 1. Header Banner
        badge={{
          icon: FolderTree,
          label: "Taxonomy & Course Classification",
        }}
        title="Course Category Hierarchy"
        description="Configure parent domains and specialized subcategories to structure the entire platform catalog."
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-xs h-9 rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenCreateModal(null)}
              className="text-xs h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Category
            </Button>
          </div>
        }
        // 2. Metrics Bar
        metrics={metricsCards}
        // 3. Tab Navigation
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        // 4. Search & Filters
        searchPlaceholder="Search categories by name, slug, description..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        dropdownFilters={dropdownFilters}
        sortOptions={sortOptions}
        currentSort={sortOption}
        onSortChange={setSortOption}
        // 5. Table Data & Columns
        columns={columns}
        data={paginatedCategories}
        keyExtractor={(cat) => cat.id}
        isLoading={isLoading}
        emptyState={{
          icon: FolderTree,
          title: activeTab === "trash" ? "Trash is Empty" : "No Categories Found",
          description:
            activeTab === "trash"
              ? "Deleted categories will appear here and can be restored anytime."
              : "Try adjusting your search terms or filters to find categories.",
        }}
        // 6. Pagination
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredCategories.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
      />

      {/* Create & Edit Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialCategory={categoryToEdit}
        defaultParentId={formDefaultParentId}
        onSuccess={() => refetch()}
      />

      {/* Soft Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(categoryToSoftDelete)}
        onClose={() => setCategoryToSoftDelete(null)}
        actionType="delete"
        title={`Move "${categoryToSoftDelete?.name}" to Trash?`}
        description={
          <div className="space-y-2 text-xs">
            <p>
              This category will be hidden from the public course catalog.
            </p>
            {!categoryToSoftDelete?.parentId && (categoryToSoftDelete?._count?.children ?? 0) > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> This parent category contains{" "}
                  <strong>{categoryToSoftDelete?._count?.children} subcategories</strong>. Soft-deleting this domain will also hide its subcategories.
                </span>
              </div>
            )}
          </div>
        }
        confirmText="Move to Trash"
        variant="danger"
        isLoading={softDeleteMutation.isPending}
        onConfirm={async () => {
          if (categoryToSoftDelete) {
            await softDeleteMutation.mutateAsync(categoryToSoftDelete.id);
            setCategoryToSoftDelete(null);
          }
        }}
      />

      {/* Restore Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(categoryToRestore)}
        onClose={() => setCategoryToRestore(null)}
        actionType="save"
        title={`Restore "${categoryToRestore?.name}"?`}
        description="This category and its associated subcategories will be restored back to the active catalog."
        confirmText="Restore Category"
        variant="success"
        isLoading={restoreMutation.isPending}
        onConfirm={async () => {
          if (categoryToRestore) {
            await restoreMutation.mutateAsync(categoryToRestore.id);
            setCategoryToRestore(null);
          }
        }}
      />

      {/* Permanent Hard Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(categoryToHardDelete)}
        onClose={() => setCategoryToHardDelete(null)}
        actionType="delete"
        title={`Permanently Purge "${categoryToHardDelete?.name}"?`}
        description="This action is destructive and cannot be undone. The category record will be permanently deleted from the database."
        confirmText="Purge Permanently"
        variant="danger"
        isLoading={hardDeleteMutation.isPending}
        onConfirm={async () => {
          if (categoryToHardDelete) {
            await hardDeleteMutation.mutateAsync(categoryToHardDelete.id);
            setCategoryToHardDelete(null);
          }
        }}
      />
    </div>
  );
};

export default AdminCategoriesPage;
