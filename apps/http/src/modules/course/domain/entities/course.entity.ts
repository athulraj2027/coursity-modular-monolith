export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
export type CoursePricingType = "FREE" | "PAID";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "FROZEN";
export type LessonType = "VIDEO" | "ARTICLE" | "QUIZ" | "LIVE_CLASS" | "ATTACHMENT";
export type VideoProvider = "LOCAL" | "S3" | "CLOUDFRONT" | "YOUTUBE" | "VIMEO" | "MUX";

export interface LessonAttachment {
  name: string;
  url: string;
  sizeBytes?: number;
  type?: string;
}

export interface CourseLessonEntity {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  lessonType?: LessonType;
  durationSeconds: number;
  sortOrder: number;
  isFreePreview?: boolean;
  isPublished: boolean;
  videoUrl?: string | null;
  videoProvider?: VideoProvider | null;
  videoThumbnail?: string | null;
  articleBody?: string | null;
  attachments?: LessonAttachment[];
  scheduledAt?: Date | null;
  liveStatus?: string;
  isLiveNow?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseModuleEntity {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  lessons?: CourseLessonEntity[];
  _count?: {
    lessons?: number;
  };
}

export interface CourseEntity {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  promoVideoUrl: string | null;
  startingDate: Date | null;
  level: CourseLevel;
  language: string;
  pricingType: CoursePricingType;
  price: number | string;
  currency: string;
  learningOutcomes: string[];
  requirements: string[];
  targetAudience: string[];
  tags: string[];
  teacherProfileId: string;
  categoryId: string;
  subcategoryId: string | null;
  status: CourseStatus;
  delistReason: string | null;
  delistedAt: Date | null;
  freezeReason: string | null;
  isFrozen: boolean;
  frozenAt: Date | null;
  publishedAt: Date | null;
  isApproved: boolean;
  totalDurationSeconds: number;
  totalLessons: number;
  totalModules: number;
  isFeatured: boolean;
  isTrending: boolean;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Populated relations
  teacherProfile?: any;
  category?: any;
  subcategory?: any;
  modules?: CourseModuleEntity[];
  _count?: {
    modules?: number;
  };
}

export interface CourseFilterParams {
  search?: string;
  teacherProfileId?: string;
  categoryId?: string;
  subcategoryId?: string;
  level?: CourseLevel;
  pricingType?: CoursePricingType;
  language?: string;
  status?: CourseStatus;
  isFeatured?: boolean;
  isTrending?: boolean;
  isFrozen?: boolean;
  isDeleted?: boolean;
  includeDeleted?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "sortOrder" | "createdAt" | "price" | "totalDurationSeconds" | "totalLessons" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CourseMetrics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  frozen: number;
  featured: number;
  freeCourses: number;
  paidCourses: number;
}

/**
 * Domain invariants and state helper functions
 */
export function isCoursePubliclyVisible(course: CourseEntity | null | undefined): boolean {
  if (!course) return false;
  if (course.isDeleted) return false;
  if (course.isFrozen || course.status === "FROZEN") return false;
  return course.status === "PUBLISHED";
}

export function isCourseEditableByTeacher(course: CourseEntity | null | undefined, teacherProfileId: string): {
  allowed: boolean;
  reason?: string;
} {
  if (!course) {
    return { allowed: false, reason: "Course not found" };
  }
  if (course.teacherProfileId !== teacherProfileId) {
    return { allowed: false, reason: "You do not have permission to manage this course." };
  }
  if (course.isFrozen || course.status === "FROZEN") {
    return {
      allowed: false,
      reason: "This course has been frozen by administration and cannot be modified. It is in read-only mode.",
    };
  }
  return { allowed: true };
}

export function canCourseBeDelisted(course: CourseEntity): { canDelist: boolean; reason?: string } {
  if (course.startingDate) {
    const startTime = new Date(course.startingDate).getTime();
    if (startTime <= Date.now()) {
      return {
        canDelist: false,
        reason: "Cannot delist a course that has already started. Started courses must be frozen instead.",
      };
    }
  }
  return { canDelist: true };
}
