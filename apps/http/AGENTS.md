# 🚀 Backend Service Rules (`apps/http`)

Guidelines and constraints for working within the **Coursity Core REST API**.

---

## 🏛️ Clean Architecture Invariants

1. **Layer Separation**:
   - `domain/`: Entities, DTOs, Enums, and Repository Interfaces ONLY. Zero external dependencies.
   - `application/`: Single-purpose Use Cases implementing business operations. Depend ONLY on domain interfaces.
   - `infrastructure/`: Prisma repositories, Redis caches, S3 client, and mailer implementations.
   - `presentation/`: Express controllers, routes, and Zod request validation schemas.
2. **Composition Root**:
   - Each module MUST provide an `index.ts` exporting a factory function `create<ModuleName>Module()` that binds dependencies.
3. **Validation**:
   - Every route that accepts user input MUST use the `validate(Schema)` middleware with Zod.
4. **Error Handling**:
   - Throw specialized errors from `@/app/errors` (`BadRequestError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, etc.).
   - Never write raw `res.status(500).json(...)` inside controllers — pass uncaught exceptions to `next(error)`.
5. **Responses**:
   - Use `ApiResponse.success(res, data, message)` or `ApiResponse.created(res, data, message)`.

---

## 📚 Related Skill
* Activate the [backend-clean-architecture](file:///d:/second-project/coursity-rebuild/.agents/skills/backend-clean-architecture/SKILL.md) skill for detailed implementation templates and runbooks.
* Activate the [prisma-database-workflow](file:///d:/second-project/coursity-rebuild/.agents/skills/prisma-database-workflow/SKILL.md) skill for database migrations and schema changes.
