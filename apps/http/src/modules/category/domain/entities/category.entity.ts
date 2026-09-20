export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  parent?: CategoryEntity | null;
  children?: CategoryEntity[];
  _count?: {
    children?: number;
  };
}

export interface CategoryTreeNode extends CategoryEntity {
  children: CategoryTreeNode[];
  subcategoryCount: number;
}

export interface CategoryFilterParams {
  search?: string;
  parentId?: string | null;
  onlyParents?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isDeleted?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "sortOrder" | "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface CategoryMetrics {
  total: number;
  parentCategories: number;
  subcategories: number;
  active: number;
  inactive: number;
  deleted: number;
}
