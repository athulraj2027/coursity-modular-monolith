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

export interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  lessonType: LessonType;
  durationSeconds: number;
  sortOrder: number;
  isFreePreview: boolean;
  isPublished: boolean;
  videoUrl: string | null;
  videoProvider: VideoProvider | null;
  videoThumbnail: string | null;
  articleBody: string | null;
  attachments: LessonAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  lessons?: CourseLesson[];
  _count?: {
    lessons: number;
  };
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  promoVideoUrl: string | null;
  startingDate: string | null;
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
  delistReason?: string | null;
  delistedAt?: string | null;
  freezeReason?: string | null;
  isFrozen?: boolean;
  frozenAt?: string | null;
  publishedAt: string | null;
  isApproved: boolean;
  totalDurationSeconds: number;
  totalLessons: number;
  totalModules: number;
  isFeatured: boolean;
  isTrending: boolean;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Populated relations
  teacherProfile?: {
    id: string;
    userId?: string;
    expertise?: string[];
    experienceYears?: number | null;
    approvalStatus?: string;
    profile?: {
      avatar?: string | null;
      user?: {
        id?: string;
        name: string;
        email: string;
      };
    };
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  modules?: CourseModule[];
  _count?: {
    modules: number;
  };
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

export interface InitialLessonPayload {
  title: string;
  description?: string;
  lessonType?: LessonType;
  durationSeconds?: number;
  sortOrder?: number;
  isFreePreview?: boolean;
  videoUrl?: string;
  videoProvider?: VideoProvider;
  videoThumbnail?: string;
  articleBody?: string;
  attachments?: LessonAttachment[];
}

export interface InitialModulePayload {
  title: string;
  description?: string;
  sortOrder?: number;
  lessons?: InitialLessonPayload[];
}

export interface CreateCoursePayload {
  title: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  promoVideoUrl?: string;
  startingDate?: string | null;
  level?: CourseLevel;
  language?: string;
  pricingType?: CoursePricingType;
  price?: number;
  currency?: string;
  learningOutcomes?: string[];
  requirements?: string[];
  targetAudience?: string[];
  tags?: string[];
  categoryId: string;
  subcategoryId?: string | null;
  status?: CourseStatus;
  modules?: InitialModulePayload[];
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> {
  status?: CourseStatus;
  isFeatured?: boolean;
  isTrending?: boolean;
  sortOrder?: number;
}

export interface CreateModulePayload {
  title: string;
  description?: string;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface UpdateModulePayload extends Partial<CreateModulePayload> {}

export interface CreateLessonPayload {
  title: string;
  description?: string;
  lessonType?: LessonType;
  durationSeconds?: number;
  sortOrder?: number;
  isFreePreview?: boolean;
  isPublished?: boolean;
  videoUrl?: string;
  videoProvider?: VideoProvider;
  videoThumbnail?: string;
  articleBody?: string;
  attachments?: LessonAttachment[];
}

export interface UpdateLessonPayload extends Partial<CreateLessonPayload> {}

export interface ReorderItemPayload {
  id: string;
  sortOrder: number;
}

export interface CourseQueryParams {
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
