export interface CategoryEntityProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

  parent?: CategoryEntity | null;
  children?: CategoryEntity[];
  childrenCount?: number;
  _count?: {
    children?: number;
  };
}

export class CategoryEntity {
  public id: string;
  public name: string;
  public slug: string;
  public description: string | null;
  public icon: string | null;
  public image: string | null;
  public parentId: string | null;
  public isActive: boolean;
  public isFeatured: boolean;
  public sortOrder: number;
  public isDeleted: boolean;
  public deletedAt: Date | null;
  public createdAt: Date;
  public updatedAt: Date;

  public parent?: CategoryEntity | null;
  public children?: CategoryEntity[];
  public childrenCount: number;

  constructor(props: CategoryEntityProps) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description ?? null;
    this.icon = props.icon ?? null;
    this.image = props.image ?? null;
    this.parentId = props.parentId ?? null;
    this.isActive = props.isActive ?? true;
    this.isFeatured = props.isFeatured ?? false;
    this.sortOrder = props.sortOrder ?? 0;
    this.isDeleted = props.isDeleted ?? false;
    this.deletedAt = props.deletedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.parent = props.parent ?? null;
    this.children = props.children ?? [];
    this.childrenCount =
      props.childrenCount ??
      props._count?.children ??
      props.children?.length ??
      0;
  }

  // Backward compatibility getter for Prisma _count convention
  get _count(): { children?: number } {
    return { children: this.childrenCount };
  }
}

export interface CategoryTreeNode {
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
  children: CategoryTreeNode[];
  subcategoryCount: number;
  parent?: CategoryEntity | null;
  childrenCount?: number;
  _count?: {
    children?: number;
  };
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
