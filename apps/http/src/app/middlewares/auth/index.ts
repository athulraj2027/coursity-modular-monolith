import { JwtTokenService } from "@/infrastructure/security";
import { createAuthMiddleware } from "./auth.middleware";
import { createOptionalAuthMiddleware } from "./optional-auth.middleware";

export * from "./types";
export * from "./token.utils";
export * from "./auth.middleware";
export * from "./optional-auth.middleware";

const defaultTokenService = new JwtTokenService();
export const authMiddleware = createAuthMiddleware(defaultTokenService);
export const optionalAuthMiddleware = createOptionalAuthMiddleware(defaultTokenService);

export default authMiddleware;
