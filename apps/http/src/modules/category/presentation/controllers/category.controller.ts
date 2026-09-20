import { Request, Response, NextFunction } from "express";
import { GetCategoriesUseCase } from "../../application/use-cases/get-categories.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import {
  createCategorySchema,
  updateCategorySchema,
  queryCategoriesSchema,
} from "../validators/category.validator";
import { ForbiddenError, NotFoundError } from "@/app/errors";

export class CategoryController {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly adminManageCategoriesUseCase: AdminManageCategoriesUseCase
  ) {}

  // ================= PUBLIC CATALOG ENDPOINTS =================

  // GET /api/categories (Public active tree or flat list)
  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tree = req.query.format === "tree" || req.query.tree === "true";
      if (tree) {
        const treeData = await this.getCategoriesUseCase.getActiveTree();
        return res.status(200).json({
          success: true,
          data: treeData,
        });
      }

      const flatData = await this.getCategoriesUseCase.getAllActive();
      return res.status(200).json({
        success: true,
        data: flatData,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/categories/tree (Public active tree shortcut)
  getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const treeData = await this.getCategoriesUseCase.getActiveTree();
      res.status(200).json({
        success: true,
        data: treeData,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/categories/slug/:slug (Public get category by slug)
  getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : (req.params.slug as string);
      const category = await this.getCategoriesUseCase.getBySlug(slug);
      if (!category) {
        throw new NotFoundError(`Category with slug '${slug}' was not found.`);
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= ADMIN MANAGEMENT ENDPOINTS =================

  // GET /api/categories/admin/all (Protected - Admin)
  adminGetAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const query = queryCategoriesSchema.parse(req.query);
      const result = await this.adminManageCategoriesUseCase.getAllCategories(query);

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/categories/admin/tree (Protected - Admin)
  adminGetCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const includeInactive = req.query.includeInactive !== "false";
      const includeDeleted = req.query.includeDeleted === "true";
      const tree = await this.adminManageCategoriesUseCase.getCategoryTree(
        includeInactive,
        includeDeleted
      );

      res.status(200).json({
        success: true,
        data: tree,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/categories/admin/metrics (Protected - Admin)
  adminGetMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const metrics = await this.adminManageCategoriesUseCase.getMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/categories/admin/:id (Protected - Admin)
  adminGetCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const category = await this.adminManageCategoriesUseCase.getCategoryById(id);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/categories/admin (Protected - Admin)
  adminCreateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const validated = createCategorySchema.parse(req.body);
      const category = await this.adminManageCategoriesUseCase.createCategory(validated as any);

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/categories/admin/:id (Protected - Admin)
  adminUpdateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = updateCategorySchema.parse(req.body);
      const category = await this.adminManageCategoriesUseCase.updateCategory(id, validated as any);

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/categories/admin/:id/status (Protected - Admin)
  adminToggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const isActive = req.body.isActive === true;
      const category = await this.adminManageCategoriesUseCase.toggleActive(id, isActive);

      res.status(200).json({
        success: true,
        message: `Category ${isActive ? "activated" : "deactivated"} successfully`,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/categories/admin/:id (Protected - Admin: Soft Delete)
  adminSoftDeleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const category = await this.adminManageCategoriesUseCase.softDeleteCategory(id);

      res.status(200).json({
        success: true,
        message: "Category moved to trash successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/categories/admin/:id/restore (Protected - Admin: Restore)
  adminRestoreCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const category = await this.adminManageCategoriesUseCase.restoreCategory(id);

      res.status(200).json({
        success: true,
        message: "Category restored successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/categories/admin/:id/permanent (Protected - Admin: Hard Delete)
  adminHardDeleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      await this.adminManageCategoriesUseCase.hardDeleteCategory(id);

      res.status(200).json({
        success: true,
        message: "Category permanently deleted",
      });
    } catch (error) {
      next(error);
    }
  };

  private ensureAdmin(req: Request) {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new ForbiddenError("Admin privileges required to manage categories.");
    }
  }
}
