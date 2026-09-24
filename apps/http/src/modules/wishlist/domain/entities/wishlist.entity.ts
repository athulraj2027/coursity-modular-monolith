export interface WishlistItemEntity {
  id: string;
  wishlistId: string;
  courseId: string;
  createdAt: Date;
  course?: WishlistCourseSnapshot;
}

export interface WishlistCourseSnapshot {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  thumbnail?: string | null;
  pricingType: "FREE" | "PAID";
  price: number;
  currency: string;
  level: string;
  language: string;
  totalDurationSeconds: number;
  totalLessons: number;
  totalModules: number;
  isFeatured: boolean;
  isTrending: boolean;
  startingDate?: Date | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  teacherProfile?: {
    id: string;
    expertise: string[];
    profile?: {
      avatar?: string | null;
      user?: {
        name: string;
      };
    };
  } | null;
}

export interface WishlistEntity {
  id: string;
  userId: string;
  items: WishlistItemEntity[];
  createdAt: Date;
  updatedAt: Date;
}
