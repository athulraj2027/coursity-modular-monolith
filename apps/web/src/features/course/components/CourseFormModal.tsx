import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  DollarSign,
  Loader2,
  Image as ImageIcon,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { usePublicCategoryTree, type CategoryTreeNode } from "@/features/categories";
import { useTeacherCreateCourse, useTeacherUpdateCourse } from "../hooks/useCourses";
import { CourseMediaUpload } from "./CourseMediaUpload";
import type {
  Course,
  CreateCoursePayload,
  CourseLevel,
  CoursePricingType,
} from "../types/course.types";

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: Course | null;
  onSuccess?: (course: Course) => void;
}

const STEPS = [
  { id: 1, title: "Basics & Schedule", icon: Calendar, subtitle: "Core metadata & start date" },
  { id: 2, title: "Media & Details", icon: ImageIcon, subtitle: "Description & visual assets" },
  { id: 3, title: "Goals & Prerequisites", icon: BookOpen, subtitle: "Outcomes & requirements" },
  { id: 4, title: "Curriculum Topics", icon: Layers, subtitle: "Live syllabus topics & outline" },
  { id: 5, title: "Pricing & Publish", icon: DollarSign, subtitle: "Access model & publish live" },
];

const isValidUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const getTomorrowDateStr = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const dd = String(tomorrow.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  initialCourse,
  onSuccess,
}) => {
  const isEditing = Boolean(initialCourse?.id);
  const createMutation = useTeacherCreateCourse();
  const updateMutation = useTeacherUpdateCourse();

  // Load public category tree
  const { data: categoryTreeData, isLoading: isCategoriesLoading } = usePublicCategoryTree();
  const parentCategories: CategoryTreeNode[] = (categoryTreeData as CategoryTreeNode[]) || [];

  // Minimum allowed start date is tomorrow
  const minStartingDate = useMemo(() => getTomorrowDateStr(), []);

  // Multi-step wizard index (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 1: Basics & Schedule
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [startingDate, setStartingDate] = useState("");
  const [level, setLevel] = useState<CourseLevel>("ALL_LEVELS");
  const [language, setLanguage] = useState("English");

  // Step 2: Details & Media
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [promoVideoUrl, setPromoVideoUrl] = useState("");
  const [audienceText, setAudienceText] = useState("");
  const [tagsText, setTagsText] = useState("");

  // Step 3: Outcomes & Prerequisites
  const [outcomesText, setOutcomesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");

  // Step 4: Live Curriculum Topics
  const [modules, setModules] = useState<Array<{ title: string; description: string }>>([
    {
      title: "Topic 1: Introduction & Architecture Fundamentals",
      description: "Live orientation, system prerequisites, and cohort roadmap.",
    },
  ]);

  // Step 5: Pricing
  const [pricingType, setPricingType] = useState<CoursePricingType>("FREE");
  const [price, setPrice] = useState<number | string>(0);

  // Available subcategories for selected parent category
  const selectedParent = parentCategories.find((c) => c.id === categoryId);
  const availableSubcategories = selectedParent?.children || [];

  useEffect(() => {
    if (initialCourse && isOpen) {
      setCurrentStep(1);
      setTitle(initialCourse.title || "");
      setSlug(initialCourse.slug || "");
      setIsSlugManuallyEdited(true);
      setSubtitle(initialCourse.subtitle || "");
      setCategoryId(initialCourse.categoryId || "");
      setSubcategoryId(initialCourse.subcategoryId || null);
      setStartingDate(
        initialCourse.startingDate
          ? new Date(initialCourse.startingDate).toISOString().split("T")[0]
          : ""
      );
      setLevel(initialCourse.level || "ALL_LEVELS");
      setLanguage(initialCourse.language || "English");
      setDescription(initialCourse.description || "");
      setThumbnail(initialCourse.thumbnail || "");
      setPromoVideoUrl(initialCourse.promoVideoUrl || "");
      setAudienceText((initialCourse.targetAudience || []).join("\n"));
      setTagsText((initialCourse.tags || []).join(", "));
      setOutcomesText((initialCourse.learningOutcomes || []).join("\n"));
      setRequirementsText((initialCourse.requirements || []).join("\n"));
      setPricingType(initialCourse.pricingType || "FREE");
      setPrice(initialCourse.price ?? 0);
      setValidationError(null);
      setFieldErrors({});
    } else if (isOpen) {
      setCurrentStep(1);
      setTitle("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      setSubtitle("");
      setCategoryId("");
      setSubcategoryId(null);
      setStartingDate("");
      setLevel("ALL_LEVELS");
      setLanguage("English");
      setDescription("");
      setThumbnail("");
      setPromoVideoUrl("");
      setAudienceText("");
      setTagsText("");
      setOutcomesText("");
      setRequirementsText("");
      setModules([
        {
          title: "Topic 1: Introduction & Fundamentals",
          description: "Live orientation, core foundations, and system setup.",
        },
      ]);
      setPricingType("FREE");
      setPrice(0);
      setValidationError(null);
      setFieldErrors({});
    }
  }, [initialCourse, isOpen]);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    setFieldErrors((prev) => ({ ...prev, title: "" }));
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Topic / Module state managers for Step 4
  const handleAddModule = () => {
    const nextIdx = modules.length + 1;
    setModules((prev) => [
      ...prev,
      {
        title: `Topic ${nextIdx}: `,
        description: "",
      },
    ]);
    setFieldErrors((prev) => ({ ...prev, modules: "" }));
  };

  const handleRemoveModule = (mIdx: number) => {
    if (modules.length <= 1) {
      setModules([]);
      return;
    }
    setModules((prev) => prev.filter((_, i) => i !== mIdx));
  };

  const handleModuleChange = (mIdx: number, field: "title" | "description", val: string) => {
    setModules((prev) => {
      const updated = [...prev];
      updated[mIdx] = { ...updated[mIdx], [field]: val };
      return updated;
    });
    setFieldErrors((prev) => ({ ...prev, modules: "" }));
  };

  // Comprehensive validation for each step
  const validateSingleStep = (step: number): { isValid: boolean; errors: Record<string, string>; message: string | null } => {
    const errors: Record<string, string> = {};
    let message: string | null = null;

    if (step === 1) {
      if (!title.trim() || title.trim().length < 3) {
        errors.title = "Course title is required and must be at least 3 characters.";
      }
      if (!categoryId) {
        errors.categoryId = "Please select a primary course category.";
      }
      if (startingDate) {
        if (startingDate < minStartingDate) {
          errors.startingDate = `Starting date must be at least tomorrow (${minStartingDate}).`;
        }
      }
      if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
        errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
      }

      if (Object.keys(errors).length > 0) {
        message = errors.title || errors.categoryId || errors.startingDate || errors.slug || "Please fix errors in Step 1.";
      }
    } else if (step === 2) {
      if (!description.trim() || description.trim().length < 15) {
        errors.description = "Course description is required and must be at least 15 characters.";
      } else if (description.trim().length > 20000) {
        errors.description = "Course description is too long (max 20,000 characters).";
      }

      if (thumbnail.trim() && !isValidUrl(thumbnail.trim())) {
        errors.thumbnail = "Please provide a valid thumbnail URL (e.g. https://...).";
      }

      if (promoVideoUrl.trim() && !isValidUrl(promoVideoUrl.trim())) {
        errors.promoVideoUrl = "Please provide a valid promotional video URL (e.g. https://...).";
      }

      if (Object.keys(errors).length > 0) {
        message = errors.description || errors.thumbnail || errors.promoVideoUrl || "Please fix errors in Step 2.";
      }
    } else if (step === 3) {
      const outcomes = outcomesText.split("\n").map((s) => s.trim()).filter(Boolean);
      const requirements = requirementsText.split("\n").map((s) => s.trim()).filter(Boolean);

      if (outcomes.length === 0) {
        errors.outcomes = "Please specify at least 1 learning outcome (what students will learn).";
      }
      if (requirements.length === 0) {
        errors.requirements = "Please specify at least 1 course requirement or prerequisite.";
      }

      if (Object.keys(errors).length > 0) {
        message = errors.outcomes || errors.requirements || "Please specify learning outcomes and prerequisites.";
      }
    } else if (step === 4 && !isEditing) {
      if (modules.length === 0) {
        errors.modules = "Please add at least 1 topic to your course curriculum.";
      } else {
        for (let mIdx = 0; mIdx < modules.length; mIdx++) {
          const mod = modules[mIdx];
          if (!mod.title.trim() || mod.title.trim().length < 2) {
            errors.modules = `Topic ${mIdx + 1} must have a valid title (minimum 2 characters).`;
            break;
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        message = errors.modules || "Please complete topic definitions.";
      }
    } else if (step === 5) {
      if (pricingType === "PAID") {
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) {
          errors.price = "Price must be greater than $0.00 for paid courses.";
        }
      }

      if (Object.keys(errors).length > 0) {
        message = errors.price || "Please provide valid pricing.";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      message,
    };
  };

  const validateStep = (step: number): boolean => {
    const { isValid, errors, message } = validateSingleStep(step);
    if (!isValid) {
      setFieldErrors(errors);
      setValidationError(message);
      return false;
    }
    setFieldErrors({});
    setValidationError(null);
    return true;
  };

  // Check if we can proceed to target step
  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;

    if (targetStep < currentStep) {
      // Allow going back freely
      setValidationError(null);
      setFieldErrors({});
      setCurrentStep(targetStep);
      return;
    }

    // If attempting to jump forward, validate all steps in between sequentially
    for (let s = currentStep; s < targetStep; s++) {
      const { isValid, errors, message } = validateSingleStep(s);
      if (!isValid) {
        setCurrentStep(s);
        setFieldErrors(errors);
        setValidationError(`Step ${s} is incomplete: ${message}`);
        return;
      }
    }

    setFieldErrors({});
    setValidationError(null);
    setCurrentStep(targetStep);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setFieldErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate all 5 steps before submitting
    for (let s = 1; s <= 5; s++) {
      const { isValid, errors, message } = validateSingleStep(s);
      if (!isValid) {
        setCurrentStep(s);
        setFieldErrors(errors);
        setValidationError(`Cannot save: Step ${s} has errors (${message})`);
        return;
      }
    }

    const parseList = (text: string) =>
      text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

    const parseCommaList = (text: string) =>
      text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const payload: CreateCoursePayload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      thumbnail: thumbnail.trim() || undefined,
      promoVideoUrl: promoVideoUrl.trim() || undefined,
      startingDate: startingDate ? new Date(startingDate).toISOString() : null,
      level,
      language,
      pricingType,
      price: pricingType === "PAID" ? Number(price) : 0,
      currency: "USD",
      learningOutcomes: parseList(outcomesText),
      requirements: parseList(requirementsText),
      targetAudience: parseList(audienceText),
      tags: parseCommaList(tagsText),
      categoryId,
      subcategoryId: subcategoryId || null,
      modules:
        !isEditing && modules.length > 0
          ? modules.map((m, idx) => ({
              title: m.title.trim(),
              description: m.description?.trim() || undefined,
              sortOrder: idx,
            }))
          : undefined,
    };

    try {
      if (isEditing && initialCourse?.id) {
        const res = await updateMutation.mutateAsync({
          id: initialCourse.id,
          payload,
        });
        if (onSuccess && res) onSuccess(res);
      } else {
        const res = await createMutation.mutateAsync(payload);
        if (onSuccess && res) onSuccess(res);
      }
      onClose();
    } catch {
      // Error handled by query mutation hooks
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Render Step 1: Basics & Schedule
  const renderStep1 = () => (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Course Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Master Full-Stack Next.js 15 & System Architecture"
            className={`text-xs rounded-xl ${
              fieldErrors.title ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            required
          />
          {fieldErrors.title && (
            <p className="text-[11px] text-red-500 font-medium">{fieldErrors.title}</p>
          )}
        </div>

        {/* Subtitle */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Subtitle / Elevator Pitch
          </label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. From zero to production ready microservices with Docker, Kubernetes, and Redis"
            className="text-xs rounded-xl"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Primary Category <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategoryId(null);
              setFieldErrors((prev) => ({ ...prev, categoryId: "" }));
            }}
            disabled={isCategoriesLoading}
            className={`w-full text-xs h-9 px-3 rounded-xl border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 disabled:opacity-50 ${
              fieldErrors.categoryId
                ? "border-red-500 focus:ring-red-500"
                : "border-neutral-200 dark:border-neutral-800 focus:ring-neutral-400"
            }`}
            required
          >
            <option value="">
              {isCategoriesLoading ? "Loading Categories..." : "Select Category"}
            </option>
            {parentCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && (
            <p className="text-[11px] text-red-500 font-medium">{fieldErrors.categoryId}</p>
          )}
        </div>

        {/* Subcategory */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Subcategory
          </label>
          <select
            value={subcategoryId || ""}
            onChange={(e) => setSubcategoryId(e.target.value || null)}
            disabled={!categoryId || availableSubcategories.length === 0}
            className="w-full text-xs h-9 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50"
          >
            <option value="">
              {!categoryId
                ? "Select a category first"
                : availableSubcategories.length === 0
                ? "None / No Subcategories"
                : "Select Subcategory (Optional)"}
            </option>
            {availableSubcategories.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Starting Date (Min: Tomorrow) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Course Starting Date
            </label>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Min: Tomorrow</span>
          </div>
          <Input
            type="date"
            min={minStartingDate}
            value={startingDate}
            onChange={(e) => {
              setStartingDate(e.target.value);
              setFieldErrors((prev) => ({ ...prev, startingDate: "" }));
            }}
            className={`text-xs rounded-xl ${
              fieldErrors.startingDate ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          {fieldErrors.startingDate ? (
            <p className="text-[11px] text-red-500 font-medium">{fieldErrors.startingDate}</p>
          ) : (
            <p className="text-[11px] text-neutral-400">
              Optional schedule date when this course or live cohort starts.
            </p>
          )}
        </div>

        {/* Course Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Target Skill Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevel)}
            className="w-full text-xs h-9 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            <option value="ALL_LEVELS">All Skill Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Instruction Language
          </label>
          <Input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="English"
            className="text-xs rounded-xl"
          />
        </div>

        {/* Custom URL Slug */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Custom URL Slug
          </label>
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugManuallyEdited(true);
              setFieldErrors((prev) => ({ ...prev, slug: "" }));
            }}
            placeholder="master-fullstack-nextjs"
            className={`text-xs rounded-xl font-mono ${
              fieldErrors.slug ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          {fieldErrors.slug && (
            <p className="text-[11px] text-red-500 font-medium">{fieldErrors.slug}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Render Step 2: Media & Overview
  const renderStep2 = () => (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          Course Overview & Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setFieldErrors((prev) => ({ ...prev, description: "" }));
          }}
          rows={4}
          placeholder="Provide a detailed roadmap, what topics will be covered, and key learning milestones (min 15 characters)..."
          className={`w-full text-xs p-3 rounded-xl border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 resize-y ${
            fieldErrors.description
              ? "border-red-500 focus:ring-red-500"
              : "border-neutral-200 dark:border-neutral-800 focus:ring-neutral-400"
          }`}
        />
        {fieldErrors.description && (
          <p className="text-[11px] text-red-500 font-medium">{fieldErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thumbnail Upload / Link */}
        <CourseMediaUpload
          label="Course Cover Thumbnail"
          type="image"
          folder="thumbnails"
          value={thumbnail}
          onChange={(url) => {
            setThumbnail(url);
            setFieldErrors((prev) => ({ ...prev, thumbnail: "" }));
          }}
          error={fieldErrors.thumbnail}
        />

        {/* Promotional Trailer Video Upload / Link */}
        <CourseMediaUpload
          label="Promotional Trailer Video"
          type="video"
          folder="videos"
          value={promoVideoUrl}
          onChange={(url) => {
            setPromoVideoUrl(url);
            setFieldErrors((prev) => ({ ...prev, promoVideoUrl: "" }));
          }}
          error={fieldErrors.promoVideoUrl}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Target Audience */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Target Audience (one per line)
          </label>
          <textarea
            value={audienceText}
            onChange={(e) => setAudienceText(e.target.value)}
            rows={3}
            placeholder="Frontend developers transitioning to fullstack&#10;Computer science students&#10;Software engineers"
            className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-none"
          />
        </div>

        {/* Search Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Search Tags (comma separated)
          </label>
          <textarea
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            rows={3}
            placeholder="React, Next.js, TypeScript, PostgreSQL, System Design"
            className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-none"
          />
        </div>
      </div>
    </div>
  );

  // Render Step 3: Goals & Prerequisites
  const renderStep3 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 duration-200">
      {/* Learning Outcomes */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            What Students Will Learn <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] text-neutral-400">1 per line</span>
        </div>
        <textarea
          value={outcomesText}
          onChange={(e) => {
            setOutcomesText(e.target.value);
            setFieldErrors((prev) => ({ ...prev, outcomes: "" }));
          }}
          rows={7}
          placeholder="Design and deploy microservices with Docker&#10;Implement OAuth 2.0 authentication from scratch&#10;Optimize Postgres queries with Redis caching&#10;Build scalable streaming architectures"
          className={`w-full text-xs p-3 rounded-xl border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 resize-none ${
            fieldErrors.outcomes
              ? "border-red-500 focus:ring-red-500"
              : "border-neutral-200 dark:border-neutral-800 focus:ring-neutral-400"
          }`}
        />
        {fieldErrors.outcomes && (
          <p className="text-[11px] text-red-500 font-medium">{fieldErrors.outcomes}</p>
        )}
      </div>

      {/* Prerequisites / Requirements */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            Course Prerequisites <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] text-neutral-400">1 per line</span>
        </div>
        <textarea
          value={requirementsText}
          onChange={(e) => {
            setRequirementsText(e.target.value);
            setFieldErrors((prev) => ({ ...prev, requirements: "" }));
          }}
          rows={7}
          placeholder="Basic understanding of JavaScript / TypeScript&#10;Familiarity with Git and terminal commands&#10;Node.js installed on your development machine"
          className={`w-full text-xs p-3 rounded-xl border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 resize-none ${
            fieldErrors.requirements
              ? "border-red-500 focus:ring-red-500"
              : "border-neutral-200 dark:border-neutral-800 focus:ring-neutral-400"
          }`}
        />
        {fieldErrors.requirements && (
          <p className="text-[11px] text-red-500 font-medium">{fieldErrors.requirements}</p>
        )}
      </div>
    </div>
  );

  // Render Step 4: Live Curriculum Topics & Syllabus
  const renderStep4 = () => (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            Live Curriculum & Syllabus Topics <span className="text-red-500">*</span>
          </h4>
          <p className="text-[11px] text-neutral-500">
            {isEditing
              ? "For existing courses, manage chapters and topics directly in the Curriculum Studio."
              : "Outline the key topics, live lecture modules, and workshop agenda for your students."}
          </p>
        </div>
        {!isEditing && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddModule}
            className="text-xs h-8 rounded-xl border-blue-500/20 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Topic
          </Button>
        )}
      </div>

      {fieldErrors.modules && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
          {fieldErrors.modules}
        </div>
      )}

      {isEditing ? (
        <div className="p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-2 bg-neutral-50/50 dark:bg-neutral-900/50">
          <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            This course currently has {initialCourse?.totalModules || 0} curriculum topics.
          </p>
          <p className="text-[11px] text-neutral-400">
            Use the dedicated <strong>Curriculum Studio</strong> on your course card to add, edit, or
            reorder live topics and resources.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {modules.map((mod, mIdx) => (
            <div
              key={mIdx}
              className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 space-y-2.5 transition-all"
            >
              {/* Topic Header & Title */}
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[11px] shrink-0">
                  Topic {mIdx + 1}
                </div>
                <Input
                  value={mod.title}
                  onChange={(e) => handleModuleChange(mIdx, "title", e.target.value)}
                  placeholder={`Topic ${mIdx + 1} Name (e.g. Distributed State & Event Loops)`}
                  className="text-xs h-8 font-medium rounded-lg flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveModule(mIdx)}
                  disabled={modules.length <= 1}
                  className="h-8 px-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30"
                  title="Remove Topic"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Topic Description / Agenda */}
              <div>
                <textarea
                  value={mod.description || ""}
                  onChange={(e) => handleModuleChange(mIdx, "description", e.target.value)}
                  placeholder="Topic summary, live discussion points, hands-on coding exercises, and workshop agenda..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-y"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleAddModule}
            className="text-xs h-8 px-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 w-full border border-dashed border-blue-500/20 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Another Topic
          </Button>
        </div>
      )}
    </div>
  );

  // Render Step 5: Pricing & Final Review
  const renderStep5 = () => {
    const parentCatName = parentCategories.find((c) => c.id === categoryId)?.name || "Uncategorized";
    const subCatName = availableSubcategories.find((c) => c.id === subcategoryId)?.name;

    return (
      <div className="space-y-4 animate-in fade-in-50 duration-200">
        {/* Pricing Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Course Access & Pricing Model
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setPricingType("FREE");
                setPrice(0);
                setFieldErrors((prev) => ({ ...prev, price: "" }));
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                pricingType === "FREE"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs">Free Enrollment</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  100% Free
                </Badge>
              </div>
              <p className="text-[11px] opacity-80">
                Accessible to all enrolled students without any payment.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPricingType("PAID");
                if (Number(price) <= 0) setPrice("49.99");
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                pricingType === "PAID"
                  ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs">Paid One-Time Purchase</span>
                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">
                  Lifetime Access
                </Badge>
              </div>
              <p className="text-[11px] opacity-80">
                Students pay a one-time fee to unlock full curriculum and materials.
              </p>
            </button>
          </div>

          {/* Paid Pricing Input */}
          {pricingType === "PAID" && (
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 mt-2 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Course Price ($ USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-neutral-400">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.99"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, price: "" }));
                  }}
                  placeholder="49.99"
                  className={`pl-7 text-xs rounded-xl ${
                    fieldErrors.price ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  required
                />
              </div>
              {fieldErrors.price ? (
                <p className="text-[11px] text-red-500 font-medium">{fieldErrors.price}</p>
              ) : (
                <p className="text-[11px] text-neutral-400">
                  Set the one-time enrollment tuition for students.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Review Dossier Summary */}
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Course Summary Preview
            </span>
            <Badge variant="outline" className="text-[10px]">
              {level} • {language}
            </Badge>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{title || "Untitled Course"}</h4>
            {subtitle && <p className="text-[11px] text-neutral-500 italic">{subtitle}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="block text-[10px] text-neutral-400">Category</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate block">
                {parentCatName}{subCatName ? ` / ${subCatName}` : ""}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-400">Start Date</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {startingDate ? new Date(startingDate).toLocaleDateString() : "Immediate / Self-paced"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-400">Curriculum</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {isEditing
                  ? `${initialCourse?.totalModules || 0} topics`
                  : `${modules.length} topic${modules.length === 1 ? "" : "s"}`}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-400">Pricing</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {pricingType === "FREE" ? "Free" : `$${price}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-500" />
          <span>{isEditing ? `Edit Course: ${initialCourse?.title}` : "Course Creator Studio"}</span>
        </div>
      }
      description={
        isEditing
          ? "Update course overview, scheduling, curriculum structure, and pricing."
          : "Complete the 5-step wizard to create and publish your course live to students."
      }
      maxWidth="xl"
      showCloseButton={!isPending}
      closeOnOverlayClick={!isPending}
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Back button */}
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isPending}
              className="text-xs h-9 rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="text-xs h-9 rounded-xl text-neutral-500 cursor-pointer"
            >
              Cancel
            </Button>
          )}

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="text-xs h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer"
              >
                Next Step
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => handleSubmit()}
                disabled={isPending}
                className="text-xs h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold shadow-sm"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {isEditing ? "Save Changes" : "Publish Course Live"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Step Indicator Navigation Bar */}
        <div className="grid grid-cols-5 gap-1 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={isPending}
                className={`flex flex-col items-center text-center p-1.5 rounded-xl transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-blue-500/10 text-blue-600 font-semibold border border-blue-500/20"
                    : isCompleted
                    ? "text-emerald-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    : "text-neutral-400 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px] font-mono">{step.id}</span>
                </div>
                <span className="text-[10px] line-clamp-1">{step.title.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Top Validation Error Banner */}
        {validationError && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-center gap-2 animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Wizard Step Content Body */}
        <div className="min-h-[280px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>
      </div>
    </ModalTemplate>
  );
};

export default CourseFormModal;
