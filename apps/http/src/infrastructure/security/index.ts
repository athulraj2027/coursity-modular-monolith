import { BcryptPasswordService } from "./infrastructure/services/bcrypt-password.service";
import { JwtTokenService } from "./infrastructure/services/jwt-token.service";
import { IPasswordService, PasswordService } from "./domain/contracts/password-service.interface";
import { ITokenService, TokenService } from "./domain/contracts/token-service.interface";

// Singleton default instances
export const passwordService: IPasswordService = new BcryptPasswordService();
export const tokenService: ITokenService = new JwtTokenService();

// Domain entities & types
export * from "./domain/entities/token.entity";
export * from "./domain/entities/password.entity";

// Domain contracts & interfaces
export * from "./domain/contracts/password-service.interface";
export * from "./domain/contracts/token-service.interface";

// Infrastructure configs
export * from "./infrastructure/config/jwt.config";
export * from "./infrastructure/config/password.config";

// Infrastructure services
export * from "./infrastructure/services/bcrypt-password.service";
export * from "./infrastructure/services/jwt-token.service";
