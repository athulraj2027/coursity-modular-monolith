import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { IPasswordComparer, ITokenGenerator } from "@/infrastructure/security";
import { ISaveRefreshTokenRepository } from "../../domain/repositories/token.repository";
import { BadRequestError, UnauthorizedError, ForbiddenError } from "@/app/errors";
import { SigninInputDTO, SigninOutputDTO } from "../dtos/signin.dto";
import { PortalAccessPolicy } from "../../domain/policies/portal-access.policy";

export class SigninUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: IPasswordComparer,
        private readonly tokenService: ITokenGenerator,
        private readonly tokenRepository: ISaveRefreshTokenRepository
    ) { }

    async execute(input: SigninInputDTO): Promise<SigninOutputDTO> {
        const email = input.email.toLowerCase().trim();

        // 1. Find user by email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError("Invalid email or password");
        }

        // 2. Check if account is blocked
        if (user.isBlocked) {
            throw new ForbiddenError("Your account has been blocked. Please contact support.");
        }

        // 3. Enforce strict role matching via PortalAccessPolicy (OCP)
        PortalAccessPolicy.assertPortalRoleAccess(user.role, input.role, "signin");

        // 4. Check if user is password-based or OAuth-only (OCP: dynamic provider check)
        if (!user.password) {
            if (user.authProvider && user.authProvider !== "LOCAL") {
                const providerName = user.authProvider === "GOOGLE" ? "Google" : user.authProvider;
                throw new BadRequestError(`This account was created with ${providerName}. Please sign in with ${providerName}.`);
            }
            throw new UnauthorizedError("Invalid email or password");
        }

        // 5. Compare password
        const isPasswordValid = await this.passwordService.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid email or password");
        }

        // 6. Generate Access & Refresh tokens
        const tokens = this.tokenService.generateAuthTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // 7. Save Refresh Token in session storage
        await this.tokenRepository.saveRefreshToken(user.id, tokens.refreshToken);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
}
