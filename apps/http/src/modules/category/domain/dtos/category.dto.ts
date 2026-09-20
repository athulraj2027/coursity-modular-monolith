export interface CreateCategoryDTO {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface CategoryListResponseDTO {
  items: any[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
