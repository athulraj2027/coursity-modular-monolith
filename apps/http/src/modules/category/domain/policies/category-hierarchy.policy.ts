import { BadRequestError } from "@/app/errors";

export interface CategoryParentCheck {
  id: string;
  parentId: string | null;
}

export class CategoryHierarchyPolicy {
  /**
   * Maximum allowed depth for category hierarchy (1 = Root Parent, 2 = Subcategory).
   */
  static readonly MAX_DEPTH = 2;

  /**
   * Validates parent assignment when creating or updating a category.
   *
   * @param currentId ID of the category being modified (undefined when creating)
   * @param parentId The parentId being assigned
   * @param parent The parent category entity found in the database
   * @param currentChildCount The number of children the current category already has
   */
  static validateParentAssignment(params: {
    currentId?: string;
    parentId?: string | null;
    parent?: CategoryParentCheck | null;
    currentChildCount?: number;
  }): void {
    const { currentId, parentId, parent, currentChildCount = 0 } = params;

    // If no parent is assigned (root category), assignment is valid unless other rules apply
    if (!parentId) {
      return;
    }

    // 1. Prevent self-parenting
    if (currentId && parentId === currentId) {
      throw new BadRequestError("A category cannot be its own parent.");
    }

    // 2. Parent must exist
    if (!parent) {
      throw new BadRequestError(`Parent category with ID '${parentId}' does not exist or is deleted.`);
    }

    // 3. Prevent nesting beyond MAX_DEPTH (2 levels: Root -> Subcategory)
    if (parent.parentId) {
      throw new BadRequestError("Nesting beyond 2 levels (subcategories under subcategories) is not permitted.");
    }

    // 4. Prevent demoting a category that already has subcategories
    if (currentChildCount > 0) {
      throw new BadRequestError(
        "This category has existing subcategories and cannot be demoted to a child category."
      );
    }
  }
}

