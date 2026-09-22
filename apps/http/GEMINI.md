# 🚀 Backend Service Rules (`apps/http` - GEMINI.md)

- Enforce Clean Architecture: `domain` -> `application` -> `infrastructure` -> `presentation`.
- Zero framework imports in `domain/`.
- Validate all incoming HTTP requests using Zod schemas.
- Use `ApiResponse` helper for standardized output.
- Follow [backend-clean-architecture](file:///d:/second-project/coursity-rebuild/.agents/skills/backend-clean-architecture/SKILL.md).
