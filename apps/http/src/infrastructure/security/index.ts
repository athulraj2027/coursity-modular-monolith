import { BcryptPasswordService } from "./services/bcrypt-password.service";
import { JwtTokenService } from "./services/jwt-token.service";
import { PasswordService } from "./contracts/password.service.abstract";
import { TokenService } from "./contracts/token.service.abstract";

// Singleton default instances
export const passwordService: PasswordService = new BcryptPasswordService();
export const tokenService: TokenService = new JwtTokenService();

// Export contracts and implementations
export * from "./contracts/password.service.abstract";
export * from "./contracts/token.service.abstract";
export * from "./services/bcrypt-password.service";
export * from "./services/jwt-token.service";
