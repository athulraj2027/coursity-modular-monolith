import {
  CourseLevel,
  CoursePricingType,
  CourseStatus,
  LessonType,
  VideoProvider,
  LessonAttachment,
} from "../entities/course.entity";

export interface InitialLessonDTO {
  title: string;
  description?: string | null;
  lessonType?: LessonType;
  durationSeconds?: number;
  sortOrder?: number;
  isFreePreview?: boolean;
  videoUrl?: string | null;
  videoProvider?: VideoProvider | null;
  videoThumbnail?: string | null;
  articleBody?: string | null;
  attachments?: LessonAttachment[];
}

export interface InitialModuleDTO {
  title: string;
  description?: string | null;
  sortOrder?: number;
  lessons?: InitialLessonDTO[];
}

export interface CreateCourseDTO {
  title: string;
  slug?: string | null;
  subtitle?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  promoVideoUrl?: string | null;
  startingDate?: Date | string | null;
  level?: CourseLevel;
  language?: string;
  pricingType?: CoursePricingType;
  price?: number;
  currency?: string;
  learningOutcomes?: string[];
  requirements?: string[];
  targetAudience?: string[];
  tags?: string[];
  teacherProfileId: string;
  categoryId: string;
  subcategoryId?: string | null;
  status?: CourseStatus;
  modules?: InitialModuleDTO[];
}

export interface UpdateCourseDTO {
  title?: string;
  slug?: string | null;
  subtitle?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  promoVideoUrl?: string | null;
  startingDate?: Date | string | null;
  level?: CourseLevel;
  language?: string;
  pricingType?: CoursePricingType;
  price?: number;
  currency?: string;
  learningOutcomes?: string[];
  requirements?: string[];
  targetAudience?: string[];
  tags?: string[];
  categoryId?: string;
  subcategoryId?: string | null;
  status?: CourseStatus;
  isFeatured?: boolean;
  isTrending?: boolean;
  sortOrder?: number;
}

export interface CreateModuleDTO {
  courseId: string;
  title: string;
  description?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface UpdateModuleDTO {
  title?: string;
  description?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface CreateLessonDTO {
  moduleId: string;
  title: string;
  description?: string | null;
  lessonType?: LessonType;
  durationSeconds?: number;
  sortOrder?: number;
  isFreePreview?: boolean;
  isPublished?: boolean;
  videoUrl?: string | null;
  videoProvider?: VideoProvider | null;
  videoThumbnail?: string | null;
  articleBody?: string | null;
  attachments?: LessonAttachment[];
}

export interface UpdateLessonDTO {
  title?: string;
  description?: string | null;
  lessonType?: LessonType;
  durationSeconds?: number;
  sortOrder?: number;
  isFreePreview?: boolean;
  isPublished?: boolean;
  videoUrl?: string | null;
  videoProvider?: VideoProvider | null;
  videoThumbnail?: string | null;
  articleBody?: string | null;
  attachments?: LessonAttachment[];
}

export interface ReorderItemDTO {
  id: string;
  sortOrder: number;
}

export interface AdminReviewCourseDTO {
  action: "APPROVE" | "REJECT";
  rejectionReason?: string;
  adminId: string;
}
