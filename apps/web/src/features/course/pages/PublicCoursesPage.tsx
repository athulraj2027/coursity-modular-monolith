import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  List,
  Sparkles,
  BookOpen,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePublicCategoryTree, type CategoryTreeNode } from "@/features/categories";
import { usePublicCourses } from "../hooks/useCourses";
import { CourseCard } from "../components/CourseCard";
import { CourseFilterSidebar, type CourseFilterState } from "../components/CourseFilterSidebar";
import type { CourseLevel, CoursePricingType } from "../types/course.types";
import { useDebounce } from "@/hooks/use-debounce";

export const PublicCoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State from URL
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || undefined;
  const initialSubcategory = searchParams.get("subcategory") || undefined;
  const initialLevel = (searchParams.get("level") as CourseLevel) || undefined;
  const initialPricingType = (searchParams.get("pricing") as CoursePricingType) || undefined;
  const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const initialLanguage = searchParams.get("language") || undefined;
  const initialSort = searchParams.get("sort") || "created-desc";
  const initialPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 350);

  const [filters, setFilters] = useState<CourseFilterState>({
    categoryId: initialCategory,
    subcategoryId: initialSubcategory,
    level: initialLevel,
    pricingType: initialPricingType,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    language: initialLanguage,
  });

  const [sortOption, setSortOption] = useState<string>(initialSort);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const pageSize = 12;

  // Categories Tree
  const { data: categoryTreeData } = usePublicCategoryTree();
  const categoriesList: CategoryTreeNode[] = (categoryTreeData as CategoryTreeNode[]) || [];

  // Query Params mapping
  const queryParams = useMemo(() => {
    let sortBy: any = "createdAt";
    let sortOrder: "asc" | "desc" = "desc";

    if (sortOption === "created-desc") {
      sortBy = "createdAt";
      sortOrder = "desc";
    } else if (sortOption === "price-asc") {
      sortBy = "price";
      sortOrder = "asc";
    } else if (sortOption === "price-desc") {
      sortBy = "price";
      sortOrder = "desc";
    } else if (sortOption === "lessons-desc") {
      sortBy = "totalLessons";
      sortOrder = "desc";
    } else if (sortOption === "title-asc") {
      sortBy = "title";
      sortOrder = "asc";
    }

    return {
      search: debouncedSearch.trim() || undefined,
      categoryId: filters.categoryId,
      subcategoryId: filters.subcategoryId,
      level: filters.level,
      pricingType: filters.pricingType,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      language: filters.language,
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
    };
  }, [debouncedSearch, filters, sortOption, currentPage, pageSize]);

  // Fetch Public Courses
  const { data: coursesResponse, isLoading } = usePublicCourses(queryParams);
  const courses = coursesResponse?.items || [];
  const totalCourses = coursesResponse?.total || 0;
  const totalPages = Math.ceil(totalCourses / pageSize) || 1;

  // Sync state changes to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (filters.categoryId) params.set("category", filters.categoryId);
    if (filters.subcategoryId) params.set("subcategory", filters.subcategoryId);
    if (filters.level) params.set("level", filters.level);
    if (filters.pricingType) params.set("pricing", filters.pricingType);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.language) params.set("language", filters.language);
    if (sortOption !== "created-desc") params.set("sort", sortOption);
    if (currentPage > 1) params.set("page", String(currentPage));

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, filters, sortOption, currentPage, setSearchParams]);

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({});
    setSortOption("created-desc");
    setCurrentPage(1);
  };

  const selectedCategoryNode = useMemo(() => {
    if (!filters.categoryId) return null;
    return categoriesList.find((c) => c.id === filters.categoryId);
  }, [filters.categoryId, categoriesList]);

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 pb-20">
      {/* 1. Hero Search Banner */}
      <div className="relative overflow-hidden bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800/80 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F42A18]/5 dark:bg-[#F42A18]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F42A18]/10 border border-[#F42A18]/20 text-[#F42A18] text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LEARN FROM INDUSTRY LEADERS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
            Explore All Courses & Cohorts
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Gain in-demand skills in software engineering, artificial intelligence, system design, and architecture with interactive, project-based curriculums.
          </p>

          {/* Search Input Bar */}
          <div className="max-w-2xl mx-auto relative flex items-center">
            <div className="absolute left-4 text-neutral-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Search by topic, skill, course title, or instructor..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
              className="h-13 pl-12 pr-10 text-sm sm:text-base rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 shadow-sm focus-visible:ring-2 focus-visible:ring-[#F42A18]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          {categoriesList.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, categoryId: undefined, subcategoryId: undefined }));
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  !filters.categoryId
                    ? "bg-[#F42A18] text-white shadow-md shadow-[#F42A18]/20"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                All Topics
              </button>

              {categoriesList.slice(0, 7).map((cat) => {
                const isSelected = filters.categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        categoryId: isSelected ? undefined : cat.id,
                        subcategoryId: undefined,
                      }));
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#F42A18] text-white shadow-md shadow-[#F42A18]/20"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Content Layout (Sidebar + Courses Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-72 shrink-0 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm sticky top-24">
            <CourseFilterSidebar
              categories={categoriesList}
              filters={filters}
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1);
              }}
              onResetFilters={handleResetFilters}
              totalResults={totalCourses}
            />
          </div>

          {/* Right Courses Container */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Top Toolbar: Results count, Active filters, Sorting, View mode */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden gap-1.5 text-xs font-semibold rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-[#F42A18]" />
                  <span>Filters</span>
                </Button>

                <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                  {isLoading ? (
                    <span className="flex items-center gap-1.5 text-neutral-500">
                      <Loader2 className="w-4 h-4 animate-spin text-[#F42A18]" />
                      Loading courses...
                    </span>
                  ) : (
                    <span>
                      Showing <strong className="text-[#F42A18]">{totalCourses}</strong> {totalCourses === 1 ? "course" : "courses"}
                    </span>
                  )}
                </p>
              </div>

              {/* Sort Dropdown & View Mode */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 hidden sm:inline">Sort by:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => {
                      setSortOption(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-8 px-2.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#F42A18] cursor-pointer"
                  >
                    <option value="created-desc">Recently Added</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="lessons-desc">Most Lessons</option>
                    <option value="title-asc">Title: A to Z</option>
                  </select>
                </div>

                {/* View Switcher */}
                <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-neutral-900 text-[#F42A18] shadow-sm"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white dark:bg-neutral-900 text-[#F42A18] shadow-sm"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Pills Bar */}
            {(filters.categoryId ||
              filters.subcategoryId ||
              filters.level ||
              filters.pricingType ||
              filters.minPrice !== undefined ||
              filters.maxPrice !== undefined ||
              filters.language ||
              debouncedSearch.trim()) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-400">Active filters:</span>

                {debouncedSearch.trim() && (
                  <Badge variant="outline" className="gap-1 text-xs py-0.5 px-2 bg-neutral-100 dark:bg-neutral-800">
                    <span>"{debouncedSearch}"</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-[#F42A18]"
                      onClick={() => setSearchInput("")}
                    />
                  </Badge>
                )}

                {selectedCategoryNode && (
                  <Badge variant="outline" className="gap-1 text-xs py-0.5 px-2 bg-neutral-100 dark:bg-neutral-800">
                    <span>{selectedCategoryNode.name}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-[#F42A18]"
                      onClick={() => setFilters((prev) => ({ ...prev, categoryId: undefined, subcategoryId: undefined }))}
                    />
                  </Badge>
                )}

                {filters.level && (
                  <Badge variant="outline" className="gap-1 text-xs py-0.5 px-2 bg-neutral-100 dark:bg-neutral-800">
                    <span>Level: {filters.level.replace("_", " ")}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-[#F42A18]"
                      onClick={() => setFilters((prev) => ({ ...prev, level: undefined }))}
                    />
                  </Badge>
                )}

                {filters.pricingType && (
                  <Badge variant="outline" className="gap-1 text-xs py-0.5 px-2 bg-neutral-100 dark:bg-neutral-800">
                    <span>{filters.pricingType === "FREE" ? "Free Only" : "Paid Only"}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-[#F42A18]"
                      onClick={() => setFilters((prev) => ({ ...prev, pricingType: undefined }))}
                    />
                  </Badge>
                )}

                {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                  <Badge variant="outline" className="gap-1 text-xs py-0.5 px-2 bg-neutral-100 dark:bg-neutral-800">
                    <span>
                      ${filters.minPrice ?? 0} - ${filters.maxPrice ?? "Any"}
                    </span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-[#F42A18]"
                      onClick={() => setFilters((prev) => ({ ...prev, minPrice: undefined, maxPrice: undefined }))}
                    />
                  </Badge>
                )}

                {filters.language && (
                  <Badge variant="outline" className="gap-1 text-xs py-0.5 px-2 bg-neutral-100 dark:bg-neutral-800">
                    <span>{filters.language}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-[#F42A18]"
                      onClick={() => setFilters((prev) => ({ ...prev, language: undefined }))}
                    />
                  </Badge>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#F42A18] hover:underline font-semibold ml-2 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Course Cards Feed */}
            {isLoading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4 animate-pulse space-y-4"
                  >
                    <div className="w-full aspect-video rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              /* Empty State */
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  No courses found matching your criteria
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  Try adjusting your search terms, selecting a broader category, or resetting your active filters.
                </p>
                <Button
                  onClick={handleResetFilters}
                  className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset All Filters
                </Button>
              </div>
            ) : (
              /* Course Grid / List */
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} viewMode={viewMode} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-9 px-3 rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <React.Fragment key={p}>
                          {prev && p - prev > 1 && (
                            <span className="px-2 text-neutral-400 text-xs">...</span>
                          )}
                          <Button
                            size="sm"
                            variant={currentPage === p ? "default" : "outline"}
                            onClick={() => {
                              setCurrentPage(p);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-9 h-9 p-0 rounded-xl text-xs font-bold cursor-pointer ${
                              currentPage === p
                                ? "bg-[#F42A18] hover:bg-[#D92212] text-white"
                                : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {p}
                          </Button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-9 px-3 rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer / Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xs h-full bg-white dark:bg-neutral-900 p-6 overflow-y-auto shadow-2xl ml-auto">
            <CourseFilterSidebar
              categories={categoriesList}
              filters={filters}
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1);
              }}
              onResetFilters={handleResetFilters}
              totalResults={totalCourses}
              isMobile
              onCloseMobile={() => setIsMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
